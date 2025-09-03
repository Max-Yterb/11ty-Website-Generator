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
    if (
      !config.projectType.includes('multilanguage') ||
      !config.languages ||
      config.languages.length === 0
    ) {
      console.log(chalk.yellow('This is not a multilanguage project. Skipping this step.'));
      return;
    }

    const projectDir = path.join(process.cwd(), config.projectName);

    if (!fs.existsSync(projectDir)) {
      throw new Error('Project directory not found. Please run step 2 first.');
    }

    console.log('Setting up multilanguage structure...');

    const languageMap = {
      English: 'en',
      Spanish: 'es',
      Italian: 'it'
    };

    const languageCodes = ['en', ...config.languages.map(lang => languageMap[lang]).filter(Boolean)];

    const translations = {
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
      },
      it: {
        home: "Home",
        about: "Chi Siamo",
        services: "Servizi",
        contact: "Contatti",
        welcome: "Benvenuto in",
        description: "Questo è un sito web multilingue creato con 11ty Website Generator."
      }
    };

    // Create language data file
    console.log('Creating i18n data file...');
    const i18nContent = `module.exports = {
  defaultLocale: "en",
  locales: {
    ${languageCodes.map(lang => `"${lang}": "${lang}"`).join(',\n    ')}
  },
  translations: ${JSON.stringify(translations, null, 2)}
};`;
    await fs.writeFile(
      path.join(projectDir, 'src', '_data', 'i18n.js'),
      i18nContent
    );

    // Update .eleventy.js for multilanguage support
    await fs.writeFile(
      path.join(projectDir, '.eleventy.js'),
      `const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addShortcode("year", () => \`\${new Date().getFullYear()}\`);
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
    
    console.log('Creating language directories...');

    // Add language switcher to header
    const headerPath = path.join(
      projectDir,
      'src',
      '_includes',
      'partials',
      'header.njk'
    );
    let headerContent = await fs.readFile(headerPath, 'utf-8');

    // Check if the language switcher already exists
    if (!headerContent.includes('id="language-switcher"')) {
      const languageSwitcher = `
          <div id="language-switcher">
            <ul>
              ${languageCodes
                .map(
                  (lang) => `
                <li>
                  <a href="/${lang}/">
                    <img src="/assets/images/flags/${lang}.svg" alt="${lang}" />
                  </a>
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
        `;
      headerContent = headerContent.replace(
        '</nav>',
        `${languageSwitcher}</nav>`
      );
      await fs.writeFile(headerPath, headerContent);
    }

    // Create language-specific directories and pages
    for (const lang of languageCodes) {
      if (lang === 'en') continue;
      const langDir = path.join(projectDir, 'src', lang);
      await fs.ensureDir(langDir);

      // Create index page for each language
      const title = translations[lang]?.home || 'Home';

      await fs.writeFile(
        path.join(langDir, 'index.njk'),
        `---
layout: layouts/base.njk
title: ${title}
locale: ${lang}
---

<div class="container mx-auto px-4 py-12">
  <h1 class="text-4xl font-bold mb-6">{{ 'welcome' | t(locale) }} {{ site.name }}</h1>
  <p class="text-lg mb-8">{{ 'description' | t(locale) }}</p>
</div>`
      );
    }

    console.log(chalk.green('Multilanguage support added successfully!'));
  } catch (error) {
    console.error('Error adding multilanguage support:', error);
    throw error;
  }
}

module.exports = { addMultilanguageSupport };