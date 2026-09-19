#!/bin/bash
# SentinelLab — Local setup script

set -e

echo "🛡️  Setting up SentinelLab..."

# Backend
echo "📦 Setting up backend..."
cd backend
python -m venv .venv
source .venv/bin/activate 2>/dev/null || .venv/Scripts/activate
pip install -r requirements.txt
cd ..

# Frontend
echo "📦 Setting up frontend..."
cd frontend
npm install
cd ..

# Environment
if [ ! -f .env ]; then
    cp .env.example .env
    echo "📝 Created .env from .env.example — edit as needed"
fi

echo "✅ Setup complete!"
echo ""
echo "Start backend:  cd backend && uvicorn app.main:app --reload"
echo "Start frontend: cd frontend && npm run dev"
