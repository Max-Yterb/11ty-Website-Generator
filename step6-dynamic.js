#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Banner
console.log(chalk.cyan.bold(`11ty Website Generator`));
console.log(chalk.cyan('Step 6: Adding Dynamic Resources\n'));

/**
 * Adds dynamic resources based on user selection
 */
async function addDynamicResources(config) {
  try {
    // Load config if not provided
    if (!config) {
      const configPath = path.join(process.cwd(), 'project-config.json');
      if (!fs.existsSync(configPath)) {
        throw new Error('Project configuration not found. Please run step 1 first.');
      }
      config = await fs.readJSON(configPath);
    }

    // Use parent directory to match step2 behavior
  const projectDir = path.join(process.cwd(), config.projectName);
    
    if (!fs.existsSync(projectDir)) {
      throw new Error('Project directory not found. Please run step 2 first.');
    }

    // Create dynamic resources directory
    const resourcesDir = path.join(projectDir, 'src', '_data', 'resources');
    await fs.ensureDir(resourcesDir);

    // Add dynamic resources based on project type
    if (config.projectType.includes('portfolio')) {
      await addPortfolioResources(resourcesDir);
    }
    
    if (config.projectType.includes('business')) {
      await addBusinessResources(resourcesDir);
    }
    
    if (config.projectType.includes('blog')) {
      await addBlogResources(resourcesDir);
    }

    // Update .eleventy.js to handle dynamic resources
    await updateEleventyConfig(projectDir);

    console.log(chalk.green('\n✅ Dynamic resources added successfully!'));
    console.log(chalk.yellow('\nYour website generator is now complete. Run the main script to generate your website.'));
    
  } catch (error) {
    console.error('Error adding dynamic resources:', error);
    throw error;
  }
}

/**
 * Adds portfolio-specific resources
 */
async function addPortfolioResources(resourcesDir) {
  await fs.writeJSON(path.join(resourcesDir, 'projects.json'), {
    items: [
      {
        title: "Sample Project 1",
        description: "A brief description of the project",
        image: "/assets/images/project1.jpg",
        technologies: ["HTML", "CSS", "JavaScript"],
        link: "https://example.com/project1"
      },
      {
        title: "Sample Project 2",
        description: "Another project description",
        image: "/assets/images/project2.jpg",
        technologies: ["React", "Node.js", "MongoDB"],
        link: "https://example.com/project2"
      }
    ]
  }, { spaces: 2 });

  await fs.writeJSON(path.join(resourcesDir, 'skills.json'), {
    categories: [
      {
        name: "Frontend",
        skills: ["HTML", "CSS", "JavaScript", "React", "Vue"]
      },
      {
        name: "Backend",
        skills: ["Node.js", "Python", "Java", "SQL"]
      }
    ]
  }, { spaces: 2 });
}

/**
 * Adds business-specific resources
 */
async function addBusinessResources(resourcesDir) {
  await fs.writeJSON(path.join(resourcesDir, 'services.json'), {
    items: [
      {
        title: "Service 1",
        description: "Description of service 1",
        icon: "code",
        features: ["Feature 1", "Feature 2", "Feature 3"]
      },
      {
        title: "Service 2",
        description: "Description of service 2",
        icon: "design",
        features: ["Feature 1", "Feature 2", "Feature 3"]
      }
    ]
  }, { spaces: 2 });

  await fs.writeJSON(path.join(resourcesDir, 'testimonials.json'), {
    items: [
      {
        name: "John Doe",
        position: "CEO, Company X",
        quote: "Great service and professional team!",
        image: "/assets/images/testimonial1.jpg"
      },
      {
        name: "Jane Smith",
        position: "CTO, Company Y",
        quote: "Exceeded our expectations!",
        image: "/assets/images/testimonial2.jpg"
      }
    ]
  }, { spaces: 2 });
}

/**
 * Adds blog-specific resources
 */
async function addBlogResources(resourcesDir) {
  await fs.writeJSON(path.join(resourcesDir, 'categories.json'), {
    items: [
      {
        name: "Technology",
        description: "Latest tech news and updates",
        slug: "technology"
      },
      {
        name: "Design",
        description: "UI/UX and graphic design",
        slug: "design"
      }
    ]
  }, { spaces: 2 });

  await fs.writeJSON(path.join(resourcesDir, 'authors.json'), {
    items: [
      {
        name: "John Writer",
        bio: "Tech enthusiast and blogger",
        image: "/assets/images/author1.jpg",
        social: {
          twitter: "johnwriter",
          github: "johnwriter"
        }
      },
      {
        name: "Jane Blogger",
        bio: "Design expert and consultant",
        image: "/assets/images/author2.jpg",
        social: {
          twitter: "janeblogger",
          github: "janeblogger"
        }
      }
    ]
  }, { spaces: 2 });
}

/**
 * Updates Eleventy configuration for dynamic resources
 */
async function updateEleventyConfig(projectDir) {
  const eleventyPath = path.join(projectDir, '.eleventy.js');
  let eleventyContent = await fs.readFile(eleventyPath, 'utf8');

  // Add collection for dynamic resources
  const collectionCode = `
  // Dynamic resource collections
  eleventyConfig.addCollection("dynamicResources", function(collection) {
    const resources = {};
    
    // Load all JSON files from _data/resources
    const resourcesPath = "./src/_data/resources/";
    if (fs.existsSync(resourcesPath)) {
      fs.readdirSync(resourcesPath).forEach(file => {
        if (file.endsWith('.json')) {
          const name = path.basename(file, '.json');
          resources[name] = require(path.join(resourcesPath, file));
        }
      });
    }
    
    return resources;
  });`;

  // Add the collection code before the return statement
  eleventyContent = eleventyContent.replace(
    'return {',
    `${collectionCode}\n\n  return {`
  );

  // Add fs and path imports if they don't exist
  if (!eleventyContent.includes('require("fs")')) {
    eleventyContent = `const fs = require("fs");\nconst path = require("path");\n${eleventyContent}`;
  }

  await fs.writeFile(eleventyPath, eleventyContent);
}

// Execute if run directly
if (require.main === module) {
  addDynamicResources();
}

module.exports = { addDynamicResources };