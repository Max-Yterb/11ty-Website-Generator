# Contributing to 11ty Website Generator

Thank you for your interest in contributing to the 11ty Website Generator! 🎉

## 🚀 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/11ty-Website-Generator.git
   cd 11ty-Website-Generator
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Formatting
```bash
# Format code with Prettier
npm run format
```

### Testing the Generator
```bash
# Run the generator locally
node main.js

# Test different project types
# - Basic
# - Multilanguage
# - CMS
# - Multilanguage + CMS
```

## 📝 Contribution Guidelines

### Code Style
- Use Prettier for code formatting (run `npm run format`)
- Follow existing code patterns and conventions
- Add comments for complex logic
- Use meaningful variable and function names

### Commit Messages
Use conventional commit format:
- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `test: add or update tests`
- `refactor: improve code structure`
- `style: format code`
- `chore: update dependencies`

### Pull Request Process

1. **Ensure tests pass**: `npm test`
2. **Update documentation** if needed
3. **Add tests** for new features
4. **Create a pull request** with:
   - Clear title and description
   - Reference any related issues
   - Screenshots for UI changes

### Testing New Features

When adding new features:

1. **Add unit tests** in the `__tests__` directory
2. **Test manually** by generating projects
3. **Verify all project types** still work
4. **Check generated projects** build and run correctly

## 🐛 Reporting Issues

When reporting issues:

1. **Use the issue template**
2. **Provide clear reproduction steps**
3. **Include system information**:
   - Node.js version
   - npm version
   - Operating system
4. **Share error messages** and logs
5. **Attach generated project** if relevant

## 💡 Feature Requests

For new features:

1. **Check existing issues** first
2. **Describe the use case** clearly
3. **Explain the expected behavior**
4. **Consider implementation complexity**

## 📚 Areas for Contribution

- **New project templates** and layouts
- **Additional CMS integrations**
- **More language support** for multilanguage sites
- **Performance improvements**
- **Documentation enhancements**
- **Test coverage improvements**
- **Bug fixes and stability**

## 🤝 Code of Conduct

Please be respectful and constructive in all interactions. We're building this together! 🌟

## 📞 Questions?

Feel free to:
- Open a [Discussion](https://github.com/Max-Yterb/11ty-Website-Generator/discussions)
- Create an [Issue](https://github.com/Max-Yterb/11ty-Website-Generator/issues)
- Contact [Massimiliano Bertinetti](mailto:max.yterb@gmail.com)

Thank you for contributing! 🙏