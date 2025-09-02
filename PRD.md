# Product Requirements Document (PRD): Website Generator Script

## Overview
This script generates website projects using Eleventy (11ty), Decap CMS, Tailwind CSS, AlpineJS, and Netlify. The script provides four different project templates to meet various client needs.

## Project Types
1. **Basic Static Site**
   - 11ty with static content pages (Home, About, Services, Contacts)
   - Tailwind CSS for styling
   - AlpineJS for interactive elements

2. **Multilanguage Static Site**
   - Same as Basic Static Site
   - Added multilanguage support
   - Language switcher component

3. **CMS-Enabled Site**
   - 11ty + Decap CMS integration
   - Static pages (Home, About, Contact)
   - Dynamic resources (configurable: Services, News, Properties, etc.)
   - Tailwind CSS and AlpineJS

4. **Multilanguage CMS-Enabled Site**
   - Same as CMS-Enabled Site
   - Added multilanguage support for all content
   - Language switcher component

## Key Features
- Command-line interface with project type selection
- Automatic setup of all required dependencies
- Pre-configured Netlify deployment settings
- Form handling through Netlify Forms
- Responsive design with Tailwind CSS
- Interactive components with AlpineJS
- Content management with Decap CMS (for types 3 & 4)
- Multilanguage support (for types 2 & 4)

## Technical Requirements
- Node.js environment
- NPM for package management
- Git for version control
- Netlify CLI for deployment configuration

## User Flow
1. User runs the script
2. Script prompts for project type selection
3. User selects desired project type
4. For CMS-enabled sites, user selects which dynamic resources to include
5. Script generates the project with all necessary files and configurations
6. User receives instructions for next steps (development, deployment)

## Implementation Plan
1. Create base script structure with project type selection
2. Implement template generation for each project type
3. Configure build processes and dependencies
4. Set up Netlify deployment configurations
5. Add documentation and usage instructions

## Technology Stack Details
- **Eleventy (11ty)**: Static site generator
- **Decap CMS**: Headless CMS for content management
- **Tailwind CSS**: Utility-first CSS framework
- **AlpineJS**: Lightweight JavaScript framework for interactivity
- **Netlify**: Hosting platform with integrated forms functionality

## Success Criteria
- Script successfully generates all four project types
- Generated projects run without errors
- CMS functionality works correctly
- Multilanguage support functions properly
- Projects deploy successfully to Netlify
- Form submissions work correctly