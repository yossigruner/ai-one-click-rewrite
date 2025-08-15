# Preview Mode Design Specification

## 🎯 Overview

Preview Mode will add a side panel that allows users to:
- Select text and see AI rewriting options before applying changes
- Choose different writing styles and see real-time previews
- Compare original vs rewritten text side-by-side
- Apply changes selectively to specific parts of the text

## 🎨 UI/UX Design

### **Side Panel Layout**

```
┌─────────────────────────────────────┐
│ AI One-Click Rewrite - Preview Mode │
├─────────────────────────────────────┤
│                                     │
│ [Provider: OpenAI ▼] [Model: GPT-4] │
│                                     │
│ ┌─ Writing Style ─────────────────┐  │
│ │ ○ Professional concise         │  │
│ │ ○ Friendly & clear             │  │
│ │ ○ Polish grammar only          │  │
│ │ ○ Shorten to 1–2 sentences     │  │
│ │ ○ Make it more assertive       │  │
│ │ ○ Make it more casual          │  │
│ │ ○ Fix typos, keep tone         │  │
│ │ ○ Summarize as bullet points   │  │
│ │ ○ Rewrite for Slack            │  │
│ │ ○ Rewrite for email            │  │
│ │ ○ Custom...                    │  │
│ └─────────────────────────────────┘  │
│                                     │
│ ┌─ Custom Instructions ───────────┐  │
│ │ [Text area for custom prompts]  │  │
│ │ [Character count: 0/500]        │  │
│ └─────────────────────────────────┘  │
│                                     │
│ [🔄 Rewrite] [⚙️ Settings] [❌ Close] │
│                                     │
├─────────────────────────────────────┤
│ Original Text                      │
├─────────────────────────────────────┤
│ [Text area with selected content]  │
│ [Word count: 45]                   │
├─────────────────────────────────────┤
│ Rewritten Text                     │
├─────────────────────────────────────┤
│ [Text area with AI output]         │
│ [Word count: 38] [Processing...]   │
│                                     │
│ [✅ Apply to Page] [🔄 Regenerate]   │
│ [📋 Copy] [🔄 Compare Side-by-Side] │
└─────────────────────────────────────┘
```

### **Key Features**

#### **1. Smart Text Selection**
- **Auto-detect selection**: When user selects text, side panel opens automatically
- **Manual trigger**: Extension icon or keyboard shortcut opens panel
- **Multiple selections**: Support for selecting multiple text blocks
- **Context awareness**: Remember last selected text per tab

#### **2. Real-time Style Switching**
- **Instant preview**: Change writing style and see immediate results
- **Style comparison**: Quick toggle between 2-3 different styles
- **Custom instructions**: Real-time preview with custom prompts
- **Style history**: Remember last used styles per user

#### **3. Advanced Text Controls**
- **Partial application**: Apply changes to specific parts only
- **Undo/Redo**: Track changes and allow reverting
- **Diff view**: Highlight changes between original and rewritten
- **Multiple versions**: Keep multiple AI outputs for comparison

#### **4. Enhanced User Experience**
- **Drag to resize**: Allow users to resize the side panel
- **Collapsible sections**: Hide/show different panels
- **Keyboard shortcuts**: Quick access to common actions
- **Dark/Light mode**: Match user's browser theme

## 🔧 Technical Implementation

### **New Components Needed**

#### **1. PreviewPanel Component**
```typescript
interface PreviewPanelProps {
  isOpen: boolean
  selectedText: string
  onClose: () => void
  onApply: (rewrittenText: string) => void
  onRegenerate: () => void
}
```

#### **2. StyleSelector Component**
```typescript
interface StyleSelectorProps {
  currentStyle: string
  onStyleChange: (style: string) => void
  customInstructions: string
  onCustomInstructionsChange: (instructions: string) => void
}
```

#### **3. TextComparison Component**
```typescript
interface TextComparisonProps {
  originalText: string
  rewrittenText: string
  isLoading: boolean
  onApply: () => void
  onRegenerate: () => void
  onCopy: () => void
}
```

#### **4. ProviderSelector Component**
```typescript
interface ProviderSelectorProps {
  currentProvider: AIProvider
  currentModel: string
  onProviderChange: (provider: AIProvider) => void
  onModelChange: (model: string) => void
}
```

### **New Message Types**

```typescript
// Add to types/index.ts
export interface PreviewModeMessage {
  type: 'open-preview' | 'close-preview' | 'update-preview'
  selectedText?: string
  style?: string
  provider?: AIProvider
  model?: string
}

export interface PreviewResponse {
  originalText: string
  rewrittenText: string
  style: string
  provider: AIProvider
  model: string
  timestamp: number
}
```

### **Content Script Integration**

