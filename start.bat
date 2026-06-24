@echo off
echo Starting AccoFinder...
echo.

cd /d "%~dp0"

echo 1. Starting Frontend on http://127.0.0.1:5500...
cd client
start "AccoFinder Frontend" cmd /c "python -m http.server 5500"

echo 2. Installing Backend Dependencies...
cd ../server
call pip install -r requirements.txt >nul 2>&1

echo 3. Starting Backend API on http://127.0.0.1:8000...
start "AccoFinder Backend" cmd /c "python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo.
echo ====================================================
echo Services Started!
echo Frontend: http://127.0.0.1:5500/login.html
echo Backend:  http://127.0.0.1:8000
echo ====================================================
echo To stop, close the two command prompt windows.
echo.
pause
