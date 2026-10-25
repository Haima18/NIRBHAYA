@echo off
echo ============================================
echo    NIRBHAYA - Women Safety App
echo    Hackathon Demo Startup
echo ============================================
echo.

:: Start backend
echo [1/2] Starting backend (Flask on port 5000)...
start "NIRBHAYA Backend" cmd /k "cd /d %~dp0backend && python app.py"

:: Wait for backend to start
timeout /t 3 /nobreak > nul

:: Start frontend
echo [2/2] Starting frontend (Vite on port 3000)...
start "NIRBHAYA Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================
echo  App starting...
echo  Open: http://localhost:3000
echo.
echo  Backend running at: http://localhost:5000
echo.
echo  Features that need backend running:
echo   - Login / Register / Profile
echo   - AI Assistant (enhanced)
echo   - Location Sharing
echo   - Deepfake Detective
echo   - Live Safety News
echo   - Nearby Places (Map)
echo.
echo  Features that work offline:
echo   - Digital Guardian (text analysis)
echo   - Evidence Vault
echo   - NIRBHAYA Pathway
echo   - Privacy Shield
echo   - HerCircle tools
echo   - Emergency Directory
echo   - Siren + SOS buttons
echo ============================================
echo.

timeout /t 5 /nobreak > nul
start http://localhost:3000
