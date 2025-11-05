@echo off

echo Setting up Firebase Functions...

cd functions

if not exist "package.json" (
  echo Creating package.json...
  (
    echo {
    echo   "name": "functions",
    echo   "version": "1.0.0",
    echo   "description": "Firebase Functions for Discipulado App",
    echo   "main": "lib/index.js",
    echo   "scripts": {
    echo     "build": "tsc",
    echo     "serve": "npm run build && firebase emulators:start --only functions",
    echo     "shell": "npm run build && firebase functions:shell",
    echo     "start": "npm run shell",
    echo     "deploy": "firebase deploy --only functions",
    echo     "logs": "firebase functions:log"
    echo   },
    echo   "engines": {
    echo     "node": "20"
    echo   },
    echo   "dependencies": {
    echo     "@hono/trpc-server": "^0.4.0",
    echo     "@trpc/server": "^11.5.1",
    echo     "firebase-admin": "^13.5.0",
    echo     "firebase-functions": "^6.2.0",
    echo     "hono": "^4.9.8",
    echo     "superjson": "^2.2.2",
    echo     "zod": "^4.1.12"
    echo   },
    echo   "devDependencies": {
    echo     "@types/node": "^20.0.0",
    echo     "typescript": "^5.9.2"
    echo   },
    echo   "private": true
    echo }
  ) > package.json
)

if not exist "tsconfig.json" (
  echo Creating tsconfig.json...
  (
    echo {
    echo   "compilerOptions": {
    echo     "module": "commonjs",
    echo     "noImplicitReturns": true,
    echo     "noUnusedLocals": true,
    echo     "outDir": "lib",
    echo     "sourceMap": true,
    echo     "strict": true,
    echo     "target": "es2021",
    echo     "esModuleInterop": true,
    echo     "moduleResolution": "node",
    echo     "resolveJsonModule": true,
    echo     "skipLibCheck": true
    echo   },
    echo   "include": [
    echo     "src"
    echo   ],
    echo   "exclude": [
    echo     "node_modules"
    echo   ]
    echo }
  ) > tsconfig.json
)

echo Installing dependencies...
call npm install

echo Building functions...
call npm run build

echo Firebase Functions setup complete!
echo.
echo To deploy functions, run: firebase deploy --only functions

cd ..
