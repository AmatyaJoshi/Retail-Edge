#!/bin/bash
set -e

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