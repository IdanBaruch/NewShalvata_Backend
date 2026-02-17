@echo off
echo ================================
echo Protocol 66 - Setup Script
echo ================================
echo.

echo [1/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/5] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo .env file created from template
    echo IMPORTANT: Edit .env and add your ANTHROPIC_API_KEY!
) else (
    echo .env already exists, skipping...
)

echo.
echo [3/5] Starting PostgreSQL with Docker...
docker-compose up postgres -d
if %errorlevel% neq 0 (
    echo WARNING: Docker Compose failed. Do you have Docker installed?
    echo You can install PostgreSQL manually instead.
)

echo.
echo [4/5] Waiting for database to be ready...
timeout /t 5 /nobreak > nul

echo.
echo [5/5] Setup complete!
echo.
echo ================================
echo Next Steps:
echo ================================
echo 1. Edit .env file with your API keys
echo 2. Run: npm run start:dev
echo 3. Open: http://localhost:8000/docs
echo.
echo ================================
pause
