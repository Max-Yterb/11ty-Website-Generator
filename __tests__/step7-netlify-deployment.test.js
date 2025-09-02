const fs = require('fs-extra');
const path = require('path');
const { addNetlifyDeployment } = require('../step7-netlify-deployment');

// Mock fs-extra
jest.mock('fs-extra');

describe('addNetlifyDeployment', () => {
  const mockConfig = {
    projectName: 'test-project'
  };
  const projectDir = path.join(process.cwd(), mockConfig.projectName);
  const configPath = path.join(process.cwd(), 'project-config.json');

  beforeEach(() => {
    // Reset mocks before each test
    fs.existsSync.mockClear();
    fs.readJson.mockClear();
    fs.writeFile.mockClear();
    fs.writeJson.mockClear();
  });

  it('should add netlify.toml and update package.json', async () => {
    fs.existsSync.mockReturnValue(true);
    fs.readJson.mockImplementation((filePath) => {
      if (filePath.endsWith('project-config.json')) {
        return Promise.resolve(mockConfig);
      }
      if (filePath.endsWith('package.json')) {
        return Promise.resolve({ scripts: {} });
      }
      return Promise.reject(new Error(`Unexpected call to fs.readJson with ${filePath}`));
    });

    await addNetlifyDeployment();

    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(projectDir, 'netlify.toml'),
      expect.stringContaining('[build]')
    );

    expect(fs.writeJson).toHaveBeenCalledWith(
      path.join(projectDir, 'package.json'),
      expect.objectContaining({
        scripts: expect.objectContaining({
          build: 'eleventy'
        })
      }),
      { spaces: 2 }
    );
  });

  it('should throw an error if project config not found', async () => {
    fs.existsSync.mockReturnValue(false);

    await expect(addNetlifyDeployment()).rejects.toThrow(
      'Project configuration not found. Please run step 1 first.'
    );
  });

  it('should throw an error if project directory not found', async () => {
    fs.existsSync.mockImplementation(p => p === configPath); // Only config file exists
    fs.readJson.mockResolvedValue(mockConfig);

    await expect(addNetlifyDeployment()).rejects.toThrow(
      'Project directory not found. Please run step 2 first.'
    );
  });
});