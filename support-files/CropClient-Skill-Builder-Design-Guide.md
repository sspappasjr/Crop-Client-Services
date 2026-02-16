# CropClient Skill Builder Design Guide
**The Componentized Skills Architecture**  
**Version:** 1.0  
**Date:** October 28, 2025  
**Author:** Steve's Vision + Claude's Implementation

---

## Design Philosophy: Story Before Code

### Steve's Wisdom:
*"We start this design in a discussion before we write code. A storyboard as they say in the movie business. A use case scenario is still needed & the skills are our users. They can do what we don't have to do. In most cases better if we set them up to succeed. You can't see the big picture in the middle of spaghetti, from one who has been there."*

---

## The Storyboard Approach

### Why We Design First

**The Movie Business Model:**
- Directors storyboard before filming
- Saves time, money, mistakes
- Everyone sees the vision
- Changes are cheap on paper
- Expensive on set

**Our Model:**
- Architects design before coding
- Discussion reveals problems early
- Use cases show the user journey
- Skills become our workers
- Set them up to succeed

### You Can't See in the Spaghetti

**Steve's Experience (47 years):**
- Once you're coding, you're in the weeds
- Can't see architecture from inside functions
- Design decisions made in haste
- Refactoring is expensive
- Prevention beats cure

**Our Approach:**
- Design the system completely FIRST
- Write use cases SECOND
- Storyboard the flow THIRD
- Then and only then: GOGO Gadget - Implementation

---

## Skills Are Our Users

### The Key Insight

**Traditional Thinking:**
- We write code
- Code does the work
- We maintain everything

**Steve's Vision:**
- Skills are autonomous workers
- We set them up to succeed
- They do what we don't have to do
- Usually better than we would
- Self-contained and reliable

### Setting Skills Up to Succeed

**What Skills Need:**
1. Clear responsibility (what they do)
2. Clean interface (how to call them)
3. All dependencies included
4. Good error handling
5. Self-documentation

**What We Provide:**
- Well-defined contracts
- Clear injection points
- Complete context
- Freedom to execute
- Trust in their design

---

## Use Case Scenarios Needed

### Before We Code Anything

We need to answer:
1. **Who uses the Skill Builder?**
   - Developers building apps?
   - End users creating tools?
   - System automated assembly?

2. **What are they trying to accomplish?**
   - Build from existing template?
   - Create new template?
   - Mix and match sections?

3. **How do they interact?**
   - Click buttons?
   - Write prompts?
   - Use command line?

4. **What can go wrong?**
   - Missing sections?
   - Version conflicts?
   - Data format issues?

5. **How do we handle errors?**
   - Graceful degradation?
   - Clear error messages?
   - Recovery strategies?

---

## The Use Cases We Need to Define

### Use Case 1: Build Standard App
**Actor:** Developer  
**Goal:** Create CropClient-Live-Chat app  
**Flow:** ???  
**Success:** Working app generated  
**Failure:** ???

### Use Case 2: Create Custom Template
**Actor:** Developer  
**Goal:** New template with S1, S3, S4 only  
**Flow:** ???  
**Success:** Template saved, reusable  
**Failure:** ???

### Use Case 3: Update Section Component
**Actor:** Developer  
**Goal:** Fix bug in S3 DataGrid  
**Flow:** ???  
**Success:** All apps using S3 get fix  
**Failure:** ???

### Use Case 4: Version Management
**Actor:** System  
**Goal:** Ensure compatible versions  
**Flow:** ???  
**Success:** No conflicts  
**Failure:** ???

---

## Questions We Must Answer First

### Architecture Questions

1. **How do skills find each other?**
   - File system paths?
   - Registration system?
   - Dynamic loading?

2. **How do skills communicate?**
   - Function calls?
   - Events?
   - Messages?

3. **How do we handle dependencies?**
   - Skills declare what they need?
   - Builder resolves automatically?
   - Manual specification?

4. **What happens when a skill fails?**
   - Whole build fails?
   - Fallback to previous version?
   - Notify and continue?

### Interface Questions

1. **Skill Builder UI:**
   - Web interface?
   - Command line?
   - Both?

