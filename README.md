# 🪄 AI One‑Click Rewrite

A powerful Chrome extension that instantly rewrites selected text using AI
providers (OpenAI, Anthropic, Google Gemini) built with **React**,
**TypeScript**, **Vite**, **TailwindCSS**, and **Material UI**.

## ✨ Features

- **🤖 Multiple AI Providers**: OpenAI GPT, Anthropic Claude, Google Gemini
- **⚡ Two Rewrite Modes**: Auto-Replace (instant) or Preview Mode (controlled)
- **🎯 Smart Presets**: Professional, friendly, and custom writing styles
- **🎨 Modern UI**: Beautiful React interface with Material Design
- **🔒 Secure**: API keys stored locally, never sent to our servers
- **🛠️ Developer-Friendly**: TypeScript, modern build system, hot reload

## 🚀 Installation

### For Users

1. Download the latest release from [GitHub Releases](../../releases)
2. Unzip the file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the unzipped folder
6. Configure your API keys in the extension options

### For Developers

#### Prerequisites

- **Node.js** 18+ and npm
- **Google Chrome** 88+ (for testing)
- **Git** for version control

#### Quick Start

```bash
# Clone the repository
git clone https://github.com/yossigruner/ai-one-click-rewrite.git
cd ai-one-click-rewrite

# Install dependencies
npm install

# Build the extension
npm run build

# Load extension in Chrome
# 1. Open Chrome → chrome://extensions/
# 2. Enable "Developer mode" (top right toggle)
# 3. Click "Load unpacked" → Select the 'dist' folder
```

#### Development Workflow

**Option 1: UI Development (Recommended)**

```bash
# Start React development server with hot reload
npm run dev

# Visit http://localhost:5173/src/options/ to develop the UI
# Changes auto-reload in browser
```

**Option 2: Full Extension Development**

```bash
# Build the extension
npm run build

# Load in Chrome (see Quick Start above)
# Make changes → rebuild → refresh extension
```

#### Available Commands

```bash
npm run dev          # Start Vite dev server for UI development
npm run build        # Build production extension
npm run preview      # Preview production build
npm run type-check   # Run TypeScript type checking
npm run lint         # Run ESLint code quality checks
npm run lint:fix     # Run ESLint and fix issues automatically
npm run format       # Format code with Prettier
npm run format:check # Check if code is properly formatted
npm run format:lint  # Format code and fix linting issues
npm run icons        # Generate PNG icons from SVG
```

## ⚙️ Setup

