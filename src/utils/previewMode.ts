import { PreviewPanelState, AIProvider } from '@/types'

// Default preview panel state
export const getDefaultPreviewState = (): PreviewPanelState => ({
  isOpen: false,
  selectedText: '',
  rewrittenText: '',
  currentStyle: 'Professional concise',
  currentProvider: 'openai',
  currentModel: 'gpt-4o-mini',
  customInstructions: '',
  isLoading: false,
  error: undefined,
})

// Preview mode manager class
export class PreviewModeManager {
  private state: PreviewPanelState = getDefaultPreviewState()
  private listeners: ((state: PreviewPanelState) => void)[] = []

  // Subscribe to state changes
  subscribe(listener: (state: PreviewPanelState) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // Notify all listeners of state changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state))
  }

  // Update state
  private updateState(updates: Partial<PreviewPanelState>) {
    this.state = { ...this.state, ...updates }
    this.notifyListeners()
  }

  // Open preview panel with selected text
  openPreview(selectedText: string) {
    this.updateState({
      isOpen: true,
      selectedText: selectedText.trim(),
      rewrittenText: '',
      isLoading: false,
      error: undefined,
    })
  }

  // Close preview panel
  closePreview() {
    this.updateState({
      isOpen: false,
      selectedText: '',
      rewrittenText: '',
      isLoading: false,
      error: undefined,
    })
  }

  // Update writing style
  updateStyle(style: string) {
    this.updateState({
      currentStyle: style,
      rewrittenText: '', // Clear rewritten text when style changes
    })
  }

  // Update provider
  updateProvider(provider: AIProvider) {
    this.updateState({
      currentProvider: provider,
      rewrittenText: '', // Clear rewritten text when provider changes
    })
  }

  // Update model
  updateModel(model: string) {
    this.updateState({
      currentModel: model,
      rewrittenText: '', // Clear rewritten text when model changes
    })
  }

  // Update custom instructions
  updateCustomInstructions(instructions: string) {
    this.updateState({
      customInstructions: instructions,
      rewrittenText: '', // Clear rewritten text when instructions change
    })
  }

  // Set loading state
  setLoading(isLoading: boolean) {
    this.updateState({ isLoading })
  }

  // Set rewritten text
  setRewrittenText(text: string) {
    this.updateState({
      rewrittenText: text,
      isLoading: false,
      error: undefined,
    })
  }

  // Set error
  setError(error: string) {
    this.updateState({
      error,
      isLoading: false,
    })
  }

  // Get current state
  getState(): PreviewPanelState {
    return { ...this.state }
  }

  // Check if panel is open
  isOpen(): boolean {
    return this.state.isOpen
  }

  // Get selected text
  getSelectedText(): string {
    return this.state.selectedText
  }

  // Get current configuration
  getCurrentConfig() {
    return {
      style: this.state.currentStyle,
      provider: this.state.currentProvider,
      model: this.state.currentModel,
      customInstructions: this.state.customInstructions,
    }
  }
}

// Global preview mode manager instance
export const previewModeManager = new PreviewModeManager()

// Utility functions for text processing
export const processTextForPreview = async (
  text: string,
  _style: string,
  _provider: AIProvider,
  _model: string,
  _customInstructions?: string
): Promise<string> => {
  try {
    // This would integrate with your existing AI providers
    // For now, return a placeholder
    return `[AI Rewritten: ${text.substring(0, 50)}...]`
  } catch (error) {
    throw new Error(`Failed to process text: ${error}`)
  }
}

// Copy text to clipboard
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text)
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

// Word count utility
export const getWordCount = (text: string): number => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

// Character count utility
export const getCharacterCount = (text: string): number => {
  return text.length
}

// Text comparison utility
export const compareTexts = (original: string, rewritten: string) => {
  const originalWords = original.split(/\s+/)
  const rewrittenWords = rewritten.split(/\s+/)
  
  return {
    originalWordCount: originalWords.length,
    rewrittenWordCount: rewrittenWords.length,
    wordCountDifference: rewrittenWords.length - originalWords.length,
    compressionRatio: rewrittenWords.length / originalWords.length,
  }
} 