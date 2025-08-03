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

function Show-Banner {
    Write-Host ""
    Write-Host "   SPENDLY - Personal Finance Management" -ForegroundColor Green
    Write-Host "   =====================================" -ForegroundColor Cyan
    Write-Host "   by Prakhar Tripathi" -ForegroundColor DarkGray
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
    Write-Host "PRODUCTION MODE - DOCKER DEPLOYMENT" -ForegroundColor Green
    Write-Host "====================================" -ForegroundColor Cyan
    
    Write-Step "Checking Docker availability..."
    if (-not (Test-Docker)) {
        Write-Error "Docker is not running! Please start Docker Desktop."
        return
    }
    Write-Success "Docker is available"
    
    Write-Host "------------------------------------" -ForegroundColor DarkGray
    Write-Info "Stopping existing containers..."
    docker-compose down 2>$null
    
    Write-Info "Starting containers..."
    $startTime = Get-Date
    docker-compose up -d
    
    if ($LASTEXITCODE -eq 0) {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds
        
        Write-Host "------------------------------------" -ForegroundColor DarkGray
        Write-Success "Application started successfully in $([math]::Round($duration, 2)) seconds!"
        Write-Host ""
        Write-Host "APPLICATION URLS:" -ForegroundColor Yellow
        Write-Host "   Frontend: http://localhost:5000" -ForegroundColor Cyan
        Write-Host "   Backend:  http://localhost:4200" -ForegroundColor Cyan
        Write-Host ""
        Write-Info "Container Status:"
        docker-compose ps
        Write-Host ""
        Write-Host "Useful Commands:" -ForegroundColor Yellow
        Write-Host "   docker-compose logs -f    (view logs)" -ForegroundColor DarkGray
        Write-Host "   docker-compose down       (stop app)" -ForegroundColor DarkGray
        Write-Host "   docker-compose restart    (restart)" -ForegroundColor DarkGray
    } else {
        Write-Error "Failed to start containers!"
    }
}

function Start-Development {
    Write-Host "DEVELOPMENT MODE - LOCAL ENVIRONMENT" -ForegroundColor Yellow
    Write-Host "====================================" -ForegroundColor Cyan
    
    Write-Step "Checking Node.js availability..."
    if (-not (Test-Node)) {
        Write-Error "Node.js is not installed!"
        return
    }
    
    $nodeVersion = node --version
    Write-Success "Node.js $nodeVersion is available"
    
    Write-Host "------------------------------------" -ForegroundColor DarkGray
    Write-Step "Checking dependencies..."
    
    if (-not (Test-Path "server\node_modules")) {
        Write-Warning "Installing server dependencies..."
        Set-Location "server"
        npm install
        Set-Location ".."
        Write-Success "Server dependencies installed"
    } else {
        Write-Success "Server dependencies found"
    }
    
    if (-not (Test-Path "client\node_modules")) {
        Write-Warning "Installing client dependencies..."
        Set-Location "client"
        npm install
        Set-Location ".."
        Write-Success "Client dependencies installed"
    } else {
        Write-Success "Client dependencies found"
    }
    
    Write-Host "------------------------------------" -ForegroundColor DarkGray
    Write-Host "STARTING DEVELOPMENT SERVERS" -ForegroundColor Yellow
    Write-Info "Opening terminal windows for each server..."
    
    Write-Step "Starting backend server..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; Write-Host 'BACKEND SERVER' -ForegroundColor Green; npm start"
    
    Start-Sleep 2
    
    Write-Step "Starting frontend server..."
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd client; Write-Host 'FRONTEND CLIENT' -ForegroundColor Blue; npm run dev"
    
    Write-Host "------------------------------------" -ForegroundColor DarkGray
    Write-Success "Development servers starting..."
    Write-Host ""
    Write-Host "DEVELOPMENT URLS:" -ForegroundColor Yellow
    Write-Host "   Frontend: http://localhost:5173 (Vite dev server)" -ForegroundColor Cyan
    Write-Host "   Backend:  http://localhost:4200 (Node.js)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Features:" -ForegroundColor Yellow
    Write-Host "   Hot reload, source maps, error overlay" -ForegroundColor Green
    Write-Host ""
    Write-Warning "Close terminal windows to stop servers"
}

# Main execution
Clear-Host
Show-Banner

Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
Write-Info "Working directory: $(Get-Location)"
Write-Host "------------------------------------" -ForegroundColor DarkGray

if ($Mode -eq "") {
    Write-Host "SELECT MODE:" -ForegroundColor White
    Write-Host "[1] Production (Docker)" -ForegroundColor Green
    Write-Host "[2] Development (Local)" -ForegroundColor Yellow
    Write-Host "[3] Exit" -ForegroundColor Red
    
    do {
        $choice = Read-Host "Enter choice (1-3)"
        switch ($choice) {
            "1" { 
                Write-Host ""
                Start-Production
                break 
            }
            "2" { 
                Write-Host ""
                Start-Development
                break 
            }
            "3" { 
                Write-Info "Goodbye!"
                exit 
            }
            default { 
                Write-Warning "Invalid choice. Enter 1, 2, or 3." 
            }
        }
    } while ($true)
} else {
    switch ($Mode.ToLower()) {
        "production" { Start-Production }
        "prod" { Start-Production }
        "development" { Start-Development }
        "dev" { Start-Development }
        default { 
            Write-Error "Invalid mode. Use production or development" 
        }
    }
}

Write-Host ""
Write-Host "------------------------------------" -ForegroundColor DarkGray
Write-Success "Script completed!"
Write-Host ""