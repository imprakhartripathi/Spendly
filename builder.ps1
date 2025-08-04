# Fresh Docker Build Script for Spendly
# This script builds fresh Docker images and starts the application

Write-Host "🚀 Building fresh Docker images for Spendly..." -ForegroundColor Green

# Stop and remove existing containers and images
Write-Host "📦 Cleaning up existing containers and images..." -ForegroundColor Yellow
docker-compose down --rmi all --volumes --remove-orphans

# Build fresh images without cache
Write-Host "🔨 Building fresh images..." -ForegroundColor Yellow
docker-compose build --no-cache

# Start the application
Write-Host "▶️ Starting the application..." -ForegroundColor Yellow
docker-compose up -d

# Show status
Write-Host "📊 Container status:" -ForegroundColor Green
docker-compose ps

Write-Host "✅ Fresh Docker images built and application started!" -ForegroundColor Green
Write-Host "🌐 Client: http://localhost:5000" -ForegroundColor Cyan
Write-Host "🔧 Server: http://localhost:4200" -ForegroundColor Cyan