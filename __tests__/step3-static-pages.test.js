const fs = require('fs-extra');
const path = require('path');
const { addStaticPages } = require('../step3-static-pages');

jest.mock('fs-extra');

describe('Static Pages Generation', () => {
  const mockConfig = {
    projectName: 'test-project',
    projectType: ['basic'],
    languages: ['en']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    fs.ensureDir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.existsSync.mockReturnValue(true);
  });

  test('should create header partial', async () => {
    await addStaticPages(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('header.njk'),
      expect.stringContaining('<header')
    );
  });

  test('should create footer partial', async () => {
    await addStaticPages(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('footer.njk'),
      expect.stringContaining('<footer')
    );
  });

  test('should create basic static pages', async () => {
    await addStaticPages(mockConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'index.njk')),
      expect.any(String)
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'about', 'index.njk')),
      expect.any(String)
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'services', 'index.njk')),
      expect.any(String)
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'contact', 'index.njk')),
      expect.any(String)
    );
  });

  test('should handle multilanguage pages', async () => {
    const multiConfig = {
      ...mockConfig,
      projectType: ['basic', 'multilanguage'],
      languages: ['en', 'es']
    };

    await addStaticPages(multiConfig);

    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'en', 'index.njk')),
      expect.any(String)
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining(path.join('src', 'es', 'index.njk')),
      expect.any(String)
    );
  });

  test('should handle errors gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const mockError = new Error('Failed to create file');
    fs.writeFile.mockRejectedValue(mockError);

    await expect(addStaticPages(mockConfig)).rejects.toThrow(mockError);

    expect(consoleError).toHaveBeenCalledWith(
      'Error adding static pages:',
      mockError
    );

    consoleError.mockRestore();
  });

  test('should check for project directory existence', async () => {
    fs.existsSync.mockReturnValue(false);
    await expect(addStaticPages(mockConfig)).rejects.toThrow('Project directory not found. Please run step 2 first.');
  });
});