const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

async function addNetlifyDeployment() {
  console.log(chalk.blue('Adding Netlify deployment configuration...'));

  try {
    const configPath = path.join(process.cwd(), 'project-config.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('Project configuration not found. Please run step 1 first.');
    }
    const config = await fs.readJson(configPath);
    // Use parent directory to match step2 behavior
  const projectDir = path.join(process.cwd(), config.projectName);

    if (!fs.existsSync(projectDir)) {
        throw new Error('Project directory not found. Please run step 2 first.');
    }

    const netlifyConfig = `[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "functions"
`;

    await fs.writeFile(path.join(projectDir, 'netlify.toml'), netlifyConfig);

    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.scripts.build = 'eleventy';
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });

    console.log(chalk.green('✅ Netlify deployment configuration added successfully!'));
  } catch (error) {
    console.error(chalk.red('Error adding Netlify deployment configuration:'), error);
    throw error;
  }
}

module.exports = { addNetlifyDeployment };