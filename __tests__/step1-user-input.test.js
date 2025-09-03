const { getUserInput } = require('../step1-user-input');
const inquirer = require('inquirer');
const fs = require('fs-extra');

jest.mock('inquirer');
jest.mock('fs-extra');

describe('User Input Collection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should collect valid user input for a basic project', async () => {
    inquirer.prompt.mockResolvedValueOnce({
      projectName: 'test-project',
      projectType: '11ty with static content (Home, About, Services, Contacts)',
    });

    const result = await getUserInput();

    expect(result).toEqual({
      projectName: 'test-project',
      projectType: '11ty with static content (Home, About, Services, Contacts)',
    });
    expect(inquirer.prompt).toHaveBeenCalledTimes(1);
  });

  test('should collect valid user input for a CMS project with dynamic resources', async () => {
    inquirer.prompt
      .mockResolvedValueOnce({
        projectName: 'cms-project',
        projectType: '11ty + Decap CMS with static and dynamic content',
      })
      .mockResolvedValueOnce({
        dynamicResources: ['Services', 'Portfolio'],
      });

    const result = await getUserInput();

    expect(result).toEqual({
      projectName: 'cms-project',
      projectType: '11ty + Decap CMS with static and dynamic content',
      dynamicResources: ['Services', 'Portfolio'],
    });
    expect(inquirer.prompt).toHaveBeenCalledTimes(2);
  });

  test('should collect valid user input for a multilanguage project', async () => {
    inquirer.prompt
      .mockResolvedValueOnce({
        projectName: 'multi-lang-project',
        projectType: '11ty with static content + multilanguage support',
      })
      .mockResolvedValueOnce({
        languages: ['Spanish', 'French'],
      });

    const result = await getUserInput();

    expect(result).toEqual({
      projectName: 'multi-lang-project',
      projectType: '11ty with static content + multilanguage support',
      languages: ['English', 'Spanish', 'French'],
    });
    expect(inquirer.prompt).toHaveBeenCalledTimes(2);
  });


  test('should validate project name', async () => {
    let nameValidation;
    inquirer.prompt.mockImplementationOnce((questions) => {
      nameValidation = questions.find(q => q.name === 'projectName').validate;
      return Promise.resolve({
        projectName: 'test-project',
        projectType: '11ty with static content (Home, About, Services, Contacts)',
      });
    });

    await getUserInput();

    expect(nameValidation('')).toBe('Project name is required');

    fs.existsSync.mockReturnValue(true);
    expect(nameValidation('existing-project')).toBe('Directory already exists. Please choose another name.');

    fs.existsSync.mockReturnValue(false);
    expect(nameValidation('new-project')).toBe(true);
  });

  test('should handle errors gracefully', async () => {
    const mockError = new Error('Inquirer error');
    inquirer.prompt.mockRejectedValue(mockError);
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    await expect(getUserInput()).rejects.toThrow('Inquirer error');
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('Error collecting user input:'), mockError);

    consoleError.mockRestore();
  });
});