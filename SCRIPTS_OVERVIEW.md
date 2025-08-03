# Spendly Scripts Overview 📋

Complete collection of scripts created for easy deployment and management of your Spendly application.

## 🚀 Main Runner Scripts

### `run-spendly.ps1` (Windows PowerShell)
**Primary interactive script for Windows users**
- Beautiful ASCII art banner and colorful logging
- Interactive mode selection (Production/Development)
- Automatic dependency checking and installation
- Docker and Node.js availability detection
- Comprehensive error handling with helpful messages
- Opens separate terminal windows for development servers

**Usage:**
```powershell
.\run-spendly.ps1                    # Interactive mode
.\run-spendly.ps1 -Mode production   # Direct production mode
.\run-spendly.ps1 -Mode development  # Direct development mode
.\run-spendly.ps1 -Mode prod         # Short form
.\run-spendly.ps1 -Mode dev          # Short form
```

### `run-spendly.sh` (Linux/macOS Bash)
**Cross-platform bash script for Unix-like systems**
- Same beautiful interface as PowerShell version
- Background process management for development servers
- Automatic creation of `stop-dev.sh` script
- Full feature parity with Windows version
- Native Unix tools integration

**Usage:**
```bash
./run-spendly.sh                # Interactive mode
./run-spendly.sh production     # Direct production mode
./run-spendly.sh development    # Direct development mode
./run-spendly.sh prod          # Short form
./run-spendly.sh dev           # Short form
```

### `spendly.ps1` (Quick Launcher)
**Lightweight launcher that can be run from anywhere**
- Automatically navigates to project directory
- Passes arguments to main runner script
- Perfect for creating shortcuts or aliases

## 🐳 Docker Scripts

### `build-fresh.ps1`
**Complete Docker rebuild script**
- Stops and removes all existing containers and images
- Builds fresh images without cache
- Starts application in production mode
- Shows final status and URLs
- Perfect for clean deployments

**Usage:**
```powershell
.\build-fresh.ps1
```

### `docker-compose.yml`
**Optimized Docker Compose configuration**
- Removed obsolete version attribute
- Client and server service definitions
- Proper port mappings and dependencies
- Production environment variables

## 📚 Documentation Files

### `DOCKER_DEPLOYMENT.md`
- Complete Docker deployment guide
- Image specifications and sizes
- Service URLs and ports
- Useful Docker commands
- Architecture overview
- Optimization details

### `RUNNER_SCRIPTS.md`
- Comprehensive guide to all runner scripts
- Feature explanations and usage examples
- Cross-platform compatibility notes
- Troubleshooting section
- Development vs Production mode details

### `SCRIPTS_OVERVIEW.md` (This file)
- Complete overview of all scripts
- Quick reference for each script's purpose
- Usage examples and best practices

## 🎯 Usage Recommendations

### For Development:
1. **First time**: `.\run-spendly.ps1` → Select Development Mode
2. **Quick start**: `.\run-spendly.ps1 -Mode dev`
3. **Features**: Hot reload, source maps, development error overlay

### For Production:
1. **First time**: `.\run-spendly.ps1` → Select Production Mode
2. **Quick start**: `.\run-spendly.ps1 -Mode prod`
3. **Clean build**: `.\build-fresh.ps1`

### For Testing:
1. **Development testing**: Use development mode for rapid iteration
2. **Production testing**: Use production mode to test Docker deployment
3. **Fresh deployment**: Use `build-fresh.ps1` for clean testing environment

## 🔧 Script Features

### ✨ User Experience:
- **Interactive menus** with clear options
- **Beautiful logging** with colors and emojis
- **Progress indicators** for long-running operations
- **Helpful error messages** with solutions
- **ASCII art banner** for professional appearance

### 🛡️ Error Handling:
- **Prerequisite checking** (Docker, Node.js)
- **Dependency validation** and auto-installation
- **Port conflict detection**
- **Graceful failure handling**
- **Informative error messages**

### 🎨 Cross-Platform Support:
- **Windows PowerShell** with Windows-specific features
- **Unix Bash** with Linux/macOS compatibility
- **Consistent functionality** across platforms
- **Native tool integration** for each platform

## 📁 File Structure

```
Spendly/
├── run-spendly.ps1          # Main Windows runner
├── run-spendly.sh           # Main Unix runner  
├── spendly.ps1              # Quick launcher
├── build-fresh.ps1          # Docker rebuild script
├── docker-compose.yml       # Docker configuration
├── DOCKER_DEPLOYMENT.md     # Docker guide
├── RUNNER_SCRIPTS.md        # Scripts guide
├── SCRIPTS_OVERVIEW.md      # This overview
├── server/
│   ├── dockerfile           # Server Docker config
│   └── .dockerignore        # Server Docker ignore
└── client/
    ├── dockerfile           # Client Docker config
    ├── nginx.conf           # Nginx configuration
    └── .dockerignore        # Client Docker ignore
```

## 🚀 Quick Start Commands

```powershell
# Interactive mode (recommended for first-time users)
.\run-spendly.ps1

# Development mode (for coding)
.\run-spendly.ps1 -Mode dev

# Production mode (for testing deployment)
.\run-spendly.ps1 -Mode prod

# Fresh Docker build (for clean deployment)
.\build-fresh.ps1

# Quick launcher (can be run from anywhere)
.\spendly.ps1 dev
```

## 💡 Pro Tips

1. **Bookmark the interactive script** - `.\run-spendly.ps1` covers all use cases
2. **Use development mode for coding** - Hot reload saves time
3. **Test with production mode** - Verify Docker deployment works
4. **Create desktop shortcuts** - Point to `spendly.ps1` for quick access
5. **Check the logs** - Scripts provide detailed information about what's happening

---

*All scripts are designed to be user-friendly, informative, and robust. They handle common issues automatically and provide clear guidance when manual intervention is needed.*