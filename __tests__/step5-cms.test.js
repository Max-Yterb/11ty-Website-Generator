const fs = require('fs-extra');
const path = require('path');
const { addCmsIntegration } = require('../step5-cms');

jest.mock('fs-extra');

describe('CMS Integration', () => {
  const mockConfig = {
    projectName: 'test-project',
    projectType: ['basic', 'CMS'],
    languages: ['en']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fs.ensureDir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.writeFileSync.mockReturnValue();
    fs.writeJSON.mockResolvedValue();
    fs.readFile.mockResolvedValue('');
    fs.readJSON.mockResolvedValue({});
    fs.existsSync.mockReturnValue(true);
  });

  test('should create admin directory and files', async () => {
    await addCmsIntegration(mockConfig);

    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining(path.join('src', 'admin')));
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'admin', 'index.html')),
      expect.stringContaining('decap-cms')
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'admin', 'config.yml')),
      expect.stringContaining('backend:')
    );
  });

  test('should create CMS configuration file', async () => {
    await addCmsIntegration(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'admin', 'config.yml')),
      expect.stringContaining('backend:')
    );
  });

  test('should create Netlify configuration', async () => {
    await addCmsIntegration(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('netlify.toml'),
      expect.stringContaining('[build]')
    );
  });

  test('should update package.json with CMS dependencies', async () => {
    fs.readJSON.mockResolvedValue({ dependencies: {} });

    await addCmsIntegration(mockConfig);

    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      expect.objectContaining({
        dependencies: expect.objectContaining({
          'decap-cms': expect.any(String)
        })
      }),
      expect.any(Object)
    );
  });

  test('should update eleventy config for admin files', async () => {
    fs.readFile.mockResolvedValue('eleventyConfig.addPassthroughCopy("src/assets");');

    await addCmsIntegration(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.eleventy.js'),
      expect.stringContaining('addPassthroughCopy("src/admin")')
    );
  });

  test('should create sample content for dynamic resources', async () => {
    const configWithResources = {
      ...mockConfig,
      dynamicResources: ['News/Blog']
    };
    
    await addCmsIntegration(configWithResources);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'blog', 'sample-blog-post.md')),
      expect.stringContaining('Welcome to Our Blog')
    );
  });

  test('should handle multilanguage CMS configuration', async () => {
    const multiConfig = {
      ...mockConfig,
      projectType: ['CMS', 'multilanguage'],
      languages: ['en', 'es'],
      dynamicResources: ['News/Blog']
    };

    await addCmsIntegration(multiConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'admin', 'config.yml')),
      expect.stringContaining('blog_es')
    );
  });

  test('should skip if not a CMS project', async () => {
    const basicConfig = {
      projectName: 'test-project',
      projectType: ['basic'],
      languages: ['en']
    };

    const consoleLog = jest.spyOn(console, 'log').mockImplementation();
    
    await addCmsIntegration(basicConfig);

    expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining('not a CMS project'));
    expect(fs.ensureDir).not.toHaveBeenCalled();

    consoleLog.mockRestore();
  });

  test('should handle missing project directory', async () => {
    fs.existsSync.mockReturnValue(false);
    await expect(addCmsIntegration(mockConfig)).rejects.toThrow('Project directory not found. Please run step 2 first.');
  });

  test('should handle errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const mockError = new Error('Failed to create directory');
    fs.ensureDir.mockRejectedValue(mockError);

    await expect(addCmsIntegration(mockConfig)).rejects.toThrow(mockError);
    expect(consoleError).toHaveBeenCalledWith(
      'Error adding CMS integration:',
      mockError
    );

    consoleError.mockRestore();
  });
});