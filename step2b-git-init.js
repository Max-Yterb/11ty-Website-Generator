#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { execSync } = require('child_process');

// Banner
console.log(chalk.cyan.bold(`11ty Website Generator`));
console.log(chalk.cyan('Step 2b: Initializing Git Repository\n'));

/**
 * Initializes a Git repository in the project directory
 */
async function initializeGitRepository(config) {
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

    // Use parent directory to match step2 behavior
    const projectDir = path.join(process.cwd(), config.projectName);
    
    // Check if project directory exists
    if (!fs.existsSync(projectDir)) {
      throw new Error(
        'Project directory not found. Please run step 2 first.'
      );
    }

    console.log('Initializing Git repository...');
    
    // Store original directory to return to it later
    const originalDir = process.cwd();
    
    // Change to project directory and initialize Git
    process.chdir(projectDir);
    
    // Initialize Git repository with main branch
    try {
      execSync('git init -b main', { stdio: 'inherit' });
    } catch (error) {
      // Fallback for older Git versions
      execSync('git init', { stdio: 'inherit' });
      try {
        execSync('git checkout -b main', { stdio: 'inherit' });
      } catch (branchError) {
        // If main branch already exists or checkout fails, continue
        console.log(chalk.yellow('Using existing branch configuration'));
      }
    }
    
    console.log('Adding files to Git...');
    execSync('git add .', { stdio: 'inherit' });
    
    console.log('Creating initial commit...');
    execSync('git commit -m "Initial commit"', { stdio: 'inherit' });
    
    // Change back to original directory
    process.chdir(originalDir);
    
    console.log(chalk.green('\n✅ Git repository initialized successfully!'));
    console.log(chalk.cyan('Repository created with main branch and initial commit.'));
    
    return projectDir;
  } catch (error) {
    console.error(chalk.red('Error initializing Git repository:'), error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  initializeGitRepository();
}

module.exports = { initializeGitRepository };