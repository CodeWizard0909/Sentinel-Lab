#!/bin/bash
# SentinelLab — Deploy to AWS

set -e

echo "🚀 Deploying SentinelLab..."

cd infrastructure
sam build
sam deploy --no-confirm-changeset

echo "✅ Deployment complete!"
