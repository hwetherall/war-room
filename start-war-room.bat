@echo off
echo ╔══════════════════════════════════════════════════╗
echo ║     🚀 WAR ROOM - Fresh Start                    ║
echo ╚══════════════════════════════════════════════════╝
echo.

REM Always install all dependencies to avoid stale code
echo 📦 Installing all dependencies...
echo    - Root
call npm install

echo    - Debate Engine (Backend)
cd debate-engine
call npm install
cd ..

echo    - Debate UI (Frontend)
cd debate-ui
call npm install
cd ..

echo.
echo ✅ All dependencies installed!
echo.
echo 🎯 Starting servers...
echo    Backend:  http://localhost:3001
echo    Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
call npm start

pause