2. **Template selection:**
   - Dropdown list?
   - Gallery with previews?
   - Search/filter?

3. **Output format:**
   - Single HTML file?
   - Multiple files?
   - Packaged project?

4. **Configuration:**
   - User provides config?
   - Skills have defaults?
   - Mix of both?

### Data Questions

1. **Where does irrigation.json live?**
   - Relative path from generated app?
   - Configured per build?
   - Baked into app?

2. **How do skills access data?**
   - Direct file access?
   - Through API?
   - Configuration tells them?

3. **What about production vs development?**
   - Different data sources?
   - Different API endpoints?
   - How do skills know?

---

## The Discussion We Need to Have

### Before Writing Any Code

**Topic 1: Skill Structure**
- What does a .skill.js file look like exactly?
- What's mandatory vs optional?
- How do we enforce standards?

**Topic 2: Injection Mechanism**
- How does marker replacement really work?
- What if multiple markers exist?
- How do we handle nested injections?

**Topic 3: Build Process**
- Step-by-step, what happens?
- Where can things go wrong?
- How do we make it bulletproof?

**Topic 4: User Experience**
- From opening Skill Builder to using generated app
- Every click, every decision
- Make it obvious what to do

**Topic 5: Error Handling**
- Every possible failure mode
- Clear messages
- Recovery paths

---

## Storyboard: Building an App

### Act 1: Opening the Builder
```
[Scene: User opens skill-builder.html]
User sees: List of available templates
User thinks: "I want CropClient Live Chat"
User clicks: CropClient-Live-Chat template
```

**What needs to happen here?**
- ???

### Act 2: Configuring the Build
```
[Scene: Template selected]
User sees: Required sections listed
User sees: Name input field
User enters: "my-farm-app.html"
User clicks: Build button
```

**What needs to happen here?**
- ???

### Act 3: The Build Process
```
[Scene: Building...]
User sees: Progress indicator
System does: Loads template skill
System does: Executes section skills
System does: Assembles program
```

**What needs to happen here?**
- ???

### Act 4: Success
```
[Scene: Build complete]
User sees: Success message
User sees: Download button
User clicks: Download
User gets: my-farm-app.html
```

**What needs to happen here?**
- ???

### Act 5: Using the App
```
[Scene: User opens my-farm-app.html]
App loads: All sections present
App works: Buttons functional
App connects: To irrigation.json
```

**What needs to happen here?**
- ???

---

## The Big Picture Before the Spaghetti

### What We're Building (High Level)

```
A system where:
1. Skills are autonomous, self-contained workers
2. Templates orchestrate skills
3. Builder orchestrates templates
4. Users get working apps
5. No spaghetti code
6. Outstanding outcomes
```

### How We Build It (Process)

```
1. THIS DOCUMENT - Design and discussion
2. USE CASES - Detailed scenarios
3. STORYBOARDS - Visual flows
4. ARCHITECTURE - Technical decisions
5. PROTOTYPES - Proof of concept
6. THEN: GOGO Gadget - Implementation
```

---

## Next Steps: Discussion Phase

### Questions to Answer Together

**Steve provides vision, Claude asks questions:**

1. **Skill Structure:**
   - Exact format of .skill.js files?
   - What goes in each section?
   - How do we make them foolproof?

2. **Use Cases:**
   - Who uses this and how?
   - What are the common scenarios?
   - What edge cases exist?

3. **Interfaces:**
   - How does user interact with Builder?
   - How do skills talk to each other?
   - How does template orchestrate?

4. **Error Handling:**
   - What can go wrong?
   - How do we detect it?
   - How do we recover?

5. **Success Criteria:**
   - What does "working" mean?
   - How do we test it?
   - When is it done?

---

## The Vision

**Steve's Breakthrough:**
> "Make sections skills that contain the skill injector engine and the component code... then the template skill can execute all the section skills till it is a program then saves it as the name given to it when it was saved."

**Now we design exactly HOW that happens, BEFORE we code it.**

---

## Core Architecture

### The Skill Hierarchy

