# 🚀 Quick Start - Docker Foundry Setup

## ✅ What's Been Set Up

Your project now has Docker support for Foundry! No need to install Foundry on Windows.

## 📁 Files Created

- `Dockerfile` - Foundry Docker image
- `docker-compose.yml` - Docker services configuration
- `.dockerignore` - Exclude unnecessary files
- `scripts/forge.ps1` - PowerShell wrapper for forge commands
- `scripts/cast.ps1` - PowerShell wrapper for cast commands
- `scripts/anvil.ps1` - PowerShell wrapper to start Anvil blockchain
- `sc/README-DOCKER.md` - Complete Docker usage guide

## 🎯 Quick Commands

### Compile Smart Contracts
```powershell
.\scripts\forge.ps1 build
```

### Run Tests
```powershell
.\scripts\test.ps1
```

### Run Tests with Verbose Output
```powershell
.\scripts\forge.ps1 test -vvv
```

### Start Anvil Blockchain
```powershell
# In a separate terminal
.\scripts\anvil.ps1
```

### Deploy Contract
```powershell
.\scripts\deploy.ps1
```

## 📋 Next Steps

1. **Test the setup:**
   ```powershell
   .\scripts\forge.ps1 build
   .\scripts\test.ps1
   ```

2. **Start Anvil** (in separate terminal):
   ```powershell
   .\scripts\anvil.ps1
   ```

3. **Deploy contract:**
   ```powershell
   .\scripts\deploy.ps1
   ```

4. **Configure MetaMask:**
   - Network: Anvil Local
   - RPC URL: http://localhost:8545
   - Chain ID: 31337
   - Import test accounts from Anvil output

5. **Update frontend config** with deployed contract address

## 💡 Tips

- All commands run in Docker - no local Foundry installation needed
- Files are mounted from your local directory
- Changes to `.sol` files are immediately available
- See `README-DOCKER.md` for advanced usage

## 🔧 Troubleshooting

If you get permission errors:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

For detailed documentation, see `README-DOCKER.md`
