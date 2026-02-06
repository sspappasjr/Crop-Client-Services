# CropClient Irrigation MCP Server

**Everything is a Prompt** - Universal Adapter for Agricultural Irrigation Management

## Overview

This MCP (Model Context Protocol) server provides natural language access to irrigation operations for CropClient applications. All business logic is centralized here, making it reusable across any app through simple natural language prompts.

## Architecture

```
Desktop File System
  └─ irrigation.json (source of truth)
      ↓
  MCP Server (stdio)
      ↓
  Natural Language Router
      ↓
  Core Business Logic (LEGO blocks)
      ↓
  Any App can use it!
```

## Core Principles

1. **Think in Domain Actions**: Tools are `create_next_irrigation`, not generic `create`
2. **Everything is a Prompt**: Natural language is the universal interface
3. **Universal Adapter**: Works with files, databases, APIs - backend-agnostic
4. **LEGO Blocks**: Reusable business logic extracted from working code

## Installation

```bash
# Navigate to mcp-server directory
cd mcp-server

# Install dependencies
npm install

# Test the server
npm start
```

## MCP Tools Available

### 1. irrigation_prompt (Universal Tool)
Send ANY natural language command related to irrigation:

```javascript
// Examples:
"create next irrigation for ranch 1 planting 1A"
"read meter for ranch 1 planting 1A"
"show all ranch 2 records"
"reset to original data"
"sort records"
"show statistics"
```

### 2. irrigation_create_next
Create the next scheduled irrigation based on interval:

```javascript
{
  ranch: "Ranch 1",
  planting: "Planting 1A"
}
```

### 3. irrigation_prepare_meter
Prepare form for field worker meter reading:

```javascript
{
  ranch: "Ranch 1",
  planting: "Planting 1A"
}
```

### 4. irrigation_read
Read records with optional filters:

```javascript
{
  ranch: "Ranch 1",      // optional
  planting: "Planting 1A", // optional
  date: "9/23/25",       // optional
  isOriginal: true       // optional
}
```

### 5. irrigation_sort
Sort all records by Ranch → Planting → Date

### 6. irrigation_reset
Reset to original irrigation.json data (removes all changes)

### 7. irrigation_update
Update a record:

```javascript
{
  recordId: "original_0",
  appliedHours: 95.5,    // optional
  mgrHours: 2.0,         // optional
  message: "..."         // optional
}
```

### 8. irrigation_delete
Delete a created record (cannot delete originals)

### 9. irrigation_stats
Get statistics about irrigation data

## The LEGO Blocks

These reusable patterns were extracted from the working Test Model:

### Block 1: Find-Sort-GetLast
```javascript
// Used everywhere: Get most recent record for a field
findLatestRecord({ ranch, planting })
```

### Block 2: Create Next Pattern
```javascript
// Create next irrigation based on interval
createNextIrrigation({ ranch, planting })
```

### Block 3: Prepare Meter Reading
```javascript
// Set up form for field worker
prepareMeterReading({ ranch, planting })
```

### Block 4: Sort and Read
```javascript
// Sort by Ranch → Planting → Date
sortAndReadRecords()
```

### Block 5: Reset to Original
```javascript
// Restore from irrigation.json
resetToOriginal()
```

## Natural Language Router

The prompt router understands these intents:

- **read**: "read", "show", "get", "display", "list", "find"
- **create**: "create", "add", "new", "make", "schedule"
- **update**: "update", "edit", "modify", "change"
- **delete**: "delete", "remove", "clear"
- **reset**: "reset", "restore", "reload"
- **create_next**: "create next", "schedule next"
- **read_meter**: "read meter", "meter reading", "prepare meter"
- **sort**: "sort", "organize", "order"
- **stats**: "statistics", "stats", "summary"

## Entity Extraction

Automatically extracts from prompts:
- Ranch: "ranch 1", "ranch 2"
- Planting: "planting 1A", "planting 2B"
- Dates: "9/23/25"
- Values: "95 gallons", "2.5 hours"
- Record IDs: "record original_0"

## Example Usage from Apps

### From Main App (Live Chat):
```javascript
// Instead of complex business logic in the app:
const result = await callMCPTool('irrigation_prompt', {
  prompt: "create next irrigation for ranch 1 planting 1A"
});
```

### From Test Harness:
```javascript
// Same prompt, different app:
const result = await callMCPTool('irrigation_prompt', {
  prompt: "read meter for ranch 1 planting 1A"
});
```

### From Future Mobile App:
```javascript
// Natural language everywhere:
const result = await callMCPTool('irrigation_prompt', {
  prompt: "show all ranch 2 records from last week"
});
```

## Configuration for Claude Desktop

Add to your Claude Desktop config:

**macOS/Linux:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cropclient-irrigation": {
      "command": "node",
      "args": [
        "C:\\AICode\\crop-client-services\\mcp-server\\server.js"
      ],
      "env": {
        "DATA_PATH": "C:\\AICode\\crop-client-services\\mcp-server\\data\\irrigation.json"
      }
    }
  }
}
```

## File Structure

```
mcp-server/
├── server.js                 # Main MCP server (stdio transport)
├── lib/
│   ├── irrigation-core.js    # All business logic (LEGO blocks)
│   ├── prompt-router.js      # Natural language parsing
│   └── date-utils.js         # Date parsing/formatting
├── data/
│   └── irrigation.json       # Source of truth
├── package.json
└── README.md
```

## Benefits

### ✅ For Development:
- Write business logic ONCE
- Test in isolation
- Reuse everywhere
- Easy to debug

### ✅ For Apps:
- No business logic in UI code
- Apps become thin clients
- Natural language interface
- Works offline (cache responses)

### ✅ For Users:
- Consistent behavior across apps
- Natural language everywhere
- Reliable data operations
- Easy reset/reload

### ✅ For Future:
- Add new apps easily
- Change backend (JSON → MongoDB → SQL)
- Apps don't need updates
- MCP handles everything

## Testing

```bash
# Start the server
npm start

# From Claude Desktop, try these prompts:
"read irrigation table"
"create next irrigation for ranch 1 planting 1A"
"read meter for ranch 1 planting 1A"
"show statistics"
"reset to original data"
```

## Error Handling

The server validates all prompts and provides helpful error messages:

```javascript
{
  "success": false,
  "error": "Ranch and planting required",
  "suggestion": "Try: create next for ranch 1 planting 1A"
}
```

## Security

- Path traversal protection
- SQL injection pattern blocking
- XSS prevention
- Prompt validation
- Cannot delete original records

## Future Enhancements

- [ ] MongoDB backend support
- [ ] PostgreSQL backend support
- [ ] API integration to CropManage UC system
- [ ] Real-time IoT sensor data
- [ ] Offline caching strategy
- [ ] Batch operations
- [ ] Advanced analytics

## Philosophy

**"Everything is a Prompt"**

Natural language isn't just a nice interface - it's THE interface. This MCP server proves that complex agricultural operations can be controlled entirely through natural language, with all business logic centralized and reusable.

## License

MIT

## Authors

CropClient Team - Making agricultural technology accessible through natural language.