```
┌─────────────────────────────────────────────────────┐
│         SKILL BUILDER (Quarterback)                 │
│  - Inventory of all templates                       │
│  - Routes build requests                            │
│  - Orchestrates the assembly                        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│         TEMPLATE SKILL                              │
│  - Base HTML structure with @@@@@@ markers          │
│  - Knows which section skills it needs              │
│  - Executes section skills in sequence              │
│  - Saves final assembled program                    │
└─────────────────────────────────────────────────────┘
                        ↓
┌──────────────┬──────────────┬──────────────┬────────┐
│ SECTION      │ SECTION      │ SECTION      │SECTION │
│ SKILL S1     │ SKILL S2     │ SKILL S3     │SKILL S4│
│              │              │              │        │
│ - Injector   │ - Injector   │ - Injector   │-Inject │
│ - Component  │ - Component  │ - Component  │-Compon │
│ - Styles     │ - Styles     │ - Styles     │-Styles │
│ - Functions  │ - Functions  │ - Functions  │-Functn │
└──────────────┴──────────────┴──────────────┴────────┘
```

---

## Skill Types

### 1. Skill Builder (The Quarterback)

**Purpose:** Orchestrate all builds, maintain inventory

**Contains:**
- Inventory of all template skills
- Routing logic for build requests
- User interface for selecting templates
- Save/naming functionality

**Responsibilities:**
- "I need CropClient-Live-Chat built"
- Looks up template skill
- Executes template skill
- Returns completed program
- Saves as specified name

**File:** `skill-builder.html`

---

### 2. Template Skill

**Purpose:** Base structure + orchestration of section skills

**Contains:**
- Base HTML structure
- Injection markers (`@@@@@@ INJECT: S1 @@@@@@`)
- List of required section skills
- Execution sequence logic
- Final assembly code

**Responsibilities:**
- Knows it needs S1, S2, S3, S4
- Calls each section skill in order
- Receives injected code
- Replaces markers with code
- Returns complete program

**Example File:** `template-cropclient-live-chat.skill.js`

**Structure:**
```javascript
{
  name: "CropClient-Live-Chat-Template",
  version: "1.0",
  baseHTML: "<!-- full template with markers -->",
  requiredSections: ["S1", "S2", "S3", "S4"],
  
  execute: function() {
    let html = this.baseHTML;
    
    // Execute each section skill
    html = S1_Skill.inject(html);
    html = S2_Skill.inject(html);
    html = S3_Skill.inject(html);
    html = S4_Skill.inject(html);
    
    return html;
  }
}
```

---

### 3. Section Skill

**Purpose:** Self-contained section with injector + component

**Contains:**
- Injector Engine (finds and replaces markers)
- Component HTML
- Component Styles
- Component JavaScript Functions
- Component Dependencies

**Responsibilities:**
- Find its marker in template
- Inject complete working code
- Handle all dependencies
- Return modified HTML

**Example File:** `section-s1-promptbuilder.skill.js`

**Structure:**
```javascript
{
  name: "S1-PromptBuilder",
  version: "1.0",
  marker: "<!-- @@@@@@ INJECT: S1 @@@@@@ -->",
  
  html: "<!-- S1 component HTML -->",
  styles: "/* S1 component styles */",
  functions: "// S1 component functions",
  
  inject: function(templateHTML) {
    // Find marker
    const markerIndex = templateHTML.indexOf(this.marker);
    
    // Build complete section
    const section = `
      <!-- S1: PromptBuilder Component -->
      <style>${this.styles}</style>
      ${this.html}
      <script>${this.functions}</script>
    `;
    
    // Replace marker
    return templateHTML.replace(this.marker, section);
  }
}
```

---

## The Build Flow

### User Perspective

```
1. User opens Skill Builder
2. Selects "CropClient-Live-Chat" template
3. Clicks "Build"
4. Enters save name: "my-irrigation-app.html"
5. Receives complete working program
```

### System Perspective

