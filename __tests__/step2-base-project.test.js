const fs = require('fs-extra');
const path = require('path');
const mockFs = require('mock-fs');
const { createBaseProject } = require('../step2-base-project');

jest.mock('fs-extra');

describe('Base Project Setup', () => {
  const mockConfig = {
    projectName: 'test-project',
    projectType: ['basic'],
    languages: ['en']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fs.ensureDir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.writeJSON.mockResolvedValue();
  });

  test('should create project directory structure', async () => {
    await createBaseProject(mockConfig);

    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('test-project'));
    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('src'));
    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('_includes'));
    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('assets'));
  });

  test('should create package.json with correct dependencies', async () => {
    await createBaseProject(mockConfig);

    expect(fs.writeJSON).toHaveBeenCalledWith(
      expect.stringContaining('package.json'),
      expect.objectContaining({
        dependencies: expect.objectContaining({
          '@11ty/eleventy': expect.any(String),
          'tailwindcss': expect.any(String),
          'alpinejs': expect.any(String)
        })
      }),
      expect.any(Object)
    );
  });

  test('should create eleventy config file', async () => {
    await createBaseProject(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.eleventy.js'),
      expect.stringContaining('module.exports = function(eleventyConfig)')
    );
  });

  test('should create base layout file', async () => {
    await createBaseProject(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('base.njk'),
      expect.stringContaining('<!DOCTYPE html>')
    );
  });

  test('should create tailwind config', async () => {
    await createBaseProject(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('tailwind.config.js'),
      expect.stringContaining('module.exports')
    );
  });

  test('should handle errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const mockError = new Error('Failed to create directory');
    fs.ensureDir.mockRejectedValue(mockError);

    await expect(createBaseProject(mockConfig)).rejects.toThrow();
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Error creating base project'), mockError);

    consoleError.mockRestore();
  });

  test('should create multilanguage structure if specified', async () => {
    const multiConfig = {
      ...mockConfig,
      projectType: ['basic', 'multilanguage'],
      languages: ['en', 'es']
    };

    await createBaseProject(multiConfig);

    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('en'));
    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('es'));
  });

  test('should create CMS configuration if specified', async () => {
    const cmsConfig = {
      ...mockConfig,
      projectType: ['basic', 'CMS']
    };

    await createBaseProject(cmsConfig);

    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('admin'));
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('config.yml'),
      expect.stringContaining('backend:')
    );
  });
});