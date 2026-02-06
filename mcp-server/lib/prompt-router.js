/**
 * Natural Language Prompt Router
 * Parses prompts and routes to correct irrigation operations
 */

const irrigationCore = require('./irrigation-core');

// Intent patterns for action recognition
const intentPatterns = {
  // Read operations
  read: /^(read|show|get|display|list|find|view)/i,
  
  // Create operations
  create: /^(create|add|new|make|schedule)/i,
  
  // Update operations
  update: /^(update|edit|modify|change|save|set)/i,
  
  // Delete operations
  delete: /^(delete|remove|clear)/i,
  
  // Reset operation
  reset: /^(reset|restore|reload)/i,
  
  // Smart operations
  create_next: /create next|schedule next|add next/i,
  read_meter: /read meter|meter reading|check meter|prepare meter/i,
  sort: /sort|organize|order/i,
  stats: /statistics|stats|summary|report/i
};

// Entity extraction patterns
const entityPatterns = {
  ranch: /ranch\s+(\d+)/i,
  ranchFull: /(MobileFrame Ranch \d+|Ranch \d+)/i,
  planting: /planting\s+(\w+)/i,
  date: /(\d{1,2}\/\d{1,2}\/\d{2})/,
  recordId: /record[_\s]?([a-z0-9_]+)/i,
  value: /(\d+\.?\d*)\s*(hours?|gallons?|gal)/i
};

/**
 * Parse intent from natural language prompt
 * @param {string} prompt - Natural language prompt
 * @returns {string} Intent action
 */
function parseIntent(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    return 'unknown';
  }
  
  const lowerPrompt = prompt.toLowerCase().trim();
  
  // Check each pattern
  for (const [action, pattern] of Object.entries(intentPatterns)) {
    if (pattern.test(lowerPrompt)) {
      return action;
    }
  }
  
  return 'unknown';
}

/**
 * Extract entities (ranch, planting, dates, etc.) from prompt
 * @param {string} prompt - Natural language prompt
 * @returns {Object} Extracted entities
 */
function extractEntities(prompt) {
  const entities = {};
  
  // Extract ranch
  const ranchMatch = prompt.match(entityPatterns.ranch);
  if (ranchMatch) {
    entities.ranch = `Ranch ${ranchMatch[1]}`;
  } else {
    const ranchFullMatch = prompt.match(entityPatterns.ranchFull);
    if (ranchFullMatch) {
      entities.ranch = ranchFullMatch[1];
    }
  }
  
  // Extract planting
  const plantingMatch = prompt.match(entityPatterns.planting);
  if (plantingMatch) {
    entities.planting = `Planting ${plantingMatch[1].toUpperCase()}`;
  }
  
  // Extract date
  const dateMatch = prompt.match(entityPatterns.date);
  if (dateMatch) {
    entities.date = dateMatch[1];
  }
  
  // Extract record ID
  const recordIdMatch = prompt.match(entityPatterns.recordId);
  if (recordIdMatch) {
    entities.recordId = recordIdMatch[1];
  }
  
  // Extract numeric value
  const valueMatch = prompt.match(entityPatterns.value);
  if (valueMatch) {
    entities.value = parseFloat(valueMatch[1]);
  }
  
  return entities;
}

/**
 * Main router - routes natural language prompts to operations
 * @param {string} prompt - Natural language prompt
 * @param {Object} context - Additional context (overrides extracted entities)
 * @returns {Promise<Object>} Operation result
 */
