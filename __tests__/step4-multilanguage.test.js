const fs = require('fs-extra');
const path = require('path');
const { addMultilanguageSupport } = require('../step4-multilanguage');

jest.mock('fs-extra');

describe('Multilanguage Support', () => {
  const mockConfig = {
    projectName: 'test-project',
    projectType: ['basic', 'multilanguage'],
    languages: ['English', 'Spanish']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fs.ensureDir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.writeJSON.mockResolvedValue();
    fs.readFile.mockResolvedValue('');
    fs.existsSync.mockReturnValue(true);
  });

  test('should create i18n data file', async () => {
    await addMultilanguageSupport(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('i18n.js'),
      expect.stringContaining('defaultLocale: \"en\"')
    );
  });

  test('should update eleventy config for i18n', async () => {
    fs.readFile.mockResolvedValue('module.exports = function(eleventyConfig) { return {}; }');

    await addMultilanguageSupport(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.eleventy.js'),
      expect.stringContaining('addFilter("t"')
    );
  });

  test('should create language directories', async () => {
    await addMultilanguageSupport(mockConfig);

    expect(fs.ensureDir).toHaveBeenCalledWith(expect.stringContaining('es'));
  });



  test('should create language-specific pages', async () => {
    await addMultilanguageSupport(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'index.njk')),
      expect.any(String)
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'es', 'index.njk')),
      expect.any(String)
    );
  });

  test('should skip if not a multilanguage project', async () => {
    const basicConfig = {
      projectName: 'test-project',
      projectType: ['basic'],
      languages: ['en']
    };

    const consoleLog = jest.spyOn(console, 'log').mockImplementation();
    
    await addMultilanguageSupport(basicConfig);

    expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining('not a multilanguage project'));
    expect(fs.writeJSON).not.toHaveBeenCalled();

    consoleLog.mockRestore();
  });

  test('should handle missing project directory', async () => {
    fs.existsSync.mockReturnValue(false);
    await expect(addMultilanguageSupport(mockConfig)).rejects.toThrow('Project directory not found. Please run step 2 first.');
  });

  test('should handle errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const mockError = new Error('Failed to create file');
    fs.writeFile.mockRejectedValue(mockError);

    await expect(addMultilanguageSupport(mockConfig)).rejects.toThrow(mockError);
    expect(consoleError).toHaveBeenCalledWith(
      'Error adding multilanguage support:',
      mockError
    );

    consoleError.mockRestore();
  });
});