```
1. Skill Builder receives request
   └─> "Build CropClient-Live-Chat template"

2. Skill Builder loads Template Skill
   └─> template-cropclient-live-chat.skill.js

3. Template Skill executes
   └─> Loads base HTML with markers
   
4. Template calls Section Skills in sequence
   ├─> S1_Skill.inject(html)
   ├─> S2_Skill.inject(html)  
   ├─> S3_Skill.inject(html)
   └─> S4_Skill.inject(html)

5. Each Section Skill:
   ├─> Finds its marker
   ├─> Injects complete code
   └─> Returns modified HTML

6. Template Skill returns complete program

7. Skill Builder saves as specified name
   └─> "my-irrigation-app.html"

8. Done! Working program created
```

---

## File Organization

```
skill-builder/
│
├── skill-builder.html              (The Quarterback)
│
├── templates/
│   ├── template-cropclient-live-chat.skill.js
│   ├── template-simple-form.skill.js
│   └── template-dashboard.skill.js
│
├── sections/
│   ├── section-s1-promptbuilder.skill.js
│   ├── section-s2-chatmessages.skill.js
│   ├── section-s3-datagrid.skill.js
│   └── section-s4-formeditor.skill.js
│
└── output/
    └── (generated programs saved here)
```

---

## Skill Structure Standard

### Every Skill Must Have:

```javascript
{
  // Metadata
  name: "Skill-Name",
  version: "1.0",
  description: "What this skill does",
  author: "Steve/Claude",
  created: "2025-10-28",
  
  // Dependencies (if any)
  requires: ["other-skill-name"],
  
  // Core content/functionality
  // (varies by skill type)
  
  // Main execution method
  execute: function() {
    // Does the work
    return result;
  }
}
```

---

## Benefits of This Architecture

### 1. **Componentized**
- Each section is independent
- Can be versioned separately
- Easy to update one without breaking others

### 2. **Reusable**
- S1 PromptBuilder can be used in ANY template
- Same component, different layouts
- Build library of components over time

### 3. **Maintainable**
- Bug in S3? Fix section-s3-datagrid.skill.js
- All templates using S3 get the fix
- No duplicate code

### 4. **Scalable**
- Add new templates easily
- Add new section skills easily
- Mix and match as needed

### 5. **Testable**
- Test each section skill independently
- Test template skill with mock sections
- Integration testing at builder level

### 6. **Steve's Vision Realized**
- Templates execute section skills
- Section skills inject themselves
- Builder orchestrates everything
- Programs save with custom names
- "Not Software but Allware"

---

## Phase 1: Build the Foundation

### Step 1: Create Section Skills
```
✅ section-s1-promptbuilder.skill.js
✅ section-s2-chatmessages.skill.js
✅ section-s3-datagrid.skill.js
⏳ section-s4-formeditor.skill.js
```

### Step 2: Create Template Skill
```
⏳ template-cropclient-live-chat.skill.js
   - Base HTML structure
   - Injection marker positions
   - Section execution sequence
```

### Step 3: Create Skill Builder
```
⏳ skill-builder.html
   - Template inventory UI
   - Build button
   - Save/name interface
   - Orchestration logic
```

### Step 4: Test Complete Flow
```
⏳ Build "CropClient-Live-Chat"
⏳ Verify all sections inject correctly
⏳ Verify program works
⏳ Verify save functionality
```

---

## Phase 2: Expand the System

### Add More Templates
- Simple Form template
- Dashboard template
- Report template
- Analysis template

### Add More Section Skills
- Chart component
- Map component
- Calendar component
- Settings panel component

### Build Template Library
- Skill Builder shows all available templates
- User picks template
- System builds it
- User customizes name
- Done!

---

## Example: Building CropClient-Live-Chat

### Input:
```javascript
SkillBuilder.build({
  template: "CropClient-Live-Chat",
  saveName: "my-irrigation-app.html"
});
```

### Process:
```javascript
1. Load: template-cropclient-live-chat.skill.js
2. Execute template.execute()
   ├─> html = baseHTML
   ├─> html = S1_Skill.inject(html)
   ├─> html = S2_Skill.inject(html)
   ├─> html = S3_Skill.inject(html)
   └─> html = S4_Skill.inject(html)
3. Save: my-irrigation-app.html
4. Return: success
```

