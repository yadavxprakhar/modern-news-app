#!/bin/bash

# ==============================================================================
# 🚀 Decoupled API Gateway Developer Bootstrapper & Diagnostics Tool
# ==============================================================================

# Set text color indicators
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================================${NC}"
echo -e "${BLUE}📡 Starting Node.js API Gateway Diagnostics & Bootstrapper...${NC}"
echo -e "${BLUE}======================================================================${NC}"

# Navigate to Gateway workspace directory relative to root project
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
GATEWAY_DIR="$ROOT_DIR/backend-node"

cd "$GATEWAY_DIR" || { echo -e "${RED}✗ Failed to access gateway directory: $GATEWAY_DIR${NC}"; exit 1; }

# 1. Environment Configurations setup
if [ ! -f .env ]; then
    echo -e "${BLUE}⚙️  No active .env file discovered. Scaffolding default settings...${NC}"
    cat <<EOT > .env
PORT=5000
NODE_ENV=development
SPRING_SERVICE_URL=http://localhost:8082/api
REDIS_URL=redis://:redis-dev-pass@localhost:6379
CORS_ORIGIN=http://localhost:3000
NEWS_API_URL=https://newsapi.org/v2
NEWS_API_KEY=
EOT
    echo -e "${GREEN}✓ Created default .env environment template.${NC}"
else
    echo -e "${GREEN}✓ Found existing .env configurations.${NC}"
fi

# 2. Redis Caching Cluster Accessibility Check
echo -e "${BLUE}📡 Probing Redis memory caching cluster at localhost:6379...${NC}"
if nc -z -w3 localhost 6379 >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis port is responsive! Cache layer ready.${NC}"
else
    echo -e "${RED}✗ Redis connection refused at localhost:6379.${NC}"
    echo -e "${RED}👉 Please spin up your docker container first using: npm run docker:up${NC}"
    exit 1;
fi

# 3. Microservice Dependency check
if [ ! -d node_modules ]; then
    echo -e "${BLUE}📦 node_modules not found. Executing silent package installs...${NC}"
    npm install --silent
    echo -e "${GREEN}✓ Dependency packages installed successfully.${NC}"
else
    echo -e "${GREEN}✓ Gateway package dependencies checked.${NC}"
fi

# 4. Launch Service in development mode
echo -e "${GREEN}✓ All diagnostics passed successfully! Launching server...${NC}"
echo -e "${BLUE}======================================================================${NC}"
npm run dev
