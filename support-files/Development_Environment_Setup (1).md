# CropClient Development Environment
## Three-Location Setup Guide

**Last Updated:** October 25, 2025  
**Purpose:** Document the development workflow and environment structure

---

## Overview

CropClient uses a three-location development architecture to balance documentation, active development, and production deployment needs.

---

## Location 1: Obsidian Vault (Documentation Hub)

**Path:** `C:\Users\Steve\Dropbox\MyObsidian\MyObsidianVault\3-Resources\MobileFrame Sales\Documents\CropManage\hello-world-system\`

### Purpose
- Knowledge management and documentation
- Architecture notes and napkin conversations
- Code viewing and light editing
- Backup and sync across devices

### Capabilities
- ✓ Edit files
- ✓ View code
- ✓ Write documentation
- ✓ Manage knowledge base
- ✗ **Cannot run MongoDB** (Dropbox sync interference)
- ✗ **Cannot run Node.js** (file lock conflicts)
- ✗ **Cannot run development server** (sync delays)

### Why Dropbox Interferes
- Cloud sync locks files during upload
- Conflicts with database file operations
- File watchers fight with sync operations
- Real-time changes get delayed by sync
- MongoDB cannot maintain consistent file locks

### What Lives Here
- Napkin conversations (Entry #1, Entry #2)
- Architecture documents
- Vision and philosophy docs
- Design notes
- Code references

---

## Location 2: Local Development (Active Workspace)

**Path:** `C:\AICode\crop-client-services`

### Purpose
- Active development and testing
- Running full stack locally
- Debugging and troubleshooting
- Feature development

### Capabilities
- ✓ Run MongoDB
- ✓ Run Node.js server
- ✓ Run full development stack
- ✓ Test features locally
- ✓ Debug in real-time
- ✓ No sync interference

### What Lives Here
- Working copy of all code
- Local MongoDB instance
- Development server
- Test data
- Build artifacts

### Development Commands
```bash
# Start MongoDB
mongod --dbpath ./data

# Start Node.js server
npm start

# Run development server
npm run dev
```

---

## Location 3: Production Server (Live Deployment)

**Domain:** CropClient.com

### Purpose
- Production environment
- Live user access
- Production testing
- Deployment target

### Capabilities
- ✓ Running MongoDB
- ✓ Running Node.js
- ✓ Serving live traffic
- ✓ Production data
- ✓ Full stack deployed

### Deployment Process
1. Develop and test in `C:\AICode\crop-client-services`
2. Verify everything works locally
3. Push to production server
4. Test on CropClient.com

---

## Development Workflow

### Standard Development Process

```
1. DESIGN/DOCUMENT
   Location: Obsidian Vault
   Activity: Write notes, sketch architecture, document vision
   
   ↓

2. BUILD/TEST
   Location: C:\AICode\crop-client-services
   Activity: Write code, run locally, debug, test features
   
   ↓

3. DEPLOY
   Location: CropClient.com
   Activity: Push to production, verify live functionality
```

### Example Session

**Morning - Planning:**
- Open Obsidian vault
- Review napkin conversations
- Plan today's features
- Write architecture notes

**Afternoon - Building:**
- Switch to `C:\AICode\crop-client-services`
- Write code
- Run local server
- Test features
- Debug issues

**Evening - Deploy:**
- Push working code to server
- Test on CropClient.com
- Verify production functionality

---

## File Organization

### Obsidian Vault Structure
```
MyObsidianVault/
├── 3-Resources/
│   └── MobileFrame Sales/
│       └── Documents/
│           └── CropManage/
│               └── hello-world-system/
│                   ├── Pages/
│                   ├── mcp-server/
│                   └── docs/
```

### Local Development Structure
```
C:\AICode\crop-client-services/
├── pages/
│   ├── CropClient-Live-Chat.html
│   └── configs/
├── mcp-server/
│   └── data/
├── node_modules/
└── package.json
```

---

## Best Practices

### DO:
- ✓ Edit documentation in Obsidian
- ✓ Develop and test in C:\AICode\
- ✓ Deploy from C:\AICode\ to production
- ✓ Keep Obsidian for knowledge/notes
- ✓ Keep working code in local development

### DON'T:
- ✗ Try to run MongoDB from Dropbox
- ✗ Try to run Node.js from Dropbox
- ✗ Develop directly on production
- ✗ Skip local testing before deployment

---

## Troubleshooting

### Problem: Can't run server from Obsidian vault
**Solution:** This is expected. Switch to `C:\AICode\crop-client-services` to run the server.

### Problem: Files not syncing to Obsidian
**Solution:** Check Dropbox sync status. May need to wait for sync to complete.

### Problem: Code changes not reflected locally
**Solution:** Make sure you're editing in `C:\AICode\` not in Obsidian vault.

### Problem: Production not updating
**Solution:** Verify deployment from C:\AICode\ to server completed successfully.

---

## Future Plans

### Eventual Consolidation
When MongoDB and infrastructure are production-ready and stable, the entire Obsidian vault (notes + code) could potentially be moved to the CropClient server, consolidating everything into one runnable location.

**Not ready yet because:**
- MongoDB infrastructure needs hardening
- Backup/sync strategy needs refinement
- Production stability needs verification

**When ready, will enable:**
- Single location for all work
- Everything runnable from one place
- Simplified workflow
- Better integration

---

## Summary

**Three locations, three purposes:**

1. **Obsidian/Dropbox** = Knowledge & Documentation Hub
2. **C:\AICode\** = Active Development Workspace  
3. **CropClient.com** = Production Deployment

**Each serves a specific role in the development pipeline, and together they create a robust, flexible development environment.**

---

**Remember:** KISS - Keep It Simple, Stupid

Use the right location for the right task. Don't fight the tools. Work with the workflow. ✓
