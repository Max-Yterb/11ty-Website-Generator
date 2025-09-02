const fs = require('fs-extra');
const path = require('path');
const { addDynamicResources } = require('../step6-dynamic');

jest.mock('fs-extra');

describe('Dynamic Resources', () => {
  const mockConfig = {
    projectName: 'test-project',
    projectType: ['portfolio', 'blog', 'business'],
    languages: ['en']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fs.ensureDir.mockResolvedValue();
    fs.writeJSON.mockResolvedValue();
    fs.readFile.mockResolvedValue('');
    fs.writeFile.mockResolvedValue();
    fs.existsSync.mockReturnValue(true);
  });

  test('should create resources directory', async () => {
    await addDynamicResources(mockConfig);

    expect(fs.ensureDir).toHaveBeenCalledWith(
      path.join(process.cwd(), mockConfig.projectName, 'src', '_data', 'resources')
    );
  });

  test('should add portfolio resources', async () => {
    await addDynamicResources(mockConfig);

    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('projects.json'),
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            description: expect.any(String)
          })
        ])
      }),
      expect.any(Object)
    );

    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('skills.json'),
      expect.objectContaining({
        categories: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            skills: expect.any(Array)
          })
        ])
      }),
      expect.any(Object)
    );
  });

  test('should add business resources', async () => {
    await addDynamicResources(mockConfig);

    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('services.json'),
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            title: expect.any(String),
            description: expect.any(String)
          })
        ])
      }),
      expect.any(Object)
    );

    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('testimonials.json'),
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            quote: expect.any(String)
          })
        ])
      }),
      expect.any(Object)
    );
  });

  test('should add blog resources', async () => {
    await addDynamicResources(mockConfig);

    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('categories.json'),
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            slug: expect.any(String)
          })
        ])
      }),
      expect.any(Object)
    );

    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('authors.json'),
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            name: expect.any(String),
            bio: expect.any(String)
          })
        ])
      }),
      expect.any(Object)
    );
  });

  test('should update eleventy config for dynamic resources', async () => {
    fs.readFile.mockResolvedValue('module.exports = function(eleventyConfig) { return {}; }');

    await addDynamicResources(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.eleventy.js'),
      expect.stringContaining('addCollection("dynamicResources"')
    );
  });

  test('should throw an error if project directory not found', async () => {
    fs.existsSync.mockReturnValue(false);

    await expect(addDynamicResources(mockConfig)).rejects.toThrow('Project directory not found. Please run step 2 first.');
  });

  test('should handle errors gracefully', async () => {
    const mockError = new Error('Failed to create directory');
    fs.ensureDir.mockRejectedValue(mockError);
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    await expect(addDynamicResources(mockConfig)).rejects.toThrow();
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('Error adding dynamic resources'),
      expect.any(Error)
    );

    consoleError.mockRestore();
  });

  test('should only add resources for selected project types', async () => {
    const basicConfig = {
      projectName: 'test-project',
      projectType: ['basic'],
      languages: ['en']
    };

    await addDynamicResources(basicConfig);

    expect(fs.writeJSON).not.toHaveBeenCalledWith(
      expect.stringContaining('projects.json'),
      expect.any(Object),
      expect.any(Object)
    );
    expect(fs.writeJSON).not.toHaveBeenCalledWith(
      expect.stringContaining('services.json'),
      expect.any(Object),
      expect.any(Object)
    );
    expect(fs.writeJSON).not.toHaveBeenCalledWith(
      expect.stringContaining('categories.json'),
      expect.any(Object),
      expect.any(Object)
    );
  });
});