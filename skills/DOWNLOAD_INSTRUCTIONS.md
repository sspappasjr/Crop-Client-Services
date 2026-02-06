# 📥 HOW TO DOWNLOAD AND INSTALL

## Step 1: Download the mcp-server Folder

**In Claude's interface, you'll see download links below. Click on:**

- **mcp-server/** folder (this downloads the entire folder as a zip)

**Or download individual files if needed:**
- server.js
- package.json
- README.md
- lib/ folder
- data/ folder

---

## Step 2: Extract to Your Location

**Extract the mcp-server folder to:**

```
C:\AICode\crop-client-services\
```

**Result should be:**

```
C:\AICode\crop-client-services\
  └── mcp-server\
      ├── server.js
      ├── package.json
      ├── README.md
      ├── lib\
      │   ├── date-utils.js
      │   ├── irrigation-core.js
      │   └── prompt-router.js
      └── data\
          └── irrigation.json
```

---

## Step 3: Install Dependencies

Open Command Prompt:

```bash
cd C:\AICode\crop-client-services\mcp-server
npm install
```

---

## Step 4: Configure Claude Desktop

**Windows Key + R** → Type: `%APPDATA%\Claude` → Hit Enter

**Create/Edit file:** `claude_desktop_config.json`

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

**Save the file!**

---

## Step 5: Restart Claude Desktop

1. Close Claude Desktop completely
2. Open it again

---

## Step 6: Test It!

**Come back to Claude Desktop and type:**

```
read irrigation table
```

**Or:**

```
show irrigation statistics
```

**If you see 12 irrigation records - IT WORKS!** ✅

---

## 🎯 Quick Checklist

- [ ] Download mcp-server folder from Claude interface
- [ ] Extract to C:\AICode\crop-client-services\
- [ ] Open Command Prompt
- [ ] cd C:\AICode\crop-client-services\mcp-server
- [ ] npm install
- [ ] Edit %APPDATA%\Claude\claude_desktop_config.json
- [ ] Save the config file
- [ ] Restart Claude Desktop
- [ ] Test: "read irrigation table"

---

## 📚 Bonus Files Also Available

- **QUICK_SETUP.md** - This file (step-by-step guide)
- **SKILL.md** - Complete skill documentation
- **README.md** - Overview and features
- **DEPLOYMENT_SUMMARY.md** - What we built today
- **MCP_Irrigation_Implementation_Guide.md** - Deep technical guide

---

## 🆘 Need Help?

If anything doesn't work:

1. Check the path in claude_desktop_config.json
2. Make sure Node.js is installed (type `node --version` in Command Prompt)
3. Make sure npm install completed without errors
4. Restart Claude Desktop again
5. Check for typos in the JSON config

---

**Ready Steve? Download the mcp-server folder and follow these steps!** 🚀
