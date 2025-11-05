#!/bin/bash

echo "Setting up Firebase Functions..."

# Navigate to functions directory
cd functions

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
  echo "Creating package.json..."
  cat > package.json << 'EOF'
{
  "name": "functions",
  "version": "1.0.0",
  "description": "Firebase Functions for Discipulado App",
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "@hono/trpc-server": "^0.4.0",
    "@trpc/server": "^11.5.1",
    "firebase-admin": "^13.5.0",
    "firebase-functions": "^6.2.0",
    "hono": "^4.9.8",
    "superjson": "^2.2.2",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.9.2"
  },
  "private": true
}
EOF
fi

# Create tsconfig.json if it doesn't exist
if [ ! -f "tsconfig.json" ]; then
  echo "Creating tsconfig.json..."
  cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2021",
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "skipLibCheck": true
  },
  "include": [
    "src"
  ],
  "exclude": [
    "node_modules"
  ]
}
EOF
fi

# Install dependencies
echo "Installing dependencies..."
npm install

echo "Building functions..."
npm run build

echo "Firebase Functions setup complete!"
echo ""
echo "To deploy functions, run: firebase deploy --only functions"
