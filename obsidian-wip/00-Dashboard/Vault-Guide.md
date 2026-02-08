# Shared WIP Vault Guide

> How to use this Obsidian vault for sharing work-in-progress resources across the CropClient project.

---

## Getting Started

### Opening the Vault
1. Open Obsidian
2. Click "Open folder as vault"
3. Select the `obsidian-wip/` folder inside this repository
4. The vault will load with all shared WIP resources

### First-Time Setup
- The vault comes pre-configured with core plugins enabled
- Templates are ready in `02-Resources/Templates/`
- New files default to `01-WIP/Active/` - change in Settings > Files & Links if needed

---

## Vault Structure

```
obsidian-wip/
├── 00-Dashboard/       # Navigation and overview
│   ├── Home.md         # Main hub (start here)
│   ├── WIP-Board.md    # Track active/review/done items
│   └── Vault-Guide.md  # This file
├── 01-WIP/             # Work-in-progress items
│   ├── Active/         # Currently being worked on
│   ├── Review/         # Ready for feedback
│   └── Archive/        # Completed or shelved
├── 02-Resources/       # Shared resources
│   ├── Templates/      # Note templates
│   ├── References/     # Reference materials
│   └── Assets/         # Images, diagrams, attachments
├── 03-Sessions/        # Session notes (by date)
└── 04-Knowledge-Base/  # Persistent knowledge
    ├── Architecture/   # Architecture decisions (ADRs)
    ├── Guides/         # How-to documentation
    └── Patterns/       # Reusable patterns
```

---

## Workflows

### Creating a New WIP Item
1. Press `Ctrl/Cmd + N` to create a new note
2. Insert the **WIP-Item** template (`Ctrl/Cmd + T` or use the template button)
3. Fill in the frontmatter (title, owner, priority)
4. Save it in `01-WIP/Active/`

### Moving Items Through Stages
- **Active** - Work is happening now
- **Review** - Ready for someone else to look at
- **Archive** - Done or no longer relevant

To move: right-click the file in the explorer and select "Move file to..." or drag it.

### Recording a Session
1. Use Daily Notes (`Ctrl/Cmd + D`) for quick session entries
2. Or create a new note with the **Session-Note** template
3. Save in `03-Sessions/`

### Adding a Resource
1. Create a new note with the **Resource-Note** template
2. Save in `02-Resources/References/`
3. For files/images, drop them in `02-Resources/Assets/`

### Making an Architecture Decision
1. Create a new note with the **Decision-Record** template
2. Save in `04-Knowledge-Base/Architecture/`
3. Link it from relevant WIP items

---

## Sharing via Git

This vault lives inside the git repository and syncs with the team through normal git operations.

### Best Practices
- **Commit frequently** - Small, focused commits for vault changes
- **Descriptive messages** - e.g., "Add WIP: irrigation scheduling redesign"
- **Pull before editing** - Avoid merge conflicts on shared notes
- **Don't commit workspace files** - `.obsidian/workspace.json` is gitignored (it's local to each person)

### What Gets Shared (tracked by git)
- All markdown notes
- Vault configuration (`.obsidian/app.json`, plugins, templates config)
- Assets and attachments

### What Stays Local (gitignored)
- `.obsidian/workspace.json` - Your personal layout
- `.obsidian/workspace-mobile.json` - Mobile layout
- `.obsidian/cache/` - Local cache

---

## Tags Convention

| Tag | Purpose |
|-----|---------|
| `#wip` | Work-in-progress items |
| `#active` | Currently being worked on |
| `#review` | Ready for review |
| `#session` | Session notes |
| `#resource` | Reference resources |
| `#decision` | Architecture decisions |
| `#architecture` | Architecture-related |
| `#dashboard` | Dashboard/navigation notes |
| `#moc` | Map of Content (index notes) |

---

## Optional Plugins

The vault works with core Obsidian features only. For a richer experience, consider:

- **Dataview** - Automatic lists and tables from your notes (the WIP Board includes Dataview queries)
- **Kanban** - Visual board for WIP tracking
- **Calendar** - Navigate session notes by date
- **Templater** - More powerful templates with dynamic content

Install these from Obsidian Settings > Community Plugins.

---

#guide #vault
