# Mintlify Navigation Manager Skill

## Purpose
Automatically manage Mintlify documentation sidebar navigation, file organization, and slug updates for the Agentbase docs project.

## Core Functions

### 1. Move Files Between Sections
When moving files between navigation sections:
- Move the actual `.mdx` file to the correct directory
- Update the `docs.json` navigation structure
- Update slug references throughout the codebase
- Remove empty directories after moves
- Verify no broken internal links

### 2. Navigation Structure Management
- **Getting Started**: Core onboarding content (`getting-started/`, some `build/` files)
- **Build**: Development and configuration (`build/`)
- **Deploy**: Deployment and APIs (`deploy/`)
- **Improve**: Optimization and monitoring (`improve/`)
- **Agent Primitives**: Core primitives (`primitives/`)
- **API Reference**: API documentation (`deploy/api/`)
- **Resources**: SDKs, support, reference materials (`resources/`)

### 3. File Organization Rules
- SDKs belong in `resources/sdk/` with navigation under Resources → SDKs
- Agent modes belong in `build/` under Build section
- API docs stay in `deploy/api/` under API Reference
- Remove duplicate files when consolidating
- Use clean naming conventions (avoid `-sdk` suffixes)

### 4. Slug Update Process
When moving files:
1. Identify all references to old slugs in `docs.json`
2. Move physical files to new directories
3. Update navigation paths in `docs.json`
4. Check for and update any internal cross-references
5. Remove empty source directories
6. Verify navigation structure is valid

### 5. Icon Management
- Use appropriate icons for file types:
  - TypeScript: `"icon": "typescript"`
  - React: `"icon": "react"`
  - Python: `"icon": "python"`
- Apply icons using the extended page object format:
  ```json
  {
    "page": "path/to/file",
    "icon": "icon-name"
  }
  ```

### 6. Validation Checks
Before completing any navigation changes:
- Verify all referenced files exist
- Check for duplicate entries
- Ensure proper directory structure
- Validate `docs.json` syntax
- Confirm no broken navigation paths

## Usage Examples

### Moving a File
```
Move agent-modes from getting-started to build section
```
Process:
1. Move `/getting-started/agent-modes.mdx` → `/build/agent-modes.mdx`
2. Update `docs.json`: Remove from Getting Started, add to Build
3. Update slug from `"getting-started/agent-modes"` → `"build/agent-modes"`

### Consolidating SDKs
```
Move all SDKs to resources section
```
Process:
1. Move files: `build/sdk/*`, `deploy/sdk/*` → `resources/sdk/`
2. Remove SDK groups from Build and Deploy sections
3. Add SDKs group to Resources section
4. Remove duplicate files
5. Update all navigation references

### Adding Icons
```
Add proper icons to SDK navigation items
```
Process:
1. Convert simple string references to page objects
2. Add appropriate icon properties
3. Maintain correct navigation structure

## Implementation Notes
- Always use `TodoWrite` for multi-step operations
- Use `Bash` commands for file operations in parallel when possible
- Validate changes by reading the updated `docs.json`
- Handle edge cases like missing directories or duplicate files
- Preserve existing navigation metadata (tags, expanded states, etc.)

## File Patterns
- Navigation config: `docs.json`
- Content files: `**/*.mdx`
- Directory structure: Mirror navigation hierarchy where possible
- Naming: Use kebab-case, avoid redundant suffixes

This skill ensures consistent, automated management of the Mintlify documentation structure while maintaining proper file organization and navigation integrity.