#### **Text Selection Handler**
```typescript
// Enhanced text selection detection
const handleTextSelection = () => {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    // Send message to open preview panel
    chrome.runtime.sendMessage({
      type: 'open-preview',
      selectedText: selection.toString().trim(),
      tabId: getCurrentTabId()
    })
  }
}
```

#### **Side Panel Injection**
```typescript
// Inject side panel into page
const injectPreviewPanel = () => {
  const panel = document.createElement('div')
  panel.id = 'ai-oneclick-preview-panel'
  panel.className = 'ai-oneclick-panel'
  // Add panel content and styling
  document.body.appendChild(panel)
}
```

### **Background Script Updates**

#### **Preview Mode Handler**
```typescript
// Handle preview mode requests
chrome.runtime.onMessage.addListener(async (message, sender) => {
  if (message.type === 'open-preview' && sender.tab?.id) {
    // Open preview panel in content script
    await chrome.tabs.sendMessage(sender.tab.id, {
      type: 'show-preview-panel',
      selectedText: message.selectedText
    })
  }
  
  if (message.type === 'rewrite-preview' && sender.tab?.id) {
    // Process AI rewrite for preview
    const result = await handleRewrite(message.selectedText, sender.tab.id, message.style)
    await chrome.tabs.sendMessage(sender.tab.id, {
      type: 'update-preview-result',
      rewrittenText: result.rewrittenText,
      style: message.style
    })
  }
})
```

## 🎨 Styling and CSS

### **Panel Positioning**
```css
.ai-oneclick-preview-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  border-left: 1px solid #e5e7eb;
  box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
  z-index: 999999;
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.ai-oneclick-panel-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.ai-oneclick-panel-content {
  padding: 16px;
}

.ai-oneclick-text-area {
  width: 100%;
  min-height: 120px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
}

.ai-oneclick-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.ai-oneclick-button:hover {
  background: #2563eb;
}

.ai-oneclick-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
```

## 🚀 Advanced Features

### **1. Smart Suggestions**
- **Style recommendations**: Suggest styles based on text content
- **Context-aware presets**: Auto-select appropriate style for emails, social media, etc.
- **Learning preferences**: Remember user's preferred styles for different contexts

### **2. Batch Processing**
- **Multiple selections**: Process multiple text blocks at once
- **Batch apply**: Apply same style to multiple selections
- **Progress tracking**: Show progress for batch operations

### **3. Collaboration Features**
- **Share rewrites**: Export rewritten text with style information
- **Team presets**: Share custom styles with team members
- **Version history**: Track changes and allow reverting

### **4. Analytics and Insights**
- **Usage statistics**: Track most used styles and providers
- **Performance metrics**: Monitor AI response times
- **Quality feedback**: Allow users to rate rewrite quality

## 📱 Responsive Design

### **Mobile Considerations**
- **Collapsible panel**: Auto-hide on small screens
- **Touch-friendly**: Larger buttons and touch targets
- **Swipe gestures**: Swipe to open/close panel
- **Keyboard optimization**: Better mobile keyboard support

### **Accessibility**
- **Screen reader support**: Proper ARIA labels and descriptions
- **Keyboard navigation**: Full keyboard accessibility
- **High contrast mode**: Support for high contrast themes
- **Font scaling**: Respect user's font size preferences

## 🔄 Integration with Existing Features

### **Mode Switching**
- **Settings integration**: Add preview mode toggle in options
- **Keyboard shortcuts**: Quick switch between auto-replace and preview
- **Context awareness**: Remember mode preference per website

### **API Integration**
- **Provider switching**: Allow changing providers in preview mode
- **Model selection**: Switch AI models on the fly
- **Custom instructions**: Real-time preview with custom prompts

## 🎯 User Workflow

### **Typical User Journey**
1. **Select text** on any webpage
2. **Side panel opens** automatically with selected text
3. **Choose writing style** from dropdown or custom instructions
4. **See real-time preview** of rewritten text
5. **Compare versions** side-by-side
6. **Apply changes** to page or copy to clipboard
7. **Close panel** when done

### **Power User Features**
- **Keyboard shortcuts** for quick actions
- **Style presets** for common use cases
- **Batch operations** for multiple text blocks
- **Advanced customization** options

## 📊 Success Metrics

### **User Engagement**
- **Panel usage**: How often users open the preview panel
- **Style switching**: Frequency of style changes
- **Apply rate**: Percentage of previews that get applied
- **Session duration**: Time spent in preview mode

### **Quality Metrics**
- **User satisfaction**: Ratings for rewrite quality
- **Regeneration rate**: How often users regenerate text
- **Style preferences**: Most popular writing styles
- **Provider usage**: Distribution across AI providers

---

This Preview Mode will significantly enhance the user experience by providing more control and visibility into the AI rewriting process! 🎉 