# Spendly Application Runner
# Interactive script to run Spendly in Production (Docker) or Development mode

param(
    [string]$Mode = ""
)

# Color functions for beautiful output
function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor White
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Text)
    Write-Host "✅ $Text" -ForegroundColor Green
}

function Write-Info {
    param([string]$Text)
    Write-Host "ℹ️  $Text" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Text)
    Write-Host "⚠️  $Text" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Text)
    Write-Host "❌ $Text" -ForegroundColor Red
}

function Write-Step {
    param([string]$Text)
    Write-Host "🔄 $Text" -ForegroundColor Magenta
}

function Write-Separator {
    Write-Host "───────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
}

# ASCII Art Banner
function Show-Banner {
    Write-Host ""
    Write-Host "  ███████╗██████╗ ███████╗███╗   ██╗██████╗ ██╗  ██╗   ██╗" -ForegroundColor Green
    Write-Host "  ██╔════╝██╔══██╗██╔════╝████╗  ██║██╔══██╗██║  ╚██╗ ██╔╝" -ForegroundColor Green
    Write-Host "  ███████╗██████╔╝█████╗  ██╔██╗ ██║██║  ██║██║   ╚████╔╝ " -ForegroundColor Green
    Write-Host "  ╚════██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║  ██║██║    ╚██╔╝  " -ForegroundColor Green
    Write-Host "  ███████║██║     ███████╗██║ ╚████║██████╔╝███████╗██║   " -ForegroundColor Green
    Write-Host "  ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝   " -ForegroundColor Green
    Write-Host ""
    Write-Host "                    Personal Finance Management" -ForegroundColor DarkGreen
    Write-Host ""
}

