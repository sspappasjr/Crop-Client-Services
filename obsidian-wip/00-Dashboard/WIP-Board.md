# WIP Board

> Track what's in progress, what needs review, and what's done.

---

## Active

Items currently being worked on. Move to **Review** when ready for feedback.

```dataview
LIST FROM "01-WIP/Active"
SORT file.mtime DESC
```

> *If you don't have the Dataview plugin, browse [[01-WIP/Active\|Active WIP]] directly.*

| Item | Owner | Priority | Started |
|------|-------|----------|---------|
| _Add rows as you create WIP items_ | | | |

---

## In Review

Items ready for feedback or approval. Move to **Archive** when complete.

```dataview
LIST FROM "01-WIP/Review"
SORT file.mtime DESC
```

> *Browse [[01-WIP/Review\|Review]] directly.*

| Item | Owner | Status | Review Date |
|------|-------|--------|-------------|
| _Items move here from Active_ | | | |

---

## Recently Completed

```dataview
LIST FROM "01-WIP/Archive"
SORT file.mtime DESC
LIMIT 10
```

> *Browse [[01-WIP/Archive\|Archive]] directly.*

---

## How to Use

1. Create a new WIP item using the **WIP-Item** template
2. Save it in `01-WIP/Active/`
3. When ready for review, move the file to `01-WIP/Review/`
4. When complete, move to `01-WIP/Archive/`
5. Update the tables above manually if you're not using Dataview

---

#wip #board #tracking
