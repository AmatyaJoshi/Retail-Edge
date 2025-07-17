#!/bin/bash
set -e

# Build frontend
cd client
npm install
npm run build
npm run export
cd ..

# Copy static build to server (for static export)
rm -rf server/out
cp -r client/out server/out

# Build backend
cd server
npm install
npm run build 