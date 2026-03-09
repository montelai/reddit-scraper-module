import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface VPNStatus {
  connected: boolean;
  server?: string;
  country?: string;
  ip?: string;
  protocol?: string;
}

export interface ConnectionResult {
  success: boolean;
  server?: string;
  error?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

export class VPNClient {
  private provider: string;
  private currentServer?: string;

  constructor(provider: string = 'nordvpn') {
    this.provider = provider;
  }

  async connect(server?: string): Promise<ConnectionResult> {
    let lastError: string | undefined;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[VPN] Connection attempt ${attempt}/${MAX_RETRIES}${server ? ` to ${server}` : ''}`);
        
        const command = server 
          ? `nordvpn connect ${server}`
          : 'nordvpn connect';
        
        const { stdout, stderr } = await execAsync(command, { timeout: 30000 });
        
        if (stderr && !stderr.includes('You are now connected')) {
          throw new Error(stderr);
        }
        
        const status = await this.status();
        
        if (status.connected) {
          this.currentServer = status.server;
          console.log(`[VPN] Successfully connected to ${status.server} (${status.country})`);
          console.log(`[VPN] Your IP: ${status.ip}`);
          return { success: true, server: status.server };
        }
        
        throw new Error('Connection established but status check failed');
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
        console.error(`[VPN] Attempt ${attempt} failed: ${lastError}`);
        
        if (attempt < MAX_RETRIES) {
          console.log(`[VPN] Retrying in ${RETRY_DELAY / 1000}s...`);
          await this.sleep(RETRY_DELAY);
        }
      }
    }
    
    return { success: false, error: lastError };
  }

  async disconnect(): Promise<boolean> {
    try {
      console.log('[VPN] Disconnecting...');
      const { stdout, stderr } = await execAsync('nordvpn disconnect', { timeout: 15000 });
      
      if (stderr && !stderr.includes('You have been disconnected')) {
        console.error(`[VPN] Disconnect warning: ${stderr}`);
      }
      
      this.currentServer = undefined;
      console.log('[VPN] Disconnected successfully');
      return true;
    } catch (error) {
      console.error(`[VPN] Disconnect failed: ${error}`);
      return false;
    }
  }

  async status(): Promise<VPNStatus> {
    try {
      const { stdout } = await execAsync('nordvpn status', { timeout: 5000 });
      
      return this.parseStatus(stdout);
    } catch (error) {
      return { connected: false };
    }
  }

  async rotate(): Promise<ConnectionResult> {
    console.log('[VPN] Rotating IP address...');
    
    const disconnected = await this.disconnect();
    
    if (!disconnected) {
      return { success: false, error: 'Failed to disconnect before rotation' };
    }
    
    await this.sleep(1000);
    
    const newServer = await this.getRandomServer();
    return this.connect(newServer);
  }

  async getAvailableCountries(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('nordvpn countries', { timeout: 10000 });
      
      const countries = stdout
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.includes('-'));
      
      return countries;
    } catch (error) {
      console.error(`[VPN] Failed to get countries: ${error}`);
      return [];
    }
  }

  private parseStatus(output: string): VPNStatus {
    const status: VPNStatus = { connected: false };
    
    if (output.includes('Status: Connected')) {
      status.connected = true;
      
      const serverMatch = output.match(/Current server:\s*(.+)/i);
      const countryMatch = output.match(/Country:\s*(.+)/i);
      const ipMatch = output.match(/Your new IP:\s*(.+)/i);
      const protocolMatch = output.match(/Current protocol:\s*(.+)/i);
      
      if (serverMatch) status.server = serverMatch[1].trim();
      if (countryMatch) status.country = countryMatch[1].trim();
      if (ipMatch) status.ip = ipMatch[1].trim();
      if (protocolMatch) status.protocol = protocolMatch[1].trim();
    }
    
    return status;
  }

  private async getRandomServer(): Promise<string | undefined> {
    const countries = await this.getAvailableCountries();
    
    if (countries.length === 0) {
      return undefined;
    }
    
    const randomIndex = Math.floor(Math.random() * countries.length);
    return countries[randomIndex];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
