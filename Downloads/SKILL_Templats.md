# CropClient Template Skill
**4-Section Layout with Injection Points**

## Purpose
Base template with marked injection points for component assembly. Steve's original 1978 pattern - templates with @@@@@@ markers for component injection.

## Structure
```
S1 (Top-Left):     Injection point for PromptBuilder
S2 (Top-Right):    Injection point for ChatMessages  
S3 (Bottom-Left):  Injection point for DataGrid
S4 (Bottom-Right): Injection point for FormEditor
```

## Injection Markers
```html
<!-- @@@@@@ INJECT: S1 @@@@@@ -->
<!-- @@@@@@ INJECT: S2 @@@@@@ -->
<!-- @@@@@@ INJECT: S3 @@@@@@ -->
<!-- @@@@@@ INJECT: S4 @@@@@@ -->
```

## How Builder Uses It
1. Read template.html
2. Find @@@@@@ markers
3. Replace with component code
4. Generate complete app

## Version
v1.0 - Initial template with S1 injection point

## History
This pattern dates back to Steve's work at Scheid Vineyards in 1978.
