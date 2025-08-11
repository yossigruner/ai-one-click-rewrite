# Changelog

## [2.0.1] - 2024-01-09

### 🌉 Enhanced Messaging with Webext-bridge

- **Added webext-bridge** for type-safe cross-context communication
- **Type-safe messaging** between background, content, and options scripts
- **Better debugging** with clear message protocols and error handling
- **Improved reliability** in extension script communication

---

## [2.0.0] - 2024-01-09

### 🎉 Major Rewrite - Modern React + TypeScript

- **Complete rewrite** using React, TypeScript, Vite, TailwindCSS, and Material
  UI
- **Modern UI/UX** with beautiful Material Design components and smooth
  animations
- **Type Safety** with comprehensive TypeScript definitions
- **Better Performance** with optimized Vite build system
- **Developer Experience** improved with hot reload, ESLint, and modern tooling

### 🔧 Technical Improvements

- Migrated from vanilla JS to React + TypeScript
- Replaced custom CSS with TailwindCSS + Material UI
- Implemented proper Chrome Extension Manifest V3 architecture
- Added comprehensive error handling and logging
- Modular component-based architecture

### 🎨 UI/UX Enhancements

- Redesigned options page with modern card-based layout
- Improved provider selection with beautiful icons and descriptions
- Enhanced form controls with better validation and feedback
- Added smooth animations and micro-interactions
- Responsive design for different screen sizes

### 🔒 Security & Performance

- Removed external CDN dependencies for better CSP compliance
- Optimized bundle size with tree shaking
- Improved error handling and user feedback
- Enhanced debugging capabilities

### 🗂️ Breaking Changes

- Removed side panel functionality (simplified to auto-replace only)
- Removed keyboard shortcut configuration (focused on context menu + floating
  button)
- Legacy settings migration handled automatically

---

## [1.0.0] - 2024-01-08

### Initial Release

- Basic text rewriting functionality
- Support for OpenAI, Anthropic, and Google Gemini
- Simple options page and content script
- Context menu integration
