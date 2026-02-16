/**
 * Dashboard Component - CropClient Irrigation Tools
 * Purpose: Portable irrigation dashboard with MCP CRUD tools
 * Works with JSON default data (offline) or API-sourced data
 * Self-contained - no external dependencies
 * 
 * @id dashboard-crud
 * @version 1.0
 */

// Component Metadata
const COMPONENT_ID = "dashboard-crud";
const COMPONENT_VERSION = "1.0";

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
let displayRecords = JSON.parse(JSON.stringify(irrigationData));
let selectedRecord = null;
let dataSource = 'json'; // 'json' = default data, 'api' = from CropManage API
let apiDetailData = []; // Stores Grid 4 cache for reset when dataSource='api'

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
// FUNCTIONS - CRUD Operations
// ========================================

function resetTable() {
    if (dataSource === 'api') {
        // Data came from API - reload from stored Grid 4 (api detail) data
        if (apiDetailData.length > 0) {
            displayRecords = JSON.parse(JSON.stringify(apiDetailData));
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
        
        return {
            success: true,
            message: 'Table Reset Complete',
            count: displayRecords.length
        };
    }
}

function testCreateNext() {
    if (displayRecords.length === 0) {
        return {
            success: false,
            message: 'No irrigation records available'
        };
    }
    
    // Sort records to find the most recent
    const sortedRecords = [...displayRecords].sort((a, b) => {
        const dateA = parseEventDate(a.scheduledDate);
        const dateB = parseEventDate(b.scheduledDate);
        return dateB - dateA; // Most recent first
    });
    
    const lastRecord = sortedRecords[0];
    
    // Parse interval (e.g., "1.5 days" → 1.5)
    const intervalDays = parseFloat(lastRecord.interval);
    
    // Calculate next date
    const lastDate = parseEventDate(lastRecord.scheduledDate);
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + intervalDays);
    
    // Create new record
    const newId = Math.max(...displayRecords.map(r => r.id)) + 1;
    const newRecord = {
        id: newId,
        ranch: lastRecord.ranch,
        planting: lastRecord.planting,
        hours: lastRecord.hours,
        mgrHours: lastRecord.mgrHours, // Recommended hours become manager hours
        appliedHours: 0,
        interval: lastRecord.interval,
        scheduledDate: formatDate(nextDate),
        irrigationMethod: lastRecord.irrigationMethod,
        recommendedInches: lastRecord.recommendedInches,
        lastUpdatedDate: new Date().toLocaleString(),
        updatedBy: "MCP Tool",
        isNew: true,
        isOriginal: false,
        isUpdated: false,
        status: -1 // Pending - needs to be posted to CropManage
    };
    
    displayRecords.push(newRecord);
    selectedRecord = newRecord;
    
    return {
        success: true,
        message: 'Next irrigation created',
        record: newRecord
    };
}

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
    
    // Sort by date to find most recent
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

function updateRecord(args = {}) {
    if (!selectedRecord) {
        return {
            success: false,
            message: 'No record selected. Please select a record first.'
        };
    }
    
    // Get values from args (MCP call) or use existing values
    const newManagerHours = args.mgrHours !== undefined ? parseFloat(args.mgrHours) : selectedRecord.mgrHours;
    const newWaterApplied = args.appliedHours !== undefined ? parseFloat(args.appliedHours) : selectedRecord.appliedHours;
    
    if (isNaN(newManagerHours) || isNaN(newWaterApplied)) {
        return {
            success: false,
            message: 'Invalid values for Manager Hours or Water Applied'
        };
    }
    
    // Find and update the record
    const recordToUpdate = displayRecords.find(r => r.id === selectedRecord.id);
    
    if (recordToUpdate) {
        recordToUpdate.mgrHours = newManagerHours;
        recordToUpdate.appliedHours = newWaterApplied;
        recordToUpdate.lastUpdatedDate = new Date().toLocaleString();
        recordToUpdate.updatedBy = "MCP Tool";
        recordToUpdate.isUpdated = true;
        recordToUpdate.status = -1;  // Mark as pending - needs sync to CropManage
        
        selectedRecord = recordToUpdate;
        
        return {
            success: true,
            message: 'Record Updated Successfully',
            record: {
                ranch: recordToUpdate.ranch,
                planting: recordToUpdate.planting,
                scheduledDate: recordToUpdate.scheduledDate,
                mgrHours: newManagerHours,
                appliedHours: newWaterApplied
            }
        };
    }
    
    return {
        success: false,
        message: 'Record not found'
    };
}

// ========================================
// MCP TOOLS REGISTRY - Export for Server
// ========================================

const dashboardTools = [
    {
        name: "create_next_irrigation",
        description: "Creates the next scheduled irrigation event based on the most recent irrigation record. Calculates new date using the interval from the last record and sets recommended hours as manager hours.",
        inputSchema: {
            type: "object",
            properties: {},
            required: []
        },
        handler: async (args) => {
            return testCreateNext();
        }
    },
    {
        name: "reset_table",
        description: "Resets the irrigation data table back to original state. Handles both JSON default data and API-sourced data (Grid 4). When data source is API, reloads from cached API detail data. When data source is JSON, reloads from original default data.",
        inputSchema: {
            type: "object",
            properties: {},
            required: []
        },
        handler: async (args) => {
            return resetTable();
        }
    },
    {
        name: "read_meter",
        description: "Prepares form to capture actual meter reading for the most recent irrigation event. Finds the last irrigation record for the selected ranch/planting, selects it, and focuses the Water Applied field for data entry. Used by field workers to record real-world water usage.",
        inputSchema: {
            type: "object",
            properties: {},
            required: []
        },
        handler: async (args) => {
            return testReadMeter();
        }
    },
    {
        name: "update_record",
        description: "Updates the currently selected irrigation record with values from the form fields (date, interval, manager hours, water applied). Marks record status as pending (-1) for sync to CropManage. Changes are saved to working memory.",
        inputSchema: {
            type: "object",
            properties: {
                mgrHours: {
                    type: "number",
                    description: "Manager's recommended irrigation hours",
                    minimum: 0
                },
                appliedHours: {
                    type: "number",
                    description: "Actual water applied in hours",
                    minimum: 0
                }
            },
            required: []
        },
        handler: async (args) => {
            return updateRecord(args);
        }
    }
];

// ========================================
// MODULE EXPORTS
// ========================================

module.exports = {
    tools: dashboardTools,
    // Export data accessors for testing/debugging
    getData: () => ({ irrigationData, displayRecords, selectedRecord }),
    selectRecord: (id) => {
        selectedRecord = displayRecords.find(r => r.id === id);
        return selectedRecord;
    }
};
