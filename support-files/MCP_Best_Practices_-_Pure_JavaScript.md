# MCP Server Development Best Practices (Pure JavaScript/Node.js)

## Core Principles

### 1. **Think in Domain Actions, Not CRUD**
- ❌ Bad: `create_record`, `update_row`, `read_data`
- ✅ Good: `schedule_irrigation`, `log_crop_reading`, `get_field_status`

**For CropClient:**
```javascript
// Tools should be: read_irrigation_table, update_crop_data, analyze_field_conditions
// NOT: create, read, update, delete
```

### 2. **Everything is a Prompt Philosophy**
Your core insight - design tools that accept natural language:
```javascript
{
  name: "query_irrigation_data",
  description: "Execute natural language queries on irrigation data",
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "Natural language command like 'read irrigation table' or 'show last week's data'"
      }
    }
  }
}
```

## Tool Design Best Practices

### Naming Conventions
1. **Use fully qualified names when multiple servers exist:**
   ```
   CropClient:read_irrigation_table
   CropClient:update_field_data
   ```

2. **Be descriptive and action-oriented:**
   - `schedule_irrigation` not `irrigation`
   - `analyze_soil_moisture` not `soil`

3. **Group related tools with prefixes:**
   ```
   irrigation_schedule
   irrigation_log
   irrigation_analyze
   ```

### Tool Descriptions
Write descriptions that help the LLM understand **when** and **how** to use the tool:

```javascript
{
  description: "Read irrigation schedule data. Use this when the user asks about irrigation history, schedules, or wants to view watering records. Accepts natural language queries like 'show this week's irrigation' or 'read irrigation table for field 3'."
}
```

### Input Schemas
Keep schemas simple but flexible:

```javascript
{
  type: "object",
  properties: {
    prompt: {
      type: "string",
      description: "Natural language command"
    },
    context: {
      type: "object",
      description: "Optional context like field_id, date_range, etc.",
      properties: {
        field_id: { type: "string" },
        date_range: { type: "string" }
      }
    }
  },
  required: ["prompt"]
}
```

## Resources vs Tools vs Prompts

### Resources (Passive Data)
Use for static or semi-static context:
- Field configuration files
- Crop type databases
- UC research guidelines
- Compliance templates

### Tools (Active Operations)
Use for actions with side effects:
- Reading current data
- Updating records
- Triggering calculations
- Generating reports

### Prompts (Task Templates)
Use for standardized workflows:
- "Analyze field {field_id} irrigation efficiency"
- "Generate compliance report for {date_range}"
- "Recommend irrigation schedule for {crop_type}"

## Architecture Best Practices

### 1. **Universal Adapter Pattern**
```javascript
// Your MCP server interprets prompts and routes to backends
async function handlePrompt(prompt, context = {}) {
  const intent = parseIntent(prompt); // "read", "update", "analyze"
  const backend = selectBackend(context); // file, db, api, iot
  
  return await backend.execute(intent, context);
}
```

### 2. **Meta-Driven Configuration**
```javascript
// config.json
{
  "server": {
    "name": "CropClient",
    "version": "1.0.0",
    "backends": {
      "local": { 
        "type": "file", 
        "path": "./data" 
      },
      "database": { 
        "type": "postgres", 
        "connection": "..." 
      },
      "api": { 
        "type": "rest", 
        "baseUrl": "..." 
      }
    },
    "tools": [
      {
        "name": "read_irrigation_table",
        "backend": "local",
        "prompt_patterns": [
          "read irrigation", 
          "show watering", 
          "irrigation history"
        ]
      }
    ]
  }
}
```

### 3. **Progressive Disclosure**
Don't load everything at once:
```javascript
server.onInitialize(({ capabilities }) => {
  const tools = context.role === 'admin' 
    ? allTools 
    : filteredTools;
  
  return { tools };
});
```

## Basic MCP Server in Pure JavaScript

