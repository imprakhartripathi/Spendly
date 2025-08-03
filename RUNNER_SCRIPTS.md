# Spendly Runner Scripts 🚀

Beautiful, interactive scripts to run your Spendly application in Production or Development mode.

## Available Scripts

### 🪟 Windows PowerShell Script
```powershell
.\run-spendly.ps1
```

### 🐧 Linux/macOS Bash Script
```bash
./run-spendly.sh
```

## Features ✨

### 🎨 Beautiful Interface
- Colorful, professional logging
- ASCII art banner
- Progress indicators and status messages
- Clear separation of different sections

### 🎯 Interactive Mode Selection
- **Production Mode**: Runs with Docker containers
- **Development Mode**: Runs locally with hot reload
- Automatic dependency checking and installation

### 📊 Comprehensive Logging
- ✅ Success messages
- ℹ️ Information messages  
- ⚠️ Warning messages
- ❌ Error messages
- 🔄 Progress steps

### 🔧 Smart Environment Detection
- Checks Docker availability for production mode
- Checks Node.js installation for development mode
- Automatically installs missing dependencies
- Validates project structure

## Usage Examples

### Interactive Mode (Recommended)
```powershell
# Windows
.\run-spendly.ps1

# Linux/macOS
./run-spendly.sh
```

### Direct Mode Selection
```powershell
# Windows - Production
.\run-spendly.ps1 -Mode production

# Windows - Development  
.\run-spendly.ps1 -Mode development

# Linux/macOS - Production
./run-spendly.sh production

# Linux/macOS - Development
./run-spendly.sh development
```

### Short Commands
```powershell
# Windows
.\run-spendly.ps1 -Mode prod
.\run-spendly.ps1 -Mode dev

# Linux/macOS
./run-spendly.sh prod
./run-spendly.sh dev
```

## Production Mode 🚀

**What it does:**
- Checks Docker availability
- Stops any existing containers
- Builds and starts Docker containers
- Shows container status and URLs
- Provides useful Docker commands

**URLs:**
- Frontend: http://localhost:5000
- Backend: http://localhost:4200

**Features:**
- Optimized for production
- Nginx serving static files
- Container isolation
- Easy scaling and deployment

## Development Mode 🛠️

**What it does:**
- Checks Node.js availability
- Installs missing dependencies automatically
- Starts backend server with nodemon (hot reload)
- Starts frontend with Vite dev server (HMR)
- Opens separate terminal windows (Windows) or runs in background (Linux/macOS)

**URLs:**
- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:4200 (Node.js with nodemon)

**Features:**
- Hot Module Replacement (HMR)
- Auto-restart on file changes
- Source maps for debugging
- Development error overlay
- Fast development workflow

## Error Handling 🛡️

The scripts include comprehensive error handling:
- Docker not running detection
- Node.js not installed detection
- Missing dependencies auto-installation
- Container startup failure detection
- Graceful error messages with solutions

## Cross-Platform Support 🌍

- **Windows**: PowerShell script with Windows-specific features
- **Linux/macOS**: Bash script with Unix-specific features
- **Consistent**: Same functionality across all platforms
- **Native**: Uses platform-specific tools and conventions

## Development Server Management

### Windows (PowerShell)
- Opens separate terminal windows for each server
- Easy to monitor and control individually
- Close windows or Ctrl+C to stop

### Linux/macOS (Bash)
- Runs servers in background
- Creates `stop-dev.sh` script automatically
- Use `./stop-dev.sh` to stop all development servers

## Tips 💡

1. **First Run**: The script will automatically install dependencies if missing
2. **Docker Issues**: Make sure Docker Desktop is running before production mode
3. **Port Conflicts**: Stop other applications using ports 4200, 5000, or 5173
4. **Development**: Use development mode for coding, production mode for testing deployment
5. **Logs**: Check container logs with `docker-compose logs -f` in production mode

## Troubleshooting 🔧

### Common Issues:
- **Docker not found**: Install Docker Desktop
- **Node.js not found**: Install Node.js from nodejs.org
- **Port already in use**: Stop other applications or change ports in configuration
- **Permission denied**: Run as administrator (Windows) or with sudo (Linux/macOS)

### Getting Help:
- Check the error messages - they include helpful suggestions
- Verify all prerequisites are installed
- Ensure you're in the correct project directory