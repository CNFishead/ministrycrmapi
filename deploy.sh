#!/usr/bin/env bash

# Installation
npm install

# Build
npm run build

# Copy built files to the appropriate location
cp -R ./dist/* /var/www/html/