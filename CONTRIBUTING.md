# Contributing to AI One‑Click Rewrite

Thank you for your interest in contributing! This document outlines the
development setup and guidelines for contributing to the project.

## 🚀 Quick Start

```bash
# Clone and setup
git clone https://github.com/yossigruner/ai-one-click-rewrite.git
cd ai-one-click-rewrite
npm install

# Start development
npm run dev          # Start React dev server
npm run build        # Build extension
npm run format:lint  # Format and lint code
```

## 🛠️ Development Environment

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **VS Code** (recommended) with suggested extensions

### Recommended VS Code Extensions

When you open the project, VS Code will suggest installing these extensions:

- ESLint
- Prettier - Code formatter
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

## 📋 Code Quality Standards

### Formatting with Prettier

- **Automatic formatting** on save (VS Code)
- **Manual formatting**: `npm run format`
- **Check formatting**: `npm run format:check`

### Linting with ESLint

- **Check issues**: `npm run lint`
- **Auto-fix issues**: `npm run lint:fix`
- **TypeScript-aware** rules
- **React hooks** validation
- **Chrome Extension** specific rules

### Git Hooks (Husky)

- **Pre-commit hook** automatically runs `lint-staged`
- **Automatic formatting** and linting before commits
- **Prevents commits** with linting errors

## 🏗️ Project Structure

```
src/
├── background/         # Service worker (TypeScript)
├── content/           # Content script (TypeScript)
├── options/           # Settings page (React + TypeScript)
├── components/        # Reusable React components
├── providers/         # AI provider implementations
├── types/            # TypeScript type definitions
└── utils/            # Utility functions

public/
├── manifest.json     # Extension manifest
└── icons/           # Extension icons
```

## 🔌 Adding New AI Providers

To add a new AI provider:

1. **Create provider file**: `src/providers/newprovider.ts`
2. **Extend BaseProvider**:

   ```typescript
   export class NewProvider extends BaseProvider {
     readonly name = 'NewAI'
     readonly baseUrl = 'https://api.newai.com'
     readonly defaultModel = 'newai-v1'
     readonly supportedModels = ['newai-v1', 'newai-v2']

     // Implement required methods...
   }
   ```

3. **Register provider**: Add to `src/providers/index.ts`
4. **Update types**: Add to `AIProvider` type in `src/types/index.ts`
5. **Update UI**: Add to provider dropdown and model options

## 🧪 Testing Changes

```bash
# Type checking
npm run type-check

# Code quality
npm run lint
npm run format:check

# Build extension
npm run build

# Test in browser
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" → Select dist/ folder
```

## 🎨 UI Development

- **React + TypeScript** for options page
- **Material UI** for components
- **TailwindCSS** for utility styling
- **Hot reload** available with `npm run dev`

### Design Principles

- **Modern and clean** interface
- **Consistent spacing** and typography
- **Accessible** color contrasts
- **Responsive** design

## 📝 Commit Guidelines

### Commit Message Format

```
type(scope): brief description

feat(providers): add GPT-4 support
fix(ui): resolve provider dropdown issue
docs(readme): update installation guide
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Build/tooling changes

## 🐛 Reporting Issues

When reporting issues, please include:

- **Chrome version**
- **Extension version**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **Console errors** (if any)
- **Screenshots** (if relevant)

## 🔒 Security Guidelines

- **Never commit** API keys or sensitive data
- **Use environment variables** for sensitive configuration
- **Validate all inputs** from external APIs
- **Follow Chrome Extension** security best practices

## 📚 Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Material UI Documentation](https://mui.com/)
- [TailwindCSS Documentation](https://tailwindcss.com/)

## 🤝 Code Review Process

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Run** `npm run format:lint`
6. **Commit** with clear messages
7. **Push** and create a Pull Request

### Pull Request Checklist

- [ ] Code follows project formatting standards
- [ ] All linting passes without errors
- [ ] TypeScript compiles without errors
- [ ] Extension builds successfully
- [ ] Changes tested in Chrome
- [ ] Documentation updated (if needed)

Thank you for contributing! 🎉
