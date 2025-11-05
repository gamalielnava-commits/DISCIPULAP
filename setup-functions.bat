@echo off

echo 🔧 Setting up Firebase Functions...

REM Create functions directory structure
if not exist functions\src mkdir functions\src

REM Create package.json for functions
(
echo {
echo   "name": "functions",
echo   "type": "module",
echo   "engines": {
echo     "node": "20"
echo   },
echo   "main": "lib/index.js",
echo   "scripts": {
echo     "build": "tsc",
echo     "serve": "npm run build && firebase emulators:start --only functions",
echo     "shell": "npm run build && firebase functions:shell",
echo     "deploy": "firebase deploy --only functions",
echo     "logs": "firebase functions:log"
echo   },
echo   "dependencies": {
echo     "@hono/trpc-server": "^0.4.0",
echo     "@trpc/server": "^11.5.1",
echo     "firebase-admin": "^13.5.0",
echo     "firebase-functions": "^6.1.2",
echo     "hono": "^4.9.8",
echo     "superjson": "^2.2.2",
echo     "zod": "^4.1.12"
echo   },
echo   "devDependencies": {
echo     "@types/node": "^20.0.0",
echo     "typescript": "~5.9.2"
echo   }
echo }
) > functions\package.json

REM Create tsconfig.json for functions
(
echo {
echo   "compilerOptions": {
echo     "module": "ESNext",
echo     "target": "ES2022",
echo     "lib": ["ES2022"],
echo     "moduleResolution": "bundler",
echo     "esModuleInterop": true,
echo     "skipLibCheck": true,
echo     "strict": true,
echo     "outDir": "lib",
echo     "sourceMap": true,
echo     "resolveJsonModule": true,
echo     "allowSyntheticDefaultImports": true
echo   },
echo   "include": ["src/**/*"],
echo   "exclude": ["node_modules"]
echo }
) > functions\tsconfig.json

echo ✅ Functions setup completed!
echo 📝 Next steps:
echo    1. Run: cd functions
echo    2. Run: npm install
echo    3. Run: cd ..
echo    4. Run: deploy-firebase-complete.bat
