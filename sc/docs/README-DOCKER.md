# 🐳 Using Foundry with Docker

This guide shows you how to use Foundry tools (forge, anvil, cast) via Docker instead of installing them natively on Windows.

## Prerequisites

- Docker Desktop for Windows installed and running
- Git Bash or PowerShell

## Quick Start

### 1. Build the Docker Image

```bash
cd sc
docker-compose build
```

### 2. Start Services

```bash
# Start all services (Foundry + Anvil)
docker-compose up -d

# Or start only Anvil blockchain
docker-compose up -d anvil
```

### 3. Run Foundry Commands

#### Compile Contracts
```bash
docker-compose exec foundry forge build
```

#### Run Tests
```bash
docker-compose exec foundry forge test
```

#### Run Tests with Verbosity
```bash
docker-compose exec foundry forge test -vvv
```

#### Deploy Contract to Anvil
```bash
docker-compose exec foundry forge script script/Deploy.s.sol \
  --rpc-url http://anvil:8545 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
  --broadcast
```

## Using Anvil (Local Blockchain)

### Start Anvil
```bash
docker-compose up -d anvil
```

Anvil will be available at: `http://localhost:8545`

### View Anvil Logs
```bash
docker-compose logs -f anvil
```

### Default Anvil Accounts
Anvil provides 10 test accounts with 10,000 ETH each:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

# ... and 7 more accounts
```

## Useful Commands

### Interactive Shell
```bash
# Enter the Foundry container
docker-compose exec foundry sh

# Now you can run commands directly
forge build
forge test
cast --version
```

### Clean Build
```bash
docker-compose exec foundry forge clean
docker-compose exec foundry forge build
```

### Check Coverage
```bash
docker-compose exec foundry forge coverage
```

### Format Code
```bash
docker-compose exec foundry forge fmt
```

## PowerShell Aliases (Optional)

Add these to your PowerShell profile for easier usage:

```powershell
# Open profile: notepad $PROFILE

function forge { docker-compose -f sc/docker-compose.yml exec foundry forge $args }
function anvil-logs { docker-compose -f sc/docker-compose.yml logs -f anvil }
function foundry-shell { docker-compose -f sc/docker-compose.yml exec foundry sh }
```

Then you can use:
```bash
forge build
forge test
anvil-logs
```

## Troubleshooting

### Container Won't Start
```bash
# Stop all containers
docker-compose down

# Remove volumes and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Permission Issues
```bash
# On Windows, ensure Docker Desktop has access to your drive
# Settings → Resources → File Sharing
```

### Port 8545 Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :8545

# Stop the process or change the port in docker-compose.yml
```

## Connecting Frontend to Dockerized Anvil

Your Next.js frontend can connect to Anvil at:
```
http://localhost:8545
```

No changes needed in your frontend configuration!

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Benefits of Docker Approach

✅ No need to install Foundry on Windows  
✅ Consistent environment across team members  
✅ Easy to reset/clean state  
✅ Isolated from system dependencies  
✅ Works on any OS with Docker  

## Next Steps

1. Start Anvil: `docker-compose up -d anvil`
2. Compile contracts: `docker-compose exec foundry forge build`
3. Run tests: `docker-compose exec foundry forge test`
4. Deploy: See deployment command above
5. Connect MetaMask to `http://localhost:8545` (Chain ID: 31337)
