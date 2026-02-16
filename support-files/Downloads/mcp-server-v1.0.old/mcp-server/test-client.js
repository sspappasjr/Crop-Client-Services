#!/usr/bin/env node

/**
 * Test Client for MCP Server
 * Tests stdin/stdout communication
 */

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🧪 MCP Server Test Client\n');

// Start the MCP server
const server = spawn('node', ['server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let messageId = 1;

// Send a request to the server
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: messageId++,
    method: method,
    params: params
  };
  
  console.log('📤 Sending:', JSON.stringify(request, null, 2));
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Handle server stdout
server.stdout.on('data', (data) => {
  const response = data.toString().trim();
  if (response) {
    console.log('📥 Received:', response);
    try {
      const parsed = JSON.parse(response);
      console.log('✅ Parsed:', JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('⚠️  Could not parse response');
    }
    console.log('');
  }
});

// Handle server stderr (logs)
server.stderr.on('data', (data) => {
  console.log('📋 Server log:', data.toString().trim());
});

// Handle server exit
server.on('close', (code) => {
  console.log(`\n🛑 Server exited with code ${code}`);
  process.exit(code);
});

// Run test sequence
console.log('Starting test sequence...\n');

setTimeout(() => {
  console.log('Test 1: Initialize server');
  sendRequest('initialize');
}, 500);

setTimeout(() => {
  console.log('Test 2: List tools');
  sendRequest('tools/list');
}, 1500);

setTimeout(() => {
  console.log('Test 3: Call hello_world tool');
  sendRequest('tools/call', {
    name: 'hello_world',
    arguments: {}
  });
}, 2500);

setTimeout(() => {
  console.log('Test 4: Save data');
  sendRequest('data/save', {
    filename: 'test.json',
    data: { message: 'Hello from test client', timestamp: new Date().toISOString() }
  });
}, 3500);

setTimeout(() => {
  console.log('Test 5: Load data');
  sendRequest('data/load', {
    filename: 'test.json'
  });
}, 4500);

setTimeout(() => {
  console.log('\n✅ All tests complete. Press Ctrl+C to exit.');
}, 5500);

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down...');
  server.kill();
  process.exit(0);
});
