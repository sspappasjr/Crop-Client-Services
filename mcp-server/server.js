#!/usr/bin/env node

/**
 * CropClient MCP Server - Irrigation Operations
 * Everything is a Prompt - Universal Adapter Pattern
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const path = require('path');

const irrigationCore = require('./lib/irrigation-core');
const promptRouter = require('./lib/prompt-router');

// Configuration
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, 'data', 'irrigation.json');

// Create MCP server
const server = new Server(
  {
    name: 'cropclient-irrigation',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    },
  }
);

// Define MCP Tools
const TOOLS = [
  {
    name: 'irrigation_prompt',
    description: 'Execute natural language irrigation operations. Use this for ANY irrigation-related query or action. Examples: "create next irrigation for ranch 1 planting 1A", "read meter for ranch 1 planting 1A", "show all ranch 2 records", "reset to original data"',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Natural language command describing the irrigation operation'
        },
        context: {
          type: 'object',
          description: 'Optional context to override extracted entities',
          properties: {
            ranch: { type: 'string', description: 'Ranch identifier (e.g., "Ranch 1")' },
            planting: { type: 'string', description: 'Planting identifier (e.g., "Planting 1A")' },
            date: { type: 'string', description: 'Date in M/D/YY format' },
            recordId: { type: 'string', description: 'Record ID for updates/deletes' },
            value: { type: 'number', description: 'Numeric value (hours, gallons, etc.)' }
          }
        }
      },
      required: ['prompt']
    }
  },
  {
    name: 'irrigation_create_next',
    description: 'Create the next scheduled irrigation for a specific ranch and planting. Calculates the next date based on interval and creates a new irrigation record.',
    inputSchema: {
      type: 'object',
      properties: {
        ranch: {
          type: 'string',
          description: 'Ranch identifier (e.g., "Ranch 1" or "MobileFrame Ranch 1")'
        },
        planting: {
          type: 'string',
          description: 'Planting identifier (e.g., "Planting 1A")'
        }
      },
      required: ['ranch', 'planting']
    }
  },
  {
    name: 'irrigation_prepare_meter',
    description: 'Prepare a meter reading form for field workers. Gets the most recent irrigation record and sets up for water meter entry.',
    inputSchema: {
      type: 'object',
      properties: {
        ranch: {
          type: 'string',
          description: 'Ranch identifier'
        },
        planting: {
          type: 'string',
          description: 'Planting identifier'
        }
      },
      required: ['ranch', 'planting']
    }
  },
  {
    name: 'irrigation_read',
    description: 'Read irrigation records with optional filtering by ranch, planting, or date.',
    inputSchema: {
      type: 'object',
      properties: {
        ranch: {
          type: 'string',
          description: 'Filter by ranch (optional)'
        },
        planting: {
          type: 'string',
          description: 'Filter by planting (optional)'
        },
        date: {
          type: 'string',
          description: 'Filter by date in M/D/YY format (optional)'
        },
        isOriginal: {
          type: 'boolean',
          description: 'Filter by original records only (optional)'
        }
      }
    }
  },
  {
    name: 'irrigation_sort',
    description: 'Sort all irrigation records by Ranch → Planting → Date (oldest first).',
    inputSchema: {
      type: 'object',
      properties: {
        preserveSelection: {
          type: 'string',
          description: 'Record ID to preserve selection (optional)'
        }
      }
    }
  },
  {
    name: 'irrigation_reset',
    description: 'Reset all irrigation data back to original state from irrigation.json file. Removes all created and updated records.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'irrigation_update',
    description: 'Update an irrigation record with new values.',
    inputSchema: {
      type: 'object',
      properties: {
        recordId: {
          type: 'string',
          description: 'Record ID to update'
        },
        mgrHours: {
          type: 'number',
          description: 'Manager hours (optional)'
        },
        appliedHours: {
          type: 'number',
          description: 'Water applied in hours or gallons (optional)'
        },
        message: {
          type: 'string',
          description: 'Message or notes (optional)'
        }
      },
      required: ['recordId']
    }
  },
  {
    name: 'irrigation_delete',
    description: 'Delete a created irrigation record (cannot delete original records).',
    inputSchema: {
      type: 'object',
      properties: {
        recordId: {
          type: 'string',
          description: 'Record ID to delete'
        }
      },
      required: ['recordId']
    }
  },
  {
    name: 'irrigation_stats',
    description: 'Get statistics about irrigation data (total records, by ranch, by planting, etc.).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// List available tools
server.setRequestHandler('tools/list', async () => {
  return { tools: TOOLS };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    let result;
    
    switch (name) {
      case 'irrigation_prompt':
        // Validate prompt
        const validation = promptRouter.validatePrompt(args.prompt);
        if (!validation.valid) {
          throw new Error(`Invalid prompt: ${validation.errors.join(', ')}`);
        }
        
        // Route the prompt
        result = await promptRouter.routePrompt(args.prompt, args.context || {});
        break;
      
      case 'irrigation_create_next':
        result = await irrigationCore.createNextIrrigation({
          ranch: args.ranch,
          planting: args.planting
        });
        break;
      
      case 'irrigation_prepare_meter':
        result = await irrigationCore.prepareMeterReading({
          ranch: args.ranch,
          planting: args.planting
        });
        break;
      
      case 'irrigation_read':
        result = await irrigationCore.getAllRecords({
          ranch: args.ranch,
          planting: args.planting,
          date: args.date,
          isOriginal: args.isOriginal
        });
        break;
      
      case 'irrigation_sort':
        result = await irrigationCore.sortAndReadRecords(args.preserveSelection);
        break;
      
      case 'irrigation_reset':
        result = await irrigationCore.resetToOriginal();
        break;
      
      case 'irrigation_update':
        result = await irrigationCore.updateRecord(args.recordId, {
          mgrHours: args.mgrHours,
          appliedHours: args.appliedHours,
          message: args.message
        });
        break;
      
      case 'irrigation_delete':
        result = await irrigationCore.deleteRecord(args.recordId);
        break;
      
      case 'irrigation_stats':
        result = await irrigationCore.getStatistics();
        break;
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
    
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: error.message,
            tool: name,
            arguments: args
          }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// List available resources (optional - for future use)
server.setRequestHandler('resources/list', async () => {
  return {
    resources: [
      {
        uri: 'irrigation://data/original',
        name: 'Original Irrigation Data',
        description: 'Original irrigation schedule data from irrigation.json',
        mimeType: 'application/json'
      }
    ]
  };
});

// Initialize and start server
async function main() {
  try {
    console.error('Initializing CropClient Irrigation MCP Server...');
    console.error(`Data path: ${DATA_PATH}`);
    
    // Initialize irrigation data
    const initResult = await irrigationCore.initialize(DATA_PATH);
    console.error(`✅ ${initResult.message} (${initResult.recordCount} records)`);
    
    // Create stdio transport
    const transport = new StdioServerTransport();
    
    // Connect server to transport
    await server.connect(transport);
    
    console.error('✅ CropClient Irrigation MCP Server running on stdio');
    console.error('📋 Available tools:');
    TOOLS.forEach(tool => {
      console.error(`   - ${tool.name}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', async () => {
  console.error('\n⏹️  Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('\n⏹️  Shutting down gracefully...');
  process.exit(0);
});

// Start the server
main();
