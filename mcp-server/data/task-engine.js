#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Portable data directory
const DATA_DIR = path.join(__dirname, 'data');

// ============================================
// TASK ENGINE - Automates Prompt Execution
// ============================================

class TaskEngine {
  constructor() {
    this.tasks = [];
    this.prompts = [];
    this.mcpServer = null;
    this.logFile = path.join(DATA_DIR, 'task-logs.json');
  }

  // ============================================
  // LOAD DATA
  // ============================================

  async loadTasks() {
    try {
      const tasksPath = path.join(DATA_DIR, 'tasks.json');
      const content = await fs.readFile(tasksPath, 'utf8');
      const data = JSON.parse(content);
      this.tasks = data.tasks || data;
      console.log(`✅ Loaded ${this.tasks.length} tasks`);
      return this.tasks;
    } catch (error) {
      console.error('❌ Failed to load tasks.json:', error.message);
      this.tasks = [];
      return [];
    }
  }

  async loadPrompts() {
    try {
      const promptsPath = path.join(DATA_DIR, 'prompts.json');
      const content = await fs.readFile(promptsPath, 'utf8');
      const data = JSON.parse(content);
      this.prompts = data.prompts || data;
      console.log(`✅ Loaded ${this.prompts.length} prompts`);
      return this.prompts;
    } catch (error) {
      console.error('❌ Failed to load prompts.json:', error.message);
      this.prompts = [];
      return [];
    }
  }

  // ============================================
  // PROMPT EXECUTION
  // ============================================

