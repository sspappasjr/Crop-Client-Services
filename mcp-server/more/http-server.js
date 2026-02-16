/**
 * HTTP Wrapper for Dashboard MCP Server
 * Allows HTML/JavaScript to call MCP tools via fetch()
 * Port: 3100
 */

const express = require('express');
const cors = require('cors');
const dashboardComponent = require('./dashboard-component');

const app = express();
const PORT = 3100;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/ping', (req, res) => {
    res.json({ 
        status: 'alive',
        server: 'CropClient Dashboard MCP',
        timestamp: new Date().toISOString()
    });
});

// List all tools
app.get('/tools', (req, res) => {
    const tools = dashboardComponent.tools.map(t => ({
        name: t.name,
        description: t.description
    }));
    res.json({ tools });
});

// Call a tool
app.post('/tools/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const args = req.body;
    
    const tool = dashboardComponent.tools.find(t => t.name === toolName);
    
    if (!tool) {
        return res.status(404).json({
            success: false,
            error: `Tool not found: ${toolName}`
        });
    }
    
    try {
        const result = await tool.handler(args);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Dashboard MCP Server running on http://localhost:${PORT}`);
    console.log(`📋 Tools available: ${dashboardComponent.tools.length}`);
    dashboardComponent.tools.forEach(t => {
        console.log(`   - ${t.name}`);
    });
});
