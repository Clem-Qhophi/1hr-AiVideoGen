@echo off
echo Starting Framewright servers...
echo.
echo [1/2] Starting backend (port 8000)...
start "Framewright Backend" powershell -NoExit -Command "Set-Location -LiteralPath '%~dp0'; .\venv\Scripts\python.exe -m uvicorn server.main:app --host 0.0.0.0 --port 8000"
echo     Backend: http://localhost:8000
echo.
echo [2/2] Starting frontend (port 5173)...
start "Framewright Frontend" cmd /c "cd /d %~dp0web && npm run dev"
echo     Frontend: http://localhost:5173
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:5173
echo.
echo Done. Close this window when you want to stop.
