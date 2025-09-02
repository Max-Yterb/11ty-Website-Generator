#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Banner
console.log(chalk.cyan.bold(`11ty Website Generator`));
console.log(chalk.cyan('Step 4: Adding Multilanguage Support\n'));

/**
 * Adds multilanguage support to the project
 */
async function addMultilanguageSupport(config) {
  try {
    // Load config if not provided
    if (!config) {
      const configPath = path.join(process.cwd(), 'project-config.json');
      if (!fs.existsSync(configPath)) {
        throw new Error('Project configuration not found. Please run step 1 first.');
      }
      config = await fs.readJSON(configPath);
    }

    // Skip if not a multilanguage project
    if (!config.projectType.includes('multilanguage')) {
      console.log(chalk.yellow('This is not a multilanguage project. Skipping this step.'));
      return;
    }

    const projectDir = path.join(process.cwd(), config.projectName);
    
    if (!fs.existsSync(projectDir)) {
      throw new Error('Project directory not found. Please run step 2 first.');
    }
    
    console.log('Setting up multilanguage structure...');
    
    // Create language directories
    const languages = config.languages || ['English', 'Spanish'];
    const langCodes = {
      'English': 'en',
      'Spanish': 'es',
      'French': 'fr',
      'German': 'de',
      'Italian': 'it',
      'Portuguese': 'pt'
    };
    
    // Create language data file
    await fs.writeFile(
      path.join(projectDir, 'src', '_data', 'i18n.js'),
      `module.exports = {
  defaultLocale: "en",
  locales: {
    ${languages.map(lang => `"${langCodes[lang]}": "${lang}"`).join(',\n    ')}
  },
  translations: {
    en: {
      home: "Home",
      about: "About Us",
      services: "Services",
      contact: "Contact Us",
      welcome: "Welcome to",
      description: "This is a multilanguage website created with 11ty Website Generator."
    },
    es: {
      home: "Inicio",
      about: "Sobre Nosotros",
      services: "Servicios",
      contact: "Contacto",
      welcome: "Bienvenido a",
      description: "Este es un sitio web multilingüe creado con 11ty Website Generator."
    }
  }
};`
    );
    
    // Update .eleventy.js for multilanguage support
    await fs.writeFile(
      path.join(projectDir, '.eleventy.js'),
      `module.exports = function(eleventyConfig) {
  // Passthrough copy for assets
  eleventyConfig.addPassthroughCopy("src/assets");
  
  // Add language code to permalink
  eleventyConfig.addFilter("localizedUrl", function(url, locale) {
    const i18n = require('./src/_data/i18n.js');
    if (locale === i18n.defaultLocale) {
      return url;
    }
    return \`/\${locale}\${url}\`;
  });
  
  // Get translation
  eleventyConfig.addFilter("t", function(key, locale) {
    const i18n = require('./src/_data/i18n.js');
    const lang = locale || i18n.defaultLocale;
    return i18n.translations[lang][key] || key;
  });

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
    
    // Create language directories and pages for English
    await fs.writeFile(
      path.join(projectDir, 'src', 'index.njk'),
      `---
layout: layouts/base.njk
title: Home
locale: en
---

<div class="container mx-auto px-4 py-12">
  <h1 class="text-4xl font-bold mb-6">{{ 'welcome' | t(locale) }} {{ site.name }}</h1>
  <p class="text-lg mb-8">{{ 'description' | t(locale) }}</p>
</div>`
    );
    
    // Create Spanish version
    await fs.ensureDir(path.join(projectDir, 'src', 'es'));
    await fs.writeFile(
      path.join(projectDir, 'src', 'es', 'index.njk'),
      `---
layout: layouts/base.njk
title: Inicio
locale: es
---

<div class="container mx-auto px-4 py-12">
  <h1 class="text-4xl font-bold mb-6">{{ 'welcome' | t(locale) }} {{ site.name }}</h1>
  <p class="text-lg mb-8">{{ 'description' | t(locale) }}</p>
</div>`
    );
    
    console.log(chalk.green('\n✅ Multilanguage support added successfully!'));
    console.log(chalk.yellow('\nRun the next step to add CMS integration (if applicable).'));
    
  } catch (error) {
    console.error('Error adding multilanguage support:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  addMultilanguageSupport();
}

module.exports = { addMultilanguageSupport };