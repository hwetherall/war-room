# War Room Startup Script
# Double-click this file or run: .\start-war-room.ps1

Write-Host "🚀 Starting War Room..." -ForegroundColor Cyan
Write-Host ""

# Check if node_modules exists in root
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing root dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if concurrently is installed
if (-not (Test-Path "node_modules\concurrently")) {
    Write-Host "📦 Installing concurrently..." -ForegroundColor Yellow
    npm install concurrently --save-dev
}

Write-Host ""
Write-Host "🎯 Starting Backend (debate-engine) and Frontend (debate-ui)..." -ForegroundColor Green
Write-Host "   Backend: http://localhost:3001" -ForegroundColor Gray
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow
Write-Host ""

# Start both servers
npm start

