# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains documentation for Agentbase, an agent cloud platform built with Mintlify. Agentbase provides a simple API for deploying AI agents without managing infrastructure.

## Development Commands

### Local Development
```bash
# Install Mintlify CLI globally
npm i -g mint

# Start local development server (run from root where docs.json is located)
mint dev

# Update CLI to latest version (if dev environment issues)
mint update
```

## Architecture

This is a Mintlify documentation site with the following structure:

- **docs.json**: Main configuration file defining navigation, theme, and site metadata
- **api/**: API documentation pages for the Agents API
- **intro/**: Introduction and platform overview pages
- **logo/**: Brand assets (SVG logos for light/dark themes)

### Key Configuration

- **Theme**: "almond" with custom Agentbase branding
- **Navigation**: Single tab structure with Introduction and Agents API sections
- **Primary CTA**: Links to Agentbase signup at base.agentbase.sh
- **External Links**: Website (agentbase.sh) and Discord community

### Content Organization

The documentation covers:
1. **Introduction**: Platform overview and key features
2. **Agents API**: Complete API reference including quickstart, capabilities, streaming, and endpoint documentation

### Publishing

Changes are automatically deployed to production when pushed to the default branch via GitHub App integration. The site is hosted through Mintlify's infrastructure.

## File Structure

- **index.mdx**: Root page (currently present but not in navigation)
- **intro/**: Introduction section pages
  - `introduction.mdx`: Platform overview
  - `agent-platform.mdx`: Platform details
- **api/**: Complete API documentation
  - `quickstart.mdx`: Getting started guide
  - `what-is-the-agents-api.mdx`: API overview
  - `agent-capabilities.mdx`: Available capabilities
  - `api-call-example.mdx`: Implementation examples
  - `streaming-message-types.mdx`: Streaming documentation
  - `run-agent.mdx`, `get-messages.mdx`, `clear-messages.mdx`: Endpoint documentation

## Important Notes

- The package-lock.json indicates no NPM dependencies are required for this documentation site
- All content is in MDX format supporting rich markdown with React components
- Navigation structure is defined entirely in docs.json - changes to page organization require updating this file
- Mintlify handles all build and deployment processes automatically