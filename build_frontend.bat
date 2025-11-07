@echo off
REM Build script to build frontend and prepare for Django serving

echo Building React frontend...
cd frontend
call npm install
call npm run build

echo Frontend build complete!
echo The built files are in frontend/dist/
echo Django will serve these files automatically.

