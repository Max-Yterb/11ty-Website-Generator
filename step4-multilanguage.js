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

    // Only include non-English languages from config.languages
    const languageCodes = config.languages
      .map(lang => languageMap[lang])
      .filter(Boolean);

    const translations = {
      en: {
        home: "Home",
        about: "About Us",
        services: "Services",
        contact: "Contact Us",
        welcome: "Welcome to",
        description: "This is a multilanguage website created with 11ty Website Generator.",
        rights_reserved: "All rights reserved."
      },
      es: {
        home: "Inicio",
        about: "Sobre Nosotros",
        services: "Servicios",
        contact: "Contacto",
        welcome: "Bienvenido a",
        description: "Este es un sitio web multilingüe creado con 11ty Website Generator.",
        rights_reserved: "Todos los derechos reservados."
      },
      it: {
        home: "Home",
        about: "Chi Siamo",
        services: "Servizi",
        contact: "Contatti",
        welcome: "Benvenuto in",
        description: "Questo è un sito web multilingue creato con 11ty Website Generator.",
        rights_reserved: "Tutti i diritti riservati."
      }
    };

    // Create language data file
    console.log('Creating i18n data file...');
    const i18nContent = `module.exports = {
  defaultLocale: "en",
  locales: {
    "en": "en",
    ${languageCodes.map(lang => `"${lang}": "${lang}"`).join(',\n    ')}
  },
  translations: ${JSON.stringify(translations, null, 2)}
};`;
    await fs.writeFile(
      path.join(projectDir, 'src', '_data', 'i18n.js'),
      i18nContent
    );

    // Create languages data file
    console.log('Creating languages data file...');
    const languageFullNames = {
        en: 'English',
        es: 'Español',
        it: 'Italiano'
    };

    const languageData = config.languages.map(lang => {
        const code = languageMap[lang];
        return { code, name: languageFullNames[code] };
    }).filter(Boolean);

    // ensure 'en' is first
    languageData.sort((a, b) => {
        if (a.code === 'en') return -1;
        if (b.code === 'en') return 1;
        return 0;
    });

    await fs.writeFile(
      path.join(projectDir, 'src', '_data', 'languages.js'),
      `module.exports = ${JSON.stringify(languageData, null, 2)};`
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

  eleventyConfig.addFilter("find", function(array, key, value) {
    return array.find(item => item[key] === value);
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

    // Copy flags from assets
    console.log('Copying flag images...');
    const flagsSrc = path.join(__dirname, 'assets', 'flags');
    const flagsDest = path.join(projectDir, 'src', 'assets', 'flags');
    await fs.copy(flagsSrc, flagsDest);

    // Add language switcher to header
    const headerPath = path.join(
      projectDir,
      'src',
      '_includes',
      'partials',
      'header.njk'
    );
    let headerContent = await fs.readFile(headerPath, 'utf-8');

    const languageSwitcher = `
<div x-data="{ open: false }" class="relative">
          <button @click="open = !open" class="flex items-center space-x-2">
            {% set currentLanguage = languages | find('code', locale) %}
            <img src="{{ ('/assets/flags/' + currentLanguage.code + '.svg') | url }}" alt="{{ currentLanguage.name }}" class="w-6 h-6">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
          <div x-show="open" @click.away="open = false" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
            <ul class="py-1">
              {% for lang in languages %}
                {% if lang.code != locale %}
                  <li>
                    <a href="{{ page.url | localizedUrl(lang.code) }}" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <img src="{{ ('/assets/flags/' + lang.code + '.svg') | url }}" alt="{{ lang.name }}" class="w-6 h-6 mr-2">
                      {{ lang.name }}
                    </a>
                  </li>
                {% endif %}
              {% endfor %}
            </ul>
          </div>
        </div>
`;

    const newHeaderContent = headerContent.replace(
      '</nav>',
      `        ${languageSwitcher.trim()}\n      </nav>`
    );

    await fs.writeFile(headerPath, newHeaderContent);

    // Create index page for English
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

    // Create language-specific directories and pages
    for (const lang of languageCodes) {
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