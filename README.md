# 11ty Website Generator

[![npm version](https://badge.fury.io/js/11ty-website-generator.svg)](https://badge.fury.io/js/11ty-website-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful CLI tool to generate modern 11ty websites with Tailwind CSS, Alpine.js, and optional CMS integration.

## ✨ Features

- **🚀 11ty Static Site Generator**: Fast, flexible, and powerful
- **🎨 Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **⚡ Alpine.js**: Lightweight JavaScript framework for interactive components
- **📝 Decap CMS**: Git-based CMS for easy content management
- **🌍 Multi-language Support**: Generate sites with content in multiple languages
- **📱 Responsive Design**: Mobile-first, responsive layouts out of the box
- **🔧 Dynamic Content**: Add blogs, portfolios, services, and more
- **🚀 Netlify Ready**: Pre-configured for easy deployment to Netlify
- **⚙️ Automated Setup**: Handles all setup and configuration automatically

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🚀 Quick Start

### Global Installation (Recommended)

```bash
npm install -g 11ty-website-generator
create-11ty-site
```

### One-time Use (npx)

```bash
npx 11ty-website-generator
```

> **📦 Now Available on NPM!** 
> The package is published as `11ty-website-generator@2.0.0` and ready for global installation.

### Local Development

1. Clone the repository:

   ```bash
   git clone https://github.com/Max-Yterb/11ty-Website-Generator.git
   cd 11ty-Website-Generator
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the generator:
   ```bash
   node main.js
   ```

## 🎯 Usage

The generator will prompt you for:

- **Project Name**: Name of your new website project
- **Project Type**: Choose from Basic, Multilanguage, CMS, or Multilanguage + CMS
- **Languages**: Select additional languages for multilanguage sites
- **Dynamic Resources**: Add blogs, portfolios, services, properties, or products
- **Author Information**: Your name and details

## 📁 Generated Project Structure

```
.
├── .eleventy.js
├── .gitignore
├── package.json
├── netlify.toml
├── tailwind.config.js
└── src/
    ├── _data/
    │   └── site.json
    ├── _includes/
    │   ├── layouts/
    │   └── partials/
    ├── admin/
    │   ├── config.yml
    │   └── index.html
    ├── assets/
    │   ├── css/
    │   └── js/
    └── (language codes)/
        ├── about.md
        ├── contact.md
        ├── index.md
        └── services.md
```

## 🛠️ Development Scripts

After generating a project, use these commands:

```bash
# Start development server
npm start

# Start with CMS proxy (for CMS projects)
npm run dev:cms

# Build for production
npm run build

# Run tests
npm test
```

## 🌍 Multilanguage Support

For multilanguage projects:

- Content is organized in language-specific folders (`/en`, `/es`, `/it`)
- Automatic language switching in navigation
- SEO-friendly URLs for each language
- Centralized translation management

## 📝 CMS Integration

Decap CMS integration includes:

- **Local Development**: Proxy backend for local editing
- **Production**: Git Gateway integration with Netlify
- **Content Types**: Automatic configuration for your selected resources
- **Media Management**: Image uploads and organization
- **Editorial Workflow**: Draft, review, and publish content

## 🚀 Deployment

### Netlify (Recommended)

1. Push your project to GitHub
2. Connect your repository to Netlify
3. Build settings are pre-configured in `netlify.toml`
4. Enable Netlify Identity for CMS projects

### Other Platforms

The generated sites work on any static hosting platform:

- Vercel
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## 📄 License

MIT © [Massimiliano Bertinetti](mailto:max.yterb@gmail.com)

## 🆘 Support

- 📖 [Documentation](https://github.com/Max-Yterb/11ty-Website-Generator/wiki)
- 🐛 [Report Issues](https://github.com/Max-Yterb/11ty-Website-Generator/issues)
- 💬 [Discussions](https://github.com/Max-Yterb/11ty-Website-Generator/discussions)

---

**Made with ❤️ by [Massimiliano Bertinetti](https://github.com/Max-Yterb)**
