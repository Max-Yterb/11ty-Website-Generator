# 11ty Website Generator

This is a command-line tool to generate a modern, feature-rich website using 11ty, Tailwind CSS, Alpine.js, and Decap CMS.

## Features

- **11ty Static Site Generator**: Fast, flexible, and powerful.
- **Tailwind CSS**: A utility-first CSS framework for rapid UI development.
- **Alpine.js**: A rugged, minimal framework for composing JavaScript behavior in your markup.
- **Decap CMS**: A git-based CMS for easy content management.
- **Multi-language Support**: Generate a site with content in multiple languages.
- **Dynamic Content**: Add dynamic resources like blogs, portfolios, or galleries.
- **Netlify Deployment**: Pre-configured for easy deployment to Netlify.
- **Automated Setup**: The script handles all the setup and configuration for you.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/Max-Yterb/Generator.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd Generator
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

## Usage

To run the generator, use the following command:

```bash
node main.js
```

Or, if you have installed it globally:

```bash
create-leadventor-site
```

The script will prompt you for the following information:

- **Project Name**: The name of your project.
- **Author**: Your name.
- **Default Language**: The default language for the site.
- **Other Languages**: A comma-separated list of other languages to support.
- **Dynamic Resources**: Select from a list of dynamic resources to add (e.g., Blog, Portfolio, Gallery).

The generator will then create a new directory with the specified project name and set up the entire project for you.

## Scripts

- `npm test`: Run the test suite.

## Project Structure

A generated project will have the following structure:

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