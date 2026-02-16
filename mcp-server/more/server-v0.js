#!/usr/bin/env node

/**
 * CropClient Dashboard MCP Server
 * Foundational server with stdin/stdout protocol
 * Port: 3100 (stdio communication)
 */

const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');

// ========================================
// SERVER CONFIGURATION
// ========================================
const SERVER_NAME = "cropclient-dashboard";
const SERVER_VERSION = "1.0.0";
const DATA_DIR = path.join(__dirname, 'data');

// ========================================
// STDIN/STDOUT INTERFACE
// ========================================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// ========================================
// MCP PROTOCOL HANDLER
// ========================================
class MCPServer {
  constructor() {
    this.tools = [];
    this.initialized = false;
  }

  // Initialize server
  async initialize() {
    // Ensure data directory exists
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      this.initialized = true;
      this.log('Server initialized');
    } catch (error) {
      this.log('Error initializing:', error.message);
      throw error;
    }
  }

  // Register a tool
  registerTool(tool) {
    this.tools.push(tool);
    this.log(`Tool registered: ${tool.name}`);
  }

  // List available tools
  listTools() {
    return {
      tools: this.tools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema
      }))
    };
  }

  // Call a tool
  async callTool(name, args = {}) {
    const tool = this.tools.find(t => t.name === name);
    
    if (!tool) {
      return {
        success: false,
        error: `Tool not found: ${name}`
      };
    }

    try {
      this.log(`Calling tool: ${name}`);
      const result = await tool.handler(args);
      return {
        success: true,
        result: result
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Save data to file
  async saveData(filename, data) {
    const filepath = path.join(DATA_DIR, filename);
    try {
      await fs.writeFile(filepath, JSON.stringify(data, null, 2));
      this.log(`Data saved: ${filename}`);
      return { success: true, filepath };
    } catch (error) {
      this.log(`Error saving data: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Load data from file
  async loadData(filename) {
    const filepath = path.join(DATA_DIR, filename);
    try {
      const data = await fs.readFile(filepath, 'utf8');
      this.log(`Data loaded: ${filename}`);
      return { success: true, data: JSON.parse(data) };
    } catch (error) {
      this.log(`Error loading data: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // Process incoming message
  async processMessage(message) {
    try {
      const request = JSON.parse(message);
      
      switch (request.method) {
        case 'initialize':
          await this.initialize();
          return {
            jsonrpc: "2.0",
            id: request.id,
            result: {
              serverName: SERVER_NAME,
              serverVersion: SERVER_VERSION,
              initialized: true
            }
          };

        case 'tools/list':
          return {
            jsonrpc: "2.0",
            id: request.id,
            result: this.listTools()
          };

        case 'tools/call':
          const result = await this.callTool(request.params.name, request.params.arguments);
          return {
            jsonrpc: "2.0",
            id: request.id,
            result: result
          };

        case 'data/save':
          const saveResult = await this.saveData(request.params.filename, request.params.data);
          return {
            jsonrpc: "2.0",
            id: request.id,
            result: saveResult
          };

        case 'data/load':
          const loadResult = await this.loadData(request.params.filename);
          return {
            jsonrpc: "2.0",
            id: request.id,
            result: loadResult
          };

        default:
          return {
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: -32601,
              message: `Method not found: ${request.method}`
            }
          };
      }
    } catch (error) {
      return {
        jsonrpc: "2.0",
        error: {
          code: -32700,
          message: `Parse error: ${error.message}`
        }
      };
    }
  }

  // Send response to stdout
  sendResponse(response) {
    console.log(JSON.stringify(response));
  }

  // Log to stderr (so it doesn't interfere with stdout protocol)
  log(...args) {
    console.error('[MCP Server]', ...args);
  }
}

// ========================================
// @@@@ DASHBOARD_COMPONENT INJECTION POINT @@@@
// Tools will be injected here by the factory
// ========================================

// Example tool (will be replaced by injected component)
const exampleTool = {
  name: "hello_world",
  description: "Test tool that returns a greeting",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  },
  handler: async (args) => {
    return {
      message: "Hello from MCP Server!",
      timestamp: new Date().toISOString()
    };
  }
};

// ========================================
// @@@@ DASHBOARD_COMPONENT INJECTION POINT @@@@
// ========================================

// ========================================
// SERVER STARTUP
// ========================================
const server = new MCPServer();

// Register example tool (will be replaced by injected tools)
server.registerTool(exampleTool);

// Listen for stdin input
rl.on('line', async (line) => {
  if (line.trim()) {
    const response = await server.processMessage(line);
    server.sendResponse(response);
  }
});

// Handle errors
rl.on('error', (error) => {
  server.log('Readline error:', error);
});

process.on('uncaughtException', (error) => {
  server.log('Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  server.log('Unhandled rejection:', error);
  process.exit(1);
});

// Server ready
server.log(`${SERVER_NAME} v${SERVER_VERSION} ready`);
server.log('Listening on stdin...');
