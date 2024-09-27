#!/bin/bash

echo "Initiating Build..."
npm install
npm run build
echo "Starting Server..."
npm start