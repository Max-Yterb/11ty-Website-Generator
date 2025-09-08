#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Banner
console.log(chalk.cyan.bold(`11ty Website Generator`));
console.log(chalk.cyan('Step 2: Creating Base 11ty Project\n'));

/**
 * Creates README.md file based on project type
 */
async function createReadme(projectDir, config) {
  const isMultilanguage = config.projectType.includes('multilanguage');
  const isCMS = config.projectType.includes('CMS');
  
  let readmeContent = `# ${config.projectName}

Website created with 11ty Website Generator

${isCMS ? '' : '## 🚀 Quick Start\n\n1. **Install dependencies:**\n   \\`\\`\\`bash\n   npm install\n   \\`\\`\\`\n\n2. **Start development server:**\n   \\`\\`\\`bash\n   npm start\n   \\`\\`\\`\n\n   Your site will be available at \\`http://localhost:8080\\`\n\n3. **Build for production:**\n   \\`\\`\\`bash\n   npm run build\n   \\`\\`\\`\n\n'}## 📁 Project Structure

\`\`\`
${config.projectName}/
├── src/
│   ├── _data/           # Global data files
│   ├── _includes/       # Templates and partials
│   │   ├── layouts/     # Page layouts
│   │   └── partials/    # Reusable components
│   ├── assets/          # Static assets (CSS, JS, images)
${isMultilanguage ? '│   ├── en/              # English content\n│   ├── es/              # Spanish content (if applicable)\n│   ├── it/              # Italian content (if applicable)\n' : ''}${isCMS ? '│   ├── admin/           # Decap CMS configuration\n' : ''}${config.dynamicResources && config.dynamicResources.length > 0 ? config.dynamicResources.map(resource => {
    const folderName = resource === 'News/Blog' ? 'blog' : resource === 'Services' ? 'services' : resource === 'Properties' ? 'properties' : resource === 'Portfolio' ? 'portfolio' : resource === 'Products' ? 'products' : resource.toLowerCase();
    return `│   ├── ${folderName}/           # ${resource} content`;
  }).join('\n') + '\n' : ''}│   └── index.njk        # Homepage
├── _site/               # Generated site (do not edit)
├── .eleventy.js         # Eleventy configuration
├── package.json         # Dependencies and scripts
└── tailwind.config.js   # Tailwind CSS configuration
\`\`\`

## 🛠️ Technologies Used

- **[Eleventy](https://www.11ty.dev/)** - Static site generator
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Alpine.js](https://alpinejs.dev/)** - Lightweight JavaScript framework
- **[Nunjucks](https://mozilla.github.io/nunjucks/)** - Templating engine
`;

  if (isMultilanguage) {
    readmeContent += `
## 🌍 Multilanguage Support

This project supports multiple languages:
${config.languages ? config.languages.map(lang => `- ${lang.toUpperCase()}`).join('\n') : '- EN (English)\n- ES (Spanish)\n- IT (Italian)'}

### Adding Content

1. **Create language-specific pages** in \`src/{language}/\` folders
2. **Use the \`t\` filter** for translations: \`{{ 'key' | t(locale) }}\`
3. **Add translations** to \`src/_data/i18n.js\`

### Language Switching

The language switcher is available in the header. Users can switch between available languages seamlessly.
`;
  }

  if (isCMS) {
    readmeContent += `
## 📝 Content Management

This project includes Decap CMS integration. CMS setup and configuration will be completed in Step 5.
`;
  }

  readmeContent += `
## 🎨 Customization

### Styling

- **Tailwind CSS** classes can be used throughout your templates
- **Custom CSS** can be added to \`src/assets/css/\`
- **Tailwind configuration** is in \`tailwind.config.js\`

### JavaScript

- **Alpine.js** is available globally for interactive components
- **Custom JavaScript** can be added to \`src/assets/js/\`

### Templates

- **Layouts** are in \`src/_includes/layouts/\`
- **Partials** are in \`src/_includes/partials/\`
- **Data files** are in \`src/_data/\`

## 📚 Learn More

- [Eleventy Documentation](https://www.11ty.dev/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Alpine.js Documentation](https://alpinejs.dev/start-here)
- [Nunjucks Documentation](https://mozilla.github.io/nunjucks/templating.html)
${isCMS ? '- [Decap CMS Documentation](https://decapcms.org/docs/)\n' : ''}
## 🚀 Deployment

### Netlify (Recommended)

1. **Connect your repository** to Netlify
2. **Build settings:**
   - Build command: \`npm run build\`
   - Publish directory: \`_site\`
${isCMS ? '3. **Enable Git Gateway and Netlify Identity** for CMS access\n' : ''}
### Other Platforms

This is a static site that can be deployed to any static hosting service:
- Vercel
- GitHub Pages
- Surge.sh
- Firebase Hosting

---

*Generated with [11ty Website Generator](https://github.com/your-repo)*
`;

  await fs.writeFile(path.join(projectDir, 'README.md'), readmeContent);
}

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

    // Create project in current working directory
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

  // Add date filters using standard JavaScript
  eleventyConfig.addFilter("date", function(dateObj, format) {
    const date = new Date(dateObj);
    
    if (format === 'YYYY-MM-DD') {
      return date.getFullYear() + '-' + 
             String(date.getMonth() + 1).padStart(2, '0') + '-' + 
             String(date.getDate()).padStart(2, '0');
    }
    
    if (format === 'MMMM DD, YYYY') {
      const months = ['January', 'February', 'March', 'April', 'May', 'June',
                     'July', 'August', 'September', 'October', 'November', 'December'];
      return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
    }
    
    // Default format
    return date.toLocaleDateString();
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

    // CMS configuration will be handled by Step 5 if this is a CMS project
    // This ensures proper configuration with both local development and production backends

    // Create README.md
    console.log('Creating README.md...');
    await createReadme(projectDir, config);

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
