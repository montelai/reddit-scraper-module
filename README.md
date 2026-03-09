# VPN Manager CLI

VPN connection manager CLI tool for Reddit scraping with automatic IP rotation and health monitoring.

## Features

- Connect/disconnect from VPN
- Automatic IP rotation
- Rate limit detection (429 status)
- Connection health monitoring
- Auto-reconnect on failure (3 retries)

## Installation

```bash
yarn install
yarn build
```

## Usage

### Connect to VPN
```bash
node dist/index.js connect
node dist/index.js connect --server us1234
```

### Disconnect from VPN
```bash
node dist/index.js disconnect
```

### Check VPN Status
```bash
node dist/index.js status
```

### Rotate IP Address
```bash
node dist/index.js rotate
```

### List Available Countries
```bash
node dist/index.js countries
```

### Start Health Monitoring
```bash
node dist/index.js monitor
node dist/index.js monitor --interval 30000
```

## Requirements

- Node.js 16+
- NordVPN CLI installed and configured
- Active NordVPN subscription

## API Usage

```typescript
import { VPNClient, HealthMonitor } from './dist';

const vpnClient = new VPNClient();
const healthMonitor = new HealthMonitor(vpnClient);

// Connect
await vpnClient.connect();

// Check status
const status = await vpnClient.status();

// Rotate IP
await vpnClient.rotate();

// Handle rate limits
if (healthMonitor.detectRateLimit(429)) {
  await healthMonitor.handleRateLimit();
}
```
