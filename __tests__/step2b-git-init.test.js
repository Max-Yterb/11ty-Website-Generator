const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const { initializeGitRepository } = require('../step2b-git-init');

jest.mock('fs-extra');
jest.mock('child_process');

describe('Git Repository Initialization', () => {
  const mockConfig = {
    projectName: 'test-project',
    projectType: ['basic'],
    languages: ['en']
  };

  const originalCwd = process.cwd();
  const mockChdir = jest.spyOn(process, 'chdir').mockImplementation();

  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.readJSON.mockResolvedValue(mockConfig);
    execSync.mockReturnValue('');
  });

  afterEach(() => {
    mockChdir.mockClear();
  });

  afterAll(() => {
    mockChdir.mockRestore();
  });

  test('should initialize Git repository with main branch', async () => {
    await initializeGitRepository(mockConfig);

    expect(mockChdir).toHaveBeenCalledWith(expect.stringContaining('test-project'));
    expect(execSync).toHaveBeenCalledWith('git init -b main', { stdio: 'inherit' });
    expect(execSync).toHaveBeenCalledWith('git add .', { stdio: 'inherit' });
    expect(execSync).toHaveBeenCalledWith('git commit -m "Initial commit"', { stdio: 'inherit' });
    expect(mockChdir).toHaveBeenCalledWith('..');
  });

  test('should fallback to older Git version commands if needed', async () => {
    execSync.mockImplementationOnce(() => {
      throw new Error('git init -b main not supported');
    });
    execSync.mockImplementationOnce(() => '');
    execSync.mockImplementationOnce(() => '');
    execSync.mockImplementationOnce(() => '');
    execSync.mockImplementationOnce(() => '');

    await initializeGitRepository(mockConfig);

    expect(execSync).toHaveBeenCalledWith('git init -b main', { stdio: 'inherit' });
    expect(execSync).toHaveBeenCalledWith('git init', { stdio: 'inherit' });
    expect(execSync).toHaveBeenCalledWith('git checkout -b main', { stdio: 'inherit' });
  });

  test('should throw error if project config not found', async () => {
    fs.existsSync.mockReturnValue(false);

    await expect(initializeGitRepository()).rejects.toThrow(
      'Project configuration not found. Please run step 1 first.'
    );
  });

  test('should throw error if project directory not found', async () => {
    fs.existsSync.mockImplementation((filePath) => {
      if (filePath.includes('project-config.json')) return true;
      return false; // Project directory doesn't exist
    });

    await expect(initializeGitRepository()).rejects.toThrow(
      'Project directory not found. Please run step 2 first.'
    );
  });

  test('should handle Git command errors gracefully', async () => {
    execSync.mockImplementation((command) => {
      if (command.includes('git init')) {
        throw new Error('Git command failed');
      }
    });

    await expect(initializeGitRepository(mockConfig)).rejects.toThrow('Git command failed');
  });

  test('should continue if branch checkout fails', async () => {
    execSync.mockImplementationOnce(() => {
      throw new Error('git init -b main not supported');
    });
    execSync.mockImplementationOnce(() => '');
    execSync.mockImplementationOnce(() => {
      throw new Error('branch already exists');
    });
    execSync.mockImplementationOnce(() => '');
    execSync.mockImplementationOnce(() => '');

    await expect(initializeGitRepository(mockConfig)).resolves.toBeDefined();
    expect(execSync).toHaveBeenCalledWith('git add .', { stdio: 'inherit' });
    expect(execSync).toHaveBeenCalledWith('git commit -m "Initial commit"', { stdio: 'inherit' });
  });
});