const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

function validateYamlFile(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    yaml.load(fileContents);
    console.log(`✅ ${filePath} is valid YAML`);
    return true;
  } catch (error) {
    console.error(`❌ ${filePath} has YAML syntax errors:`);
    console.error(error.message);
    if (error.mark) {
      console.error(`Line ${error.mark.line + 1}, Column ${error.mark.column + 1}`);
    }
    return false;
  }
}

// Validate the GitHub Pages workflow
const workflowPath = path.join(__dirname, '.github', 'workflows', 'pages.yml');
validateYamlFile(workflowPath);