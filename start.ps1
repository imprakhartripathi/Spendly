# Spendly Application Runner
param([string]$Mode = "")

# Functions
function Write-Success { 
    param([string]$Text)
    Write-Host "[SUCCESS] $Text" -ForegroundColor Green 
}

function Write-Info { 
    param([string]$Text)
    Write-Host "[INFO] $Text" -ForegroundColor Cyan 
}

function Write-Warning { 
    param([string]$Text)
    Write-Host "[WARNING] $Text" -ForegroundColor Yellow 
}

function Write-Error { 
    param([string]$Text)
    Write-Host "[ERROR] $Text" -ForegroundColor Red 
}

function Write-Step { 
    param([string]$Text)
    Write-Host "[STEP] $Text" -ForegroundColor Magenta 
}

function Show-Loading {
    param([string]$Text = "Loading", [int]$Duration = 3)
    
    $spinner = @('|', '/', '-', '\')
    $counter = 0
    $endTime = (Get-Date).AddSeconds($Duration)
    
    Write-Host -NoNewline "$Text "
    while ((Get-Date) -lt $endTime) {
        Write-Host -NoNewline "`r$Text $($spinner[$counter % 4])" -ForegroundColor Yellow
        Start-Sleep -Milliseconds 200
        $counter++
    }
    Write-Host -NoNewline "`r$Text " -ForegroundColor Green
    Write-Host "✓" -ForegroundColor Green
}

function Show-ProgressBar {
    param([string]$Activity, [int]$PercentComplete)
    
    $barLength = 40
    $completed = [math]::Floor($barLength * $PercentComplete / 100)
    $remaining = $barLength - $completed
    
    $progressBar = "█" * $completed + "░" * $remaining
    Write-Host -NoNewline "`r$Activity [" -ForegroundColor Cyan
    Write-Host -NoNewline $progressBar -ForegroundColor Green
    Write-Host -NoNewline "] $PercentComplete%" -ForegroundColor Cyan
    
    if ($PercentComplete -eq 100) {
        Write-Host " ✓" -ForegroundColor Green
    }
}

function Show-Menu {
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "  ║                      SELECT LAUNCH MODE                   ║" -ForegroundColor White
    Write-Host "  ╠════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "  ║                                                            ║" -ForegroundColor Cyan
    Write-Host "  ║  [1] 🐳 Production Mode                                   ║" -ForegroundColor Cyan
    Write-Host "  ║      └─ Docker containers with optimized builds           ║" -ForegroundColor DarkGray
    Write-Host "  ║      └─ Ready for deployment                               ║" -ForegroundColor DarkGray
    Write-Host "  ║                                                            ║" -ForegroundColor Cyan
    Write-Host "  ║  [2] 🛠️  Development Mode                                  ║" -ForegroundColor Cyan
    Write-Host "  ║      └─ Local servers with hot reload                     ║" -ForegroundColor DarkGray
    Write-Host "  ║      └─ Debug-friendly environment                         ║" -ForegroundColor DarkGray
    Write-Host "  ║                                                            ║" -ForegroundColor Cyan
    Write-Host "  ║  [3] ❌ Exit                                               ║" -ForegroundColor Cyan
    Write-Host "  ║      └─ Close the application launcher                     ║" -ForegroundColor DarkGray
    Write-Host "  ║                                                            ║" -ForegroundColor Cyan
    Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Get-UserChoice {
    do {
        Write-Host "  💡 " -NoNewline -ForegroundColor Yellow
        Write-Host "Enter your choice " -NoNewline -ForegroundColor White
        Write-Host "(1-3): " -NoNewline -ForegroundColor Cyan
        $choice = Read-Host
        
        if ($choice -match '^[1-3]$') {
            return $choice
        } else {
            Write-Host "  ❌ " -NoNewline -ForegroundColor Red
            Write-Host "Invalid choice! Please enter 1, 2, or 3." -ForegroundColor Red
            Write-Host ""
        }
    } while ($true)
}

function Show-Banner {
    $bannerColor = "Cyan"
    $accentColor = "Green"
    $authorColor = "DarkGray"
    
    Write-Host ""
    Write-Host "  ╔══════════════════════════════════════════════════════════════╗" -ForegroundColor $bannerColor
    Write-Host "  ║                                                              ║" -ForegroundColor $bannerColor
    Write-Host "  ║   ███████╗██████╗ ███████╗███╗   ██╗██████╗ ██╗  ██╗   ██╗  ║" -ForegroundColor $accentColor
    Write-Host "  ║   ██╔════╝██╔══██╗██╔════╝████╗  ██║██╔══██╗██║  ╚██╗ ██╔╝  ║" -ForegroundColor $accentColor
    Write-Host "  ║   ███████╗██████╔╝█████╗  ██╔██╗ ██║██║  ██║██║   ╚████╔╝   ║" -ForegroundColor $accentColor
    Write-Host "  ║   ╚════██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║  ██║██║    ╚██╔╝    ║" -ForegroundColor $accentColor
    Write-Host "  ║   ███████║██║     ███████╗██║ ╚████║██████╔╝███████╗██║     ║" -ForegroundColor $accentColor
    Write-Host "  ║   ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝     ║" -ForegroundColor $accentColor
    Write-Host "  ║                                                              ║" -ForegroundColor $bannerColor
    Write-Host "  ║              Personal Finance Management System              ║" -ForegroundColor White
    Write-Host "  ║                                                              ║" -ForegroundColor $bannerColor
    Write-Host "  ║                    Created by Prakhar Tripathi               ║" -ForegroundColor $authorColor
    Write-Host "  ║                                                              ║" -ForegroundColor $bannerColor
    Write-Host "  ╚══════════════════════════════════════════════════════════════╝" -ForegroundColor $bannerColor
    Write-Host ""
}

function Test-Docker {
    try { 
        docker version | Out-Null
        return $true 
    } catch { 
        return $false 
    }
}

function Test-Node {
    try { 
        node --version | Out-Null
        return $true 
    } catch { 
        return $false 
    }
}

function Start-Production {
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "  ║                    🐳 PRODUCTION MODE                      ║" -ForegroundColor White
    Write-Host "  ║                   Docker Deployment                       ║" -ForegroundColor Green
    Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    # Step 1: Check Docker
    Write-Host "  🔍 " -NoNewline -ForegroundColor Yellow
    Write-Host "Checking Docker availability..." -ForegroundColor White
    Show-ProgressBar "Docker Check" 25
    
    if (-not (Test-Docker)) {
        Write-Host ""
        Write-Host "  ❌ " -NoNewline -ForegroundColor Red
        Write-Host "Docker is not running! Please start Docker Desktop." -ForegroundColor Red
        Write-Host ""
        return
    }
    
    Show-ProgressBar "Docker Check" 100
    Write-Host ""
    Write-Host "  ✅ " -NoNewline -ForegroundColor Green
    Write-Host "Docker is available and ready!" -ForegroundColor Green
    Write-Host ""
    
    # Step 2: Stop existing containers
    Write-Host "  🛑 " -NoNewline -ForegroundColor Yellow
    Write-Host "Stopping existing containers..." -ForegroundColor White
    Show-ProgressBar "Cleanup" 50
    docker-compose down 2>$null | Out-Null
    Show-ProgressBar "Cleanup" 100
    Write-Host ""
    
    # Step 3: Start containers
    Write-Host "  🚀 " -NoNewline -ForegroundColor Yellow
    Write-Host "Starting production containers..." -ForegroundColor White
    $startTime = Get-Date
    
    # Simulate progress for visual appeal
    Show-ProgressBar "Building Images" 20
    Start-Sleep 1
    Show-ProgressBar "Building Images" 60
    
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        Show-ProgressBar "Starting Services" 100
        Write-Host ""
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        Write-Host ""
        Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "  ║                    🎉 SUCCESS!                            ║" -ForegroundColor White
        Write-Host "  ║          Application started in $([math]::Round($duration, 2)) seconds!                    ║" -ForegroundColor Green
        Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "  🌐 " -NoNewline -ForegroundColor Cyan
        Write-Host "APPLICATION URLS:" -ForegroundColor White
        Write-Host "     Frontend: " -NoNewline -ForegroundColor DarkGray
        Write-Host "http://localhost:5000" -ForegroundColor Cyan
        Write-Host "     Backend:  " -NoNewline -ForegroundColor DarkGray
        Write-Host "http://localhost:4200" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "  📊 " -NoNewline -ForegroundColor Magenta
        Write-Host "Container Status:" -ForegroundColor White
        docker-compose ps
        Write-Host ""
        
        Write-Host "  🛠️  " -NoNewline -ForegroundColor Yellow
        Write-Host "Useful Commands:" -ForegroundColor White
        Write-Host "     docker-compose logs -f    " -NoNewline -ForegroundColor DarkGray
        Write-Host "(view logs)" -ForegroundColor Gray
        Write-Host "     docker-compose down       " -NoNewline -ForegroundColor DarkGray
        Write-Host "(stop app)" -ForegroundColor Gray
        Write-Host "     docker-compose restart    " -NoNewline -ForegroundColor DarkGray
        Write-Host "(restart)" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "  ❌ " -NoNewline -ForegroundColor Red
        Write-Host "Failed to start containers!" -ForegroundColor Red
        Write-Host ""
    }
}

function Start-Development {
    Write-Host ""
    Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "  ║                   🛠️  DEVELOPMENT MODE                     ║" -ForegroundColor White
    Write-Host "  ║                   Local Environment                       ║" -ForegroundColor Yellow
    Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    
    # Step 1: Check Node.js
    Write-Host "  🔍 " -NoNewline -ForegroundColor Yellow
    Write-Host "Checking Node.js availability..." -ForegroundColor White
    Show-ProgressBar "Node.js Check" 25
    
    if (-not (Test-Node)) {
        Write-Host ""
        Write-Host "  ❌ " -NoNewline -ForegroundColor Red
        Write-Host "Node.js is not installed!" -ForegroundColor Red
        Write-Host ""
        return
    }
    
    $nodeVersion = node --version
    Show-ProgressBar "Node.js Check" 100
    Write-Host ""
    Write-Host "  ✅ " -NoNewline -ForegroundColor Green
    Write-Host "Node.js $nodeVersion is available!" -ForegroundColor Green
    Write-Host ""
    
    # Step 2: Check dependencies
    Write-Host "  📦 " -NoNewline -ForegroundColor Yellow
    Write-Host "Checking project dependencies..." -ForegroundColor White
    Show-ProgressBar "Dependencies" 20
    
    if (-not (Test-Path "server\node_modules")) {
        Write-Host ""
        Write-Host "  📥 " -NoNewline -ForegroundColor Yellow
        Write-Host "Installing server dependencies..." -ForegroundColor White
        Set-Location "server"
        npm install | Out-Null
        Set-Location ".."
        Write-Host "  ✅ " -NoNewline -ForegroundColor Green
        Write-Host "Server dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "  ✅ " -NoNewline -ForegroundColor Green
        Write-Host "Server dependencies found!" -ForegroundColor Green
    }
    
    Show-ProgressBar "Dependencies" 60
    
    if (-not (Test-Path "client\node_modules")) {
        Write-Host ""
        Write-Host "  📥 " -NoNewline -ForegroundColor Yellow
        Write-Host "Installing client dependencies..." -ForegroundColor White
        Set-Location "client"
        npm install | Out-Null
        Set-Location ".."
        Write-Host "  ✅ " -NoNewline -ForegroundColor Green
        Write-Host "Client dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "  ✅ " -NoNewline -ForegroundColor Green
        Write-Host "Client dependencies found!" -ForegroundColor Green
    }
    
    Show-ProgressBar "Dependencies" 100
    Write-Host ""
    Write-Host ""
    
    # Step 3: Start servers
    Write-Host "  🚀 " -NoNewline -ForegroundColor Yellow
    Write-Host "Starting development servers..." -ForegroundColor White
    Write-Host "  📝 " -NoNewline -ForegroundColor Cyan
    Write-Host "Opening terminal windows for each server..." -ForegroundColor White
    Write-Host ""
    
    Write-Host "  🔧 " -NoNewline -ForegroundColor Magenta
    Write-Host "Starting backend server..." -ForegroundColor White
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; Write-Host '🔧 BACKEND SERVER' -ForegroundColor Green; Write-Host '==================' -ForegroundColor Cyan; npm start"
    
    Show-ProgressBar "Backend Startup" 50
    Start-Sleep 2
    Show-ProgressBar "Backend Startup" 100
    Write-Host ""
    
    Write-Host "  ⚡ " -NoNewline -ForegroundColor Blue
    Write-Host "Starting frontend server..." -ForegroundColor White
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; Write-Host '⚡ FRONTEND CLIENT' -ForegroundColor Blue; Write-Host '==================' -ForegroundColor Cyan; npm run dev"
    
    Show-ProgressBar "Frontend Startup" 50
    Start-Sleep 1
    Show-ProgressBar "Frontend Startup" 100
    Write-Host ""
    Write-Host ""
    
    Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "  ║                🎉 DEVELOPMENT SERVERS STARTED!            ║" -ForegroundColor White
    Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "  🌐 " -NoNewline -ForegroundColor Cyan
    Write-Host "DEVELOPMENT URLS:" -ForegroundColor White
    Write-Host "     Frontend: " -NoNewline -ForegroundColor DarkGray
    Write-Host "http://localhost:5000 " -NoNewline -ForegroundColor Cyan
    Write-Host "(Vite dev server)" -ForegroundColor Gray
    Write-Host "     Backend:  " -NoNewline -ForegroundColor DarkGray
    Write-Host "http://localhost:4200 " -NoNewline -ForegroundColor Cyan
    Write-Host "(Node.js)" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "  ⚡ " -NoNewline -ForegroundColor Yellow
    Write-Host "Development Features:" -ForegroundColor White
    Write-Host "     • Hot reload for instant updates" -ForegroundColor Green
    Write-Host "     • Source maps for easy debugging" -ForegroundColor Green
    Write-Host "     • Error overlay for quick fixes" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "  ⚠️  " -NoNewline -ForegroundColor Red
    Write-Host "To stop servers: Close the terminal windows" -ForegroundColor Yellow
}

# Main execution
Clear-Host
Show-Banner

Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
Write-Host "  📁 " -NoNewline -ForegroundColor Cyan
Write-Host "Working directory: " -NoNewline -ForegroundColor White
Write-Host "$(Get-Location)" -ForegroundColor Gray
Write-Host ""

if ($Mode -eq "") {
    Show-Menu
    $choice = Get-UserChoice
    
    switch ($choice) {
        "1" { 
            Start-Production
        }
        "2" { 
            Start-Development
        }
        "3" { 
            Write-Host ""
            Write-Host "  👋 " -NoNewline -ForegroundColor Yellow
            Write-Host "Thanks for using Spendly! Goodbye!" -ForegroundColor White
            Write-Host ""
            exit 
        }
    }
} else {
    switch ($Mode.ToLower()) {
        "production" { Start-Production }
        "prod" { Start-Production }
        "development" { Start-Development }
        "dev" { Start-Development }
        default { 
            Write-Host ""
            Write-Host "  ❌ " -NoNewline -ForegroundColor Red
            Write-Host "Invalid mode. Use 'production' or 'development'" -ForegroundColor Red
            Write-Host ""
        }
    }
}

Write-Host ""
Write-Host "  ╔════════════════════════════════════════════════════════════╗" -ForegroundColor DarkGray
Write-Host "  ║                    Script Completed!                      ║" -ForegroundColor White
Write-Host "  ╚════════════════════════════════════════════════════════════╝" -ForegroundColor DarkGray
Write-Host ""