async function routePrompt(prompt, context = {}) {
  try {
    // Parse intent
    const intent = parseIntent(prompt);
    
    // Extract entities from prompt
    const entities = extractEntities(prompt);
    
    // Merge with provided context (context takes precedence)
    const fullContext = { ...entities, ...context };
    
    // Route to appropriate handler
    switch (intent) {
      case 'create_next':
        return await handleCreateNext(fullContext);
      
      case 'read_meter':
        return await handleReadMeter(fullContext);
      
      case 'sort':
        return await handleSort(fullContext);
      
      case 'reset':
        return await handleReset();
      
      case 'stats':
        return await handleStats();
      
      case 'read':
        return await handleRead(fullContext);
      
      case 'update':
        return await handleUpdate(fullContext);
      
      case 'delete':
        return await handleDelete(fullContext);
      
      case 'create':
        // For now, create defaults to create_next
        return await handleCreateNext(fullContext);
      
      default:
        return {
          success: false,
          error: `Unknown intent: ${intent}`,
          prompt: prompt,
          suggestion: 'Try: "read irrigation table", "create next for ranch 1 planting 1A", "read meter for ranch 1 planting 1A"'
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      prompt: prompt
    };
  }
}

/**
 * Handler: Create Next Irrigation
 */
async function handleCreateNext(context) {
  if (!context.ranch || !context.planting) {
    throw new Error('Ranch and planting required for create next. Example: "create next for ranch 1 planting 1A"');
  }
  
  const result = await irrigationCore.createNextIrrigation({
    ranch: context.ranch,
    planting: context.planting
  });
  
  return {
    ...result,
    operation: 'create_next',
    context: context
  };
}

/**
 * Handler: Read Meter / Prepare Meter Reading
 */
async function handleReadMeter(context) {
  if (!context.ranch || !context.planting) {
    throw new Error('Ranch and planting required for meter reading. Example: "read meter for ranch 1 planting 1A"');
  }
  
  const result = await irrigationCore.prepareMeterReading({
    ranch: context.ranch,
    planting: context.planting
  });
  
  return {
    ...result,
    operation: 'read_meter',
    context: context
  };
}

/**
 * Handler: Sort Records
 */
async function handleSort(context) {
  const result = await irrigationCore.sortAndReadRecords(context.preserveSelection);
  
  return {
    ...result,
    operation: 'sort',
    context: context
  };
}

/**
 * Handler: Reset to Original
 */
async function handleReset() {
  const result = await irrigationCore.resetToOriginal();
  
  return {
    ...result,
    operation: 'reset'
  };
}

/**
 * Handler: Get Statistics
 */
async function handleStats() {
  const result = await irrigationCore.getStatistics();
  
  return {
    ...result,
    operation: 'stats'
  };
}

/**
 * Handler: Read Records
 */
async function handleRead(context) {
  const filters = {};
  
  if (context.ranch) filters.ranch = context.ranch;
  if (context.planting) filters.planting = context.planting;
  if (context.date) filters.date = context.date;
  if (context.isOriginal !== undefined) filters.isOriginal = context.isOriginal;
  
  const result = await irrigationCore.getAllRecords(filters);
  
  return {
    ...result,
    operation: 'read',
    context: context,
    filters: filters
  };
}

/**
 * Handler: Update Record
 */
async function handleUpdate(context) {
  if (!context.recordId) {
    throw new Error('Record ID required for update. Example: "update record original_0 with 95 gallons"');
  }
  
  const updates = {};
  
  if (context.value !== undefined) {
    // Assume value is for appliedHours (water applied)
    updates.appliedHours = context.value;
  }
  
  if (context.mgrHours !== undefined) {
    updates.mgrHours = context.mgrHours;
  }
  
  if (context.message !== undefined) {
    updates.message = context.message;
  }
  
  const result = await irrigationCore.updateRecord(context.recordId, updates);
  
  return {
    ...result,
    operation: 'update',
    context: context
  };
}

/**
 * Handler: Delete Record
 */
async function handleDelete(context) {
  if (!context.recordId) {
    throw new Error('Record ID required for delete. Example: "delete record created_123456"');
  }
  
  const result = await irrigationCore.deleteRecord(context.recordId);
  
  return {
    ...result,
    operation: 'delete',
    context: context
  };
}

/**
 * Validate prompt before routing
 * @param {string} prompt - Prompt to validate
 * @returns {Object} Validation result
 */
function validatePrompt(prompt) {
  const errors = [];
  
  if (!prompt || typeof prompt !== 'string') {
    errors.push('Prompt must be a non-empty string');
  }
  
  if (prompt && prompt.length > 500) {
    errors.push('Prompt too long (max 500 characters)');
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.\.[\/\\]/,  // Path traversal
    /DROP\s+TABLE/i,  // SQL injection
    /<script>/i,  // XSS
    /eval\(/i  // Code injection
  ];
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(prompt)) {
      errors.push('Suspicious pattern detected in prompt');
      break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Get suggestions for common prompts
 * @returns {Array} Array of example prompts
 */
function getPromptSuggestions() {
  return [
    {
      category: 'Read Operations',
      prompts: [
        'read irrigation table',
        'show all ranch 1 records',
        'display planting 1A schedule',
        'get records for ranch 2 planting 2B',
        'list all original records'
      ]
    },
    {
      category: 'Smart Operations',
      prompts: [
        'create next irrigation for ranch 1 planting 1A',
        'read meter for ranch 1 planting 1A',
        'sort records',
        'show statistics'
      ]
    },
    {
      category: 'Updates',
      prompts: [
        'update record original_0 with 95 gallons',
        'reset to original data'
      ]
    }
  ];
}

module.exports = {
  routePrompt,
  parseIntent,
  extractEntities,
  validatePrompt,
  getPromptSuggestions
};
