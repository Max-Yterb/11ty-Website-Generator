#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs-extra');
const path = require('path');

// Banner
console.log(chalk.cyan.bold(`11ty Website Generator`));
console.log(chalk.cyan('Step 1: Project Configuration\n'));

// Project types
const PROJECT_TYPES = [
  '11ty with static content (Home, About, Services, Contacts)',
  '11ty with static content + multilanguage support',
  '11ty + Decap CMS with static and dynamic content',
  '11ty + Decap CMS with static and dynamic content + multilanguage'
];

/**
 * Collects and validates user input for project configuration
 * @returns {Promise<Object>} Project configuration
 */
async function getUserInput() {
  try {
    // Basic project information
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        validate: input => {
          if (input.trim() === '') return 'Project name is required';
          if (fs.existsSync(path.join(process.cwd(), input))) {
            return 'Directory already exists. Please choose another name.';
          }
          return true;
        }
      },
      {
        type: 'list',
        name: 'projectType',
        message: 'Select project type:',
        choices: PROJECT_TYPES
      }
    ]);
    
    // Additional questions based on project type
    if (answers.projectType.includes('CMS')) {
      const resources = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'dynamicResources',
          message: 'Select dynamic resources to include:',
          choices: ['Services', 'News/Blog', 'Properties', 'Portfolio', 'Products'],
          validate: input => input.length > 0 ? true : 'Select at least one dynamic resource'
        }
      ]);
      answers.dynamicResources = resources.dynamicResources;
    }
    
    // Language selection for multilanguage projects
    if (answers.projectType.includes('multilanguage')) {
      const langs = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'languages',
          message: 'Select languages to include (English is default):',
          choices: ['Spanish', 'French', 'Italian', 'German', 'Portuguese'],
          default: ['Spanish']
        }
      ]);
      answers.languages = ['English', ...langs.languages];
    }
    
    // Save configuration to file for next steps
    const configPath = path.join(process.cwd(), 'project-config.json');
    await fs.writeJSON(configPath, answers, { spaces: 2 });
    
    console.log(chalk.green('\n✅ Project configuration saved successfully!'));
    console.log(chalk.yellow('\nRun the next step to create the base project structure.'));
    
    return answers;
  } catch (error) {
    console.error(chalk.red('Error collecting user input:'), error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  getUserInput();
}

module.exports = { getUserInput };