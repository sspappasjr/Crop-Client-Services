/**
 * Dashboard MCP Server - CropClient Irrigation CRUD Tools
 * Combines MCP stdio protocol + HTTP bridge in one process
 * Port: 3100 (HTTP), stdio (MCP)
 * Tools: 4 CRUD operations (create_next, reset, read_meter, update)
 */

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

// @@@@ DASHBOARD_COMPONENT id:dashboard-crud @@@@
// Purpose: Portable irrigation dashboard with MCP CRUD tools
// Works with JSON default data (offline) or API-sourced data
// Self-contained - no external dependencies

// ========================================================================================================
// --------------------- NEW FEATURE ADDED TO EXISTING COMPONENT ----------------------------
// ========================================================================================================

// MCP Master Routing - Parse command to tool name
function parseCommandToTool(input) {
    if (input.includes('create next') || input.includes('next irrigation')) return 'create_next_irrigation';
    if (input.includes('reset table') || input.includes('reset')) return 'reset_table';
    if (input.includes('read meter') || input.includes('meter')) return 'read_meter';
    if (input.includes('update record') || input.includes('update')) return 'update_record';
    if (input.includes('get token') || input.includes('token')) return 'get_token';
    if (input.includes('get ranches') || input.includes('ranches')) return 'get_ranches';
    if (input.includes('get plantings') || input.includes('plantings')) return 'get_plantings';
    if (input.includes('get irrigation') || input.includes('irrigation details')) return 'get_irrigation_details';
    if (input.includes('load display') || input.includes('load into')) return 'load_into_displayRecords';
    if (input.includes('post new') || input.includes('post irrigation')) return 'post_new_irrigation';
    if (input.includes('update irrigation')) return 'update_irrigation';
    if (input.includes('batch post') || input.includes('batch queue')) return 'batch_post_queue';
    return null;
}

// MCP Tool Registry - Tracks which server has which tools
const mcpRegistry = {
    dashboard: {
        port: null,
        tools: ['create_next_irrigation', 'reset_table', 'read_meter', 'update_record']
    },
    api: {
        port: 3101,
        tools: ['get_token', 'get_ranches', 'get_plantings', 'get_irrigation_details', 
                'load_into_displayRecords', 'post_new_irrigation', 'update_irrigation', 'batch_post_queue']
    }
};

// Route command to correct tool/server
async function routeCommand(promptText) {
    const mode = 'local'; // default to local mode in server
    const input = promptText.toLowerCase();
    
    // Parse command to tool name
    let toolName = parseCommandToTool(input);
    
    if (!toolName) {
        return { success: false, error: 'Command not recognized' };
    }
    
    // Find which server has this tool
    let targetServer = null;
    for (const [serverName, config] of Object.entries(mcpRegistry)) {
        if (config.tools.includes(toolName)) {
            targetServer = serverName;
            break;
        }
    }
    
    if (!targetServer) {
        return { success: false, error: `Tool not registered: ${toolName}` };
    }
    
    // Route based on target server
    if (targetServer === 'dashboard') {
        // Execute dashboard tool locally
        return await callLocalTool(toolName);
    } else if (targetServer === 'api') {
        // Forward to API server
        return await callRemoteTool(toolName, mcpRegistry.api.port);
    }
}

// Call tool on local dashboard server
async function callLocalTool(toolName) {
    try {
        let result;
        
        switch (toolName) {
            case 'create_next_irrigation':
                result = testCreateNext();
                break;
            case 'reset_table':
                result = resetTable();
                break;
            case 'read_meter':
                result = testReadMeter();
                break;
            case 'update_record':
                result = updateRecord();
                break;
            default:
                return { success: false, error: `Tool not found locally: ${toolName}` };
        }
        
        return result;
        
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Call tool on remote API server
async function callRemoteTool(toolName, port) {
    try {
        const url = `http://localhost:${port}/tools/${toolName}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        
        if (!response.ok) {
            throw new Error(`API server returned ${response.status}`);
        }
        
        const result = await response.json();
        return result;
        
    } catch (error) {
        return {
            success: false,
            error: `Failed to reach API server: ${error.message}`
        };
    }
}

// ========================================
// FILE OPERATIONS - Persistent Storage
// ========================================

const fs = require('fs');
const path = require('path');

// Base data directory
const DATA_DIR = path.join(__dirname, 'data');

// Ensure data directory exists
function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
}

// Resolve file path - supports both relative and absolute paths
function resolvePath(filepath) {
    if (path.isAbsolute(filepath)) {
        return filepath;
    }
    return path.join(DATA_DIR, filepath);
}

// Read JSON file
function readJSON(filepath) {
    try {
        const fullPath = resolvePath(filepath);
        const data = fs.readFileSync(fullPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null; // File not found
        }
        throw new Error(`Error reading JSON file: ${error.message}`);
    }
}

// Write JSON file (create or overwrite)
function writeJSON(filepath, data) {
    try {
        const fullPath = resolvePath(filepath);
        const dir = path.dirname(fullPath);
        
        // Ensure directory exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        // Write with pretty formatting
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf8');
        
        return { success: true, path: fullPath };
    } catch (error) {
        throw new Error(`Error writing JSON file: ${error.message}`);
    }
}

// Update JSON file (merge with existing data)
function updateJSON(filepath, updates) {
    try {
        const fullPath = resolvePath(filepath);
        
        // Read existing data
        let existing = {};
        try {
            const data = fs.readFileSync(fullPath, 'utf8');
            existing = JSON.parse(data);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                throw error;
            }
            // File doesn't exist, will create new
        }
        
        // Merge updates with existing data
        const merged = { ...existing, ...updates };
        
        // Write back
        writeJSON(filepath, merged);
        
        return { success: true, path: fullPath, data: merged };
    } catch (error) {
        throw new Error(`Error updating JSON file: ${error.message}`);
    }
}

// Delete JSON file
function deleteJSON(filepath) {
    try {
        const fullPath = resolvePath(filepath);
        fs.unlinkSync(fullPath);
        return { success: true, path: fullPath };
    } catch (error) {
        if (error.code === 'ENOENT') {
            throw new Error(`File not found: ${filepath}`);
        }
        throw new Error(`Error deleting JSON file: ${error.message}`);
    }
}

// List JSON files in a directory
function listJSONFiles(directory = '.') {
    try {
        const fullPath = resolvePath(directory);
        ensureDataDir();
        
        if (!fs.existsSync(fullPath)) {
            return []; // Directory doesn't exist
        }
        
        const files = fs.readdirSync(fullPath);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        
        return jsonFiles.map(f => path.join(directory, f));
    } catch (error) {
        throw new Error(`Error listing JSON files: ${error.message}`);
    }
}

// Check if file exists
function fileExists(filepath) {
    try {
        const fullPath = resolvePath(filepath);
        return fs.existsSync(fullPath);
    } catch {
        return false;
    }
}

// Auto-save helper - saves displayRecords to file
function autoSaveIrrigationData() {
    try {
        writeJSON('irrigation-data.json', {
            records: displayRecords,
            lastSaved: new Date().toISOString()
        });
        console.log('💾 Auto-saved irrigation data');
    } catch (error) {
        console.error('❌ Auto-save failed:', error.message);
    }
}

// Initialize data directory on load
ensureDataDir();

// ========================================================================================================
// --------------------- EXISTING CODE HERE NOW --------------------------------------
// ========================================================================================================

// ========================================
// VARIABLES - Grid Storage (Default Data)
// ========================================
        const originalData = [
            { id: 1, ranch: "1", planting: "1A", hours: 1.3, mgrHours: 1.2, appliedHours: 1.15, interval: "1.5 days", scheduledDate: "10/14/24", irrigationMethod: "Drip", recommendedInches: "0.5", lastUpdatedDate: "10/13/24 14:30", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 2, ranch: "1", planting: "1A", hours: 1.2, mgrHours: 1.1, appliedHours: 1.05, interval: "1.5 days", scheduledDate: "10/16/24", irrigationMethod: "Drip", recommendedInches: "0.5", lastUpdatedDate: "10/15/24 09:15", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 3, ranch: "1", planting: "1A", hours: 1.4, mgrHours: 1.3, appliedHours: 0, interval: "1.5 days", scheduledDate: "10/18/24", irrigationMethod: "Drip", recommendedInches: "0.5", lastUpdatedDate: "10/17/24 11:20", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 4, ranch: "1", planting: "1B", hours: 1.6, mgrHours: 1.4, appliedHours: 0, interval: "1.5 days", scheduledDate: "10/20/24", irrigationMethod: "Drip", recommendedInches: "0.6", lastUpdatedDate: "10/19/24 08:45", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 5, ranch: "1", planting: "1B", hours: 2.1, mgrHours: 2, appliedHours: 1.95, interval: "2 days", scheduledDate: "10/12/24", irrigationMethod: "Sprinkler", recommendedInches: "0.8", lastUpdatedDate: "10/11/24 16:00", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 6, ranch: "1", planting: "1B", hours: 2.2, mgrHours: 2.1, appliedHours: 0, interval: "2 days", scheduledDate: "10/14/24", irrigationMethod: "Sprinkler", recommendedInches: "0.8", lastUpdatedDate: "10/13/24 10:30", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 7, ranch: "2", planting: "2A", hours: 1.8, mgrHours: 1.7, appliedHours: 1.65, interval: "1 days", scheduledDate: "10/15/24", irrigationMethod: "Drip", recommendedInches: "0.6", lastUpdatedDate: "10/14/24 13:20", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 8, ranch: "2", planting: "2A", hours: 1.9, mgrHours: 1.8, appliedHours: 1.75, interval: "1 days", scheduledDate: "10/16/24", irrigationMethod: "Drip", recommendedInches: "0.6", lastUpdatedDate: "10/15/24 14:45", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 9, ranch: "2", planting: "2A", hours: 2, mgrHours: 1.9, appliedHours: 0, interval: "1 days", scheduledDate: "10/17/24", irrigationMethod: "Drip", recommendedInches: "0.6", lastUpdatedDate: "10/16/24 09:00", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 10, ranch: "2", planting: "2B", hours: 1.5, mgrHours: 1.4, appliedHours: 1.35, interval: "2 days", scheduledDate: "10/13/24", irrigationMethod: "Sprinkler", recommendedInches: "0.7", lastUpdatedDate: "10/12/24 15:10", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 11, ranch: "2", planting: "2B", hours: 1.6, mgrHours: 1.5, appliedHours: 0, interval: "2 days", scheduledDate: "10/15/24", irrigationMethod: "Sprinkler", recommendedInches: "0.7", lastUpdatedDate: "10/14/24 12:30", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false },
            { id: 12, ranch: "2", planting: "2B", hours: 1.7, mgrHours: 1.6, appliedHours: 0, interval: "2 days", scheduledDate: "10/17/24", irrigationMethod: "Sprinkler", recommendedInches: "0.7", lastUpdatedDate: "10/16/24 11:15", updatedBy: "System", isNew: false, isOriginal: true, isUpdated: false }
        ];

// ========================================
// VARIABLES - Working Grid Data
// ========================================
        let irrigationData = JSON.parse(JSON.stringify(originalData));
        let displayRecords = [];
        let selectedRecord = null;

        // Auto-load irrigation data from file on startup
        const savedData = readJSON('irrigation-data.json');
        if (savedData && savedData.records) {
            displayRecords = savedData.records;
            console.log(`✅ Loaded ${displayRecords.length} irrigation records from file`);
        } else {
            // First time - use default data
            displayRecords = JSON.parse(JSON.stringify(irrigationData));
            console.log(`✅ Using default ${displayRecords.length} irrigation records`);
        }

// ========================================
// MCP TOOLS REGISTRY
// ========================================
        
        const mcpTools = {
            create_next_irrigation: {
                name: "create_next_irrigation",
                description: "Creates the next scheduled irrigation event based on the most recent irrigation record. Calculates new date using the interval from the last record and sets recommended hours as manager hours.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: []
                },
                handler: function() {
                    return testCreateNext();
                }
            },
            reset_table: {
                name: "reset_table",
                description: "Resets the irrigation data table back to original state. Handles both JSON default data and API-sourced data (Grid 4). When data source is API, reloads from cached API detail data. When data source is JSON, reloads from original default data.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: []
                },
                handler: function() {
                    resetTable();
                    return { success: true, message: "Table reset complete" };
                }
            },
            read_meter: {
                name: "read_meter",
                description: "Prepares form to capture actual meter reading for the most recent irrigation event. Finds the last irrigation record for the selected ranch/planting, selects it, and focuses the Water Applied field for data entry. Used by field workers to record real-world water usage.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: []
                },
                handler: function() {
                    testReadMeter();
                    return { success: true, message: "Ready for meter reading" };
                }
            },
            update_record: {
                name: "update_record",
                description: "Updates the currently selected irrigation record with values from the form fields (date, interval, manager hours, water applied). Marks record status as pending (-1) for sync to CropManage. Changes are saved to working memory.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    required: []
                },
                handler: function() {
                    updateRecord();
                    return { success: true, message: "Record updated" };
                }
            }
        };

// ========================================
// FUNCTIONS - MCP Tool Caller
// ========================================
        
        function callTool(toolName, params = {}) {
            const tool = mcpTools[toolName];
            if (!tool) {
                return { success: false, error: `Tool not found: ${toolName}` };
            }
            
            return tool.handler(params);
        }

// ========================================
// FUNCTIONS - Utilities
// ========================================

        function parseEventDate(dateStr) {
            const parts = dateStr.split('/');
            const month = parseInt(parts[0]) - 1;
            const day = parseInt(parts[1]);
            const year = parseInt('20' + parts[2]);
            return new Date(year, month, day);
        }

        function formatDate(date) {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            return `${month}/${day}/${year}`;
        }

// ========================================
// FUNCTIONS - CRUD Operations (Reset, Create, Read, Update)
// ========================================

        function resetTable() {
            // Turn off wait queue filter to avoid black screen
            
            // Check data source to determine how to reset
            if (dataSource === 'api') {
                // Data came from API - reload from stored Grid 4 (api detail) data
                if (apiDetailData.length > 0) {
                    displayRecords = JSON.parse(JSON.stringify(apiDetailData));
                    autoSaveIrrigationData(); // Auto-save
                    return {
                        success: true,
                        message: `Reset Complete - Reloaded from API Detail`,
                        count: displayRecords.length
                    };
                } else {
                    return {
                        success: false,
                        message: 'No API data stored - please refresh from CropManage first'
                    };
                }
            } else {
                // Data came from JSON - reset to original default data
                irrigationData = JSON.parse(JSON.stringify(originalData));
                displayRecords = JSON.parse(JSON.stringify(irrigationData));
                selectedRecord = null;
                
                autoSaveIrrigationData(); // Auto-save
                
                return {
                    success: true,
                    message: 'Table Reset Complete',
                    count: displayRecords.length
                };
            }
        }

        // ========================================
        // CREATE NEXT IRRIGATION (CORE TOOL #1)
        // ========================================

        function testCreateNext() {
            if (!selectedRecord) {
                // If no record selected, use most recent from all records
                if (displayRecords.length === 0) {
                    return {
                        success: false,
                        message: 'No irrigation records available'
                    };
                }
            }
            
            const sameFieldRecords = selectedRecord 
                ? displayRecords.filter(r => 
                    r.ranch === selectedRecord.ranch && 
                    r.planting === selectedRecord.planting
                  )
                : displayRecords;
            
            sameFieldRecords.sort((a, b) => {
                const dateA = parseEventDate(a.scheduledDate);
                const dateB = parseEventDate(b.scheduledDate);
                return dateA - dateB;
            });
            
            const lastRecord = sameFieldRecords[sameFieldRecords.length - 1];
            
            const currentDate = parseEventDate(lastRecord.scheduledDate);
            const nextDate = new Date(currentDate);
            const intervalDays = parseFloat(lastRecord.interval) || 1;
            const roundedInterval = Math.round(intervalDays);
            
            nextDate.setDate(nextDate.getDate() + roundedInterval);
            const nextDateStr = formatDate(nextDate);
            
            const tinyAdjust = (Math.random() * 0.2 + 0.1);
            const newRecHours = Math.max(0.1, parseFloat((lastRecord.hours + tinyAdjust).toFixed(1)));
            const newMgrHours = parseFloat((lastRecord.mgrHours + 0.1).toFixed(1));
            
            const maxId = Math.max(...displayRecords.map(r => r.id));
            
            const newRecord = {
                id: maxId + 1,
                ranch: lastRecord.ranch,
                planting: lastRecord.planting,
                hours: newRecHours,
                mgrHours: newMgrHours,
                appliedHours: 0,
                interval: lastRecord.interval,
                scheduledDate: nextDateStr,
                irrigationMethod: lastRecord.irrigationMethod,
                recommendedInches: lastRecord.recommendedInches,
                lastUpdatedDate: new Date().toLocaleString(),
                updatedBy: "CropClient System",
                isNew: true,
                isOriginal: false,
                isUpdated: false,
                ranchId: lastRecord.ranchId,
                plantingId: lastRecord.plantingId,
                status: -1
            };
            
            displayRecords.push(newRecord);
            
            // Clear isNew flag on all OTHER records (only newest shows as new)
            displayRecords.forEach(r => {
                if (r.id !== newRecord.id) {
                    r.isNew = false;
                }
            });
            
            selectedRecord = newRecord;
            
            autoSaveIrrigationData(); // Auto-save
            
            return {
                success: true,
                message: 'Next irrigation created',
                record: newRecord,
                records: displayRecords
            };
        }

        // ========================================
        // READ METER (CORE TOOL #2)
        // ========================================

        function testReadMeter() {
            if (!selectedRecord) {
                return {
                    success: false,
                    message: 'No record selected. Please select a record first.'
                };
            }
            
            const targetRanch = selectedRecord.ranch;
            const targetPlanting = selectedRecord.planting;
            
            const matchingRecords = displayRecords.filter(r => 
                r.ranch === targetRanch && 
                r.planting === targetPlanting
            );
            
            if (matchingRecords.length === 0) {
                return {
                    success: false,
                    message: `No records found for Ranch ${targetRanch} Planting ${targetPlanting}`
                };
            }
            
            matchingRecords.sort((a, b) => {
                const dateA = parseEventDate(a.scheduledDate);
                const dateB = parseEventDate(b.scheduledDate);
                return dateA - dateB;
            });
            
            const lastRecord = matchingRecords[matchingRecords.length - 1];
            
            selectedRecord = lastRecord;
            
            return {
                success: true,
                message: 'Ready for Meter Reading',
                record: {
                    ranch: lastRecord.ranch,
                    planting: lastRecord.planting,
                    scheduledDate: lastRecord.scheduledDate,
                    currentAppliedHours: lastRecord.appliedHours
                }
            };
        }

        // ========================================
        // UPDATE RECORD (SAVE CHANGES)
        // ========================================

        function updateRecord() {
            if (!selectedRecord) {
                return {
                    success: false,
                    message: 'No record selected. Please select a record first.'
                };
            }
            
            const recordToUpdate = displayRecords.find(r => r.id === selectedRecord.id);
            
            if (recordToUpdate) {
                recordToUpdate.lastUpdatedDate = new Date().toLocaleString();
                recordToUpdate.updatedBy = "Field Worker";
                recordToUpdate.isUpdated = true;
                recordToUpdate.status = -1;  // Mark as pending - needs sync to CropManage
                
                autoSaveIrrigationData(); // Auto-save
                
                return {
                    success: true,
                    message: 'Record updated successfully',
                    record: recordToUpdate,
                    records: displayRecords
                };
            }
            
            return {
                success: false,
                message: 'Record not found'
            };
        }

        // Helper function for record selection
        function selectRecord(id) {
            selectedRecord = displayRecords.find(r => r.id === id);
            return selectedRecord;
        }

// @@@@ DASHBOARD_COMPONENT id:dashboard-crud @@@@

// ========================================
// MCP SERVER SETUP
// ========================================

const server = new Server(
    {
        name: 'cropclient-dashboard',
        version: '1.0.0',
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// Tool Definitions
const tools = [
    {
        name: 'create_next_irrigation',
        description: 'Creates the next scheduled irrigation event based on the most recent irrigation record. Calculates new date using the interval from the last record and sets recommended hours as manager hours.',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'reset_table',
        description: 'Resets the irrigation data table back to original state. Handles both JSON default data and API-sourced data (Grid 4). When data source is API, reloads from cached API detail data. When data source is JSON, reloads from original default data.',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'read_meter',
        description: 'Prepares form to capture actual meter reading for the most recent irrigation event. Finds the last irrigation record for the selected ranch/planting, selects it, and focuses the Water Applied field for data entry. Used by field workers to record real-world water usage.',
        inputSchema: {
            type: 'object',
            properties: {},
            required: []
        }
    },
    {
        name: 'update_record',
        description: 'Updates the currently selected irrigation record with values from the form fields (date, interval, manager hours, water applied). Marks record status as pending (-1) for sync to CropManage. Changes are saved to working memory.',
        inputSchema: {
            type: 'object',
            properties: {
                mgrHours: {
                    type: 'number',
                    description: "Manager's recommended irrigation hours",
                    minimum: 0
                },
                appliedHours: {
                    type: 'number',
                    description: 'Actual water applied in hours',
                    minimum: 0
                }
            },
            required: []
        }
    }
];

// List Tools Handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools };
});

// Call Tool Handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    
    try {
        let result;
        
        switch (name) {
            case 'create_next_irrigation':
                result = testCreateNext();
                break;
            case 'reset_table':
                result = resetTable();
                break;
            case 'read_meter':
                result = testReadMeter();
                break;
            case 'update_record':
                result = updateRecord(args || {});
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
                        error: error.message
                    }, null, 2)
                }
            ],
            isError: true
        };
    }
});

// ========================================
// HTTP BRIDGE (Express + CORS)
// ========================================

const app = express();
const PORT = 3100;

app.use(cors());
app.use(express.json());

// Health check
app.get('/ping', (req, res) => {
    res.json({ 
        status: 'alive',
        server: 'CropClient Dashboard MCP',
        timestamp: new Date().toISOString(),
        tools: tools.length
    });
});

// List tools
app.get('/tools', (req, res) => {
    const toolList = tools.map(t => ({
        name: t.name,
        description: t.description
    }));
    res.json({ tools: toolList });
});

// NEW ENDPOINT - MCP Router Execute
app.post('/mcp/execute', async (req, res) => {
    const { promptText } = req.body;
    
    if (!promptText) {
        return res.status(400).json({
            success: false,
            error: 'No prompt provided'
        });
    }
    
    try {
        const result = await routeCommand(promptText);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// FILE OPERATIONS ENDPOINTS
app.post('/save-json', (req, res) => {
    const { filename, data } = req.body;
    
    if (!filename || !data) {
        return res.status(400).json({
            success: false,
            error: 'Filename and data required'
        });
    }
    
    try {
        const result = writeJSON(filename, data);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/read-json/:filename', (req, res) => {
    const { filename } = req.params;
    
    try {
        const data = readJSON(filename);
        if (data === null) {
            return res.status(404).json({
                success: false,
                error: 'File not found'
            });
        }
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/update-json', (req, res) => {
    const { filename, updates } = req.body;
    
    if (!filename || !updates) {
        return res.status(400).json({
            success: false,
            error: 'Filename and updates required'
        });
    }
    
    try {
        const result = updateJSON(filename, updates);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.delete('/delete-json/:filename', (req, res) => {
    const { filename } = req.params;
    
    try {
        const result = deleteJSON(filename);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/list-json', (req, res) => {
    const { directory } = req.query;
    
    try {
        const files = listJSONFiles(directory || '.');
        res.json({ success: true, files });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/file-exists/:filename', (req, res) => {
    const { filename } = req.params;
    
    try {
        const exists = fileExists(filename);
        res.json({ success: true, exists });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Call a tool
app.post('/tools/:toolName', async (req, res) => {
    const { toolName } = req.params;
    const args = req.body;
    
    try {
        let result;
        
        switch (toolName) {
            case 'create_next_irrigation':
                result = testCreateNext();
                break;
            case 'reset_table':
                result = resetTable();
                break;
            case 'read_meter':
                result = testReadMeter();
                break;
            case 'update_record':
                result = updateRecord(args);
                break;
            default:
                return res.status(404).json({
                    success: false,
                    error: `Tool not found: ${toolName}`
                });
        }
        
        res.json(result);
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Select record endpoint (for UI)
app.post('/select-record', (req, res) => {
    const { id } = req.body;
    const record = selectRecord(id);
    
    if (record) {
        res.json({ success: true, record });
    } else {
        res.status(404).json({ success: false, error: 'Record not found' });
    }
});

// Get all records (for UI)
app.get('/records', (req, res) => {
    res.json({ 
        success: true, 
        records: displayRecords,
        count: displayRecords.length,
        dataSource: dataSource
    });
});

// Start HTTP server
app.listen(PORT, () => {
    console.log(`✅ Dashboard MCP Server running on http://localhost:${PORT}`);
    console.log(`📋 Tools available: ${tools.length}`);
    tools.forEach(t => {
        console.log(`   - ${t.name}`);
    });
});

// ========================================
// START MCP STDIO SERVER
// ========================================

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Dashboard MCP Server started - stdio ready');
}

main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});
