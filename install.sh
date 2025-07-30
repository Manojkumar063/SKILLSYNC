#!/bin/bash

# SkillSync Backend Quick Installation Script

echo "🚀 Starting SkillSync Backend Installation..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 16+ first."
    exit 1
fi

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB not found. Please install MongoDB first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create uploads and logs directories
echo "📁 Creating directories..."
mkdir -p uploads logs
touch uploads/.gitkeep logs/.gitkeep

# Copy environment file
if [ ! -f .env ]; then
    echo "📄 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please configure your .env file before running the server"
fi

# Set permissions
echo "🔐 Setting permissions..."
chmod 755 uploads logs

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Configure your .env file"
echo "2. Start MongoDB: brew services start mongodb-community (macOS)"
echo "3. Run: npm run seed (optional - adds sample data)"
echo "4. Run: npm run dev"
echo ""
echo "🌟 Your SkillSync backend will be available at http://localhost:5000"
