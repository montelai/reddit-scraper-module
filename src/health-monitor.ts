import { exec } from 'child_process';
import { promisify } from 'util';
import { VPNClient } from './vpn-client';

const execAsync = promisify(exec);

export interface HealthStatus {
  healthy: boolean;
  latency?: number;
  error?: string;
}

export class HealthMonitor {
  private vpnClient: VPNClient;
  private checkInterval?: NodeJS.Timeout;
  private onUnhealthy?: () => void;

  constructor(vpnClient: VPNClient) {
    this.vpnClient = vpnClient;
  }

  async checkConnection(): Promise<HealthStatus> {
    try {
      const status = await this.vpnClient.status();
      
      if (!status.connected) {
        return { healthy: false, error: 'VPN not connected' };
      }
      
      const pingResult = await this.ping(status.server || '8.8.8.8');
      
      return pingResult;
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : String(error) 
      };
    }
  }

  async ping(host: string): Promise<HealthStatus> {
    try {
      const { stdout } = await execAsync(`ping -c 1 -W 2 ${host}`, { timeout: 5000 });
      
      const latencyMatch = stdout.match(/time=([\d.]+)\s*ms/);
      
      if (latencyMatch) {
        const latency = parseFloat(latencyMatch[1]);
        return { healthy: true, latency };
      }
      
      return { healthy: true, latency: 0 };
    } catch (error) {
      return { 
        healthy: false, 
        error: `Ping failed: ${error instanceof Error ? error.message : String(error)}` 
      };
    }
  }

  detectRateLimit(statusCode: number): boolean {
    return statusCode === 429;
  }

  async handleRateLimit(): Promise<void> {
    console.log('[Health] Rate limit detected (429), rotating IP...');
    
    const result = await this.vpnClient.rotate();
    
    if (!result.success) {
      console.error('[Health] Failed to rotate IP after rate limit');
      throw new Error('Failed to rotate IP after rate limit detection');
    }
    
    console.log(`[Health] Successfully rotated to ${result.server}`);
  }

  startMonitoring(intervalMs: number = 60000, onUnhealthy?: () => void): void {
    this.onUnhealthy = onUnhealthy;
    
    console.log(`[Health] Starting monitoring (interval: ${intervalMs}ms)`);
    
    this.checkInterval = setInterval(async () => {
      const health = await this.checkConnection();
      
      if (!health.healthy) {
        console.error(`[Health] Connection unhealthy: ${health.error}`);
        
        if (this.onUnhealthy) {
          this.onUnhealthy();
        }
      } else {
        console.log(`[Health] Connection healthy (latency: ${health.latency}ms)`);
      }
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
      console.log('[Health] Monitoring stopped');
    }
  }

  async waitForConnection(timeoutMs: number = 30000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      const health = await this.checkConnection();
      
      if (health.healthy) {
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return false;
  }
}