  async executePrompt(promptText) {
    console.log(`   🔄 Executing: "${promptText}"`);
    
    try {
      // TODO: In production, this would call MCP server
      // For now, we'll simulate execution
      
      // Simulate MCP server processing
      await this.sleep(100);
      
      const result = {
        success: true,
        prompt: promptText,
        timestamp: new Date().toISOString(),
        message: `Prompt executed successfully`
      };
      
      console.log(`   ✅ Success: ${promptText}`);
      return result;
      
    } catch (error) {
      console.error(`   ❌ Failed: ${promptText}`, error.message);
      return {
        success: false,
        prompt: promptText,
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  // ============================================
  // TASK EXECUTION
  // ============================================

  async executeTask(task) {
    console.log(`\n📋 Executing Task: ${task.name || task.id}`);
    console.log(`   ID: ${task.id}`);
    
    if (!task.enabled && task.enabled !== undefined) {
      console.log(`   ⏭️  Skipped (disabled)`);
      return {
        taskId: task.id,
        status: 'skipped',
        reason: 'Task is disabled'
      };
    }

    const results = [];
    
    // Execute prompts in sequence
    if (task.prompts && Array.isArray(task.prompts)) {
      for (const promptText of task.prompts) {
        const result = await this.executePrompt(promptText);
        results.push(result);
        
        // Stop on first failure if configured
        if (!result.success && task.stopOnError) {
          console.log(`   ⚠️  Stopping task due to error`);
          break;
        }
      }
    }
    
    // Execute prompt IDs (references to prompts.json)
    if (task.promptIds && Array.isArray(task.promptIds)) {
      for (const promptId of task.promptIds) {
        const prompt = this.prompts.find(p => p.id === promptId);
        if (prompt) {
          const result = await this.executePrompt(prompt.prompt);
          results.push(result);
          
          if (!result.success && task.stopOnError) {
            console.log(`   ⚠️  Stopping task due to error`);
            break;
          }
        } else {
          console.log(`   ⚠️  Prompt ID not found: ${promptId}`);
          results.push({
            success: false,
            promptId: promptId,
            error: 'Prompt not found in library'
          });
        }
      }
    }

    const taskResult = {
      taskId: task.id,
      taskName: task.name,
      status: results.every(r => r.success) ? 'success' : 'partial',
      executedAt: new Date().toISOString(),
      promptCount: results.length,
      successCount: results.filter(r => r.success).length,
      results: results
    };

    console.log(`   ✅ Task Complete: ${taskResult.successCount}/${taskResult.promptCount} prompts succeeded`);
    
    return taskResult;
  }

  // ============================================
  // BATCH EXECUTION
  // ============================================

  async executeAllTasks() {
    console.log('\n🚀 Starting Task Engine Batch Run\n');
    console.log('='.repeat(50));
    
    await this.loadTasks();
    await this.loadPrompts();
    
    if (this.tasks.length === 0) {
      console.log('\n⚠️  No tasks found to execute');
      return [];
    }

    const results = [];
    
    for (const task of this.tasks) {
      const result = await this.executeTask(task);
      results.push(result);
      await this.logResult(result);
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n✅ Batch Complete: ${results.length} tasks executed`);
    
    this.printSummary(results);
    
    return results;
  }

  async executeTaskById(taskId) {
    console.log(`\n🎯 Executing Single Task: ${taskId}\n`);
    console.log('='.repeat(50));
    
    await this.loadTasks();
    await this.loadPrompts();
    
    const task = this.tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error(`\n❌ Task not found: ${taskId}`);
      return null;
    }

    const result = await this.executeTask(task);
    await this.logResult(result);
    
    console.log('\n' + '='.repeat(50));
    console.log(`\n✅ Task Complete`);
    
    return result;
  }

  // ============================================
  // SCHEDULING
  // ============================================

  async startScheduler() {
    console.log('\n⏰ Task Scheduler Started\n');
    console.log('Checking for scheduled tasks every minute...');
    console.log('Press Ctrl+C to stop\n');
    
    await this.loadTasks();
    await this.loadPrompts();
    
    // Check every minute
    setInterval(async () => {
      await this.checkScheduledTasks();
    }, 60000); // 60 seconds
    
    // Also check immediately
    await this.checkScheduledTasks();
  }

  async checkScheduledTasks() {
    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5); // HH:MM
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    console.log(`⏰ Checking scheduled tasks at ${currentTime}...`);
    
    for (const task of this.tasks) {
      if (!task.schedule || !task.enabled) continue;
      
      const shouldRun = this.shouldTaskRun(task.schedule, currentTime, currentDay);
      
      if (shouldRun) {
        console.log(`\n🔔 Triggering scheduled task: ${task.name}`);
        const result = await this.executeTask(task);
        await this.logResult(result);
      }
    }
  }

  shouldTaskRun(schedule, currentTime, currentDay) {
    // Parse schedule formats:
    // "daily 7am" - every day at 7am
    // "monday 6am" - every Monday at 6am
    // "hourly" - every hour
    // "15:30" - specific time daily
    
    const parts = schedule.toLowerCase().split(' ');
    
    if (schedule === 'hourly') {
      // Run if minutes are :00
      return currentTime.endsWith(':00');
    }
    
    if (parts.length === 1) {
      // Just a time, run daily
      const scheduleTime = this.parseTime(parts[0]);
      return currentTime === scheduleTime;
    }
    
    if (parts.length === 2) {
      const [dayOrFreq, time] = parts;
      const scheduleTime = this.parseTime(time);
      
      if (dayOrFreq === 'daily') {
        return currentTime === scheduleTime;
      }
      
      // Check if it's a day of week
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      if (daysOfWeek.includes(dayOrFreq)) {
        return currentDay === dayOrFreq && currentTime === scheduleTime;
      }
    }
    
    return false;
  }

  parseTime(timeStr) {
    // Convert various time formats to HH:MM
    // "7am" -> "07:00"
    // "15:30" -> "15:30"
    // "9:30pm" -> "21:30"
    
    timeStr = timeStr.toLowerCase().trim();
    
    if (timeStr.includes(':')) {
      // Already in HH:MM format (might have am/pm)
      const isPM = timeStr.includes('pm');
      const isAM = timeStr.includes('am');
      const cleanTime = timeStr.replace(/[ap]m/, '');
      const [hours, minutes] = cleanTime.split(':');
      let hour = parseInt(hours);
      
      if (isPM && hour < 12) hour += 12;
      if (isAM && hour === 12) hour = 0;
      
      return `${hour.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
    } else {
      // Just hour with am/pm
      const isPM = timeStr.includes('pm');
      const isAM = timeStr.includes('am');
      let hour = parseInt(timeStr.replace(/[ap]m/, ''));
      
      if (isPM && hour < 12) hour += 12;
      if (isAM && hour === 12) hour = 0;
      
      return `${hour.toString().padStart(2, '0')}:00`;
    }
  }

  // ============================================
  // LOGGING
  // ============================================

  async logResult(result) {
    try {
      let logs = [];
      
      // Load existing logs
      try {
        const content = await fs.readFile(this.logFile, 'utf8');
        logs = JSON.parse(content);
      } catch {
        // File doesn't exist yet, start fresh
      }
      
      // Add new result
      logs.push({
        ...result,
        loggedAt: new Date().toISOString()
      });
      
      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs = logs.slice(-1000);
      }
      
      // Save
      await fs.writeFile(this.logFile, JSON.stringify(logs, null, 2), 'utf8');
      
    } catch (error) {
      console.error('Failed to write log:', error.message);
    }
  }

  // ============================================
  // UTILITIES
  // ============================================

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  printSummary(results) {
    const totalTasks = results.length;
    const successfulTasks = results.filter(r => r.status === 'success').length;
    const partialTasks = results.filter(r => r.status === 'partial').length;
    const skippedTasks = results.filter(r => r.status === 'skipped').length;
    
    console.log('\n📊 Summary:');
    console.log(`   Total Tasks:      ${totalTasks}`);
    console.log(`   Successful:       ${successfulTasks}`);
    console.log(`   Partial Success:  ${partialTasks}`);
    console.log(`   Skipped:          ${skippedTasks}`);
  }
}

// ============================================
// CLI INTERFACE
// ============================================

async function main() {
  const engine = new TaskEngine();
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🤖 CropClient Task Engine v1.0\n');

  if (command === 'run' && args[1]) {
    // Run specific task by ID
    await engine.executeTaskById(args[1]);
  } else if (command === 'run-all' || command === 'batch') {
    // Run all enabled tasks
    await engine.executeAllTasks();
  } else if (command === 'schedule' || command === 'watch') {
    // Start scheduler (runs continuously)
    await engine.startScheduler();
  } else if (command === 'list') {
    // List all tasks
    await engine.loadTasks();
    console.log('📋 Available Tasks:\n');
    engine.tasks.forEach(task => {
      const status = task.enabled === false ? '❌ DISABLED' : '✅ ENABLED';
      console.log(`   ${task.id}`);
      console.log(`      Name: ${task.name || 'N/A'}`);
      console.log(`      Status: ${status}`);
      console.log(`      Schedule: ${task.schedule || 'Manual only'}`);
      console.log(`      Prompts: ${(task.prompts?.length || 0) + (task.promptIds?.length || 0)}`);
      console.log();
    });
  } else {
    // Show help
    console.log('Usage:');
    console.log('  node task-engine.js run <task-id>     Run specific task');
    console.log('  node task-engine.js run-all           Run all enabled tasks once');
    console.log('  node task-engine.js schedule          Start scheduler (continuous)');
    console.log('  node task-engine.js list              List all tasks');
    console.log();
    console.log('Examples:');
    console.log('  node task-engine.js run morning-check');
    console.log('  node task-engine.js run-all');
    console.log('  node task-engine.js schedule');
    console.log();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default TaskEngine;
