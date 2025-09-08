#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const { getUserInput } = require('./step1-user-input');
const { createBaseProject } = require('./step2-base-project');
const { initializeGitRepository } = require('./step2b-git-init');
const { addStaticPages } = require('./step3-static-pages');
const { addMultilanguageSupport } = require('./step4-multilanguage');
const { addCmsIntegration } = require('./step5-cms');
const { addDynamicResources } = require('./step6-dynamic');
const { addNetlifyDeployment } = require('./step7-netlify-deployment');

const steps = [
  {
    name: 'Collecting user input',
    action: getUserInput,
    isConfig: true,
  },
  {
    name: 'Creating base project',
    action: createBaseProject,
  },
  {
    name: 'Initializing Git repository',
    action: initializeGitRepository,
  },
  {
    name: 'Adding static pages',
    action: addStaticPages,
  },
  {
    name: 'Adding multilanguage support',
    action: addMultilanguageSupport,
    condition: (config) => config.projectType.includes('multilanguage'),
  },
  {
    name: 'Adding CMS integration',
    action: addCmsIntegration,
    condition: (config) => config.projectType.includes('CMS'),
  },
  {
    name: 'Adding dynamic resources',
    action: addDynamicResources,
  },
  {
    name: 'Adding Netlify deployment',
    action: addNetlifyDeployment,
  },
];

async function main() {
  let config;
  console.log(chalk.cyan.bold('\n11ty Website Generator'));
  console.log(chalk.cyan('===================\n'));

  try {
    for (const [index, step] of steps.entries()) {
      console.log(chalk.yellow(`Step ${index + 1}: ${step.name}...`));
      if (step.condition && !step.condition(config)) {
        console.log(chalk.gray(`Skipping step: ${step.name}`));
        continue;
      }
      
      if (step.isConfig) {
        config = await step.action();
      } else {
        await step.action(config);
      }
      console.log(chalk.green(`✓ ${step.name} completed\n`));
    }
    
    console.log(chalk.green.bold('\n✅ All steps completed successfully!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log(`1. cd ${config.projectName}`);
    console.log('2. npm install');
    
    // Show appropriate start command based on project type
    if (config.projectType.includes('CMS')) {
      console.log('3. npm run dev:cms');
      console.log('\nYour website will be available at http://localhost:8080');
      console.log('CMS admin will be available at http://localhost:8080/admin/\n');
    } else {
      console.log('3. npm start');
      console.log('\nYour website will be available at http://localhost:8080\n');
    }

  } catch (error) {
    console.error(chalk.red('\n❌ An error occurred during project generation:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };