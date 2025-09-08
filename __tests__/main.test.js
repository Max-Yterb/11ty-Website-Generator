const { main } = require('../main');
const step1 = require('../step1-user-input');
const step2 = require('../step2-base-project');
const step2b = require('../step2b-git-init');
const step3 = require('../step3-static-pages');
const step4 = require('../step4-multilanguage');
const step5 = require('../step5-cms');
const step6 = require('../step6-dynamic');
const step7 = require('../step7-netlify-deployment');

jest.mock('../step1-user-input', () => ({ getUserInput: jest.fn() }));
jest.mock('../step2-base-project', () => ({ createBaseProject: jest.fn() }));
jest.mock('../step2b-git-init', () => ({ initializeGitRepository: jest.fn() }));
jest.mock('../step3-static-pages', () => ({ addStaticPages: jest.fn() }));
jest.mock('../step4-multilanguage', () => ({ addMultilanguageSupport: jest.fn() }));
jest.mock('../step5-cms', () => ({ addCmsIntegration: jest.fn() }));
jest.mock('../step6-dynamic', () => ({ addDynamicResources: jest.fn() }));
jest.mock('../step7-netlify-deployment', () => ({ addNetlifyDeployment: jest.fn() }));

describe('Main Script', () => {
  const mockConfig = {
    projectName: 'test-project',
    projectType: ['basic', 'multilanguage', 'CMS'],
    languages: ['en', 'es']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    step1.getUserInput.mockResolvedValue(mockConfig);
    step2.createBaseProject.mockResolvedValue();
    step2b.initializeGitRepository.mockResolvedValue();
    step3.addStaticPages.mockResolvedValue();
    step4.addMultilanguageSupport.mockResolvedValue();
    step5.addCmsIntegration.mockResolvedValue();
    step6.addDynamicResources.mockResolvedValue();
    step7.addNetlifyDeployment.mockResolvedValue();
  });

  test('should execute all steps in correct order', async () => {
    await main();

    expect(step1.getUserInput).toHaveBeenCalledTimes(1);
    expect(step2.createBaseProject).toHaveBeenCalledWith(mockConfig);
    expect(step2b.initializeGitRepository).toHaveBeenCalledWith(mockConfig);
    expect(step3.addStaticPages).toHaveBeenCalledWith(mockConfig);
    expect(step4.addMultilanguageSupport).toHaveBeenCalledWith(mockConfig);
    expect(step5.addCmsIntegration).toHaveBeenCalledWith(mockConfig);
    expect(step6.addDynamicResources).toHaveBeenCalledWith(mockConfig);
    expect(step7.addNetlifyDeployment).toHaveBeenCalledWith(mockConfig);
  });

  test('should skip multilanguage step for non-multilanguage projects', async () => {
    step1.getUserInput.mockResolvedValue({
      ...mockConfig,
      projectType: ['basic']
    });

    await main();

    expect(step4.addMultilanguageSupport).not.toHaveBeenCalled();
  });

  test('should skip CMS step for non-CMS projects', async () => {
    step1.getUserInput.mockResolvedValue({
      ...mockConfig,
      projectType: ['basic']
    });

    await main();

    expect(step5.addCmsIntegration).not.toHaveBeenCalled();
  });

  test('should handle errors gracefully', async () => {
    const mockError = new Error('Failed to get user input');
    step1.getUserInput.mockRejectedValue(mockError);
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const processExit = jest.spyOn(process, 'exit').mockImplementation();

    await main();

    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('❌ An error occurred during project generation:'),
      mockError
    );
    expect(processExit).toHaveBeenCalledWith(1);

    consoleError.mockRestore();
    processExit.mockRestore();
  });

  test('should display success message on completion', async () => {
    const consoleLog = jest.spyOn(console, 'log').mockImplementation();

    await main();

    expect(consoleLog).toHaveBeenCalledWith(
      expect.stringContaining('✅ All steps completed successfully!')
    );

    consoleLog.mockRestore();
  });
});