#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Banner
console.log(chalk.cyan.bold(`11ty Website Generator`));
console.log(chalk.cyan('Step 3: Adding Static Pages\n'));

/**
 * Adds static pages to the project
 */
async function addStaticPages(config) {
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

    if (!fs.existsSync(projectDir)) {
      throw new Error('Project directory not found. Please run step 2 first.');
    }

    console.log('Creating header and footer partials...');

    // Create header partial
    await fs.writeFile(
      path.join(projectDir, 'src', '_includes', 'partials', 'header.njk'),
      `<header class="bg-gray-800 text-white">
  <div class="container mx-auto px-4 py-4">
    <div class="flex justify-between items-center">
      <a href="/" class="text-xl font-bold">{{ site.name }}</a>
      <nav>
        <ul class="flex space-x-4">
          <li><a href="/" class="hover:text-gray-300">Home</a></li>
          <li><a href="/about/" class="hover:text-gray-300">About</a></li>
          <li><a href="/services/" class="hover:text-gray-300">Services</a></li>
          <li><a href="/contact/" class="hover:text-gray-300">Contact</a></li>
        </ul>
      </nav>
    </div>
  </div>
</header>`
    );

    // Create footer partial
    await fs.writeFile(
      path.join(projectDir, 'src', '_includes', 'partials', 'footer.njk'),
      `<footer class="bg-gray-800 text-white py-6 mt-8">
  <div class="container mx-auto px-4">
    <div class="mt-6 pt-4 border-t border-gray-700 text-sm">
      <p>&copy; { year } {{ site.name }}. All rights reserved.</p>
    </div>
  </div>
</footer>`
    );

    console.log('Creating static pages...');

    const pages = [
      {
        path: 'index.njk',
        dir: '',
        title: 'Home',
        content: `<div class="container mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold mb-6">Welcome to {{ site.name }}</h1>
      <p class="text-lg mb-8">{{ site.description }}</p>
    </div>`,
      },
      {
        path: 'index.njk',
        dir: 'about',
        title: 'About Us',
        content: `<div class="container mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold mb-6">About Us</h1>
      <p class="text-lg mb-6">Welcome to {{ site.name }}. We are a dedicated team committed to excellence.</p>
    </div>`,
      },
      {
        path: 'index.njk',
        dir: 'services',
        title: 'Our Services',
        content: `<div class="container mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold mb-6">Our Services</h1>
      <p class="text-lg mb-8">We offer a range of professional services to meet your needs.</p>
    </div>`,
      },
      {
        path: 'index.njk',
        dir: 'contact',
        title: 'Contact Us',
        content: `<div class="container mx-auto px-4 py-12">
      <h1 class="text-4xl font-bold mb-6">Contact Us</h1>
      <p class="text-lg mb-8">We'd love to hear from you.</p>
    </div>`,
      },
    ];

    const createPage = async (filePath, title, content) => {
      const pageContent = `---\nlayout: layouts/base.njk\ntitle: ${title}\n---\n\n${content}`;
      await fs.writeFile(filePath, pageContent);
    };

    const createPagesForPath = async (basePath) => {
      for (const page of pages) {
        const dirPath = path.join(basePath, page.dir);
        if (page.dir) {
          await fs.ensureDir(dirPath);
        }
        await createPage(
          path.join(dirPath, page.path),
          page.title,
          page.content
        );
      }
    };

    if (
      config.projectType.includes('multilanguage') &&
      config.languages.length > 0
    ) {
      for (const lang of config.languages) {
        const langDir = path.join(projectDir, 'src', lang);
        await createPagesForPath(langDir);
      }
    } else {
      await createPagesForPath(path.join(projectDir, 'src'));
    }

    console.log(chalk.green('\n✅ Static pages created successfully!'));
    console.log(
      chalk.yellow(
        '\nRun the next step to add multilanguage support (if applicable).'
      )
    );
  } catch (error) {
    console.error('Error adding static pages:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  addStaticPages();
}

module.exports = { addStaticPages };
