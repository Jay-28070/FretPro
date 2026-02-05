@echo off
echo ========================================
echo Deploying Firestore Rules to Firebase
echo ========================================
echo.

echo Checking Firebase CLI...
firebase --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Firebase CLI not installed!
    echo.
    echo Install it with: npm install -g firebase-tools
    echo Then run: firebase login
    echo.
    pause
    exit /b 1
)

echo.
echo Deploying rules...
firebase deploy --only firestore:rules

if errorlevel 1 (
    echo.
    echo ERROR: Deployment failed!
    echo.
    echo Make sure you're logged in: firebase login
    echo Make sure you're in the right project: firebase use --add
    echo.
) else (
    echo.
    echo ========================================
    echo SUCCESS! Rules deployed to Firebase
    echo ========================================
    echo.
    echo Now test your Friends tab - the permission error should be gone!
    echo.
)

pause
