#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Banner
console.log(chalk.cyan.bold(`11ty Website Generator`));
console.log(chalk.cyan('Step 2: Creating Base 11ty Project\n'));

/**
 * Creates the base 11ty project structure with Tailwind CSS and Alpine.js
 */
async function createBaseProject(config) {
  try {
    // Load config if not provided
    if (!config) {
      const configPath = path.join(process.cwd(), 'project-config.json');
      if (!fs.existsSync(configPath)) {
        throw new Error(
          'Project configuration not found. Please run step 1 first.'
        );
      }
      config = await fs.readJSON(configPath);
    }

    const projectDir = path.join(process.cwd(), config.projectName);
    console.log('Creating project directories...');

    // Create project directory
    await fs.ensureDir(projectDir);

    // Create basic structure
    await fs.ensureDir(path.join(projectDir, 'src'));
    await fs.ensureDir(path.join(projectDir, 'src', '_includes'));
    await fs.ensureDir(path.join(projectDir, 'src', '_includes', 'layouts'));
    await fs.ensureDir(path.join(projectDir, 'src', '_includes', 'partials'));
    await fs.ensureDir(path.join(projectDir, 'src', '_data'));
    await fs.ensureDir(path.join(projectDir, 'src', 'assets'));
    await fs.ensureDir(path.join(projectDir, 'src', 'assets', 'css'));
    await fs.ensureDir(path.join(projectDir, 'src', 'assets', 'js'));

    console.log('Creating package.json...');

    // Create package.json
    const packageJson = {
      name: config.projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: 'Website created with 11ty Website Generator',
      scripts: {
        start: 'eleventy --serve',
        build: 'eleventy',
      },
      dependencies: {
        '@11ty/eleventy': '2.0.1',
        'alpinejs': '3.13.3',
        'tailwindcss': '3.3.5',
        '@11ty/eleventy-navigation': '0.3.5'
      },
    };

    await fs.writeJSON(path.join(projectDir, 'package.json'), packageJson, {
      spaces: 2,
    });

    console.log('Creating configuration files...');

    // Create .eleventy.js
    await fs.writeFile(
      path.join(projectDir, '.eleventy.js'),
      `const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addShortcode("year", () => \`\${new Date().getFullYear()}\`);
  eleventyConfig.addPassthroughCopy("src/assets");

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    }
  };
};`
    );

    // Create tailwind.config.js
    await fs.writeFile(
      path.join(projectDir, 'tailwind.config.js'),
      `module.exports = {
        content: ["./src/**/*.{html,njk,js}"],
        theme: {
          extend: {},
        },
        plugins: [],
      }`
    );

    console.log('Creating base layout...');

    // Create base layout
    await fs.writeFile(
      path.join(projectDir, 'src', '_includes', 'layouts', 'base.njk'),
      `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ title }} | {{ site.name }}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body>
  {% include "partials/header.njk" %}

  <main>
    {{ content | safe }}
  </main>

  {% include "partials/footer.njk" %}
</body>
</html>`
    );

    // Create site data file
    await fs.writeFile(
      path.join(projectDir, 'src', '_data', 'site.js'),
      `module.exports = {
  name: "${config.projectName}",
  description: "Website created with 11ty Website Generator"
};`
    );

    // Create multilanguage structure if specified
    if (
      config.projectType.includes('multilanguage') &&
      config.languages.length > 0
    ) {
      console.log('Creating multilanguage structure...');
      for (const lang of config.languages) {
        await fs.ensureDir(path.join(projectDir, 'src', lang));
      }
    }

    // Create CMS configuration if specified
    if (config.projectType.includes('CMS')) {
      console.log('Creating CMS configuration...');
      const adminDir = path.join(projectDir, 'src', 'admin');
      await fs.ensureDir(adminDir);
      await fs.writeFile(
        path.join(adminDir, 'config.yml'),
        `backend:
  name: git-gateway
  branch: main # Branch to update (optional; defaults to master)

media_folder: "src/assets/images" # Media files will be stored in the repo under images/uploads

collections:
  - name: "pages"
    label: "Pages"
    files:
      - file: "src/_data/pages.json"
        label: "All Pages"
        name: "pages"
        fields:
          - { label: "Title", name: "title", widget: "string" }
          - { label: "Body", name: "body", widget: "markdown" }
`
      );
    }

    console.log(chalk.green('\n✅ Base 11ty project created successfully!'));
    console.log(chalk.yellow('\nRun the next step to add static pages.'));

    return projectDir;
  } catch (error) {
    console.error(chalk.red('Error creating base project:'), error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  createBaseProject();
}

module.exports = { createBaseProject };
