#!/bin/bash

# Impact LMS - Docker Startup Script
# This script starts all services in Docker

echo "🐳 Starting Impact LMS in Docker..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Error: docker-compose is not installed!"
    echo "Please install docker-compose and try again."
    exit 1
fi

# Navigate to project directory
cd "$(dirname "$0")"

echo "📦 Building and starting all services..."
echo ""

# Start services
docker-compose up --build

# Note: To run in background, use: docker-compose up --build -d
