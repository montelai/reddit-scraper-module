#!/usr/bin/env node

import { Command } from 'commander';
import { VPNClient } from '../vpn-client';
import { HealthMonitor } from '../health-monitor';

const program = new Command();
const vpnClient = new VPNClient();
const healthMonitor = new HealthMonitor(vpnClient);

program
  .name('vpn-manager')
  .description('VPN connection manager CLI for Reddit scraping')
  .version('1.0.0');

program
  .command('connect')
  .description('Connect to VPN')
  .option('-p, --provider <provider>', 'VPN provider (default: nordvpn)', 'nordvpn')
  .option('-s, --server <server>', 'Specific server to connect to')
  .action(async (options) => {
    try {
      const result = await vpnClient.connect(options.server);

      if (!result.success) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
      }

      console.log('✓ Connected successfully');
    } catch (error) {
      console.error(`Failed to connect: ${error}`);
      process.exit(1);
    }
  });

program
  .command('disconnect')
  .description('Disconnect from VPN')
  .action(async () => {
    try {
      const success = await vpnClient.disconnect();

      if (!success) {
        console.error('Error: Failed to disconnect');
        process.exit(1);
      }

      console.log('✓ Disconnected successfully');
    } catch (error) {
      console.error(`Failed to disconnect: ${error}`);
      process.exit(1);
    }
  });

program
  .command('status')
  .description('Check VPN connection status')
  .action(async () => {
    try {
      const status = await vpnClient.status();

      if (status.connected) {
        console.log('VPN Status: Connected');
        console.log(`  Server: ${status.server}`);
        console.log(`  Country: ${status.country}`);
        console.log(`  IP: ${status.ip}`);
        console.log(`  Protocol: ${status.protocol}`);

        const health = await healthMonitor.checkConnection();

        if (health.healthy) {
          console.log(`  Health: ✓ Healthy (latency: ${health.latency}ms)`);
        } else {
          console.log(`  Health: ✗ Unhealthy (${health.error})`);
        }
      } else {
        console.log('VPN Status: Disconnected');
      }
    } catch (error) {
      console.error(`Failed to check status: ${error}`);
      process.exit(1);
    }
  });

program
  .command('rotate')
  .description('Rotate IP by disconnecting and connecting to a new server')
  .action(async () => {
    try {
      const result = await vpnClient.rotate();

      if (!result.success) {
        console.error(`Error: ${result.error}`);
        process.exit(1);
      }

      console.log(`✓ Rotated successfully to ${result.server}`);
    } catch (error) {
      console.error(`Failed to rotate: ${error}`);
      process.exit(1);
    }
  });

program
  .command('countries')
  .description('List available countries')
  .action(async () => {
    try {
      const countries = await vpnClient.getAvailableCountries();

      if (countries.length === 0) {
        console.log('No countries available');
        return;
      }

      console.log(`Available countries (${countries.length}):`);
      console.log(countries.map((c: string) => `  - ${c}`).join('\n'));
    } catch (error) {
      console.error(`Failed to list countries: ${error}`);
      process.exit(1);
    }
  });

program
  .command('monitor')
  .description('Start health monitoring')
  .option('-i, --interval <ms>', 'Check interval in milliseconds', '60000')
  .action(async (options) => {
    const interval = parseInt(options.interval, 10);

    console.log(`Starting health monitoring (interval: ${interval}ms)`);
    console.log('Press Ctrl+C to stop');

    healthMonitor.startMonitoring(interval, async () => {
      console.log('[Monitor] Connection lost, attempting to reconnect...');
      const result = await vpnClient.connect();

      if (result.success) {
        console.log('[Monitor] Reconnected successfully');
      } else {
        console.error('[Monitor] Reconnection failed');
      }
    });

    process.on('SIGINT', () => {
      healthMonitor.stopMonitoring();
      console.log('\nMonitoring stopped');
      process.exit(0);
    });
  });

program.parse();