### Simple Server Structure
```javascript
// server.js
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const fs = require('fs').promises;
const path = require('path');

// Create server instance
const server = new Server(
  {
    name: 'cropclient-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Define tools
const tools = [
  {
    name: 'read_irrigation_table',
    description: 'Read irrigation scheduling data using natural language queries',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Natural language command like "read irrigation table"'
        }
      },
      required: ['prompt']
    }
  },
  {
    name: 'update_crop_data',
    description: 'Update crop information using natural language commands',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Natural language command like "update crop status"'
        },
        data: {
          type: 'object',
          description: 'Data to update'
        }
      },
      required: ['prompt']
    }
  }
];

// List available tools
server.setRequestHandler('tools/list', async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'read_irrigation_table':
        return await readIrrigationTable(args.prompt);
      
      case 'update_crop_data':
        return await updateCropData(args.prompt, args.data);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`
        }
      ],
      isError: true
    };
  }
});

// Implementation functions
async function readIrrigationTable(prompt) {
  const intent = parseIntent(prompt);
  const dataPath = path.join(__dirname, 'data', 'irrigation.json');
  
  const data = await fs.readFile(dataPath, 'utf8');
  const irrigation = JSON.parse(data);
  
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(irrigation, null, 2)
      }
    ]
  };
}

async function updateCropData(prompt, data) {
  const intent = parseIntent(prompt);
  const dataPath = path.join(__dirname, 'data', 'crops.json');
  
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
  
  return {
    content: [
      {
        type: 'text',
        text: 'Crop data updated successfully'
      }
    ]
  };
}

// Natural language intent parser
function parseIntent(prompt) {
  const intentPatterns = {
    read: /^(read|show|get|display|list)/i,
    write: /^(write|save|update|set|create)/i,
    delete: /^(delete|remove|clear)/i,
    analyze: /^(analyze|calculate|compute|recommend)/i
  };
  
  for (const [action, pattern] of Object.entries(intentPatterns)) {
    if (pattern.test(prompt)) {
      return action;
    }
  }
  
  return 'unknown';
}

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('CropClient MCP Server running on stdio');
}

main().catch(console.error);
```

## Security Best Practices

### 1. **Validate All Inputs**
```javascript
function validatePrompt(prompt) {
  // Prevent path traversal
  if (prompt.includes('../')) {
    throw new Error('Path traversal not allowed');
  }
  
  // Prevent injection
  if (containsSQLPatterns(prompt)) {
    throw new Error('SQL patterns not allowed');
  }
  
  // Validate against allowed patterns
  if (!matchesAllowedPatterns(prompt)) {
    throw new Error('Invalid prompt pattern');
  }
  
  return true;
}

function containsSQLPatterns(str) {
  const sqlPatterns = /(\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b)/i;
  return sqlPatterns.test(str);
}

function matchesAllowedPatterns(str) {
  const allowed = [
    /^read/i,
    /^show/i,
    /^get/i,
    /^update/i,
    /^analyze/i
  ];
  
  return allowed.some(pattern => pattern.test(str));
}
```

### 2. **Implement Access Control**
```javascript
async function checkPermissions(user, action) {
  const rolePermissions = {
    'admin': ['read', 'write', 'delete'],
    'manager': ['read', 'write'],
    'field': ['read']
  };
  
  const userRole = user.role || 'field';
  const allowed = rolePermissions[userRole] || [];
  
  if (!allowed.includes(action)) {
    throw new Error(`Permission denied: ${userRole} cannot ${action}`);
  }
  
  return true;
}
```

### 3. **Safe File Operations**
```javascript
const fs = require('fs').promises;
const path = require('path');

