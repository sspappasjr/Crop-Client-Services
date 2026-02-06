# CropClient MCP Server - Quick Setup

## 🚀 Fast Installation (5 Minutes)

### Step 1: Copy This Folder

Copy the entire `cropclient-mcp-deploy` folder to:

```
C:\AICode\crop-client-services\
```

**Result:**
```
C:\AICode\crop-client-services\
  └── mcp-server\
      ├── server.js
      ├── package.json
      ├── lib\
      └── data\
```

---

### Step 2: Install Dependencies

Open Command Prompt:

```bash
cd C:\AICode\crop-client-services\mcp-server
npm install
```

**Takes about 30 seconds.**

---

### Step 3: Configure Claude Desktop

**Windows Key + R** → Type: `%APPDATA%\Claude` → Hit Enter

**Create/Edit:** `claude_desktop_config.json`

**Paste this:**

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

**Save the file.**

---

### Step 4: Restart Claude Desktop

1. Close Claude Desktop completely
2. Open Claude Desktop again

---

### Step 5: Test It!

**In Claude Desktop, type:**

```
read irrigation table
```

**Expected Result:**
You should see 12 irrigation records returned with details about Ranch 1, Ranch 2, and various plantings!

---

## ✅ Success Checklist

- [ ] Folder copied to C:\AICode\crop-client-services\mcp-server\
- [ ] `npm install` completed without errors
- [ ] claude_desktop_config.json created in %APPDATA%\Claude\
- [ ] Claude Desktop restarted
- [ ] "read irrigation table" returns data

---

## 🎯 What You Can Do Now

Try these prompts in Claude Desktop:

```
"show irrigation statistics"
"create next irrigation for ranch 1 planting 1A"
"read meter for ranch 1 planting 1A"
"sort records"
"reset to original data"
"show all ranch 2 records"
```

---

## 📚 Documentation

- **SKILL.md** - Complete installation guide and features
- **mcp-server/README.md** - Full technical documentation
- **MCP_Irrigation_Implementation_Guide.md** - Deep dive on architecture

---

## 🔧 Troubleshooting

**Problem:** "read irrigation table" doesn't work

**Solutions:**
1. Check the path in claude_desktop_config.json matches where you copied files
2. Make sure Node.js is installed (you already have it)
3. Restart Claude Desktop again
4. Check for typos in the JSON config

---

**Problem:** npm install fails

**Solutions:**
1. Make sure you're in the mcp-server directory
2. Check internet connection (needs to download MCP SDK)
3. Try: `npm install --force`

---

## 🎉 You're Done!

**The MCP server is now running whenever Claude Desktop is open!**

All your apps can now use natural language prompts to control irrigation operations. The LEGO blocks are live! 🚀

---

**Next Steps:**
1. Update Test Model to use MCP
2. Update Main App to use MCP
3. Demo for Michael Cahn
4. Build new apps using the same MCP server!
