#!/usr/bin/env node

const chalk = require('chalk');
const { getUserInput } = require('./step1-user-input');
const { createBaseProject } = require('./step2-base-project');
const { addStaticPages } = require('./step3-static-pages');
const { addMultilanguageSupport } = require('./step4-multilanguage');
const { addCmsIntegration } = require('./step5-cms');
const { addDynamicResources } = require('./step6-dynamic');

async function main() {
  try {
    console.log(chalk.cyan.bold('\n11ty Website Generator'));
    console.log(chalk.cyan('===================\n'));

    // Step 1: Get user input
    console.log(chalk.yellow('Step 1: Collecting user input...'));
    const config = await getUserInput();
    console.log(chalk.green('✓ User input collected\n'));

    // Step 2: Create base project
    console.log(chalk.yellow('Step 2: Creating base project...'));
    await createBaseProject(config);
    console.log(chalk.green('✓ Base project created\n'));

    // Step 3: Add static pages
    console.log(chalk.yellow('Step 3: Adding static pages...'));
    await addStaticPages(config);
    console.log(chalk.green('✓ Static pages added\n'));

    // Step 4: Add multilanguage support if selected
    if (config.projectType.includes('multilanguage')) {
      console.log(chalk.yellow('Step 4: Adding multilanguage support...'));
      await addMultilanguageSupport(config);
      console.log(chalk.green('✓ Multilanguage support added\n'));
    }

    // Step 5: Add CMS integration if selected
    if (config.projectType.includes('CMS')) {
      console.log(chalk.yellow('Step 5: Adding CMS integration...'));
      await addCmsIntegration(config);
      console.log(chalk.green('✓ CMS integration added\n'));
    }

    // Step 6: Add dynamic resources
    console.log(chalk.yellow('Step 6: Adding dynamic resources...'));
    await addDynamicResources(config);
    console.log(chalk.green('✓ Dynamic resources added\n'));

    console.log(chalk.green.bold('✨ Website generated successfully!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log('1. cd', config.projectName);
    console.log('2. npm install');
    console.log('3. npm start');
    console.log('\nYour website will be available at http://localhost:8080\n');

  } catch (error) {
    console.error(chalk.red('\nError generating website:'), error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main();
}

module.exports = { main };