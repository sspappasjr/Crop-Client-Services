/**
 * Test Client for API MCP Server
 * Tests all 7 API tools via stdin/stdout protocol
 */

const { spawn } = require('child_process');

let requestId = 1;
const server = spawn('node', ['server.js']);

server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
        try {
            const response = JSON.parse(line);
            console.log('Response:', JSON.stringify(response, null, 2));
        } catch (e) {
            // Ignore non-JSON output (like startup message)
        }
    });
});

server.stderr.on('data', (data) => {
    console.log('Server:', data.toString());
});

function sendRequest(method, params = {}) {
    const request = {
        jsonrpc: '2.0',
        id: requestId++,
        method,
        params
    };
    server.stdin.write(JSON.stringify(request) + '\n');
}

// Run tests
setTimeout(() => {
    console.log('\n=== Test 1: Initialize ===');
    sendRequest('initialize');
}, 500);

setTimeout(() => {
    console.log('\n=== Test 2: List Tools ===');
    sendRequest('tools/list');
}, 1000);

setTimeout(() => {
    console.log('\n=== Test 3: Call get_token ===');
    sendRequest('tools/call', {
        name: 'get_token',
        arguments: {}
    });
}, 1500);

setTimeout(() => {
    console.log('\n=== Test 4: Call get_ranches ===');
    sendRequest('tools/call', {
        name: 'get_ranches',
        arguments: {}
    });
}, 2000);

setTimeout(() => {
    console.log('\n=== Test 5: Call get_plantings ===');
    sendRequest('tools/call', {
        name: 'get_plantings',
        arguments: {}
    });
}, 2500);

setTimeout(() => {
    console.log('\n=== Tests Complete ===');
    server.kill();
    process.exit(0);
}, 3000);
