@echo off
echo Starting Luxe Beauty Servers...
echo.
echo Starting Main Server (Port 3001)...
start "Luxe Beauty Main" cmd /k "node server.js"
timeout /t 2 /nobreak > nul
echo.
echo Starting API Server (Port 3002)...
start "Luxe Beauty API" cmd /k "node api-server.js"
echo.
echo ═══════════════════════════════════════════════════════
echo   All servers started!
echo ═══════════════════════════════════════════════════════
echo   Main Website: http://localhost:3001
echo   Admin Panel:  http://localhost:3001/admin
echo   API Server:   http://localhost:3002
echo ═══════════════════════════════════════════════════════
echo.
pause