async function safeReadFile(filename) {
  // Ensure file is within allowed directory
  const dataDir = path.join(__dirname, 'data');
  const fullPath = path.resolve(dataDir, filename);
  
  if (!fullPath.startsWith(dataDir)) {
    throw new Error('Access denied: file outside data directory');
  }
  
  try {
    const data = await fs.readFile(fullPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

async function safeWriteFile(filename, data) {
  const dataDir = path.join(__dirname, 'data');
  const fullPath = path.resolve(dataDir, filename);
  
  if (!fullPath.startsWith(dataDir)) {
    throw new Error('Access denied: file outside data directory');
  }
  
  try {
    await fs.writeFile(fullPath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
}
```

## Testing & Validation

### Test for Security
```javascript
// test/security.test.js
const assert = require('assert');
const { validatePrompt, handlePrompt } = require('../server');

describe('Security Tests', () => {
  it('should block path traversal', () => {
    assert.throws(
      () => validatePrompt('read ../../etc/passwd'),
      /Path traversal not allowed/
    );
  });
  
  it('should validate permissions', async () => {
    const context = { role: 'field' };
    
    await assert.rejects(
      handlePrompt('delete all data', context),
      /Permission denied/
    );
  });
  
  it('should block SQL injection patterns', () => {
    assert.throws(
      () => validatePrompt('read table; DROP TABLE users;'),
      /SQL patterns not allowed/
    );
  });
});
```

### Test Prompt Parsing
```javascript
// test/parser.test.js
const assert = require('assert');
const { parseIntent } = require('../server');

describe('Prompt Parser Tests', () => {
  it('should parse read intent', () => {
    const result = parseIntent('read irrigation table for field 3');
    assert.strictEqual(result, 'read');
  });
  
  it('should parse write intent', () => {
    const result = parseIntent('update crop status');
    assert.strictEqual(result, 'write');
  });
  
  it('should parse analyze intent', () => {
    const result = parseIntent('analyze soil moisture');
    assert.strictEqual(result, 'analyze');
  });
});
```

## Performance Optimization

### 1. **Caching**
```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedData(key, fetchFunction) {
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchFunction();
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  return data;
}

// Usage
const irrigation = await getCachedData(
  'irrigation_table',
  () => safeReadFile('irrigation.json')
);
```

### 2. **Batch Operations**
```javascript
// Instead of multiple calls, handle in one
async function handleBatchPrompt(prompts) {
  const results = await Promise.all(
    prompts.map(prompt => handlePrompt(prompt))
  );
  
  return results;
}
```

## CropClient-Specific Recommendations

### Bootstrap Sequence
```javascript
const fs = require('fs').promises;
const path = require('path');

async function bootstrap() {
  try {
    // 1. Check for config
    const configPath = path.join(__dirname, 'config', 'app-config.json');
    let config;
    
    try {
      const data = await fs.readFile(configPath, 'utf8');
      config = JSON.parse(data);
      console.log('Config loaded successfully');
    } catch (error) {
      console.log('No config found, creating default...');
      config = createDefaultConfig();
    }
    
    // 2. Ensure config directory exists
    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });
    
    // 3. Write config
    await fs.writeFile(
      configPath,
      JSON.stringify(config, null, 2),
      'utf8'
    );
    
    // 4. Verify operation
    const verification = await fs.readFile(configPath, 'utf8');
    const verifiedConfig = JSON.parse(verification);
    
    console.log('Bootstrap complete:', verifiedConfig);
    return { success: true, config: verifiedConfig };
    
  } catch (error) {
    console.error('Bootstrap failed:', error);
    return { success: false, error: error.message };
  }
}

function createDefaultConfig() {
  return {
    app: {
      name: "CropClient Live Chat",
      version: "1.0.0",
      created: new Date().toISOString()
    },
    server: {
      host: "localhost",
      port: 3000
    },
    data: {
      backend: "file",
      path: "./mcp-server/data"
    }
  };
}

// Run bootstrap
if (require.main === module) {
  bootstrap().then(result => {
    console.log('Bootstrap result:', result);
  });
}
```

### Natural Language Router
```javascript
const intentPatterns = {
  read: /^(read|show|get|display|list)/i,
  write: /^(write|save|update|set|create)/i,
  delete: /^(delete|remove|clear)/i,
  analyze: /^(analyze|calculate|compute|recommend)/i
};

function parseIntent(prompt) {
  for (const [action, pattern] of Object.entries(intentPatterns)) {
    if (pattern.test(prompt)) {
      return action;
    }
  }
  return 'unknown';
}

function extractEntity(prompt) {
  const entities = {
    irrigation: /irrigation|watering|schedule/i,
    crop: /crop|plant|field/i,
    sensor: /sensor|reading|measurement/i
  };
  
  for (const [entity, pattern] of Object.entries(entities)) {
    if (pattern.test(prompt)) {
      return entity;
    }
  }
  
  return 'unknown';
}

async function routePrompt(prompt, context = {}) {
  const action = parseIntent(prompt);
  const entity = extractEntity(prompt);
  
  const handler = handlers[entity];
  
  if (!handler) {
    throw new Error(`Unknown entity: ${entity}`);
  }
  
  return await handler[action](prompt, context);
}
```

## Package.json Setup

```json
{
  "name": "cropclient-mcp-server",
  "version": "1.0.0",
  "description": "CropClient MCP Server - Everything is a Prompt",
  "main": "server.js",
  "type": "commonjs",
  "scripts": {
    "start": "node server.js",
    "test": "node --test",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

## Claude Configuration for MCP Server

Add to your Claude Desktop config file:

**macOS/Linux:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cropclient": {
      "command": "node",
      "args": [
        "/absolute/path/to/your/cropclient-mcp-server/server.js"
      ],
      "env": {
        "DATA_PATH": "/absolute/path/to/your/data"
      }
    }
  }
}
```

## Common Pitfalls to Avoid

1. ❌ **Don't use TypeScript compilation** → ✅ Use pure JavaScript
2. ❌ **Don't expose raw file operations** → ✅ Expose domain operations
3. ❌ **Don't trust client hints blindly** → ✅ Always validate server-side
4. ❌ **Don't load all tools upfront** → ✅ Use progressive disclosure
5. ❌ **Don't make tools too granular** → ✅ Bundle related operations
6. ❌ **Don't ignore error handling** → ✅ Provide clear error messages
7. ❌ **Don't use relative paths** → ✅ Use absolute paths in config
8. ❌ **Don't forget stdio for transport** → ✅ MCP uses stdin/stdout

## Debugging Tips

### Enable Logging
```javascript
// At the top of server.js
const DEBUG = process.env.DEBUG === 'true';

function log(...args) {
  if (DEBUG) {
    console.error('[CropClient MCP]', ...args);
  }
}

// Usage
log('Handling prompt:', prompt);
log('Intent parsed:', intent);
```

### Check Claude Logs
```bash
# macOS
tail -f ~/Library/Logs/Claude/mcp*.log

# Linux
tail -f ~/.config/Claude/logs/mcp*.log

# Windows
# Check: %APPDATA%\Claude\logs\
```

### Test Server Manually
```javascript
// test-server.js
const { spawn } = require('child_process');

const server = spawn('node', ['server.js']);

server.stdout.on('data', (data) => {
  console.log('Server output:', data.toString());
});

server.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

// Send a test request
const request = {
  jsonrpc: '2.0',
  method: 'tools/list',
  id: 1
};

server.stdin.write(JSON.stringify(request) + '\n');
```

## Resources

- [Official MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP SDK (JavaScript works fine)](https://github.com/modelcontextprotocol/typescript-sdk)
- [Community Servers](https://github.com/modelcontextprotocol/servers)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [CropClient Project Memory](https://claude.ai/project/YOUR_PROJECT_ID)

## Next Steps

1. **Set up your project structure:**
   ```
   cropclient-mcp-server/
   ├── server.js
   ├── package.json
   ├── config/
   │   └── app-config.json
   ├── data/
   │   ├── irrigation.json
   │   └── crops.json
   └── test/
       ├── security.test.js
       └── parser.test.js
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Claude Desktop** with your server path

4. **Test the connection** by asking Claude to use your tools

5. **Iterate and expand** based on your needs

---

**Document Version:** 1.0.0  
**Last Updated:** 2025-10-25  
**Author:** CropClient Development Team  
**License:** MIT