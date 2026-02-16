/**
 * API MCP Server - CropManage Integration (Port 3101)
 * Protocol: JSON-RPC 2.0 over stdin/stdout
 * Tools: 7 API integration tools (authentication, fetch, POST, UPDATE, batch)
 */

const readline = require('readline');

class MCPServer {
    constructor() {
        this.tools = new Map();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
    }

    registerTool(tool) {
        this.tools.set(tool.name, tool);
    }

    async handleRequest(request) {
        const { id, method, params } = request;

        try {
            switch (method) {
                case 'initialize':
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {
                            protocolVersion: '2024-11-05',
                            serverInfo: {
                                name: 'cropclient-api-mcp-server',
                                version: '1.0.0'
                            },
                            capabilities: {
                                tools: {}
                            }
                        }
                    };

                case 'tools/list':
                    const toolsList = Array.from(this.tools.values()).map(tool => ({
                        name: tool.name,
                        description: tool.description,
                        inputSchema: tool.inputSchema
                    }));
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: { tools: toolsList }
                    };

                case 'tools/call':
                    const toolName = params.name;
                    const tool = this.tools.get(toolName);
                    
                    if (!tool) {
                        throw new Error(`Tool not found: ${toolName}`);
                    }

                    const result = await tool.handler(params.arguments || {});
                    
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(result, null, 2)
                                }
                            ]
                        }
                    };

                default:
                    throw new Error(`Unknown method: ${method}`);
            }
        } catch (error) {
            return {
                jsonrpc: '2.0',
                id,
                error: {
                    code: -32603,
                    message: error.message
                }
            };
        }
    }

    start() {
        this.rl.on('line', async (line) => {
            if (!line.trim()) return;

            try {
                const request = JSON.parse(line);
                const response = await this.handleRequest(request);
                console.log(JSON.stringify(response));
            } catch (error) {
                console.log(JSON.stringify({
                    jsonrpc: '2.0',
                    id: null,
                    error: {
                        code: -32700,
                        message: 'Parse error: ' + error.message
                    }
                }));
            }
        });

        process.stderr.write('API MCP Server started - 7 tools ready\n');
    }
}

// Create server instance
const server = new MCPServer();

// ========================================
// @@@@ API_COMPONENT INJECTION POINT @@@@
// ========================================

const apiComponent = require('./api-component');

// Register all 7 API tools
apiComponent.tools.forEach(tool => {
    server.registerTool(tool);
});

// ========================================
// @@@@ API_COMPONENT INJECTION POINT @@@@
// ========================================

// Start server
server.start();
