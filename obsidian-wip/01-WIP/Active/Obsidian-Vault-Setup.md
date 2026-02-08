---
title: "Obsidian Shared WIP Vault Setup"
created: "2026-02-08"
updated: "2026-02-08"
owner: "Team"
priority: "high"
status: "active"
tags: [wip, setup]
---

# Obsidian Shared WIP Vault Setup

## Summary

Setting up the shared Obsidian vault within the Crop-Client-Services repository so the team can collaborate on work-in-progress resources, session notes, and project knowledge.

## Goal

A fully functional Obsidian vault that:
- Lives in the git repo and syncs via normal git workflows
- Has a clear folder structure for WIP items, resources, and knowledge
- Includes templates for common note types
- Is easy for anyone on the team to open and start using

## Context

The CropClient project uses a three-location architecture:
1. Local dev environment
2. Obsidian vault for documentation and knowledge
3. Production at CropClient.com

This vault bridges locations 1 and 2 by embedding an Obsidian workspace directly in the repo.

## Progress

### 2026-02-08
- [x] Created vault folder structure
- [x] Configured `.obsidian` settings (app, appearance, core plugins, templates)
- [x] Built Home dashboard (MOC) and WIP Board
- [x] Created templates: WIP-Item, Session-Note, Resource-Note, Decision-Record
- [x] Wrote Vault-Guide with workflows and conventions
- [x] Updated `.gitignore` for Obsidian workspace files
- [ ] Team review and feedback
- [ ] Add any project-specific reference materials
- [ ] Consider community plugins (Dataview, Kanban, Calendar)

## Notes

- The vault uses Obsidian's core template plugin (no community plugins required)
- Dataview queries are included in WIP-Board but require the optional Dataview plugin
- The accent color is set to green (#4a9a4a) to match the agricultural theme

## Related

- [[Home]] - Vault dashboard
- [[WIP-Board]] - WIP tracking board
- [[Vault-Guide]] - Usage instructions

---

#wip #active #setup
