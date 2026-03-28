@echo off

echo 🚀 Starting Firebase deployment...

REM 1. Build web app
echo 📦 Building web app...
call npm run build:web
if %errorlevel% neq 0 (
  echo ❌ Web build failed
  exit /b 1
)

REM 2. Copy backend files to functions
echo 📋 Copying backend files to functions...
if exist functions\src\trpc rmdir /s /q functions\src\trpc
mkdir functions\src\trpc
xcopy /s /e /y backend\trpc\* functions\src\trpc\
if exist backend\firebaseAdmin.ts copy /y backend\firebaseAdmin.ts functions\src\firebaseAdmin.ts

REM 3. Install functions dependencies
echo 📦 Installing functions dependencies...
cd functions
call npm install
if %errorlevel% neq 0 (
  echo ❌ Functions dependencies installation failed
  exit /b 1
)

REM 4. Build functions
echo 🔨 Building functions...
call npm run build
if %errorlevel% neq 0 (
  echo ❌ Functions build failed
  exit /b 1
)
cd ..

REM 5. Deploy everything to Firebase
echo 🚀 Deploying to Firebase...
call firebase deploy
if %errorlevel% neq 0 (
  echo ❌ Firebase deployment failed
  exit /b 1
)

echo ✅ Deployment completed successfully!
echo 🌐 Your app should be available at: https://iglesia-casa-de-dios-ed5b2.web.app
