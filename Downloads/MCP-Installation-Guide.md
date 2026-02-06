# CropClient-Services MCP Installation Guide
## Simple & Practical Setup for Stdio with Node.js

---

## Prerequisites
- Node.js installed on your system
- Command prompt access
- Text editor (VS Code, Notepad++, etc.)

---

## Step 1: Create Directory Structure

```
C:\CropClient-Services\
    └── mcp-service\
            ├── src\
            │   └── index.js
            ├── data\
            │   └── irrigation.json
            ├── package.json
            └── test-client.js
```

**Create the folders:**
```bash
mkdir C:\CropClient-Services\mcp-service
mkdir C:\CropClient-Services\mcp-service\src
mkdir C:\CropClient-Services\mcp-service\data
```

---

## Step 2: Initialize Node Project

Open Command Prompt and navigate to your MCP service folder:

```bash
cd C:\CropClient-Services\mcp-service
npm init -y
```

This creates your `package.json` file with default settings.

---

## Step 3: Install MCP SDK

From the same directory:

```bash
npm install @modelcontextprotocol/sdk
```

This installs the MCP SDK into `node_modules\@modelcontextprotocol\sdk\`

---

## Step 4: Understanding the Built-in Imports

Your `src\index.js` will use these **standard Node.js imports** (no extra packages needed):

### Built-in Node.js Modules:
- **`fs/promises`** - File system operations (read/write JSON files)
- **`path`** - Handle file paths correctly across Windows/Linux

### MCP SDK Imports:
- **`@modelcontextprotocol/sdk`** - Provides:
  - `Server` - MCP server instance
  - `StdioServerTransport` - Stdio communication transport

### What These Give You:

**From fs/promises:**
- `readFile()` - Read irrigation.json from disk
- `writeFile()` - Save changes to JSON files
- `readdir()` - List files in directories
- `stat()` - Check if files exist

**From path:**
- `path.join()` - Build file paths correctly
- `path.resolve()` - Get absolute paths

**From MCP SDK:**
- Server setup for handling tool requests
- Stdio transport for stdin/stdout communication

---

## Step 5: Create Simple Test Client

Create `test-client.js` in your `mcp-service` folder.

### Purpose:
This file will:
- Start your MCP server as a child process
- Send test requests via stdin
- Receive responses via stdout
- Display results in the console

### To Run Tests:
```bash
node test-client.js
```

### What You'll See:
- List of available tools (imported + custom)
- Test results for each operation
- Any errors clearly displayed
- Pass/fail status for each test

---

## Step 6: View Available Features

### In Your Console, You Can Check:

**1. List All Tools:**
```
Available Tools:
- list_tools (built-in MCP feature)
- read_irrigation_table (your custom tool)
- write_irrigation_data (your custom tool)
- get_ranch_info (your custom tool)
```

**2. Test Each Tool:**
- Send sample request
- See the response data
- Verify it's working correctly

**3. Inspect Results:**
- Console.log output only
- No special dashboard needed
- Clear pass/fail for each test
- JSON response data visible

---

## Step 7: Simple Testing Pattern

### Your Workflow:

1. **Start test client:**
   ```bash
   node test-client.js
   ```

2. **See list of available tools**
   - All MCP built-in features
   - Your custom irrigation tools

3. **Run tests for each tool**
   - Automated test suite runs
   - Or manual tool testing

4. **Check console output**
   - Green = Pass
   - Red = Fail
   - JSON response data

5. **Fix any issues**
   - Edit src\index.js
   - Update tool handlers

6. **Re-run tests**
   ```bash
   node test-client.js
   ```

**No TypeScript, no dashboards, no extra complexity** - just Node.js, command prompt, and console output.

---

## Step 8: What You Can Test

### MCP Service Health:
- ✓ Is stdio working?
- ✓ Is the server responding?
- ✓ Are tools registered correctly?

### File Operations:
- ✓ Can it read irrigation.json?
- ✓ Are file paths correct?
- ✓ Can it write data back?

### Data Processing:
- ✓ Do filters work (Ranch 1, Date, etc.)?
- ✓ Is data formatting correct?
- ✓ Are query parameters working?

### Error Handling:
- ✓ Are errors handled properly?
- ✓ Do error messages make sense?
- ✓ Does it recover gracefully?

### All Results Visible in Console:
```
Test: read_irrigation_table
Parameters: { ranch: "Ranch 1", date: "9/23/25" }
Status: PASS ✓
Response: [irrigation data array]
Time: 45ms
```

---

## Step 9: Running Your MCP Service

### For Testing (with test client):
```bash
node test-client.js
```

### For Production (standalone):
```bash
node src\index.js
```

The service will:
- Start stdio transport
- Register all tools
- Wait for requests on stdin
- Send responses on stdout
- Log errors to stderr

---

## Step 10: AWS Deployment

### Same Structure on AWS:
```
/home/ubuntu/CropClient-Services/
    └── mcp-service/
            ├── src/
            ├── data/
            ├── package.json
            └── test-client.js
```

### Installation on AWS:
```bash
cd /home/ubuntu/CropClient-Services/mcp-service
npm install
node test-client.js
```

The same code works - paths automatically adapt between Windows and Linux.

---

## Troubleshooting

### If MCP Server Won't Start:
1. Check Node.js is installed: `node --version`
2. Check MCP SDK installed: `npm list @modelcontextprotocol/sdk`
3. Check file paths in index.js
4. Look for errors in console

### If Tools Don't Work:
1. Check data\irrigation.json exists
2. Check file permissions
3. Check JSON is valid
4. Run test-client.js to see specific errors

### If Stdio Issues:
1. Make sure nothing else writes to stdout
2. All logging should use console.error (stderr)
3. Check stdin/stdout aren't redirected

---

## Summary

You now have:
- ✓ MCP SDK installed with stdio support
- ✓ Built-in Node.js modules (fs/promises, path)
- ✓ Simple test client for validation
- ✓ Console-based inspection (no dashboard)
- ✓ Clean structure that works on desktop and AWS

**Next Steps:**
- Build your tool handlers in src\index.js
- Create sample irrigation.json data
- Run test-client.js to verify everything works
- Deploy to AWS when ready

---

## Key Principles

1. **Keep It Simple** - No TypeScript, no extra frameworks
2. **Test Desktop First** - Your machine is the test environment
3. **Use Built-ins** - Node.js has everything you need
4. **Console Testing** - Clear, visible results
5. **Same Code Everywhere** - Desktop and AWS use identical setup

---

*Guide for CropClient-Services MCP Installation*  
*Simple stdio setup with Node.js built-in modules*
