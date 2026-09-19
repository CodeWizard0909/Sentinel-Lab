#!/bin/bash
# SentinelLab — Local test script

set -e

echo "🧪 Running SentinelLab tests..."

cd backend

# Run tests
python -m pytest tests/ -v

echo ""
echo "✅ All tests passed!"
