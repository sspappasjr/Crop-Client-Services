#!/usr/bin/env node

/**
 * Test Client for APIServer.js
 * Tests the 7 CropManage API tools via stdio (JSON-RPC)
 * 
 * USAGE:
 * 1. Start APIServer.js in one terminal: node APIServer.js
 * 2. Run this test in another terminal: node test-api-server.js
 */

const { spawn } = require('child_process');

console.log('🧪 APIServer.js Test Client\n');

// Start the APIServer
const server = spawn('node', ['APIServer.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let messageId = 1;

// Send JSON-RPC request to server
function sendRequest(method, params = {}) {
  const request = {
    jsonrpc: "2.0",
    id: messageId++,
    method: method,
    params: params
  };
  
  console.log('📤 Sending:', method);
  console.log('   Params:', JSON.stringify(params, null, 2));
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Handle server stdout (responses)
server.stdout.on('data', (data) => {
  const response = data.toString().trim();
  if (response) {
    try {
      const parsed = JSON.parse(response);
      console.log('📥 Response:');
      console.log(JSON.stringify(parsed, null, 2));
      console.log('');
    } catch (e) {
      console.log('⚠️  Could not parse:', response);
      console.log('');
    }
  }
});

// Handle server stderr (logs)
server.stderr.on('data', (data) => {
  console.log('📋 Server:', data.toString().trim());
});

// Handle server exit
server.on('close', (code) => {
  console.log(`\n🛑 Server exited with code ${code}`);
  process.exit(code);
});

// Run test sequence
console.log('Starting test sequence...\n');

setTimeout(() => {
  console.log('═══════════════════════════════════════');
  console.log('Test 1: Initialize server');
  console.log('═══════════════════════════════════════');
  sendRequest('initialize');
}, 500);

setTimeout(() => {
  console.log('═══════════════════════════════════════');
  console.log('Test 2: List all tools');
  console.log('═══════════════════════════════════════');
  sendRequest('tools/list');
}, 1500);

setTimeout(() => {
  console.log('═══════════════════════════════════════');
  console.log('Test 3: Get CropManage Token');
  console.log('═══════════════════════════════════════');
  sendRequest('tools/call', {
    name: 'get_token',
    arguments: {
      username: 'stevep@sspnet.com',
      password: 'gosteve1!'
    }
  });
}, 2500);

setTimeout(() => {
  console.log('═══════════════════════════════════════');
  console.log('Test 4: Get Ranches (requires token from Test 3)');
  console.log('═══════════════════════════════════════');
  sendRequest('tools/call', {
    name: 'get_ranches',
    arguments: {}
  });
}, 4500);

setTimeout(() => {
  console.log('═══════════════════════════════════════');
  console.log('Test 5: Get Plantings (requires ranch GUID)');
  console.log('Note: This will fail without selecting a ranch first');
  console.log('═══════════════════════════════════════');
  sendRequest('tools/call', {
    name: 'get_plantings',
    arguments: {
      ranchGuid: 'test-guid-placeholder'
    }
  });
}, 6500);

setTimeout(() => {
  console.log('\n✅ All tests complete.');
  console.log('\n💡 Observed:');
  console.log('   - Test 1: Server initialized');
  console.log('   - Test 2: Should list 7 tools');
  console.log('   - Test 3: Should return authentication token');
  console.log('   - Test 4: Should return ranch data');
  console.log('   - Test 5: Expected to fail (no valid ranch GUID)');
  console.log('\nPress Ctrl+C to exit.');
}, 8500);

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down...');
  server.kill();
  process.exit(0);
});
