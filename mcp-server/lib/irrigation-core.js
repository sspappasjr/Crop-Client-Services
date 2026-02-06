/**
 * Core Irrigation Business Logic
 * All reusable operations extracted from working Test Model
 */

const fs = require('fs').promises;
const path = require('path');
const { parseEventDate, formatDate, addDaysToDate } = require('./date-utils');

// In-memory data store
let irrigationRecords = [];
let originalData = null;

/**
 * Initialize the irrigation data system
 * @param {string} dataPath - Path to irrigation.json file
 */
async function initialize(dataPath) {
  try {
    const fullPath = path.resolve(dataPath);
    const fileData = await fs.readFile(fullPath, 'utf8');
    originalData = JSON.parse(fileData);
    
    // Transform to working format
    irrigationRecords = transformToWorkingFormat(originalData);
    
    return {
      success: true,
      recordCount: irrigationRecords.length,
      message: 'Irrigation data initialized successfully'
    };
  } catch (error) {
    throw new Error(`Failed to initialize: ${error.message}`);
  }
}

/**
 * Transform raw JSON data to working record format
 * @param {Array} rawData - Raw irrigation data from JSON
 * @returns {Array} Transformed records
 */
function transformToWorkingFormat(rawData) {
  return rawData.map((record, index) => ({
    id: `original_${index}`,
    ranch: record.Ranch,
    planting: record.Planting,
    scheduledDate: formatDate(parseEventDate(record.Eventdate)),
    hours: parseFloat(record.RecommendedHours) || 0,
    mgrHours: parseFloat(record.ManagerAmount) || 0,
    appliedHours: parseFloat(record.WaterApplied) || 0,
    interval: parseFloat(record.RecommendedInterval) || 0,
    irrigationMethod: record.IrrigationMethod,
    recommendedInches: record.RecommendedInches,
    lastUpdatedDate: record.LastUpdatedDate,
    updatedBy: record.UpdatedBy,
    isOriginal: true,
    isNew: false,
    isUpdated: false
  }));
}

/**
 * LEGO BLOCK 1: Find-Sort-GetLast Pattern
 * Used by Create Next, Read Meter, and many other operations
 */
async function findLatestRecord(filters) {
  const { ranch, planting } = filters;
  
  // 1. Find all records for this field
  const matchingRecords = irrigationRecords.filter(r => {
    const ranchMatch = !ranch || r.ranch.includes(ranch);
    const plantingMatch = !planting || r.planting === planting;
    return ranchMatch && plantingMatch;
  });
  
  if (matchingRecords.length === 0) {
    throw new Error(`No records found for ranch: ${ranch}, planting: ${planting}`);
  }
  
  // 2. Sort by date (oldest first)
  matchingRecords.sort((a, b) => {
    const dateA = parseEventDate(a.scheduledDate);
    const dateB = parseEventDate(b.scheduledDate);
    return dateA - dateB;
  });
  
  // 3. Return most recent (last)
  return matchingRecords[matchingRecords.length - 1];
}

/**
 * LEGO BLOCK 2: Create Next Irrigation Pattern
 * Creates the next irrigation record based on interval
 */
async function createNextIrrigation(filters) {
  const { ranch, planting } = filters;
  
  // Get latest record
  const lastRecord = await findLatestRecord({ ranch, planting });
  
  // Calculate next date
  const currentDate = parseEventDate(lastRecord.scheduledDate);
  const intervalDays = Math.round(parseFloat(lastRecord.interval) || 1);
  const nextDate = addDaysToDate(currentDate, intervalDays);
  const nextDateStr = formatDate(nextDate);
  
  // Calculate new hours (small random adjustment for variation)
  const tinyAdjust = (Math.random() * 0.2 + 0.1);
  const newRecHours = Math.max(0.1, parseFloat((lastRecord.hours + tinyAdjust).toFixed(1)));
  const newMgrHours = parseFloat((lastRecord.mgrHours + 0.1).toFixed(1));
  
  // Create new record
  const newRecord = {
    id: `created_${Date.now()}`,
    ranch: lastRecord.ranch,
    planting: lastRecord.planting,
    scheduledDate: nextDateStr,
    hours: newRecHours,
    mgrHours: newMgrHours,
    appliedHours: 0,
    interval: lastRecord.interval,
    irrigationMethod: lastRecord.irrigationMethod,
    recommendedInches: lastRecord.recommendedInches,
    lastUpdatedDate: new Date().toLocaleString(),
    updatedBy: "MCP System",
    isOriginal: false,
    isNew: true,
    isUpdated: false
  };
  
  // Add to records
  irrigationRecords.push(newRecord);
  
  return {
    success: true,
    oldRecord: {
      ranch: lastRecord.ranch,
      planting: lastRecord.planting,
      date: lastRecord.scheduledDate,
      interval: lastRecord.interval
    },
    newRecord: {
      id: newRecord.id,
      ranch: newRecord.ranch,
      planting: newRecord.planting,
      date: newRecord.scheduledDate,
      hours: newRecord.hours,
      mgrHours: newRecord.mgrHours
    },
    message: `Created next irrigation for ${newRecord.ranch} ${newRecord.planting} on ${nextDateStr}`
  };
}

/**
 * LEGO BLOCK 3: Prepare Meter Reading Pattern
 * Sets up a record for field worker to enter water meter reading
 */
async function prepareMeterReading(filters) {
  const { ranch, planting } = filters;
  
  // Get latest record
  const record = await findLatestRecord({ ranch, planting });
  
  return {
    success: true,
    record: record,
    formData: {
      date: record.scheduledDate,
      interval: `${record.interval} days`,
      recommendation: record.hours.toFixed(1),
      managerHours: record.mgrHours,
      waterApplied: '', // EMPTY for field entry
      message: 'Read water meter and enter gallons. Meter located at northwest corner.'
    },
    focusField: 'waterApplied',
    instructions: [
      'Locate water meter at northwest corner of field',
      'Record current meter reading',
      'Enter the water applied value',
      'Click Update to save'
    ]
  };
}