1. **Get API Keys**:
   - **OpenAI**: Visit [platform.openai.com](https://platform.openai.com) → API
     Keys
   - **Anthropic**: Visit [console.anthropic.com](https://console.anthropic.com)
     → API Keys
   - **Google Gemini**: Visit
     [makersuite.google.com](https://makersuite.google.com) → Get API Key

2. **Configure Extension**:
   - Click the extension icon in Chrome toolbar
   - Select your preferred AI provider
   - Enter your API key
   - Choose a model and writing preset
   - Save settings

## 📖 Usage

### Two Rewrite Modes

#### Auto-Replace Mode (Default)
- Select text and click the floating ✨ button
- Text is instantly replaced with AI suggestions
- Perfect for quick, confident rewrites

#### Preview Mode
- Select text and right-click → "Rewrite with AI"
- Opens a side panel with style selection and preview
- Review AI suggestions before applying
- Choose from professional, friendly, or custom styles

### Method 1: Context Menu

1. Select any text on a webpage
2. Right-click and choose "Rewrite with AI"
3. In Auto-Replace mode: text is instantly replaced
4. In Preview mode: side panel opens for controlled rewriting

### Method 2: Floating Button

1. Select text on any webpage
2. Click the floating ✨ button that appears
3. In Auto-Replace mode: watch your text transform instantly
4. In Preview mode: side panel opens for controlled rewriting

## 🎯 Writing Styles

Choose from professional presets or create custom instructions:

- **✨ Professional & Concise** - Clear, business-appropriate tone
- **😊 Friendly & Clear** - Approachable and easy to understand
- **📝 Polish Grammar Only** - Fix errors without changing style
- **⚡ Shorten to 1-2 Sentences** - Condense to key points
- **💪 Make it More Assertive** - Strengthen confidence and authority
- **🎨 Custom Instructions** - Write your own rewriting instructions

## 🛠️ Development

### Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: TailwindCSS + Material UI
- **Build Tool**: Vite
- **Code Quality**: ESLint + Prettier + Husky
- **Messaging**: Standard Chrome Extension messaging
- **Architecture**: Chrome Extension Manifest V3

### Project Structure

```
src/
├── background/         # Service worker (TypeScript)
├── content/           # Content script (TypeScript)
├── options/           # Settings page (React)
├── components/        # Reusable React components
├── providers/         # AI provider implementations (modular)
├── types/            # TypeScript type definitions
└── utils/            # Utility functions (storage, messaging)

public/
├── manifest.json     # Extension manifest
└── icons/           # Extension icons
```

### Scripts

- `npm run dev` - Start development server for UI
- `npm run build` - Build production extension
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint

### Development Guide

#### 🏗️ Building for Production

```bash
# Clean build
npm run build

# Output: dist/ folder ready for Chrome
# ├── manifest.json
# ├── background.js     (Service worker)
# ├── content.js        (Content script)
# ├── options.html      (Settings page)
# ├── options.js        (React bundle)
# ├── assets/           (CSS, images)
# └── icons/            (Extension icons)
```

#### 🔧 Loading in Chrome

1. **Build the extension**: `npm run build`
2. **Open Chrome Extensions**: Navigate to `chrome://extensions/`
3. **Enable Developer Mode**: Toggle in top-right corner
4. **Load Extension**: Click "Load unpacked" → Select `dist` folder
5. **Test**: Click extension icon or right-click selected text

#### 🔄 Development Cycle

```bash
# For UI changes (options page)
npm run dev                    # Start dev server
# → Visit http://localhost:5173/src/options/
# → Make changes with hot reload

# For extension logic changes (background/content)
npm run build                  # Rebuild extension
# → Go to chrome://extensions/
# → Click refresh button on your extension
# → Test changes
```

#### 🐛 Debugging

**Options Page (React UI)**

```bash
npm run dev                    # Start dev server
# → Open browser dev tools
# → React DevTools available
```

**Extension Scripts**

1. **Background Script**: `chrome://extensions/` → Click "service worker" link
2. **Content Script**: Right-click page → Inspect → Console tab
3. **Debug Logs**: Enable in extension options → Check console

#### 🔧 Troubleshooting

**Build Issues**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (requires 18+)
node --version

# Type check without building
npm run type-check
```

**Extension Loading Issues**

- **Manifest errors**: Check `dist/manifest.json` exists and is valid
- **Script errors**: Enable debug logs and check browser console
- **Icons missing**: Ensure `public/icons/` contains all required sizes

**Development Server Issues**

```bash
# If port 5173 is busy
npm run dev -- --port 3000

# Clear Vite cache
rm -rf node_modules/.vite
```

**Runtime Errors**

- **API keys not saving**: Check Chrome storage permissions
- **Content script not loading**: Verify site permissions and CSP
- **Background script errors**: Check service worker console

#### 📦 Project Structure Deep Dive

```
src/
├── background/
│   └── index.ts              # Service worker (background script)
├── content/
│   └── index.ts              # Content script (injected into pages)
├── options/
│   ├── index.html            # Options page HTML
│   ├── main.tsx              # React app entry point
│   ├── OptionsApp.tsx        # Main options component
│   ├── theme.ts              # Material UI theme
│   └── index.css             # Global styles
├── components/
│   ├── HeaderSection.tsx     # Header with gradient
│   ├── ProviderSection.tsx   # AI provider configuration
│   ├── ModeSection.tsx       # Rewrite mode settings
│   └── DebugSection.tsx      # Debug options
├── providers/
│   ├── base.ts               # Abstract base provider class
│   ├── openai.ts             # OpenAI GPT provider
│   ├── anthropic.ts          # Anthropic Claude provider
│   ├── gemini.ts             # Google Gemini provider
│   └── index.ts              # Provider registry and factory
├── types/
│   └── index.ts              # TypeScript type definitions
└── utils/
    ├── storage.ts            # Chrome storage utilities
    └── bridge.ts             # Messaging utilities

public/
├── manifest.json             # Extension manifest
└── icons/                    # Extension icons (16px, 32px, 48px, 128px)
```

#### ⚡ Build Performance

- **Bundle Size**: ~380KB (options page), ~14KB (background), ~10KB (content)
- **Build Time**: ~3-5 seconds on modern hardware
- **Tree Shaking**: Unused Material UI components automatically removed
- **TypeScript**: Full type checking during build
- **Hot Reload**: React components update instantly during development
- **Modular Providers**: Clean separation of AI provider logic

#### 🔌 Modular Provider System

The extension features a **clean, extensible provider architecture**:

**Base Provider Class**

```typescript
import { BaseProvider, RewriteRequest } from '@/providers'

// Each provider extends BaseProvider
export class CustomProvider extends BaseProvider {
  readonly name = 'CustomAI'
  readonly baseUrl = 'https://api.customai.com'
  readonly defaultModel = 'custom-model-v1'
  readonly supportedModels = ['custom-model-v1', 'custom-model-v2']

  async rewrite(request: RewriteRequest): Promise<ProviderResponse> {
    // Implementation
  }

  validateApiKey(apiKey: string): boolean {
    return apiKey.startsWith('custom-') && apiKey.length > 20
  }
}
```

**Provider Registry**

```typescript
import { getProvider, getAllProviders } from '@/providers'

// Get a provider instance
const openai = getProvider('openai')
const result = await openai.rewrite({ text, instructions, config })

// Get all available providers
const providers = getAllProviders()
```

**Benefits:**

- 🔧 **Easy to extend** - Add new AI providers by implementing BaseProvider
- 🛡️ **Type-safe** - Full TypeScript support with proper error handling
- 📦 **Modular** - Each provider is self-contained with its own logic
- 🧪 **Testable** - Easy to unit test individual providers
- 🔄 **Consistent** - Uniform interface across all AI services

#### 🎯 Code Quality & Formatting

The project includes a comprehensive code quality setup:

**ESLint Configuration**

- TypeScript-aware linting rules
- React hooks validation
- Chrome Extension specific rules
- Integration with Prettier for formatting

**Prettier Configuration**

- Consistent code formatting across the team
- Automatic formatting on save (VS Code)
- Support for TypeScript, React, JSON, CSS, and Markdown

**Git Hooks (Husky)**

- Pre-commit hooks that run lint-staged
- Automatic formatting and linting before commits
- Prevents commits with linting errors

**VS Code Integration**

- Recommended extensions for optimal development
- Format on save enabled
- Auto-fix ESLint issues on save
- Organized imports automatically

**Commands:**

```bash
npm run lint         # Check for linting issues
npm run lint:fix     # Fix linting issues automatically
npm run format       # Format all files with Prettier
npm run format:check # Check if files are properly formatted
npm run format:lint  # Format + lint in one command
```

#### 🚀 Production Optimization

```bash
# Analyze bundle size
npm run build
# Check dist/options.js size (~380KB is normal for Material UI)

# Type checking only (faster)
npm run type-check

# Lint without auto-fix
npm run lint
```

## 🔒 Privacy & Security

- **Local Storage**: All API keys and settings stored in your browser
- **No Data Collection**: We never see your text or API keys
- **Secure Communication**: Direct HTTPS connections to AI providers
- **No Analytics**: No tracking or usage monitoring

## 📋 Requirements

- **Chrome**: Version 88+ (Manifest V3 support)
- **API Access**: Valid API key from at least one supported provider
- **Permissions**: Extension needs access to read/modify webpage content

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md)
for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run lint`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 💝 Support This Project

If you find this extension helpful, consider supporting its development:

- ⭐ **Star this repository** on GitHub
- 🐛 **Report issues** and suggest improvements

## 👨‍💻 Author

**Yossi Gruner**

- GitHub: [@yossigruner](https://github.com/yossigruner)
- Email: [yossigruner@gmail.com](mailto:yossigruner@gmail.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🔄 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

**Made with ❤️ and modern web technologies**
