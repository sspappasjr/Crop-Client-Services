# CropClient Dashboard MCP Server - Foundation

**Date:** December 30, 2024  
**Phase:** Foundation with stdin/stdout  
**Next:** Component injection

---

## What This Is:

The foundational MCP server with **stdin/stdout protocol** ready for component injection.

This is the base you'll build the complete CropClient Dashboard MCP Server around.

---

## Files Included:

### 1. **server.js**
The main MCP server with:
- ✅ stdin listener (reads commands)
- ✅ stdout responder (sends JSON-RPC responses)
- ✅ Tool registry system
- ✅ File save/load capability
- ✅ Injection markers for DASHBOARD_COMPONENT
- ✅ Example "hello_world" tool (for testing)

### 2. **package.json**
Node.js project configuration

### 3. **test-client.js**
Test script that:
- Spawns the MCP server
- Sends test commands via stdin
- Receives responses via stdout
- Validates the protocol works

### 4. **README.md** (this file)
Setup and usage instructions

---

## Installation:

### Step 1: Extract
Unzip this folder to: `C:\AICode\crop-client-services\mcp-server\`

### Step 2: Install (if needed)
```bash
cd C:\AICode\crop-client-services\mcp-server
npm install
```
*(Currently no dependencies, but good practice)*

---

## Testing:

### Test 1: Run the test client
```bash
npm test
```

**What happens:**
1. Spawns the MCP server
2. Sends 5 test commands:
   - Initialize server
   - List available tools
   - Call hello_world tool
   - Save test data
   - Load test data
3. Shows all stdin/stdout communication

**Expected output:**
```
🧪 MCP Server Test Client

Starting test sequence...

Test 1: Initialize server
📤 Sending: {"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}
📋 Server log: [MCP Server] Server initialized
📥 Received: {"jsonrpc":"2.0","id":1,"result":{"serverName":"cropclient-dashboard",...}}
✅ Parsed: ...

Test 2: List tools
📤 Sending: {"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
📥 Received: {"jsonrpc":"2.0","id":2,"result":{"tools":[{"name":"hello_world",...}]}}
✅ Parsed: ...

[... etc ...]

✅ All tests complete. Press Ctrl+C to exit.
```

### Test 2: Manual stdin test
```bash
node server.js
```

Then type (as single line JSON):
```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

Press Enter. You should see response on stdout.

---

## How It Works:

### MCP Protocol (JSON-RPC 2.0 over stdin/stdout):

**Request format:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "hello_world",
    "arguments": {}
  }
}
```

**Response format:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "success": true,
    "result": {
      "message": "Hello from MCP Server!",
      "timestamp": "2024-12-30T..."
    }
  }
}
```

### Available Methods:

1. **initialize** - Start the server
2. **tools/list** - Get available tools
3. **tools/call** - Execute a tool
4. **data/save** - Save JSON to file
5. **data/load** - Load JSON from file

---

## Component Injection Points:

### Markers in server.js:
```javascript
// ========================================
// @@@@ DASHBOARD_COMPONENT INJECTION POINT @@@@
// Tools will be injected here by the factory
// ========================================

// Example tool (will be replaced by injected component)
const exampleTool = { ... };

// ========================================
// @@@@ DASHBOARD_COMPONENT INJECTION POINT @@@@
// ========================================
```

**When you inject DASHBOARD_COMPONENT:**
- Replace everything between the markers
- Include: create_next_irrigation, reset_table, read_meter, update_record tools
- Register all 4 tools with server.registerTool()

---

## Data Storage:

Files saved via `data/save` go to: `./data/` directory

**Example:**
```javascript
// Save irrigation data
{
  "method": "data/save",
  "params": {
    "filename": "irrigations.json",
    "data": { ... irrigation records ... }
  }
}
```

Creates: `./data/irrigations.json`

---

## Next Steps:

### Phase 1: ✅ Foundation (YOU ARE HERE)
- stdin/stdout protocol working
- Tool registry functional
- Data save/load working
- Test client validates everything

### Phase 2: Component Injection
- Extract DASHBOARD_COMPONENT from marked file
- Inject between markers in server.js
- Replace hello_world with real tools
- Test all 4 CRUD operations

### Phase 3: Production Deploy
- Move to `/var/www/cropclient.io/mcp-server/`
- Set up as Windows service
- Connect to Claude via MCP

---

## Troubleshooting:

**Server won't start:**
- Check Node.js version (need 18+)
- Run: `node --version`

**No response to stdin:**
- Make sure JSON is on single line
- Check JSON is valid (no trailing commas)
- Server logs to stderr, responses to stdout

**Test client fails:**
- Make sure server.js is in same directory
- Check file permissions (chmod +x on Unix)

---

## Architecture Notes:

**Why stdin/stdout?**
- MCP protocol standard
- Works across all platforms
- No network ports needed
- Secure (local only)

**Why JSON-RPC 2.0?**
- Standard protocol
- Request/response matching via ID
- Error handling built-in
- Tool calling standard

**Why separate data directory?**
- Clean separation of code and data
- Easy to backup data only
- Gitignore data files
- Multiple servers can share

---

**Status:** Foundation complete and tested  
**Ready for:** Component injection

---

*Built with the "Hello World" spirit - start simple, prove it works, then build up.* 🎖️