/**
 * LEGO BLOCK 4: Sort and Read Pattern
 * Sorts all records by Ranch → Planting → Date
 */
async function sortAndReadRecords(preserveSelectionId = null) {
  // Sort by Ranch → Planting → Date (oldest first)
  const sorted = [...irrigationRecords].sort((a, b) => {
    // First by ranch
    if (a.ranch < b.ranch) return -1;
    if (a.ranch > b.ranch) return 1;
    
    // Then by planting
    if (a.planting < b.planting) return -1;
    if (a.planting > b.planting) return 1;
    
    // Finally by date (ascending - oldest first)
    const dateA = parseEventDate(a.scheduledDate);
    const dateB = parseEventDate(b.scheduledDate);
    return dateA - dateB;
  });
  
  // Calculate statistics
  const stats = {
    total: sorted.length,
    original: sorted.filter(r => r.isOriginal).length,
    created: sorted.filter(r => r.isNew).length,
    updated: sorted.filter(r => r.isUpdated).length,
    byRanch: {}
  };
  
  // Group by ranch
  sorted.forEach(record => {
    if (!stats.byRanch[record.ranch]) {
      stats.byRanch[record.ranch] = 0;
    }
    stats.byRanch[record.ranch]++;
  });
  
  return {
    success: true,
    records: sorted,
    stats: stats,
    preserveSelection: preserveSelectionId,
    message: `Sorted ${sorted.length} records by Ranch → Planting → Date`
  };
}

/**
 * LEGO BLOCK 5: Reset to Original Pattern
 * Restores data to original irrigation.json state
 */
async function resetToOriginal() {
  if (!originalData) {
    throw new Error('No original data loaded. Call initialize() first.');
  }
  
  // Transform original data again
  irrigationRecords = transformToWorkingFormat(originalData);
  
  return {
    success: true,
    recordCount: irrigationRecords.length,
    message: 'Reset to original irrigation.json data. All created/updated records removed.'
  };
}

/**
 * Get all records (with optional filtering)
 */
async function getAllRecords(filters = {}) {
  let results = [...irrigationRecords];
  
  // Apply filters
  if (filters.ranch) {
    results = results.filter(r => r.ranch.includes(filters.ranch));
  }
  
  if (filters.planting) {
    results = results.filter(r => r.planting === filters.planting);
  }
  
  if (filters.date) {
    results = results.filter(r => r.scheduledDate === filters.date);
  }
  
  if (filters.isOriginal !== undefined) {
    results = results.filter(r => r.isOriginal === filters.isOriginal);
  }
  
  return {
    success: true,
    records: results,
    count: results.length
  };
}

/**
 * Get a single record by ID
 */
async function getRecordById(recordId) {
  const record = irrigationRecords.find(r => r.id === recordId);
  
  if (!record) {
    throw new Error(`Record not found: ${recordId}`);
  }
  
  return {
    success: true,
    record: record
  };
}

/**
 * Update a record
 */
async function updateRecord(recordId, updates) {
  const record = irrigationRecords.find(r => r.id === recordId);
  
  if (!record) {
    throw new Error(`Record not found: ${recordId}`);
  }
  
  // Apply updates
  if (updates.mgrHours !== undefined) {
    record.mgrHours = parseFloat(updates.mgrHours);
  }
  
  if (updates.appliedHours !== undefined) {
    record.appliedHours = parseFloat(updates.appliedHours);
  }
  
  if (updates.message !== undefined) {
    record.message = updates.message;
  }
  
  // Mark as updated
  record.isUpdated = true;
  record.lastUpdatedDate = new Date().toLocaleString();
  record.updatedBy = updates.updatedBy || "MCP System";
  
  return {
    success: true,
    record: record,
    message: `Updated record ${recordId}`
  };
}

/**
 * Delete a record (only created records, not originals)
 */
async function deleteRecord(recordId) {
  const index = irrigationRecords.findIndex(r => r.id === recordId);
  
  if (index === -1) {
    throw new Error(`Record not found: ${recordId}`);
  }
  
  const record = irrigationRecords[index];
  
  if (record.isOriginal) {
    throw new Error('Cannot delete original records. Use reset to restore original data.');
  }
  
  // Remove from array
  irrigationRecords.splice(index, 1);
  
  return {
    success: true,
    deletedId: recordId,
    message: `Deleted record ${recordId}`
  };
}

/**
 * Get statistics about current data
 */
async function getStatistics() {
  const stats = {
    total: irrigationRecords.length,
    original: irrigationRecords.filter(r => r.isOriginal).length,
    created: irrigationRecords.filter(r => r.isNew).length,
    updated: irrigationRecords.filter(r => r.isUpdated).length,
    totalWater: irrigationRecords.reduce((sum, r) => sum + r.hours, 0).toFixed(1),
    byRanch: {},
    byPlanting: {}
  };
  
  // Group by ranch
  irrigationRecords.forEach(record => {
    if (!stats.byRanch[record.ranch]) {
      stats.byRanch[record.ranch] = 0;
    }
    stats.byRanch[record.ranch]++;
    
    if (!stats.byPlanting[record.planting]) {
      stats.byPlanting[record.planting] = 0;
    }
    stats.byPlanting[record.planting]++;
  });
  
  return {
    success: true,
    stats: stats
  };
}

module.exports = {
  initialize,
  findLatestRecord,
  createNextIrrigation,
  prepareMeterReading,
  sortAndReadRecords,
  resetToOriginal,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getStatistics
};
