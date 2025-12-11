@echo off
echo ==================================================
echo         WAR ROOM - Fresh Start
echo ==================================================
echo.

REM Kill any existing processes on our ports
echo Killing any existing servers...

REM Kill process on port 3001 (backend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001" ^| findstr "LISTENING"') do (
    echo    Killing process on port 3001 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill process on port 5173 (frontend)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    echo    Killing process on port 5173 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill process on port 5174 (frontend fallback)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5174" ^| findstr "LISTENING"') do (
    echo    Killing process on port 5174 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

REM Kill process on port 5175 (frontend fallback 2)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5175" ^| findstr "LISTENING"') do (
    echo    Killing process on port 5175 (PID: %%a)
    taskkill /F /PID %%a >nul 2>&1
)

echo    Done.
echo.

REM Always install all dependencies to avoid stale code
echo [1/3] Installing root dependencies...
call npm install

echo.
echo [2/3] Installing backend dependencies...
cd debate-engine
call npm install
cd ..

echo.
echo [3/3] Installing frontend dependencies...
cd debate-ui
call npm install
cd ..

echo.
echo ==================================================
echo All dependencies installed!
echo ==================================================
echo.
echo Starting servers...
echo    Backend:  http://localhost:3001
echo    Frontend: http://localhost:5173
echo.
echo Press Ctrl+C to stop both servers
echo.

REM Start both servers
call npm start

pause

