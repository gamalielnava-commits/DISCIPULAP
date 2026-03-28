#!/bin/bash

echo "🚀 Starting Firebase deployment..."

# 1. Build web app
echo "📦 Building web app..."
npm run build:web
if [ $? -ne 0 ]; then
  echo "❌ Web build failed"
  exit 1
fi

# 2. Copy backend files to functions
echo "📋 Copying backend files to functions..."
rm -rf functions/src/trpc
mkdir -p functions/src/trpc
cp -r backend/trpc/* functions/src/trpc/
cp backend/firebaseAdmin.ts functions/src/firebaseAdmin.ts 2>/dev/null || echo "⚠️ firebaseAdmin.ts not found, skipping"

# 3. Install functions dependencies
echo "📦 Installing functions dependencies..."
cd functions
npm install
if [ $? -ne 0 ]; then
  echo "❌ Functions dependencies installation failed"
  exit 1
fi

# 4. Build functions
echo "🔨 Building functions..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Functions build failed"
  exit 1
fi
cd ..

# 5. Deploy everything to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy
if [ $? -ne 0 ]; then
  echo "❌ Firebase deployment failed"
  exit 1
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be available at: https://iglesia-casa-de-dios-ed5b2.web.app"
