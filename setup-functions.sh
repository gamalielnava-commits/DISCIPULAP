#!/bin/bash

echo "🔧 Setting up Firebase Functions..."

# Create functions directory structure
mkdir -p functions/src

# Create package.json for functions
cat > functions/package.json << 'EOF'
{
  "name": "functions",
  "type": "module",
  "engines": {
    "node": "20"
  },
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "dependencies": {
    "@hono/trpc-server": "^0.4.0",
    "@trpc/server": "^11.5.1",
    "firebase-admin": "^13.5.0",
    "firebase-functions": "^6.1.2",
    "hono": "^4.9.8",
    "superjson": "^2.2.2",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "~5.9.2"
  }
}
EOF

# Create tsconfig.json for functions
cat > functions/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "ESNext",
    "target": "ES2022",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "outDir": "lib",
    "sourceMap": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
EOF

echo "✅ Functions setup completed!"
echo "📝 Next steps:"
echo "   1. Run: cd functions && npm install"
echo "   2. Run: ./deploy-firebase-complete.sh"