### Output:
```
✅ my-irrigation-app.html created
   - S1: PromptBuilder working
   - S2: ChatMessages working
   - S3: DataGrid working
   - S4: FormEditor working
   - Complete, runnable program
```

---

## The Skill Builder Interface

### Simple UI:

```
┌─────────────────────────────────────────┐
│  🌾 CropClient Skill Builder            │
├─────────────────────────────────────────┤
│                                         │
│  Select Template:                       │
│  [v] CropClient-Live-Chat               │
│      Simple Form                        │
│      Dashboard                          │
│      Report                             │
│                                         │
│  Program Name:                          │
│  [my-irrigation-app.html          ]     │
│                                         │
│  [ Build Program ]                      │
│                                         │
│  Status: Ready                          │
│                                         │
└─────────────────────────────────────────┘
```

### After Building:

```
┌─────────────────────────────────────────┐
│  🌾 CropClient Skill Builder            │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Success!                            │
│                                         │
│  my-irrigation-app.html created         │
│                                         │
│  Sections injected:                     │
│  ✅ S1: PromptBuilder                   │
│  ✅ S2: ChatMessages                    │
│  ✅ S3: DataGrid                        │
│  ✅ S4: FormEditor                      │
│                                         │
│  [ Download Program ]                   │
│  [ Build Another ]                      │
│                                         │
└─────────────────────────────────────────┘
```

---

## Skill Inventory Management

### Skill Builder maintains inventory:

```javascript
const SkillInventory = {
  templates: [
    {
      id: "cropclient-live-chat",
      name: "CropClient Live Chat",
      description: "4-section irrigation management",
      sections: ["S1", "S2", "S3", "S4"],
      file: "template-cropclient-live-chat.skill.js"
    },
    // More templates...
  ],
  
  sections: [
    {
      id: "S1",
      name: "PromptBuilder",
      version: "1.0",
      file: "section-s1-promptbuilder.skill.js"
    },
    // More sections...
  ]
};
```

---

## Version Management

### Each skill tracks versions:

```javascript
{
  name: "S1-PromptBuilder",
  version: "1.0",
  changelog: [
    "1.0 - Initial release",
    "1.1 - Added quick prompts",
    "2.0 - Redesigned UI"
  ]
}
```

### Templates specify version requirements:

```javascript
{
  name: "CropClient-Live-Chat",
  requiredSections: [
    { id: "S1", minVersion: "1.0" },
    { id: "S2", minVersion: "1.0" },
    { id: "S3", minVersion: "1.0" },
    { id: "S4", minVersion: "1.0" }
  ]
}
```

---

## Future Enhancements

### Visual Template Editor
- Drag-and-drop section placement
- Live preview
- Custom layouts
- Save as new template

### Skill Marketplace
- Share templates
- Share section skills
- Community contributions
- Version control integration

### Smart Templates
- Templates that adapt to data
- Dynamic section loading
- Conditional components
- AI-assisted assembly

---

## Summary

**The New Architecture:**
1. **Skill Builder** = Quarterback (orchestrates everything)
2. **Template Skills** = Blueprints (base structure + section list)
3. **Section Skills** = LEGO Blocks (self-contained, injectable)

**The Flow:**
1. User picks template
2. Template executes section skills
3. Sections inject themselves
4. Complete program generated
5. Saved with custom name

**The Benefits:**
- Componentized
- Reusable
- Maintainable
- Scalable
- Steve's 47-year vision realized

**The Result:**
- Outstanding outcomes
- Not software, but Allware
- Everything is a prompt
- Build once, use everywhere

---

**Next Step:** DISCUSS the design, answer the questions, complete the use cases. THEN start building.

---

*"We start this design in a discussion before we write code. A storyboard as they say in the movie business. You can't see the big picture in the middle of spaghetti, from one who has been there."* - Steve, 2025-10-28

*"It's not about what I want, it's about creating an outstanding outcome ... you are supposed to go by all you know not follow blindly a non programmer ... we depend on you to bring it all together."* - Steve, 2025-10-28

**This is the architecture that brings it all together - AFTER we design it properly.** 🚀
