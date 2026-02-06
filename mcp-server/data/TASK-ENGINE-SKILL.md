# CropClient Task Engine Skill

**Automate your prompts - The batch/scheduled execution layer**

---

## What This Skill Teaches

This skill documents:
1. How to automate prompt execution with the Task Engine
2. How to create task definitions
3. How to organize reusable prompts
4. How to schedule automated workflows
5. How to integrate with your existing CropClient Live Chat prompts

**The Vision:** Every prompt you use interactively can also run automatically!

---

## Core Concept

### Everything Flows From Prompts

```
You type in Live Chat:
  "create next irrigation for ranch 1 planting 1A"
         ↓
Task Engine can run the SAME prompt automatically:
  Schedule: "daily 6am"
  Execute: "create next irrigation for ranch 1 planting 1A"
```

**Same prompts, different triggers:**
- **Interactive:** You type them in Live Chat
- **Automated:** Task Engine runs them on schedule
- **Batch:** Task Engine runs many at once

---

## Architecture

```
┌─────────────────────────────────────┐
│  CropClient Live Chat               │
│  (Interactive prompts)              │
└──────────────┬──────────────────────┘
               │
               │ Same prompts!
               │
┌──────────────▼──────────────────────┐
│  prompts.json (Library)             │
│  - Reusable prompt definitions      │
│  - Categories and descriptions      │
│  - Used by both UI and automation   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  tasks.json (Automation)            │
│  - Task definitions                 │
│  - Schedules and triggers           │
│  - Sequences of prompts             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  task-engine.js (Executor)          │
│  - Reads tasks                      │
│  - Executes prompts                 │
│  - Logs results                     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  MCP Server (stdio)                 │
│  - Same server as Live Chat uses    │
│  - Executes all operations          │
└─────────────────────────────────────┘
```

---

## Installation

### Prerequisites

You already have:
- ✅ MCP server running (server.js)
- ✅ Node.js installed
- ✅ Prompts you use in Live Chat

### Setup

1. **Copy task-engine.js** to your mcp-server folder:
```
mcp-server/
├── server.js         ← Already have
├── task-engine.js    ← NEW
├── data/
│   ├── prompts.json  ← YOUR prompts
│   └── tasks.json    ← YOUR tasks
```

2. **No installation needed!** It's just JavaScript.

---

## File Formats

### prompts.json

**Your reusable prompt library:**

```json
{
  "prompts": [
    {
      "id": "read-irrigation",
      "name": "Read Irrigation Table",
      "prompt": "read irrigation table",
      "category": "data-read",
      "description": "Load all irrigation records"
    },
    {
      "id": "create-next-r1-1a",
      "name": "Create Next Ranch 1-1A",
      "prompt": "create next irrigation for ranch 1 planting 1A",
      "category": "create",
      "description": "Generate next irrigation for R1-1A"
    }
  ]
}
```

**Fields:**
- `id` - Unique identifier (reference in tasks)
- `name` - Display name
- `prompt` - The actual prompt text (what you'd type)
- `category` - Organize prompts (optional)
- `description` - What it does (optional)

### tasks.json

**Your automation definitions:**

```json
{
  "tasks": [
    {
      "id": "morning-check",
      "name": "Morning Irrigation Check",
      "description": "Daily routine check",
      "enabled": true,
      "schedule": "daily 7am",
      "stopOnError": false,
      "prompts": [
        "read irrigation table",
        "show irrigation statistics"
      ]
    },
    {
      "id": "create-all-next",
      "name": "Create All Next Irrigations",
      "enabled": true,
      "schedule": null,
      "stopOnError": true,
      "promptIds": [
        "create-next-r1-1a",
        "create-next-r1-1b",
        "create-next-r2-2a"
      ]
    }
  ]
}
```

**Fields:**
- `id` - Unique task identifier
- `name` - Display name
- `description` - What the task does (optional)
- `enabled` - true/false to enable/disable
- `schedule` - When to run (null = manual only)
- `stopOnError` - Stop if a prompt fails (true/false)
- `prompts` - Array of prompt strings (direct)
- `promptIds` - Array of IDs from prompts.json (reusable)

**You can use EITHER:**
- `prompts` - Write prompts directly in the task
- `promptIds` - Reference prompts from your library
- **Both!** - Combine direct and referenced prompts

---

## Usage

### Command Line Interface

**List all tasks:**
```bash
node task-engine.js list
```

**Run a specific task:**
```bash
node task-engine.js run morning-check
```

**Run all enabled tasks once:**
```bash
node task-engine.js run-all
```

**Start the scheduler (continuous):**
```bash
node task-engine.js schedule
```
(Press Ctrl+C to stop)

---

## Schedule Formats

The `schedule` field supports various formats:

**Daily at specific time:**
```json
"schedule": "daily 7am"
"schedule": "daily 15:30"
```

**Specific day and time:**
```json
"schedule": "monday 6am"
"schedule": "friday 17:00"
```

**Every hour:**
```json
"schedule": "hourly"
```

**Manual only (no schedule):**
```json
"schedule": null
```

**Days of week:**
- monday, tuesday, wednesday, thursday, friday, saturday, sunday

**Time formats:**
- `7am`, `9pm` - Simple hour with am/pm
- `15:30` - 24-hour format
- `9:30am`, `3:45pm` - Hour:minute with am/pm

---

## Creating Tasks

### Pattern 1: Direct Prompts

**Use when:** Prompts are specific to this task only

```json
{
  "id": "custom-workflow",
  "name": "Custom Daily Workflow",
  "enabled": true,
  "schedule": "daily 8am",
  "prompts": [
    "read irrigation table",
    "filter last 24 hours",
    "check for anomalies",
    "send report to managers"
  ]
}
```

### Pattern 2: Referenced Prompts

**Use when:** Prompts are reusable across multiple tasks

```json
{
  "id": "morning-routine",
  "name": "Morning Routine",
  "enabled": true,
  "schedule": "daily 7am",
  "promptIds": [
    "read-irrigation",
    "check-meters",
    "validate-data"
  ]
}
```

### Pattern 3: Combined

**Use when:** Mix reusable and custom prompts

```json
{
  "id": "weekly-report",
  "name": "Weekly Report Generation",
  "enabled": true,
  "schedule": "monday 6am",
  "promptIds": [
    "read-irrigation",
    "weekly-filter"
  ],
  "prompts": [
    "generate weekly summary report",
    "email report to steve@cropclient.com"
  ]
}
```

---

## Building Your Prompt Library

### Step 1: Extract from Live Chat

**Look at prompts you type frequently:**
- "read irrigation table"
- "create next irrigation for ranch 1 planting 1A"
- "show statistics"
- "read meter for ranch 2 planting 2B"

### Step 2: Add to prompts.json

```json
{
  "id": "read-irrigation",
  "name": "Read Irrigation Table",
  "prompt": "read irrigation table",
  "category": "data-read"
}
```

### Step 3: Reference in Tasks

```json
{
  "id": "daily-check",
  "promptIds": ["read-irrigation"]
}
```

### Step 4: Reuse Everywhere

Same prompt works:
- ✅ In Live Chat (you type it)
- ✅ In tasks (automated)
- ✅ In other tasks (reuse)
- ✅ In API calls (if you add HTTP layer)

---

## Real-World Examples

### Morning Irrigation Check

**What it does:** Read current status every morning

```json
{
  "id": "morning-check",
  "name": "Morning Irrigation Status",
  "enabled": true,
  "schedule": "daily 7am",
  "prompts": [
    "read irrigation table",
    "show irrigation statistics",
    "check for overdue records"
  ]
}
```

### Create Next Irrigations

**What it does:** Generate recommendations for all plantings

```json
{
  "id": "create-all-next",
  "name": "Create All Next Irrigations",
  "enabled": true,
  "schedule": null,
  "stopOnError": true,
  "prompts": [
    "create next irrigation for ranch 1 planting 1A",
    "create next irrigation for ranch 1 planting 1B",
    "create next irrigation for ranch 2 planting 2A",
    "create next irrigation for ranch 2 planting 2B"
  ]
}
```

**Run manually when needed:**
```bash
node task-engine.js run create-all-next
```

### Weekly Report

**What it does:** Monday morning summary of last week

```json
{
  "id": "weekly-report",
  "name": "Weekly Irrigation Report",
  "enabled": true,
  "schedule": "monday 6am",
  "prompts": [
    "read irrigation table",
    "filter last 7 days",
    "calculate weekly totals",
    "generate compliance report"
  ]
}
```

### Data Backup

**What it does:** Daily backup of all data

```json
{
  "id": "daily-backup",
  "name": "Daily Data Backup",
  "enabled": true,
  "schedule": "daily 11pm",
  "prompts": [
    "backup irrigation data",
    "backup crop data",
    "backup user data",
    "verify backup integrity"
  ]
}
```

---

## Integration with MCP Server

### How It Works

**Task Engine → MCP Server:**

```javascript
// Task Engine reads your task
const task = {
  prompts: ["read irrigation table"]
};

// Sends prompt to MCP server (same server Live Chat uses)
// MCP executes: data_operation(action="read", table="irrigation")
// Returns results

// Task Engine logs the results
```

**Same flow as typing in Live Chat!**

### Future: Direct MCP Integration

**Current (v1.0):** Task Engine simulates prompt execution

**Future (v2.0):** Task Engine directly calls MCP tools

```javascript
// Will connect to MCP server
const mcpClient = new MCPClient();
await mcpClient.callTool('data_operation', {
  action: 'read',
  table: 'irrigation'
});
```

---

## Logging

**All task executions are logged to:**
```
mcp-server/data/task-logs.json
```

**Log format:**
```json
{
  "taskId": "morning-check",
  "taskName": "Morning Irrigation Check",
  "status": "success",
  "executedAt": "2025-10-27T07:00:00.000Z",
  "promptCount": 3,
  "successCount": 3,
  "results": [
    {
      "success": true,
      "prompt": "read irrigation table",
      "timestamp": "2025-10-27T07:00:01.000Z"
    }
  ]
}
```

**Logs are kept for:**
- Troubleshooting failures
- Auditing automated actions
- Performance monitoring
- Compliance records

---

## Best Practices

### 1. Start Simple

**First task:** Just read data
```json
{
  "id": "test-task",
  "prompts": ["read irrigation table"]
}
```

**Test it:**
```bash
node task-engine.js run test-task
```

### 2. Build Your Library

**Extract common prompts:**
- Don't repeat prompts across tasks
- Put them in prompts.json
- Reference by ID

### 3. Use stopOnError

**For critical sequences:**
```json
{
  "stopOnError": true,
  "prompts": [
    "validate data integrity",
    "create next irrigation",  // ← Don't run if validation fails
    "send notifications"        // ← Don't run if creation fails
  ]
}
```

**For independent operations:**
```json
{
  "stopOnError": false,
  "prompts": [
    "backup ranch 1 data",
    "backup ranch 2 data",  // ← Run even if ranch 1 fails
    "backup ranch 3 data"   // ← Run even if ranch 2 fails
  ]
}
```

### 4. Test Before Scheduling

**Always test manually first:**
```bash
node task-engine.js run new-task
```

**Then add schedule:**
```json
{
  "schedule": "daily 7am"
}
```

### 5. Use Descriptive Names

**Good:**
```json
{
  "id": "morning-irrigation-check",
  "name": "Morning Irrigation Status Check"
}
```

**Bad:**
```json
{
  "id": "task1",
  "name": "Task"
}
```

---

## Troubleshooting

### Task Won't Run

**Check:**
1. Is `enabled: true`?
2. Is schedule format correct?
3. Did you restart the scheduler?

**Test manually:**
```bash
node task-engine.js run task-id
```

### Prompt Fails

**Check task-logs.json for error details**

**Common issues:**
- Prompt syntax incorrect
- MCP server not running
- Data file missing
- Permission errors

### Schedule Not Triggering

**Verify:**
1. Scheduler is running: `node task-engine.js schedule`
2. Current time matches schedule
3. Task is enabled
4. Time format is correct

**Test time parsing:**
```javascript
// "daily 7am" triggers at 07:00
// "monday 15:30" triggers Monday at 3:30 PM
```

---

## Advanced Usage

### Conditional Execution

**Task only runs if condition met:**

```json
{
  "id": "alert-on-high-usage",
  "prompts": [
    "read irrigation table",
    "if water usage > threshold then send alert"
  ]
}
```

### Chained Tasks

**One task triggers another:**

```json
{
  "id": "main-workflow",
  "prompts": [
    "run task morning-check",
    "if success then run task create-next",
    "if success then run task send-reports"
  ]
}
```

### Variable Substitution

**Use dynamic values in prompts:**

```json
{
  "id": "dated-backup",
  "prompts": [
    "backup irrigation data to backup-{date}.json",
    "backup crop data to backup-{date}.json"
  ]
}
```

### External Triggers

**Run tasks from other systems:**

```bash
# From cron job
0 7 * * * cd /path/to/mcp-server && node task-engine.js run morning-check

# From web hook
curl -X POST http://cropclient.com/trigger-task?id=morning-check

# From another script
node task-engine.js run urgent-task
```

---

## Integration Patterns

### With CropClient Live Chat

**Workflow:**
1. Develop prompts in Live Chat interactively
2. Test until they work perfectly
3. Add working prompts to prompts.json
4. Create tasks that use those prompts
5. Automate!

### With Test Model

**Use Test Model to:**
- Develop new prompts
- Test task sequences
- Validate data operations
- Debug failures

**Then move to automation:**
- Export working prompts
- Create task definitions
- Schedule execution

### With External Systems

**Task Engine can:**
- Read data from external APIs (add prompts)
- Write results to external systems
- Trigger notifications
- Update dashboards

---

## Future Enhancements

### v2.0 Features (Planned)

**Direct MCP Integration:**
- Task Engine talks directly to MCP server
- No simulation needed
- Real-time execution

**Web UI:**
- Visual task editor
- Real-time monitoring
- Log viewer
- Schedule calendar

**Advanced Scheduling:**
- Cron expressions
- Conditional triggers
- Event-based execution
- Retry logic

**Notifications:**
- Email on task completion/failure
- SMS alerts
- Slack/Teams integration
- Dashboard updates

---

## Philosophy

### Reusability is King

**One prompt, many uses:**
- Type it in Live Chat
- Run it in a task
- Schedule it daily
- Chain it with others
- Share it with team

**Build your library, reuse forever!**

### Automation Frees Humans

**What computers should do:**
- Repetitive daily tasks
- Scheduled operations
- Data validation
- Report generation
- Backups and maintenance

**What humans should do:**
- Design workflows
- Make decisions
- Handle exceptions
- Improve processes
- Grow crops! 🌱

### Everything is a Prompt

**From interactive to automated:**

```
Human types:     "read irrigation table"
Task executes:   "read irrigation table"
API receives:    "read irrigation table"
Scheduled runs:  "read irrigation table"

Same prompt. Different triggers. Universal interface.
```

---

## Summary

**You now know:**
- ✅ How to automate your Live Chat prompts
- ✅ How to create task definitions
- ✅ How to build a reusable prompt library
- ✅ How to schedule automated workflows
- ✅ How to integrate with MCP server
- ✅ How to log and monitor executions

**Next steps:**
1. Create your prompts.json from Live Chat prompts
2. Define your first task in tasks.json
3. Test it manually
4. Add a schedule
5. Let it run!

---

**Version:** 1.0.0  
**Last Updated:** October 27, 2025  
**Maintained by:** CropClient Team

**License:** MIT - Automate everything!

---

*"Automate the routine, focus on what matters."* 🤖🌱
