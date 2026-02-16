# MCP Servers v1.0 - Installation Guide

**Date:** January 1, 2025  
**Version:** 1.0  
**Components:** Dashboard MCP Server + APIService MCP Server

---

## What's Included:

### 1. Dashboard MCP Server (Port 3100)
- **Component:** dashboard-component.js v1.0
- **ID:** dashboard-crud
- **Tools:** 4 CRUD operations
  - create_next_irrigation
  - reset_table
  - read_meter
  - update_record
- **Purpose:** Offline-capable irrigation management

### 2. APIService MCP Server (Port 3101)
- **Component:** api-component.js v1.0
- **ID:** api-sync
- **Tools:** 7 API operations
  - get_token
  - get_ranches
  - get_plantings
  - get_irrigation_details
  - post_irrigation
  - update_irrigation
  - batch_post_queue
- **Purpose:** CropManage API integration

---

## Installation:

### Step 1: Extract Files
```bash
# Extract to your project directory
# Target: C:\AICode\crop-client-services\
```

**You should have:**
```
C:\AICode\crop-client-services\
├── mcp-server/
│   ├── server.js
│   ├── dashboard-component.js (v1.0)
│   ├── package.json
│   ├── test-client.js
│   ├── README.md
│   └── data/
│
└── api-server/
    ├── server.js
    ├── api-component.js (v1.0)
    ├── package.json
    ├── test-client.js
    ├── QUICK_START.txt
    └── more/ (test variations)
```

### Step 2: Install Dependencies (if needed)
```bash
# Dashboard MCP Server
cd C:\AICode\crop-client-services\mcp-server
npm install

# API Server
cd C:\AICode\crop-client-services\api-server
npm install
```

*Note: Currently no external dependencies, but good practice*

---

## Testing:

### Test 1: Dashboard MCP Server

**Start the test:**
```bash
cd C:\AICode\crop-client-services\mcp-server
npm test
```

**Expected output:**
```
🧪 MCP Server Test Client

Test 1: Initialize server
[MCP Server] Tool registered: create_next_irrigation
[MCP Server] Tool registered: reset_table
[MCP Server] Tool registered: read_meter
[MCP Server] Tool registered: update_record
[MCP Server] cropclient-dashboard v1.0.0 ready
✅ Passed

Test 2: List tools
📥 Received: 4 tools registered
✅ Passed

Test 3: Call create_next_irrigation
✅ Passed

Test 4: Call reset_table
✅ Passed

Test 5: Save data
✅ Passed

✅ All tests complete.
```

**If you see 4 tools and all tests pass → Dashboard server is working! ✅**

---

### Test 2: API Server

**Start the test:**
```bash
cd C:\AICode\crop-client-services\api-server
npm test
```

**Expected behavior:**
- Server starts
- 7 tools registered
- get_token test runs
- **KNOWN ISSUE:** Token test may fail with 400 error (Content-Type needs to be x-www-form-urlencoded)
- Other tests should work

**If you see 7 tools registered → API server structure is working! ✅**

*Note: Token authentication needs CropManage credentials to fully test*

---

## Manual Testing:

### Test Dashboard Server Manually:

**1. Start server:**
```bash
cd C:\AICode\crop-client-services\mcp-server
node server.js
```

**2. In another window, send commands:**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node server.js
```

**3. Call a tool:**
```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"reset_table","arguments":{}}}' | node server.js
```

---

### Test API Server Manually:

**1. Start server:**
```bash
cd C:\AICode\crop-client-services\api-server
node server.js
```

**2. List tools:**
```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node server.js
```

**3. Call get_token (requires credentials):**
```bash
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"get_token","arguments":{"username":"your@email.com","password":"yourpassword"}}}' | node server.js
```

---

## Component Versions:

Both components are **v1.0** and include metadata:

**Dashboard Component:**
```javascript
/**
 * @id dashboard-crud
 * @version 1.0
 */
const COMPONENT_ID = "dashboard-crud";
const COMPONENT_VERSION = "1.0";
```

**API Component:**
```javascript
/**
 * @id api-sync
 * @version 1.0
 */
const COMPONENT_ID = "api-sync";
const COMPONENT_VERSION = "1.0";
```

---

## Next Steps:

After testing both servers:

1. **Fix API token issue** (change Content-Type in api-component.js if needed)
2. **Deploy to cropclient.io** (production server)
3. **Set up as Windows services** (for continuous operation)
4. **Test end-to-end** (Dashboard → API → CropManage)
5. **Connect to Claude NLP** (natural language interface)

---

## Troubleshooting:

### Dashboard Server Won't Start:
- Check Node.js version (need 18+)
- Verify dashboard-component.js exists
- Check for syntax errors: `node -c server.js`

### API Server Token Fails:
- **Known Issue:** Content-Type may be wrong
- Fix: Edit api-component.js, change to 'application/x-www-form-urlencoded'
- Verify credentials are correct
- Check network access to api.dev.cropmanage.ucanr.edu

### Tests Hang:
- Press Ctrl+C to stop
- Check if another process is using the ports
- Verify JSON is valid (no trailing commas)

### No Tools Registered:
- Verify component file has module.exports
- Check for require() errors in server.js
- Look at stderr for error messages

---

## Architecture:

```
User (Natural Language)
    ↓
Dashboard MCP Server (3100)
    ↓
dashboard-component.js v1.0
    ├── create_next_irrigation
    ├── reset_table
    ├── read_meter
    └── update_record
    
API Server (3101)
    ↓
api-component.js v1.0
    ├── get_token
    ├── get_ranches
    ├── get_plantings
    ├── get_irrigation_details
    ├── post_irrigation
    ├── update_irrigation
    └── batch_post_queue
    ↓
CropManage API
```

---

## Files Included:

### mcp-server/
- server.js - MCP server with stdio protocol
- dashboard-component.js - v1.0 CRUD tools
- package.json - Project config
- test-client.js - Automated tests
- README.md - Detailed server documentation
- data/ - Data persistence directory

### api-server/
- server.js - MCP server with stdio protocol
- api-component.js - v1.0 API integration
- package.json - Project config
- test-client.js - Automated tests
- QUICK_START.txt - Quick reference
- more/ - Test variations and examples

---

## Support:

**Working Directory:** `C:\AICode\crop-client-services\`  
**Ports Used:** 3100 (Dashboard), 3101 (API)  
**Protocol:** JSON-RPC 2.0 over stdin/stdout  
**Node Version:** 18+ required

---

**Version 1.0 - Ready for Testing**

*Both servers include versioned components and are ready for deployment.*
