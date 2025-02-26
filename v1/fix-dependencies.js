#!/usr/bin/env node

/**
 * This script helps fix common dependency issues with the loopation library
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper to run commands
function runCommand(command) {
  console.log(`\n> ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Command failed: ${command}`);
    return false;
  }
}

// Clean npm cache
console.log('Cleaning npm cache...');
runCommand('npm cache clean --force');

// Check if node_modules exists and remove it if necessary
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('Removing existing node_modules directory...');
  if (process.platform === 'win32') {
    // On Windows, use rd command
    runCommand('rd /s /q node_modules');
  } else {
    // On Unix-like systems
    runCommand('rm -rf node_modules');
  }
}

// Install dependencies with legacy peer deps flag
console.log('Installing dependencies...');
const installSuccess = runCommand('npm install --legacy-peer-deps');

if (installSuccess) {
  console.log('\n✅ Dependencies installed successfully!');
  console.log('\nYou can now run:');
  console.log('  npm run examples:dev   - Start the demo in development mode');
  console.log('  npm run examples:build - Build the examples for production');
  console.log('  npm run build          - Build the library');
} else {
  console.log('\n❌ Dependency installation failed.');
  console.log('Try running: npm install --force');
} 