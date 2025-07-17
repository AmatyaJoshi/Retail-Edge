#!/bin/bash
set -e

# Cleanup
rm -rf node_modules
rm -rf client/node_modules
rm -rf server/node_modules
rm -f node_modules.tar.gz
rm -f client/node_modules.tar.gz
rm -f server/node_modules.tar.gz

# Build frontend
cd client
rm -rf node_modules
npm install
npm run build
npm run export
cd ..

# Copy static build to server (for static export)
rm -rf server/out
cp -r client/out server/out

# Build backend
cd server
rm -rf node_modules
npm install
npm run build 