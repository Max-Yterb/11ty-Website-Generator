#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Banner
console.log(chalk.cyan.bold(`11ty Website Generator`));
console.log(chalk.cyan('Step 5: Adding Decap CMS Integration\n'));

/**
 * Updates README with comprehensive CMS instructions
 */
async function updateReadmeWithCmsInstructions(projectDir, config) {
  const readmePath = path.join(projectDir, 'README.md');
  let readmeContent = await fs.readFile(readmePath, 'utf8');

  // Find and replace the CMS section
  const cmsSection = `## 📝 Content Management (Decap CMS)

This project includes Decap CMS for easy content management.

### For Production (Netlify):

1. **Deploy to Netlify** and enable Git Gateway
2. **Enable Netlify Identity** in your site settings
3. **Access the CMS** at \`https://yoursite.netlify.app/admin/\`

### For Local Development:

1. **Install dependencies** (already included):
   \`\`\`bash
   npm install
   \`\`\`

2. **Start the development server with CMS proxy:**
   \`\`\`bash
   npm run dev:cms
   \`\`\`
   
   Or run separately:
   \`\`\`bash
   # Terminal 1: Start the site
   npm start
   
   # Terminal 2: Start the CMS proxy
   npm run cms:proxy
   \`\`\`

3. **Access the local CMS** at \`http://localhost:8080/admin/\`

### CMS Configuration

- **Config file:** \`src/admin/config.yml\`
- **Collections:** ${config.dynamicResources && config.dynamicResources.length > 0 ? config.dynamicResources.join(', ') : 'Dynamic Content'}
- **Media folder:** \`src/assets/images/uploads\`

### Switching Between Local and Production

The CMS configuration is set up for local development by default. To switch:

**For local development (default):**
\`\`\`yaml
backend:
  name: proxy
  proxy_url: http://localhost:8081/api/v1
  branch: main
\`\`\`

**For production (uncomment in config.yml):**
\`\`\`yaml
backend:
  name: git-gateway
  branch: main
publish_mode: editorial_workflow  # Enable draft/review workflow
\`\`\`

### Publish Modes

**Simple Mode (Local Development):**
- Content is published immediately
- No draft or review workflow
- Works with proxy backend

**Editorial Workflow (Production):**
- Draft → Review → Publish workflow
- Requires Git Gateway backend
- Creates pull requests for content changes

### Troubleshooting

- **API Error 404**: Make sure the CMS proxy server is running (\`npm run cms:proxy\`)
- **Cannot access /admin**: Ensure the development server is running (\`npm start\`)
- **Authentication issues**: Check Netlify Identity settings for production
- **API_ERROR: Unknown action unpublishedEntries**: Switch to \`publish_mode: simple\` for local development
`;

  // Replace the existing CMS section or add it after the main description
  if (readmeContent.includes('## 📝 Content Management')) {
    readmeContent = readmeContent.replace(
      /## 📝 Content Management[\s\S]*?(?=\n## |$)/,
      cmsSection
    );
  } else {
    // Find a good place to insert the CMS section
    const insertAfter = readmeContent.indexOf('## 🎨 Customization');
    if (insertAfter !== -1) {
      readmeContent = readmeContent.slice(0, insertAfter) + cmsSection + '\n\n' + readmeContent.slice(insertAfter);
    } else {
      readmeContent += '\n\n' + cmsSection;
    }
  }

  await fs.writeFile(readmePath, readmeContent);
}

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

    // Use parent directory to match step2 behavior
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
    let configContent = `# Backend configuration
# For local development (default):
backend:
  name: proxy
  proxy_url: http://localhost:8081/api/v1
  branch: main # optional, defaults to master

# For production (Netlify), uncomment the following and comment out proxy:
# backend:
#   name: git-gateway
#   branch: main # Branch to update (optional; defaults to master)

# Publish mode - use simple for local development, editorial_workflow for production
# For local development with proxy backend:
publish_mode: simple

# For production with Git Gateway, use:
# publish_mode: editorial_workflow

# Media folder where uploads will go
media_folder: "src/assets/images/uploads"
public_folder: "/assets/images/uploads"

# Site URL (required for proper API functionality)
site_url: "http://localhost:8080"

# Collections define the structure for content
collections:`;

    // Generate collections based on selected dynamic resources
    const resourceConfigs = {
      'Services': {
        name: 'services',
        label: 'Services',
        folder: 'src/services',
        layout: 'layouts/service.njk',
        slug: '{{slug}}',
        fields: [
          {label: 'Layout', name: 'layout', widget: 'hidden', default: 'layouts/service.njk'},
          {label: 'Title', name: 'title', widget: 'string'},
          {label: 'Description', name: 'description', widget: 'text'},
          {label: 'Body', name: 'body', widget: 'markdown'},
          {label: 'Featured Image', name: 'featuredImage', widget: 'image', required: false},
          {label: 'Price', name: 'price', widget: 'string', required: false},
          {label: 'SEO Description', name: 'seoDescription', widget: 'text', required: false}
        ]
      },
      'News/Blog': {
        name: 'blog',
        label: 'Blog Posts',
        folder: 'src/blog',
        layout: 'layouts/post.njk',
        slug: '{{year}}-{{month}}-{{day}}-{{slug}}',
        fields: [
          {label: 'Layout', name: 'layout', widget: 'hidden', default: 'layouts/post.njk'},
          {label: 'Title', name: 'title', widget: 'string'},
          {label: 'Date', name: 'date', widget: 'datetime'},
          {label: 'Author', name: 'author', widget: 'string'},
          {label: 'Body', name: 'body', widget: 'markdown'},
          {label: 'Featured Image', name: 'featuredImage', widget: 'image', required: false},
          {label: 'Tags', name: 'tags', widget: 'list', required: false},
          {label: 'SEO Description', name: 'seoDescription', widget: 'text', required: false}
        ]
      },
      'Properties': {
        name: 'properties',
        label: 'Properties',
        folder: 'src/properties',
        layout: 'layouts/property.njk',
        slug: '{{slug}}',
        fields: [
          {label: 'Layout', name: 'layout', widget: 'hidden', default: 'layouts/property.njk'},
          {label: 'Title', name: 'title', widget: 'string'},
          {label: 'Price', name: 'price', widget: 'string'},
          {label: 'Location', name: 'location', widget: 'string'},
          {label: 'Property Type', name: 'propertyType', widget: 'select', options: ['House', 'Apartment', 'Condo', 'Townhouse', 'Commercial']},
          {label: 'Bedrooms', name: 'bedrooms', widget: 'number', required: false},
          {label: 'Bathrooms', name: 'bathrooms', widget: 'number', required: false},
          {label: 'Square Feet', name: 'squareFeet', widget: 'number', required: false},
          {label: 'Body', name: 'body', widget: 'markdown'},
          {label: 'Featured Image', name: 'featuredImage', widget: 'image', required: false},
          {label: 'Gallery', name: 'gallery', widget: 'list', field: {label: 'Image', name: 'image', widget: 'image'}, required: false},
          {label: 'SEO Description', name: 'seoDescription', widget: 'text', required: false}
        ]
      },
      'Portfolio': {
        name: 'portfolio',
        label: 'Portfolio',
        folder: 'src/portfolio',
        layout: 'layouts/portfolio.njk',
        slug: '{{slug}}',
        fields: [
          {label: 'Layout', name: 'layout', widget: 'hidden', default: 'layouts/portfolio.njk'},
          {label: 'Title', name: 'title', widget: 'string'},
          {label: 'Client', name: 'client', widget: 'string'},
          {label: 'Project Type', name: 'projectType', widget: 'string'},
          {label: 'Date', name: 'date', widget: 'datetime'},
          {label: 'Body', name: 'body', widget: 'markdown'},
          {label: 'Featured Image', name: 'featuredImage', widget: 'image', required: false},
          {label: 'Gallery', name: 'gallery', widget: 'list', field: {label: 'Image', name: 'image', widget: 'image'}, required: false},
          {label: 'Technologies', name: 'technologies', widget: 'list', required: false},
          {label: 'Project URL', name: 'projectUrl', widget: 'string', required: false},
          {label: 'SEO Description', name: 'seoDescription', widget: 'text', required: false}
        ]
      },
      'Products': {
        name: 'products',
        label: 'Products',
        folder: 'src/products',
        layout: 'layouts/product.njk',
        slug: '{{slug}}',
        fields: [
          {label: 'Layout', name: 'layout', widget: 'hidden', default: 'layouts/product.njk'},
          {label: 'Title', name: 'title', widget: 'string'},
          {label: 'Price', name: 'price', widget: 'string'},
          {label: 'Category', name: 'category', widget: 'string'},
          {label: 'SKU', name: 'sku', widget: 'string', required: false},
          {label: 'Body', name: 'body', widget: 'markdown'},
          {label: 'Featured Image', name: 'featuredImage', widget: 'image', required: false},
          {label: 'Gallery', name: 'gallery', widget: 'list', field: {label: 'Image', name: 'image', widget: 'image'}, required: false},
          {label: 'Specifications', name: 'specifications', widget: 'list', fields: [{label: 'Name', name: 'name', widget: 'string'}, {label: 'Value', name: 'value', widget: 'string'}], required: false},
          {label: 'In Stock', name: 'inStock', widget: 'boolean', default: true},
          {label: 'SEO Description', name: 'seoDescription', widget: 'text', required: false}
        ]
      }
    };

    // Add collections for each selected resource
    if (config.dynamicResources && Array.isArray(config.dynamicResources)) {
      for (const resource of config.dynamicResources) {
      const resourceConfig = resourceConfigs[resource];
      if (resourceConfig) {
        configContent += `
  - name: "${resourceConfig.name}"
    label: "${resourceConfig.label}"
    folder: "${resourceConfig.folder}"
    create: true
    slug: "${resourceConfig.slug}"
    fields:`;

        for (const field of resourceConfig.fields) {
          if (field.widget === 'hidden') {
            configContent += `
      - {label: "${field.label}", name: "${field.name}", widget: "${field.widget}", default: "${field.default}"}`;
          } else if (field.widget === 'select') {
            configContent += `
      - {label: "${field.label}", name: "${field.name}", widget: "${field.widget}", options: [${field.options.map(opt => `"${opt}"`).join(', ')}]${field.required === false ? ', required: false' : ''}}`;
          } else if (field.widget === 'list' && field.field) {
            configContent += `
      - {label: "${field.label}", name: "${field.name}", widget: "${field.widget}", field: {label: "${field.field.label}", name: "${field.field.name}", widget: "${field.field.widget}"}${field.required === false ? ', required: false' : ''}}`;
          } else if (field.widget === 'list' && field.fields) {
            configContent += `
      - {label: "${field.label}", name: "${field.name}", widget: "${field.widget}", fields: [${field.fields.map(f => `{label: "${f.label}", name: "${f.name}", widget: "${f.widget}"}`).join(', ')}]${field.required === false ? ', required: false' : ''}}`;
          } else {
            configContent += `
      - {label: "${field.label}", name: "${field.name}", widget: "${field.widget}"${field.default !== undefined ? `, default: ${typeof field.default === 'boolean' ? field.default : `"${field.default}"`}` : ''}${field.required === false ? ', required: false' : ''}}`;
          }
        }
      }
    }
    }

    // Add multilanguage collections if needed
    if (config.projectType.includes('multilanguage') && config.dynamicResources && Array.isArray(config.dynamicResources)) {
      const otherLanguages = config.languages.filter(lang => lang !== 'English');

      for (const resource of config.dynamicResources) {
        const resourceConfig = resourceConfigs[resource];
        if (resourceConfig) {
          for (const lang of otherLanguages) {
            const langCode = lang === 'Spanish' ? 'es' : lang.toLowerCase();
            const langName = lang === 'Spanish' ? 'Spanish' : lang;

            configContent += `
  - name: "${resourceConfig.name}_${langCode}"
    label: "${resourceConfig.label} (${langName})"
    folder: "src/${langCode}/${resourceConfig.name}"
    create: true
    slug: "${resourceConfig.slug}"
    fields:`;

            for (const field of resourceConfig.fields) {
               if (field.widget === 'hidden') {
                 configContent += `
      - {label: "${field.label}", name: "${field.name}", widget: "${field.widget}", default: "${field.default}"}`;
               } else if (field.widget === 'select') {
                 configContent += `
      - {label: "${field.label}", name: "${field.name}", widget: "${field.widget}", options: [${field.options.map(opt => `"${opt}"`).join(', ')}]${field.required === false ? ', required: false' : ''}}`;
               } else if (field.widget === 'list' && field.field) {
                 configContent += `
      - {label: "${field.label}", name: "${field.name}", widget: "${field.widget}", field: {label: "${field.field.label}", name: "${field.field.name}", widget: "${field.field.widget}"}${field.required === false ? ', required: false' : ''}}`;
               } else if (field.widget === 'list' && field.fields) {
                 configContent += `
      - {label: "${field.label}", name: "${field.name}", widget: "${field.widget}", fields: [${field.fields.map(f => `{label: "${f.label}", name: "${f.name}", widget: "${f.widget}"}`).join(', ')}]${field.required === false ? ', required: false' : ''}}`;
               } else {
                 configContent += `
      - {label: "${field.label}", name: "${field.name}", widget: "${field.widget}"${field.default !== undefined ? `, default: ${typeof field.default === 'boolean' ? field.default : `"${field.default}"`}` : ''}${field.required === false ? ', required: false' : ''}}`;
               }
             }

            configContent += `
      - {label: "Locale", name: "locale", widget: "hidden", default: "${langCode}"}`;
          }
        }
      }
    }



    // Write the config.yml file
    await fs.writeFile(
      path.join(projectDir, 'src', 'admin', 'config.yml'),
      configContent
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

    // Create directories for selected CMS resources
    const resourceFolders = {
      'Services': 'services',
      'News/Blog': 'blog',
      'Properties': 'properties',
      'Portfolio': 'portfolio',
      'Products': 'products'
    };

    if (config.dynamicResources && Array.isArray(config.dynamicResources)) {
      for (const resource of config.dynamicResources) {
        const folderName = resourceFolders[resource];
        if (folderName) {
          await fs.ensureDir(path.join(projectDir, 'src', folderName));

          // Create multilanguage directories if needed
          if (config.projectType.includes('multilanguage')) {
            for (const lang of config.languages.filter(l => l !== 'English')) {
              const langCode = lang === 'Spanish' ? 'es' : lang.toLowerCase();
              await fs.ensureDir(path.join(projectDir, 'src', langCode, folderName));
            }
          }
        }
      }
    }

    // Create sample content for selected resources
    const sampleContent = {
      'Services': {
        filename: 'sample-service.md',
        content: `---
layout: layouts/service.njk
title: Web Development
description: Professional web development services
price: Contact for quote
---
# Web Development Services

We offer comprehensive web development services to help your business grow online.

## What We Offer

- Custom website development
- Responsive design
- Performance optimization
- SEO-friendly structure

Contact us today to discuss your project!
`
      },
      'News/Blog': {
        filename: 'sample-blog-post.md',
        content: `---
layout: layouts/post.njk
title: Welcome to Our Blog
date: 2024-01-01T00:00:00.000Z
author: Admin
tags: ["welcome", "blog"]
---
# Welcome to Our Blog

This is a sample blog post created with Decap CMS. You can edit this content through the admin interface.

## What You Can Do

- Write engaging blog posts
- Add images and media
- Organize with tags
- Schedule publications

Start creating amazing content!
`
      },
      'Properties': {
        filename: 'sample-property.md',
        content: `---
layout: layouts/property.njk
title: Modern Downtown Apartment
description: Beautiful 2-bedroom apartment in the heart of the city
price: $2,500/month
bedrooms: 2
bathrooms: 2
squareFeet: 1200
---
# Modern Downtown Apartment

Discover urban living at its finest in this stunning 2-bedroom apartment.

## Features

- Open floor plan
- Modern appliances
- City views
- Walking distance to amenities

Schedule a viewing today!
`
      },
      'Portfolio': {
        filename: 'sample-project.md',
        content: `---
layout: layouts/project.njk
title: E-commerce Website
description: Custom e-commerce solution for retail business
category: Web Development
technologies: ["React", "Node.js", "MongoDB"]
completionDate: 2024-01-01T00:00:00.000Z
---
# E-commerce Website Project

A comprehensive e-commerce solution built for a growing retail business.

## Project Overview

- Custom shopping cart functionality
- Payment gateway integration
- Inventory management system
- Mobile-responsive design

View the live project to see our work in action!
`
      },
      'Products': {
        filename: 'sample-product.md',
        content: `---
layout: layouts/product.njk
title: Premium Headphones
description: High-quality wireless headphones with noise cancellation
price: $299.99
category: Electronics
sku: HP-001
inStock: true
---
# Premium Headphones

Experience superior sound quality with our premium wireless headphones.

## Features

- Active noise cancellation
- 30-hour battery life
- Bluetooth 5.0 connectivity
- Comfortable over-ear design

Order now and enjoy free shipping!
`
      }
    };

    if (config.dynamicResources && Array.isArray(config.dynamicResources)) {
      for (const resource of config.dynamicResources) {
        const folderName = resourceFolders[resource];
        const sample = sampleContent[resource];

        if (folderName && sample) {
          await fs.writeFile(
            path.join(projectDir, 'src', folderName, sample.filename),
            sample.content
          );
        }
      }
    }

    // Create layout templates for selected resources
    await fs.ensureDir(path.join(projectDir, 'src', '_includes', 'layouts'));

    const layoutTemplates = {
      'Services': {
        filename: 'service.njk',
        content: `---
layout: layouts/base.njk
---

<div class="container mx-auto px-4 py-12">
  <header class="mb-8">
    <h1 class="text-4xl font-bold mb-4">{{ title }}</h1>
    {% if description %}
    <p class="text-xl text-gray-600 mb-4">{{ description }}</p>
    {% endif %}
    {% if price %}
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
      <span class="text-lg font-semibold text-blue-800">Price: {{ price }}</span>
    </div>
    {% endif %}
  </header>

  <div class="prose max-w-none">
    {{ content | safe }}
  </div>
</div>`
      },
      'News/Blog': {
        filename: 'post.njk',
        content: `---
layout: layouts/base.njk
---

<article class="container mx-auto px-4 py-12">
  <header class="mb-8">
    <h1 class="text-4xl font-bold mb-4">{{ title }}</h1>
    <div class="text-gray-600 mb-4">
      <time datetime="{{ date | date('YYYY-MM-DD') }}">{{ date | date('MMMM DD, YYYY') }}</time>
      {% if author %} • By {{ author }}{% endif %}
    </div>
    {% if tags %}
    <div class="flex flex-wrap gap-2">
      {% for tag in tags %}
      <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">{{ tag }}</span>
      {% endfor %}
    </div>
    {% endif %}
  </header>

  <div class="prose max-w-none">
    {{ content | safe }}
  </div>
</article>`
      },
      'Properties': {
        filename: 'property.njk',
        content: `---
layout: layouts/base.njk
---

<div class="container mx-auto px-4 py-12">
  <header class="mb-8">
    <h1 class="text-4xl font-bold mb-4">{{ title }}</h1>
    {% if description %}
    <p class="text-xl text-gray-600 mb-4">{{ description }}</p>
    {% endif %}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {% if price %}
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <span class="text-lg font-semibold text-green-800">{{ price }}</span>
      </div>
      {% endif %}
      {% if bedrooms %}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <span class="text-sm text-blue-600">Bedrooms:</span>
        <span class="text-lg font-semibold text-blue-800">{{ bedrooms }}</span>
      </div>
      {% endif %}
      {% if bathrooms %}
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <span class="text-sm text-purple-600">Bathrooms:</span>
        <span class="text-lg font-semibold text-purple-800">{{ bathrooms }}</span>
      </div>
      {% endif %}
    </div>
  </header>

  <div class="prose max-w-none">
    {{ content | safe }}
  </div>
</div>`
      },
      'Portfolio': {
        filename: 'project.njk',
        content: `---
layout: layouts/base.njk
---

<div class="container mx-auto px-4 py-12">
  <header class="mb-8">
    <h1 class="text-4xl font-bold mb-4">{{ title }}</h1>
    {% if description %}
    <p class="text-xl text-gray-600 mb-4">{{ description }}</p>
    {% endif %}
    <div class="flex flex-wrap gap-4 mb-6">
      {% if category %}
      <span class="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">{{ category }}</span>
      {% endif %}
      {% if technologies %}
        {% for tech in technologies %}
        <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">{{ tech }}</span>
        {% endfor %}
      {% endif %}
    </div>
    {% if completionDate %}
    <div class="text-gray-600 mb-4">
      <span class="font-medium">Completed:</span>
      <time datetime="{{ completionDate | date('YYYY-MM-DD') }}">{{ completionDate | date('MMMM DD, YYYY') }}</time>
    </div>
    {% endif %}
  </header>

  <div class="prose max-w-none">
    {{ content | safe }}
  </div>
</div>`
      },
      'Products': {
        filename: 'product.njk',
        content: `---
layout: layouts/base.njk
---

<div class="container mx-auto px-4 py-12">
  <header class="mb-8">
    <h1 class="text-4xl font-bold mb-4">{{ title }}</h1>
    {% if description %}
    <p class="text-xl text-gray-600 mb-4">{{ description }}</p>
    {% endif %}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {% if price %}
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <span class="text-sm text-green-600">Price:</span>
        <span class="text-lg font-semibold text-green-800 block">{{ price }}</span>
      </div>
      {% endif %}
      {% if category %}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <span class="text-sm text-blue-600">Category:</span>
        <span class="text-lg font-semibold text-blue-800 block">{{ category }}</span>
      </div>
      {% endif %}
      {% if sku %}
      <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <span class="text-sm text-purple-600">SKU:</span>
        <span class="text-lg font-semibold text-purple-800 block">{{ sku }}</span>
      </div>
      {% endif %}
      {% if inStock %}
      <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <span class="text-sm text-emerald-600">Status:</span>
        <span class="text-lg font-semibold text-emerald-800 block">In Stock</span>
      </div>
      {% endif %}
    </div>
  </header>

  <div class="prose max-w-none">
    {{ content | safe }}
  </div>
</div>`
      }
    };

    // Create layouts for selected resources
    if (config.dynamicResources && Array.isArray(config.dynamicResources)) {
      for (const resource of config.dynamicResources) {
        const layout = layoutTemplates[resource];
        if (layout) {
          await fs.writeFile(
            path.join(projectDir, 'src', '_includes', 'layouts', layout.filename),
            layout.content
          );
        }
      }
    }

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

    // Update README with CMS instructions
    console.log('Updating README with CMS instructions...');
    await updateReadmeWithCmsInstructions(projectDir, config);

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