# Check if Docker is running
function Test-DockerRunning {
    try {
        $null = docker version 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Check if Node.js is installed
function Test-NodeInstalled {
    try {
        $null = node --version 2>$null
        return $true
    }
    catch {
        return $false
    }
}

# Production mode - Docker
function Start-ProductionMode {
    Write-Header "🚀 PRODUCTION MODE - DOCKER DEPLOYMENT"
    
    Write-Step "Checking Docker availability..."
    if (-not (Test-DockerRunning)) {
        Write-Error "Docker is not running or not installed!"
        Write-Info "Please start Docker Desktop and try again."
        return
    }
    Write-Success "Docker is running"
    
    Write-Separator
    Write-Step "Stopping any existing containers..."
    docker-compose down 2>$null
    
    Write-Step "Starting Spendly in production mode..."
    Write-Info "Building and starting containers..."
    
    $startTime = Get-Date
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        Write-Separator
        Write-Success "Spendly started successfully in $([math]::Round($duration, 2)) seconds!"
        
        Write-Info "Container Status:"
        docker-compose ps
        
        Write-Separator
        Write-Header "🌐 APPLICATION URLS"
        Write-Host "  Frontend (Client): " -NoNewline -ForegroundColor White
        Write-Host "http://localhost:5000" -ForegroundColor Cyan
        Write-Host "  Backend (Server):  " -NoNewline -ForegroundColor White
        Write-Host "http://localhost:4200" -ForegroundColor Cyan
        
        Write-Separator
        Write-Info "Useful commands:"
        Write-Host "  • View logs:        " -NoNewline -ForegroundColor DarkGray
        Write-Host "docker-compose logs -f" -ForegroundColor White
        Write-Host "  • Stop application: " -NoNewline -ForegroundColor DarkGray
        Write-Host "docker-compose down" -ForegroundColor White
        Write-Host "  • Restart:          " -NoNewline -ForegroundColor DarkGray
        Write-Host "docker-compose restart" -ForegroundColor White
        
    } else {
        Write-Error "Failed to start containers!"
        Write-Info "Check logs with: docker-compose logs"
    }
}

# Development mode - Local
function Start-DevelopmentMode {
    Write-Header "🛠️  DEVELOPMENT MODE - LOCAL ENVIRONMENT"
    
    Write-Step "Checking Node.js availability..."
    if (-not (Test-NodeInstalled)) {
        Write-Error "Node.js is not installed!"
        Write-Info "Please install Node.js and try again."
        return
    }
    
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion is available"
    
    Write-Separator
    Write-Step "Checking project dependencies..."
    
    # Check server dependencies
    if (-not (Test-Path "server\node_modules")) {
        Write-Warning "Server dependencies not found. Installing..."
        Set-Location "server"
        npm install
        Set-Location ".."
        Write-Success "Server dependencies installed"
    } else {
        Write-Success "Server dependencies found"
    }
    
    # Check client dependencies
    if (-not (Test-Path "client\node_modules")) {
        Write-Warning "Client dependencies not found. Installing..."
        Set-Location "client"
        npm install
        Set-Location ".."
        Write-Success "Client dependencies installed"
    } else {
        Write-Success "Client dependencies found"
    }
    
    Write-Separator
    Write-Header "🚀 STARTING DEVELOPMENT SERVERS"
    
    Write-Info "Starting servers in development mode..."
    Write-Warning "This will open multiple terminal windows"
    
    # Start server in new window
    Write-Step "Starting backend server..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'server'; Write-Host '🔧 SPENDLY BACKEND SERVER' -ForegroundColor Green; Write-Host 'Starting Node.js server with hot reload...' -ForegroundColor Cyan; npm start"
    
    Start-Sleep -Seconds 2
    
    # Start client in new window
    Write-Step "Starting frontend development server..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'client'; Write-Host '🌐 SPENDLY FRONTEND CLIENT' -ForegroundColor Blue; Write-Host 'Starting React development server...' -ForegroundColor Cyan; npm run dev"
    
    Write-Separator
    Write-Success "Development servers are starting..."
    Write-Info "Please wait a moment for both servers to initialize"
    
    Write-Separator
    Write-Header "🌐 DEVELOPMENT URLS (will be available shortly)"
    Write-Host "  Frontend (Client): " -NoNewline -ForegroundColor White
    Write-Host "http://localhost:5173" -ForegroundColor Cyan -NoNewline
    Write-Host " (Vite dev server)" -ForegroundColor DarkGray
    Write-Host "  Backend (Server):  " -NoNewline -ForegroundColor White
    Write-Host "http://localhost:4200" -ForegroundColor Cyan -NoNewline
    Write-Host " (Node.js with nodemon)" -ForegroundColor DarkGray
    
    Write-Separator
    Write-Info "Development features enabled:"
    Write-Host "  • Hot Module Replacement (HMR)" -ForegroundColor Green
    Write-Host "  • Auto-restart on file changes" -ForegroundColor Green
    Write-Host "  • Source maps for debugging" -ForegroundColor Green
    Write-Host "  • Development error overlay" -ForegroundColor Green
    
    Write-Warning "To stop development servers, close the terminal windows or press Ctrl+C in each"
}

# Interactive mode selection
function Show-ModeSelection {
    Write-Header "🎯 SELECT DEPLOYMENT MODE"
    
    Write-Host "  [1] 🚀 Production Mode  " -NoNewline -ForegroundColor Green
    Write-Host "- Run with Docker containers (recommended for production)" -ForegroundColor DarkGray
    Write-Host "  [2] 🛠️  Development Mode " -NoNewline -ForegroundColor Yellow
    Write-Host "- Run locally with hot reload (for development)" -ForegroundColor DarkGray
    Write-Host "  [3] ❌ Exit" -ForegroundColor Red
    Write-Host ""
    
    do {
        $choice = Read-Host "Enter your choice (1-3)"
        switch ($choice) {
            "1" { 
                return "production" 
            }
            "2" { 
                return "development" 
            }
            "3" { 
                Write-Info "Goodbye! 👋"
                exit 0 
            }
            default { 
                Write-Warning "Invalid choice. Please enter 1, 2, or 3." 
            }
        }
    } while ($true)
}

# Main execution
try {
    Clear-Host
    Show-Banner
    
    # Change to project directory
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location $scriptPath
    
    Write-Info "Working directory: $(Get-Location)"
    Write-Separator
    
    # Determine mode
    if ($Mode -eq "") {
        $selectedMode = Show-ModeSelection
    } else {
        $selectedMode = $Mode.ToLower()
    }
    
    # Execute based on mode
    switch ($selectedMode) {
        "production" { 
            Start-ProductionMode 
        }
        "development" { 
            Start-DevelopmentMode 
        }
        "prod" { 
            Start-ProductionMode 
        }
        "dev" { 
            Start-DevelopmentMode 
        }
        default { 
            Write-Error "Invalid mode: $Mode"
            Write-Info "Valid modes: production, development, prod, dev"
            exit 1
        }
    }
    
    Write-Separator
    Write-Success "Script completed successfully!"
    
} catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    Write-Info "Please check the error details above and try again."
    exit 1
}

# Keep window open if run directly
if ($Host.Name -eq "ConsoleHost") {
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor DarkGray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}