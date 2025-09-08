#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Banner
console.log(chalk.cyan.bold(`11ty Website Generator`));
console.log(chalk.cyan('Step 5: Adding Decap CMS Integration\n'));

/**
 * Adds Decap CMS integration to the project
 */
async function addCmsIntegration(config) {
  try {
    // Load config if not provided
    if (!config) {
      const configPath = path.join(process.cwd(), 'project-config.json');
      if (!fs.existsSync(configPath)) {
        throw new Error('Project configuration not found. Please run step 1 first.');
      }
      config = await fs.readJSON(configPath);
    }

    // Skip if not a CMS project
    if (!config.projectType.includes('CMS')) {
      console.log(chalk.yellow('This is not a CMS project. Skipping this step.'));
      return;
    }

    const projectDir = path.join(process.cwd(), config.projectName);
    
    if (!fs.existsSync(projectDir)) {
      throw new Error('Project directory not found. Please run step 2 first.');
    }
    
    console.log('Setting up Decap CMS...');
    
    // Create admin directory
    await fs.ensureDir(path.join(projectDir, 'src', 'admin'));
    
    // Create admin index.html
    await fs.writeFile(
      path.join(projectDir, 'src', 'admin', 'index.html'),
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Content Manager</title>
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</head>
<body>
  <!-- Include the script that builds the page and powers Decap CMS -->
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>`
    );
    
    // Create config.yml with both production and local development backends
    await fs.writeFile(
      path.join(projectDir, 'src', 'admin', 'config.yml'),
      `# Backend configuration
# For local development (default):
backend:
  name: proxy
  proxy_url: http://localhost:8081/api/v1
  branch: main # optional, defaults to master

# For production (Netlify), uncomment the following and comment out proxy:
# backend:
#   name: git-gateway
#   branch: main # Branch to update (optional; defaults to master)

# Publish mode for editorial workflow
publish_mode: editorial_workflow

# Media folder where uploads will go
media_folder: "src/assets/images/uploads"
public_folder: "/assets/images/uploads"

# Collections define the structure for content
collections:
  - name: "pages"
    label: "Pages"
    folder: "src/pages"
    create: true
    slug: "{{slug}}"
    fields:
      - {label: "Layout", name: "layout", widget: "hidden", default: "layouts/page.njk"}
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Body", name: "body", widget: "markdown"}
      - {label: "Featured Image", name: "featuredImage", widget: "image", required: false}
      - {label: "SEO Description", name: "seoDescription", widget: "text", required: false}
${config.projectType.includes('multilanguage') ? `
  # Multilanguage content
  - name: "pages_es"
    label: "Pages (Spanish)"
    folder: "src/es/pages"
    create: true
    slug: "{{slug}}"
    fields:
      - {label: "Layout", name: "layout", widget: "hidden", default: "layouts/page.njk"}
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Body", name: "body", widget: "markdown"}
      - {label: "Featured Image", name: "featuredImage", widget: "image", required: false}
      - {label: "SEO Description", name: "seoDescription", widget: "text", required: false}
      - {label: "Locale", name: "locale", widget: "hidden", default: "es"}
` : ''}`
    );
    
    // Create netlify.toml
    await fs.writeFile(
      path.join(projectDir, 'netlify.toml'),
      `[build]
  publish = "_site"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  
[dev]
  command = "npm start"
  port = 8080
  publish = "_site"`
    );
    
    // Update package.json to include Decap CMS
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = await fs.readJSON(packageJsonPath);
    
    packageJson.dependencies = {
      ...packageJson.dependencies,
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
      'decap-cms': '^3.0.0'
    };
    
    // Add decap-server for local development
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
      'decap-server': '^3.3.1',
      'concurrently': '^8.2.0'
    };
    
    // Add scripts for local CMS development
    packageJson.scripts = {
      ...packageJson.scripts,
      'cms:proxy': 'decap-server',
      'dev:cms': 'concurrently "npm run start" "npm run cms:proxy"'
    };
    
    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
    
    // Update .eleventy.js to include admin folder
    const eleventyPath = path.join(projectDir, '.eleventy.js');
    let eleventyContent = await fs.readFile(eleventyPath, 'utf8');
    
    if (!eleventyContent.includes('addPassthroughCopy("src/admin")')) {
      eleventyContent = eleventyContent.replace(
        'eleventyConfig.addPassthroughCopy("src/assets");',
        'eleventyConfig.addPassthroughCopy("src/assets");\n  eleventyConfig.addPassthroughCopy("src/admin");'
      );
      
      await fs.writeFile(eleventyPath, eleventyContent);
    }
    
    // Create pages directory for CMS content
    await fs.ensureDir(path.join(projectDir, 'src', 'pages'));
    
    // Create a sample page
    await fs.writeFile(
      path.join(projectDir, 'src', 'pages', 'sample-page.md'),
      `---
layout: layouts/page.njk
title: Sample CMS Page
---
# Sample CMS Page

This is a sample page created with Decap CMS. You can edit this content through the admin interface.

## Features

- Easy content editing
- Markdown support
- Image uploads
- And more!
`
    );
    
    // Create page layout
    await fs.ensureDir(path.join(projectDir, 'src', '_includes', 'layouts'));
    await fs.writeFile(
      path.join(projectDir, 'src', '_includes', 'layouts', 'page.njk'),
      `---
layout: layouts/base.njk
---

<div class="container mx-auto px-4 py-12">
  <h1 class="text-4xl font-bold mb-6">{{ title }}</h1>
  
  <div class="prose max-w-none">
    {{ content | safe }}
  </div>
</div>`
    );
    
    // Add Netlify Identity script to base layout
    const baseLayoutPath = path.join(projectDir, 'src', '_includes', 'layouts', 'base.njk');
    if (fs.existsSync(baseLayoutPath)) {
      let baseLayoutContent = await fs.readFile(baseLayoutPath, 'utf8');
      
      if (!baseLayoutContent.includes('netlify-identity-widget.js')) {
        baseLayoutContent = baseLayoutContent.replace(
          '</head>',
          '  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>\n</head>'
        );
        
        baseLayoutContent = baseLayoutContent.replace(
          '</body>',
          '  <script>\n' +
          '    if (window.netlifyIdentity) {\n' +
          '      window.netlifyIdentity.on("init", user => {\n' +
          '        if (!user) {\n' +
          '          window.netlifyIdentity.on("login", () => {\n' +
          '            document.location.href = "/admin/";\n' +
          '          });\n' +
          '        }\n' +
          '      });\n' +
          '    }\n' +
          '  </script>\n' +
          '</body>'
        );
        
        await fs.writeFile(baseLayoutPath, baseLayoutContent);
      }
    }
    
    console.log(chalk.green('\n✅ Decap CMS integration added successfully!'));
    console.log(chalk.yellow('\nRun the next step to add dynamic resources.'));
    
  } catch (error) {
    console.error('Error adding CMS integration:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  addCmsIntegration();
}

module.exports = { addCmsIntegration };