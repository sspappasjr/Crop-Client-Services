/**
 * Test Client for API MCP Server
 * Tests all 7 API tools via stdin/stdout protocol
 * Sequential execution - waits for each response
 */

const { spawn } = require('child_process');

let requestId = 1;
let currentTest = 0;
const server = spawn('node', ['server.js']);

const tests = [
    { name: 'Initialize', method: 'initialize', params: {} },
    { name: 'List Tools', method: 'tools/list', params: {} },
    { name: 'Get Token', method: 'tools/call', params: { name: 'get_token', arguments: {} } },
    { name: 'Get Ranches', method: 'tools/call', params: { name: 'get_ranches', arguments: {} } },
    { name: 'Get Plantings', method: 'tools/call', params: { name: 'get_plantings', arguments: {} } }
];

server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
        try {
            const response = JSON.parse(line);
            console.log('Response:', JSON.stringify(response, null, 2));
            
            // Run next test after response received
            currentTest++;
            if (currentTest < tests.length) {
                setTimeout(() => runTest(currentTest), 500);
            } else {
                setTimeout(() => {
                    console.log('\n=== All Tests Complete ===');
                    server.kill();
                    process.exit(0);
                }, 500);
            }
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

function runTest(index) {
    const test = tests[index];
    console.log(`\n=== Test ${index + 1}: ${test.name} ===`);
    sendRequest(test.method, test.params);
}

// Start first test after server initializes
setTimeout(() => runTest(0), 500);
