// import { setupBridge } from '@/utils/bridge'
// import { onMessage, sendMessage } from 'webext-bridge/content-script'

// Logging utility
let isDebugEnabled = false

const log = (...args: any[]) => {
  if (isDebugEnabled) {
    console.log(`[AI-OneClick-Rewrite Content] ${new Date().toISOString()}:`, ...args)
  }
}

const logError = (...args: any[]) => {
  if (isDebugEnabled) {
    console.error(`[AI-OneClick-Rewrite Content ERROR] ${new Date().toISOString()}:`, ...args)
  }
}

// Load debug setting
const updateDebugSetting = async () => {
  try {
    const result = await chrome.storage.sync.get(['debugLogs'])
    isDebugEnabled = result.debugLogs !== false
  } catch (error) {
    console.error('Failed to load debug setting:', error)
  }
}

// Load mode setting
const updateModeSetting = async () => {
  try {
    const result = await chrome.storage.sync.get(['mode'])
    isPreviewModeEnabled = result.mode === 'preview'
    log('Preview mode setting loaded:', isPreviewModeEnabled)
  } catch (error) {
    console.error('Failed to load mode setting:', error)
  }
}

// Load auto-detection setting
const updateAutoDetectionSetting = async () => {
  try {
    const result = await chrome.storage.sync.get(['autoDetection'])
    autoDetectionMode = result.autoDetection || 'always'
    log('Auto-detection setting loaded:', autoDetectionMode)
  } catch (error) {
    console.error('Failed to load auto-detection setting:', error)
  }
}

// Get current tab ID (webext-bridge handles this automatically)
const getCurrentTabId = (): number => {
  // webext-bridge will automatically inject the correct tabId
  return 0 // This will be replaced by webext-bridge
}

// Floating button state
let floatingButton: HTMLElement | null = null
let isButtonVisible = false
let currentSelection = ''

// Preview mode state
let previewPanel: HTMLElement | null = null
let isPreviewModeEnabled = false
let originalSelectionRange: Range | null = null

// Auto-detection state
let autoDetectionMode: 'always' | 'right-click-only' | 'disabled' = 'always'

// Create floating button
const createFloatingButton = (): HTMLElement => {
  const button = document.createElement('div')
  button.id = 'ai-oneclick-rewrite-button'
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" 
            fill="white" stroke="none"/>
    </svg>
  `

  // Styles
  Object.assign(button.style, {
    position: 'fixed',
    zIndex: '2147483647',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    border: '2px solid white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: '0',
    transform: 'scale(0.8)',
    pointerEvents: 'none',
  })

  // Hover effects
  button.onmouseenter = () => {
    if (!button.classList.contains('loading')) {
      Object.assign(button.style, {
        transform: 'scale(1.1)',
        boxShadow: '0 6px 20px rgba(59, 130, 246, 0.6)',
      })
    }
  }

  button.onmouseleave = () => {
    if (!button.classList.contains('loading')) {
      Object.assign(button.style, {
        transform: 'scale(1)',
        boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
      })
    }
  }

  // Click handler
  button.onclick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    log('Floating button clicked')

    if (!currentSelection) {
      showErrorNotification('No text selected')
      return
    }

    // In preview mode, open the preview panel instead of auto-rewriting
    if (isPreviewModeEnabled) {
      openPreviewPanel(currentSelection)
      return
    }

    // Auto-replace mode: proceed with immediate rewrite
    showButtonLoading()
    showTextLoading()

    try {
      chrome.runtime.sendMessage({
        type: 'trigger-rewrite',
        selection: currentSelection,
        tabId: getCurrentTabId(),
      })
    } catch (error: any) {
      logError('Failed to send rewrite message:', error)
      showErrorNotification('Failed to communicate with extension')
      hideButtonLoading()
      hideTextLoading()
    }
  }

  document.body.appendChild(button)
  return button
}

// Show floating button
const showFloatingButton = (x: number, y: number) => {
  if (!floatingButton) {
    floatingButton = createFloatingButton()
  }

  // Position button near selection but avoid edges
  const margin = 50
  const buttonX = Math.min(Math.max(x, margin), window.innerWidth - margin)
  const buttonY = Math.min(Math.max(y - 60, margin), window.innerHeight - margin)

  Object.assign(floatingButton.style, {
    left: `${buttonX}px`,
    top: `${buttonY}px`,
    opacity: '1',
    transform: 'scale(1)',
    pointerEvents: 'auto',
  })

  isButtonVisible = true
  log('Floating button shown at', { x: buttonX, y: buttonY })
}

// Hide floating button
const hideFloatingButton = () => {
  if (floatingButton && isButtonVisible) {
    Object.assign(floatingButton.style, {
      opacity: '0',
      transform: 'scale(0.8)',
      pointerEvents: 'none',
    })
    isButtonVisible = false
    log('Floating button hidden')
  }
}

// Show loading state on button
const showButtonLoading = () => {
  if (!floatingButton) return

  floatingButton.classList.add('loading')
  floatingButton.innerHTML = `
    <div style="width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); 
                border-top: 2px solid white; border-radius: 50%; 
                animation: spin 1s linear infinite;">
    </div>
    <style>
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
  `

  Object.assign(floatingButton.style, {
    cursor: 'default',
    transform: 'scale(1)',
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.4)',
  })
}

// Hide loading state on button
const hideButtonLoading = () => {
  if (!floatingButton) return

  floatingButton.classList.remove('loading')
  floatingButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" 
            fill="white" stroke="none"/>
    </svg>
  `

  Object.assign(floatingButton.style, {
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)',
  })
}

// Loading functions (simplified for Preview Mode)
const showTextLoading = () => {
  // No longer needed with Preview Mode
  log('Text loading requested (Preview Mode handles this)')
}

const updateLoadingMessage = (_message: string) => {
  // No longer needed with Preview Mode
  log('Loading message update requested (Preview Mode handles this)')
}

const hideTextLoading = () => {
  // No longer needed with Preview Mode
  log('Text loading hide requested (Preview Mode handles this)')
}

// Replace selected text
const replaceSelection = (newText: string) => {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    log('No selection found for replacement')
    return
  }

  try {
    const range = selection.getRangeAt(0)

    // Handle input fields
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
    ) {
      const start = activeElement.selectionStart || 0
      const end = activeElement.selectionEnd || 0
      const currentValue = activeElement.value

      activeElement.value = currentValue.substring(0, start) + newText + currentValue.substring(end)
      activeElement.selectionStart = start
      activeElement.selectionEnd = start + newText.length

      // Trigger change event
      activeElement.dispatchEvent(new Event('input', { bubbles: true }))
      log('Text replaced in input field')
    } else {
      // Handle regular text content
      range.deleteContents()
      range.insertNode(document.createTextNode(newText))

      // Clear selection
      selection.removeAllRanges()
      log('Text replaced in content')
    }

    currentSelection = ''
    hideFloatingButton()

    // Show brief success indication
    showSuccessNotification('Text rewritten successfully!')
  } catch (error: any) {
    logError('Failed to replace selection:', error)
    showErrorNotification('Failed to replace text')
  }
}

// Replace text using stored selection range (for Preview Panel)
const replaceWithStoredRange = (newText: string) => {
  if (!originalSelectionRange) {
    log('No stored selection range found')
    showErrorNotification('No text selection found to replace')
    return
  }

  try {
    // Handle input fields
    const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement
    if (
      activeElement &&
      (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
    ) {
      // For input fields, we need to restore the selection first
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(originalSelectionRange)
      }
      
      const start = activeElement.selectionStart || 0
      const end = activeElement.selectionEnd || 0
      const currentValue = activeElement.value

      activeElement.value = currentValue.substring(0, start) + newText + currentValue.substring(end)
      activeElement.selectionStart = start
      activeElement.selectionEnd = start + newText.length

      // Trigger change event
      activeElement.dispatchEvent(new Event('input', { bubbles: true }))
      log('Text replaced in input field using stored range')
    } else {
      // Handle regular text content
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(originalSelectionRange)
      }

      originalSelectionRange.deleteContents()
      originalSelectionRange.insertNode(document.createTextNode(newText))

      // Clear selection
      selection?.removeAllRanges()
      log('Text replaced in content using stored range')
    }

    // Clear stored range
    originalSelectionRange = null
    currentSelection = ''
    hideFloatingButton()

    // Show brief success indication
    showSuccessNotification('Text applied to page successfully!')
  } catch (error: any) {
    logError('Failed to replace with stored range:', error)
    showErrorNotification('Failed to apply text to page')
  }
}

// Show error notification
const showErrorNotification = (message: string) => {
  const notification = document.createElement('div')
  notification.id = 'ai-oneclick-rewrite-error'

  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: 'white',
    padding: '16px 20px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
    zIndex: '2147483647',
    fontSize: '14px',
    fontWeight: '500',
    maxWidth: '350px',
    animation: 'slideInRight 0.3s ease-out',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    lineHeight: '1.4',
  })

  // Add animation styles
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `
  document.head.appendChild(style)

  // Add warning icon and message
  notification.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink: 0; margin-top: 1px;">
      <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <div style="flex: 1;">
      <div style="font-weight: 600; margin-bottom: 4px;">AI Rewrite Error</div>
      <div style="font-size: 13px; opacity: 0.95;">${message}</div>
    </div>
  `
  document.body.appendChild(notification)

  // Auto remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out'
    setTimeout(() => {
      notification.remove()
      style.remove()
    }, 300)
  }, 3000)

  log('Error notification shown:', message)
}

// Show success notification
const showSuccessNotification = (message: string) => {
  const notification = document.createElement('div')
  notification.id = 'ai-oneclick-rewrite-success'

  Object.assign(notification.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '8px',
    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
    zIndex: '2147483647',
    fontSize: '14px',
    fontWeight: '600',
    maxWidth: '300px',
    animation: 'slideInRight 0.3s ease-out',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  })

  // Add checkmark icon
  notification.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span>${message}</span>
  `

  // Add animation styles if not already present
  const existingStyle = document.getElementById('notification-styles')
  if (!existingStyle) {
    const style = document.createElement('style')
    style.id = 'notification-styles'
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }

  document.body.appendChild(notification)

  // Auto remove after 2 seconds (shorter than error notifications)
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.3s ease-out'
    setTimeout(() => {
      notification.remove()
    }, 300)
  }, 2000)

  log('Success notification shown:', message)
}

// Show setup required modal
const showSetupRequiredModal = (provider: string) => {
  // Remove any existing modal
  const existingModal = document.getElementById('ai-oneclick-rewrite-setup-modal')
  if (existingModal) {
    existingModal.remove()
  }

  // Create modal overlay
  const modalOverlay = document.createElement('div')
  modalOverlay.id = 'ai-oneclick-rewrite-setup-modal'

  Object.assign(modalOverlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    zIndex: '2147483647',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.3s ease-out',
  })

  // Create modal content
  const modal = document.createElement('div')
  Object.assign(modal.style, {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '16px',
    boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    maxWidth: '440px',
    width: '90%',
    padding: '32px',
    textAlign: 'center',
    animation: 'slideInScale 0.3s ease-out',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  })

  // Provider name mapping
  const providerNames: { [key: string]: string } = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    gemini: 'Google Gemini',
  }

  modal.innerHTML = `
    <div style="margin-bottom: 24px;">
      <div style="width: 64px; height: 64px; margin: 0 auto 16px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h2 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #1e293b; line-height: 1.2;">
        API Key Required
      </h2>
      <p style="margin: 0; font-size: 16px; color: #64748b; line-height: 1.5;">
        You need to configure your <strong>${providerNames[provider] || provider}</strong> API key to use AI rewriting.
      </p>
    </div>
    
    <div style="display: flex; gap: 12px; justify-content: center;">
      <button id="setup-cancel-btn" style="
        background: #f1f5f9; 
        border: 2px solid #e2e8f0; 
        color: #64748b; 
        padding: 12px 24px; 
        border-radius: 8px; 
        font-size: 14px; 
        font-weight: 600; 
        cursor: pointer; 
        transition: all 0.2s ease;
        font-family: inherit;
      ">
        Cancel
      </button>
      <button id="setup-open-btn" style="
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
        border: none; 
        color: white; 
        padding: 12px 24px; 
        border-radius: 8px; 
        font-size: 14px; 
        font-weight: 600; 
        cursor: pointer; 
        transition: all 0.2s ease;
        font-family: inherit;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      ">
        Open Settings
      </button>
    </div>
  `

  // Add animation styles
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideInScale {
      from { transform: scale(0.9) translateY(20px); opacity: 0; }
      to { transform: scale(1) translateY(0); opacity: 1; }
    }
    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }
    @keyframes slideOutScale {
      from { transform: scale(1) translateY(0); opacity: 1; }
      to { transform: scale(0.9) translateY(20px); opacity: 0; }
    }
    #setup-cancel-btn:hover {
      background: #e2e8f0 !important;
      border-color: #cbd5e1 !important;
      color: #475569 !important;
    }
    #setup-open-btn:hover {
      transform: translateY(-1px) !important;
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4) !important;
    }
  `
  document.head.appendChild(style)

  modalOverlay.appendChild(modal)
  document.body.appendChild(modalOverlay)

  // Event handlers
  const closeModal = () => {
    modalOverlay.style.animation = 'fadeOut 0.3s ease-out'
    modal.style.animation = 'slideOutScale 0.3s ease-out'
    setTimeout(() => {
      modalOverlay.remove()
      style.remove()
    }, 300)
  }

  // Cancel button
  const cancelBtn = modal.querySelector('#setup-cancel-btn')
  cancelBtn?.addEventListener('click', closeModal)

  // Open settings button
  const openBtn = modal.querySelector('#setup-open-btn')
  openBtn?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openOptions' })
    closeModal()
  })

  // Close on overlay click
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal()
    }
  })

  // Close on Escape key
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal()
      document.removeEventListener('keydown', handleKeydown)
    }
  }
  document.addEventListener('keydown', handleKeydown)

  log('Setup required modal shown for provider:', provider)
}

// Handle text selection changes
const handleSelectionChange = () => {
  const selection = window.getSelection()
  const selectedText = selection?.toString().trim() || ''

  if (selectedText && selectedText.length > 0) {
    currentSelection = selectedText

    // Check auto-detection setting
    if (autoDetectionMode === 'disabled') {
      // Don't show any visual feedback
      log('Auto-detection disabled - no visual feedback for text selection')
      return
    }

    if (autoDetectionMode === 'right-click-only') {
      // Don't show floating button, but still track selection for context menu
      log('Right-click only mode - no floating button shown')
      return
    }

    // Auto-detection mode is 'always' - show floating button
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      if (rect.width > 0 && rect.height > 0) {
        showFloatingButton(rect.left + rect.width / 2, rect.top + window.scrollY)
        log('Text selected:', { length: selectedText.length })
      }
    }
    
    // Preview mode is enabled but don't auto-open panel
    // Panel will only open when user explicitly requests it (right-click or button click)
    if (isPreviewModeEnabled) {
      log('Preview mode enabled - text selected but panel not auto-opened')
    }
  } else {
    currentSelection = ''
    hideFloatingButton()
  }
}

// Message handlers using standard Chrome messaging
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  switch (message.type) {
    case 'show-loading':
      log('Received show-loading message')
      showTextLoading()
      break

    case 'update-loading':
      log('Received update-loading message:', message.message)
      updateLoadingMessage(message.message)
      break

    case 'hide-loading':
      log('Received hide-loading message')
      hideButtonLoading()
      hideTextLoading()
      break

    case 'replace-selection':
      log('Received replace-selection message:', message.rewrittenText.length, 'characters')

      // Check if this is from an inline icon
      if ((window as any).aiOneclickActiveInput) {
        const input = (window as any).aiOneclickActiveInput
        setInputValue(input, message.rewrittenText)

        // Remove loading state from icon
        const container = input.parentElement
        const icon = container?.querySelector('.ai-oneclick-icon')
        if (icon) {
          icon.classList.remove('loading')
        }

        // Clear reference
        delete (window as any).aiOneclickActiveInput

        showSuccessNotification('Text rewritten successfully!')
      } else {
        // Regular text selection replacement
        replaceSelection(message.rewrittenText)
        hideButtonLoading()
        hideTextLoading()
        showSuccessNotification('Text rewritten successfully!')
      }
      break

    case 'show-error':
      log('Received show-error message:', message.error)

      // Check if this is from an inline icon
      if ((window as any).aiOneclickActiveInput) {
        const input = (window as any).aiOneclickActiveInput

        // Remove loading state from icon
        const container = input.parentElement
        const icon = container?.querySelector('.ai-oneclick-icon')
        if (icon) {
          icon.classList.remove('loading')
        }

        // Clear reference
        delete (window as any).aiOneclickActiveInput
      } else {
        hideButtonLoading()
        hideTextLoading()
      }

      showErrorNotification(message.error)
      break

    case 'show-setup-required':
      log('Received show-setup-required message for provider:', message.provider)
      showSetupRequiredModal(message.provider)
      hideButtonLoading()
      hideTextLoading()
      break

    case 'show-preview-panel':
      log('Received show-preview-panel message')
      if (message.selectedText) {
        openPreviewPanel(message.selectedText)
      }
      break

    case 'update-preview-result':
      log('Received update-preview-result message')
      const rewrittenTextArea = document.getElementById('rewritten-text') as HTMLTextAreaElement
      const rewriteBtn = document.getElementById('preview-rewrite-btn') as HTMLButtonElement
      
      // Handle error case
      if (message.error) {
        log('Preview rewrite error:', message.error)
        
        // Show error in the rewritten text area
        if (rewrittenTextArea) {
          rewrittenTextArea.value = `❌ Error: ${message.error}`
          rewrittenTextArea.style.color = '#dc2626'
          rewrittenTextArea.style.backgroundColor = '#fef2f2'
          rewrittenTextArea.style.borderColor = '#fca5a5'
        }
        
        // Reset button
        if (rewriteBtn) {
          rewriteBtn.disabled = false
          rewriteBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Rewrite with AI
          `
        }
        
        // Show error notification
        showErrorNotification(message.error)
        break
      }
      
      // Handle success case
      if (rewrittenTextArea && message.rewrittenText) {
        rewrittenTextArea.value = message.rewrittenText
        rewrittenTextArea.style.color = '#374151'
        rewrittenTextArea.style.backgroundColor = 'white'
        rewrittenTextArea.style.borderColor = '#e5e7eb'
      }
      
      if (rewriteBtn) {
        rewriteBtn.disabled = false
        rewriteBtn.innerHTML = `
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Rewrite with AI
        `
      }
      break

    case 'ping':
      log('Received ping message')
      // Content script is ready
      break

    case 'update-auto-detection':
      log('Received update-auto-detection message:', message.mode)
      autoDetectionMode = message.mode as 'always' | 'right-click-only' | 'disabled'
      
      // Hide floating button if auto-detection is disabled or set to right-click-only
      if (autoDetectionMode !== 'always') {
        hideFloatingButton()
      }
      break

    case 'toggle-preview-mode':
      log('Received toggle-preview-mode message')
      isPreviewModeEnabled = message.enabled || false
      
      // Close preview panel if it's open and mode is being disabled
      if (!isPreviewModeEnabled && previewPanel) {
        closePreviewPanel()
      }
      
      log(`Preview mode ${isPreviewModeEnabled ? 'enabled' : 'disabled'}`)
      break
  }
})

// Storage change listener for debug setting
chrome.storage.onChanged.addListener((changes) => {
  if (changes.debugLogs) {
    isDebugEnabled = changes.debugLogs.newValue !== false
    log('Debug logging setting changed:', isDebugEnabled)
  }
})

// Initialize
updateDebugSetting()
updateModeSetting()
updateAutoDetectionSetting()
// setupBridge() // No longer needed with standard Chrome messaging

// Preview Mode Functions
const createPreviewPanel = (): HTMLElement => {
  const panel = document.createElement('div')
  panel.id = 'ai-oneclick-preview-panel'
  panel.className = 'ai-oneclick-preview-panel'
  
  // Add modern styling with animations
  Object.assign(panel.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '420px',
    height: '100vh',
    background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
    borderLeft: '1px solid rgba(59, 130, 246, 0.1)',
    boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.08), -4px 0 16px rgba(59, 130, 246, 0.1)',
    zIndex: '999999',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backdropFilter: 'blur(20px)',
  })

  // Add animation styles
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    @keyframes shimmer {
      0% { background-position: -200px 0; }
      100% { background-position: calc(200px + 100%) 0; }
    }
  `
  document.head.appendChild(style)

  // Create header
  const header = document.createElement('div')
  header.className = 'ai-oneclick-panel-header'
  Object.assign(header.style, {
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  })

  // Add subtle pattern overlay
  header.innerHTML = `
    <div style="
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
      pointer-events: none;
    "></div>
  `

  const title = document.createElement('h3')
  title.textContent = 'AI One-Click Rewrite'
  title.style.margin = '0'
  title.style.fontSize = '20px'
  title.style.fontWeight = '700'
  title.style.letterSpacing = '-0.025em'
  title.style.position = 'relative'
  title.style.zIndex = '1'

  const subtitle = document.createElement('div')
  subtitle.textContent = 'Preview Mode'
  subtitle.style.fontSize = '13px'
  subtitle.style.opacity = '0.9'
  subtitle.style.fontWeight = '500'
  subtitle.style.marginTop = '2px'
  subtitle.style.position = 'relative'
  subtitle.style.zIndex = '1'

  const titleContainer = document.createElement('div')
  titleContainer.appendChild(title)
  titleContainer.appendChild(subtitle)

  const closeButton = document.createElement('button')
  closeButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `
  closeButton.onclick = () => closePreviewPanel()
  closeButton.onmouseenter = () => {
    closeButton.style.background = 'rgba(255, 255, 255, 0.2)'
    closeButton.style.transform = 'scale(1.05)'
  }
  closeButton.onmouseleave = () => {
    closeButton.style.background = 'rgba(255, 255, 255, 0.1)'
    closeButton.style.transform = 'scale(1)'
  }
  Object.assign(closeButton.style, {
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    position: 'relative',
    zIndex: '1',
  })

  header.appendChild(titleContainer)
  header.appendChild(closeButton)
  panel.appendChild(header)

  // Create content area
  const content = document.createElement('div')
  content.className = 'ai-oneclick-panel-content'
  Object.assign(content.style, {
    flex: '1',
    overflow: 'auto',
    padding: '24px',
    animation: 'fadeIn 0.4s ease-out 0.1s both',
  })

  // Add modern content
  content.innerHTML = `
    <!-- Writing Style Section -->
    <div style="margin-bottom: 24px; animation: fadeIn 0.4s ease-out 0.2s both;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="white"/>
          </svg>
        </div>
        <label style="font-weight: 600; color: #1f2937; font-size: 14px;">Writing Style</label>
      </div>
      
      <select id="preview-style-select" style="
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        background: white;
        font-size: 14px;
        color: #374151;
        transition: all 0.2s ease;
        cursor: pointer;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      ">
        <option value="Professional concise">✨ Professional & Concise</option>
        <option value="Friendly & clear">😊 Friendly & Clear</option>
        <option value="Polish grammar only">📝 Polish Grammar Only</option>
        <option value="Shorten to 1–2 sentences">⚡ Shorten to 1-2 Sentences</option>
        <option value="Make it more assertive">💪 Make it More Assertive</option>
        <option value="Custom">🎨 Custom Instructions...</option>
      </select>
    </div>
    
    <!-- Custom Instructions Section -->
    <div id="custom-instructions" style="display: none; margin-bottom: 24px; animation: fadeIn 0.4s ease-out 0.3s both;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <label style="font-weight: 600; color: #1f2937; font-size: 14px;">Custom Instructions</label>
      </div>
      
      <textarea id="custom-instructions-text" placeholder="Tell me exactly how you want your text rewritten..." 
                style="
                  width: 100%;
                  min-height: 80px;
                  padding: 12px 16px;
                  border: 2px solid #e5e7eb;
                  border-radius: 12px;
                  background: white;
                  font-size: 14px;
                  color: #374151;
                  resize: vertical;
                  transition: all 0.2s ease;
                  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                  font-family: inherit;
                "></textarea>
    </div>
    
    <!-- Rewrite Button -->
    <button id="preview-rewrite-btn" style="
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      margin-bottom: 24px;
      font-weight: 600;
      font-size: 15px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      animation: fadeIn 0.4s ease-out 0.4s both;
    ">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Rewrite with AI
    </button>
    
    <!-- Original Text Section -->
    <div style="margin-bottom: 24px; animation: fadeIn 0.4s ease-out 0.5s both;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="14,2 14,8 20,8" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="16" y1="13" x2="8" y2="13" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="16" y1="17" x2="8" y2="17" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="10,9 9,9 8,9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <label style="font-weight: 600; color: #1f2937; font-size: 14px;">Original Text</label>
      </div>
      
      <textarea id="original-text" readonly 
                style="
                  width: 100%;
                  min-height: 120px;
                  padding: 16px;
                  border: 2px solid #e5e7eb;
                  border-radius: 12px;
                  background: #f9fafb;
                  font-size: 14px;
                  color: #6b7280;
                  resize: vertical;
                  font-family: inherit;
                  line-height: 1.5;
                "></textarea>
    </div>
    
    <!-- Rewritten Text Section -->
    <div style="animation: fadeIn 0.4s ease-out 0.6s both;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="white"/>
          </svg>
        </div>
        <label style="font-weight: 600; color: #1f2937; font-size: 14px;">Rewritten Text</label>
      </div>
      
      <textarea id="rewritten-text" 
                style="
                  width: 100%;
                  min-height: 120px;
                  padding: 16px;
                  border: 2px solid #e5e7eb;
                  border-radius: 12px;
                  background: white;
                  font-size: 14px;
                  color: #374151;
                  resize: vertical;
                  font-family: inherit;
                  line-height: 1.5;
                  transition: all 0.2s ease;
                "></textarea>
      
      <!-- Action Button -->
      <div style="margin-top: 16px;">
        <button id="apply-btn" style="
          width: 100%;
          padding: 12px 16px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Apply to Page
        </button>
      </div>
      
      <!-- AI Model Indicator -->
      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; animation: fadeIn 0.4s ease-out 0.7s both;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="
            width: 20px;
            height: 20px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="white"/>
            </svg>
          </div>
          <label style="font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">AI Model</label>
        </div>
        <div id="ai-model-indicator" style="
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          color: #374151;
        ">
          <div id="ai-provider-icon" style="
            width: 16px;
            height: 16px;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            color: white;
          "></div>
          <span id="ai-model-text" style="font-weight: 500;">Loading...</span>
        </div>
      </div>
    </div>
  `

  panel.appendChild(content)
  return panel
}

const openPreviewPanel = (selectedText: string) => {
  log('Opening preview panel with text:', selectedText.substring(0, 50) + '...')
  
  // Store the original selection range before opening panel
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    originalSelectionRange = selection.getRangeAt(0).cloneRange()
    log('Original selection range stored')
  }
  
  // Remove existing panel if any
  if (previewPanel) {
    document.body.removeChild(previewPanel)
  }

  // Create new panel
  previewPanel = createPreviewPanel()
  document.body.appendChild(previewPanel)

  // Set original text
  const originalTextArea = document.getElementById('original-text') as HTMLTextAreaElement
  if (originalTextArea) {
    originalTextArea.value = selectedText
  }

  // Load and display AI model information
  loadAIModelInfo()

  // Handle style selection
  const styleSelect = document.getElementById('preview-style-select') as HTMLSelectElement
  const customInstructions = document.getElementById('custom-instructions') as HTMLElement
  const customInstructionsText = document.getElementById('custom-instructions-text') as HTMLTextAreaElement

  if (styleSelect) {
    styleSelect.onchange = () => {
      if (styleSelect.value === 'Custom') {
        customInstructions.style.display = 'block'
      } else {
        customInstructions.style.display = 'none'
      }
    }
  }

  // Handle rewrite button
  const rewriteBtn = document.getElementById('preview-rewrite-btn') as HTMLButtonElement
  if (rewriteBtn) {
    rewriteBtn.onclick = async () => {
      const style = styleSelect?.value || 'Professional concise'
      const customInstructions = customInstructionsText?.value || ''
      
      await handlePreviewRewrite(selectedText, style, customInstructions)
    }
  }

  // Handle apply button
  const applyBtn = document.getElementById('apply-btn') as HTMLButtonElement
  if (applyBtn) {
    applyBtn.onclick = () => {
      const rewrittenText = (document.getElementById('rewritten-text') as HTMLTextAreaElement)?.value
      if (rewrittenText && !rewrittenText.startsWith('❌ Error:')) {
        replaceWithStoredRange(rewrittenText)
        closePreviewPanel()
      } else if (rewrittenText?.startsWith('❌ Error:')) {
        showErrorNotification('Cannot apply error message to page. Please try rewriting again.')
      } else {
        showErrorNotification('No rewritten text to apply')
      }
    }
  }


}

// Load and display AI model information
const loadAIModelInfo = async () => {
  try {
    const result = await chrome.storage.sync.get(['provider', 'models'])
    const provider = result.provider || 'openai'
    const models = result.models || {}
    const model = models[provider] || 'gpt-4o-mini'
    
    const providerIcon = document.getElementById('ai-provider-icon') as HTMLElement
    const modelText = document.getElementById('ai-model-text') as HTMLElement
    
    if (providerIcon && modelText) {
      // Set provider icon and color
      const providerColors = {
        openai: { bg: '#10a37f', text: 'O' },
        anthropic: { bg: '#d97706', text: 'C' },
        gemini: { bg: '#4285f4', text: 'G' }
      }
      
      const color = providerColors[provider as keyof typeof providerColors] || providerColors.openai
      providerIcon.style.background = color.bg
      providerIcon.textContent = color.text
      
      // Set model text
      const modelNames = {
        'gpt-4o-mini': 'GPT-4o Mini',
        'gpt-4o': 'GPT-4o',
        'claude-3-haiku-20240307': 'Claude Haiku',
        'claude-3-sonnet-20240229': 'Claude Sonnet',
        'claude-3-opus-20240229': 'Claude Opus',
        'gemini-1.5-flash-latest': 'Gemini Flash',
        'gemini-1.5-pro-latest': 'Gemini Pro'
      }
      
      const displayName = modelNames[model as keyof typeof modelNames] || model
      modelText.textContent = `${displayName} (${provider.charAt(0).toUpperCase() + provider.slice(1)})`
      
      log('AI model info loaded:', { provider, model, displayName })
    }
  } catch (error) {
    logError('Failed to load AI model info:', error)
    const modelText = document.getElementById('ai-model-text') as HTMLElement
    if (modelText) {
      modelText.textContent = 'Settings not found'
    }
  }
}

const closePreviewPanel = () => {
  if (previewPanel) {
    // Add slide out animation
    previewPanel.style.animation = 'slideOutRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    
    setTimeout(() => {
      if (previewPanel && previewPanel.parentNode) {
        document.body.removeChild(previewPanel)
        previewPanel = null
      }
      // Clear stored selection range when panel closes
      originalSelectionRange = null
    }, 300)
  }
}

const handlePreviewRewrite = async (text: string, style: string, customInstructions: string) => {
  const rewriteBtn = document.getElementById('preview-rewrite-btn') as HTMLButtonElement
  
  if (rewriteBtn) {
    rewriteBtn.disabled = true
    rewriteBtn.textContent = 'Processing...'
  }

  try {
    // Send message to background script for AI processing
    chrome.runtime.sendMessage({
      type: 'rewrite-preview',
      selection: text,
      style: style,
      customInstructions: customInstructions,
      tabId: getCurrentTabId(),
    })
  } catch (error: any) {
    logError('Failed to send preview rewrite message:', error)
    if (rewriteBtn) {
      rewriteBtn.disabled = false
      rewriteBtn.textContent = 'Rewrite Text'
    }
  }
}

// Storage change listener for mode updates
chrome.storage.onChanged.addListener((changes) => {
  if (changes.mode) {
    isPreviewModeEnabled = changes.mode.newValue === 'preview'
    log('Preview mode setting changed:', isPreviewModeEnabled)
    
    // Close preview panel if it's open and mode is being disabled
    if (!isPreviewModeEnabled && previewPanel) {
      closePreviewPanel()
    }
    
    log(`Preview mode ${isPreviewModeEnabled ? 'enabled' : 'disabled'}`)
    
    // Show mode change notification
    if (isPreviewModeEnabled) {
      showSuccessNotification('Preview Mode enabled - Select text to open side panel')
    } else {
      showSuccessNotification('Auto-Replace Mode enabled - Click button for instant rewrite')
    }
  }
  if (changes.debugLogs) {
    isDebugEnabled = changes.debugLogs.newValue !== false
  }
  if (changes.autoDetection) {
    autoDetectionMode = changes.autoDetection.newValue as 'always' | 'right-click-only' | 'disabled'
    log('Auto-detection setting changed:', autoDetectionMode)
    
    // Hide floating button if auto-detection is disabled or set to right-click-only
    if (autoDetectionMode !== 'always') {
      hideFloatingButton()
    }
    
    // Show setting change notification
    switch (autoDetectionMode) {
      case 'always':
        showSuccessNotification('Floating button enabled - Shows on text selection')
        break
      case 'right-click-only':
        showSuccessNotification('Right-click only mode - Use context menu to rewrite')
        break
      case 'disabled':
        showSuccessNotification('Auto-detection disabled - Use extension icon in toolbar')
        break
    }
  }
})



// Event listeners
document.addEventListener('selectionchange', handleSelectionChange)

// Hide button when clicking elsewhere
document.addEventListener('click', (e) => {
  if (floatingButton && !floatingButton.contains(e.target as Node)) {
    setTimeout(handleSelectionChange, 10) // Small delay to check new selection
  }
})

// Handle page navigation
window.addEventListener('beforeunload', () => {
  hideFloatingButton()
  hideTextLoading()
})

// Signal to background script that content script is ready
chrome.runtime.sendMessage({ type: 'content-script-ready' }).catch(() => {
  // Ignore errors during startup
})

// === INLINE AI ICONS FEATURE (Grammarly-style) ===

const initializeInlineAIIcons = () => {
  log('Initializing inline AI icons for input fields')

  // Add global styles for inline AI icons
  addInlineIconStyles()

  // Find and setup existing input fields
  setupExistingInputFields()

  // Watch for dynamically added input fields
  watchForNewInputFields()
}

const addInlineIconStyles = () => {
  const styleId = 'ai-oneclick-inline-styles'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    .ai-oneclick-input-container {
      position: relative !important;
      display: inline-block !important;
      width: 100% !important;
    }
    
    .ai-oneclick-icon {
      position: absolute !important;
      right: 8px !important;
      top: 50% !important;
      transform: translateY(-50%) !important;
      width: 20px !important;
      height: 20px !important;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
      border-radius: 50% !important;
      cursor: pointer !important;
      z-index: 999999 !important;
      opacity: 0 !important;
      transition: all 0.2s ease !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4) !important;
      border: 2px solid rgba(255, 255, 255, 0.9) !important;
      backdrop-filter: blur(4px) !important;
    }
    
    .ai-oneclick-icon:hover {
      opacity: 1 !important;
      transform: translateY(-50%) scale(1.1) !important;
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.6) !important;
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%) !important;
    }
    
    .ai-oneclick-icon-visible {
      opacity: 0.8 !important;
    }
    
    .ai-oneclick-icon svg {
      width: 12px !important;
      height: 12px !important;
      color: white !important;
      fill: currentColor !important;
    }
    
    .ai-oneclick-icon.loading {
      opacity: 1 !important;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
      animation: ai-pulse 1.5s ease-in-out infinite !important;
    }
    
    .ai-oneclick-icon.loading svg {
      animation: ai-spin 1s linear infinite !important;
    }
    
    @keyframes ai-pulse {
      0%, 100% { box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3); }
      50% { box-shadow: 0 4px 16px rgba(245, 158, 11, 0.6); }
    }
    
    @keyframes ai-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    /* Tooltip styles */
    .ai-oneclick-tooltip {
      position: absolute !important;
      bottom: calc(100% + 8px) !important;
      right: 0 !important;
      background: rgba(0, 0, 0, 0.9) !important;
      color: white !important;
      padding: 6px 10px !important;
      border-radius: 6px !important;
      font-size: 12px !important;
      font-weight: 500 !important;
      white-space: nowrap !important;
      opacity: 0 !important;
      transform: translateY(4px) !important;
      transition: all 0.2s ease !important;
      pointer-events: none !important;
      z-index: 1000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    }
    
    .ai-oneclick-tooltip::after {
      content: '' !important;
      position: absolute !important;
      top: 100% !important;
      right: 12px !important;
      border: 4px solid transparent !important;
      border-top-color: rgba(0, 0, 0, 0.9) !important;
    }
    
    .ai-oneclick-icon:hover .ai-oneclick-tooltip {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
    
    /* Adjust input padding to make room for icon */
    .ai-oneclick-input-with-icon {
      padding-right: 36px !important;
    }
  `
  document.head.appendChild(style)
}

const setupExistingInputFields = () => {
  const selectors = [
    'input[type="text"]',
    'input[type="email"]',
    'input[type="search"]',
    'input[type="url"]',
    'input[type="tel"]',
    'input[type="password"]',
    'textarea',
    '[contenteditable="true"]',
  ]

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      setupInputField(element as HTMLInputElement | HTMLTextAreaElement)
    })
  })
}

const watchForNewInputFields = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element

          // Check if the added element is an input field
          if (isInputField(element)) {
            setupInputField(element as HTMLInputElement | HTMLTextAreaElement)
          }

          // Check for input fields within the added element
          element.querySelectorAll('input, textarea, [contenteditable="true"]').forEach((input) => {
            if (isInputField(input)) {
              setupInputField(input as HTMLInputElement | HTMLTextAreaElement)
            }
          })
        }
      })
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
}

const isInputField = (element: Element): boolean => {
  const tagName = element.tagName.toLowerCase()

  if (tagName === 'input') {
    const type = (element as HTMLInputElement).type
    return ['text', 'email', 'search', 'url', 'tel', 'password'].includes(type)
  }

  if (tagName === 'textarea') return true

  if (element.getAttribute('contenteditable') === 'true') return true

  return false
}

const setupInputField = (input: HTMLInputElement | HTMLTextAreaElement) => {
  // Skip if already setup or if it's our own elements
  if (input.dataset.aiOneclickSetup || input.id?.includes('ai-oneclick')) return

  // Skip if input is too small or hidden
  const rect = input.getBoundingClientRect()
  if (rect.width < 50 || rect.height < 20) return

  input.dataset.aiOneclickSetup = 'true'

  // Wrap input in container if not already wrapped
  let container = input.parentElement
  if (!container?.classList.contains('ai-oneclick-input-container')) {
    container = document.createElement('div')
    container.className = 'ai-oneclick-input-container'
    input.parentNode?.insertBefore(container, input)
    container.appendChild(input)
  }

  // Create AI icon
  const icon = createAIIcon(input)
  container.appendChild(icon)

  // Add event listeners
  setupInputEventListeners(input, icon)
}

const createAIIcon = (input: HTMLInputElement | HTMLTextAreaElement): HTMLElement => {
  const icon = document.createElement('div')
  icon.className = 'ai-oneclick-icon'

  // AI robot SVG icon
  icon.innerHTML = `
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7.5V9H21ZM3 9H9V7.5L3 7V9ZM15 11.5V13H9V11.5H15ZM21 13V15H15V13H21ZM9 13V15H3V13H9ZM12 15.5C10.62 15.5 9.5 16.62 9.5 18S10.62 20.5 12 20.5 14.5 18.88 14.5 18 13.38 15.5 12 15.5Z"/>
    </svg>
    <div class="ai-oneclick-tooltip">Rewrite with AI</div>
  `

  // Click handler
  icon.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    handleIconClick(input, icon)
  })

  return icon
}

const setupInputEventListeners = (
  input: HTMLInputElement | HTMLTextAreaElement,
  icon: HTMLElement
) => {
  let focusTimeout: number

  const showIcon = () => {
    const hasText = getInputValue(input).trim().length > 0
    if (hasText) {
      icon.classList.add('ai-oneclick-icon-visible')
      input.classList.add('ai-oneclick-input-with-icon')
    }
  }

  const hideIcon = () => {
    clearTimeout(focusTimeout)
    focusTimeout = setTimeout(() => {
      icon.classList.remove('ai-oneclick-icon-visible')
      input.classList.remove('ai-oneclick-input-with-icon')
    }, 100)
  }

  const updateIconVisibility = () => {
    const hasText = getInputValue(input).trim().length > 0
    if (document.activeElement === input && hasText) {
      showIcon()
    } else {
      hideIcon()
    }
  }

  input.addEventListener('focus', showIcon)
  input.addEventListener('blur', hideIcon)
  input.addEventListener('input', updateIconVisibility)
  icon.addEventListener('mouseenter', () => clearTimeout(focusTimeout))
  icon.addEventListener('mouseleave', () => {
    if (document.activeElement !== input) hideIcon()
  })
}

const getInputValue = (input: HTMLInputElement | HTMLTextAreaElement): string => {
  if (input.tagName.toLowerCase() === 'input' || input.tagName.toLowerCase() === 'textarea') {
    return (input as HTMLInputElement | HTMLTextAreaElement).value
  } else {
    // ContentEditable
    return input.textContent || ''
  }
}

const setInputValue = (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
  if (input.tagName.toLowerCase() === 'input' || input.tagName.toLowerCase() === 'textarea') {
    ;(input as HTMLInputElement | HTMLTextAreaElement).value = value
    // Trigger input event for frameworks like React
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  } else {
    // ContentEditable
    input.textContent = value
    input.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

const selectAllText = (input: HTMLInputElement | HTMLTextAreaElement) => {
  if (input.tagName.toLowerCase() === 'input' || input.tagName.toLowerCase() === 'textarea') {
    const inputElement = input as HTMLInputElement | HTMLTextAreaElement
    inputElement.focus()
    inputElement.select()
  } else {
    // ContentEditable
    const range = document.createRange()
    range.selectNodeContents(input)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    input.focus()
  }
}

const handleIconClick = async (
  input: HTMLInputElement | HTMLTextAreaElement,
  icon: HTMLElement
) => {
  const text = getInputValue(input).trim()
  if (!text) return

  log('Inline AI icon clicked', { textLength: text.length })

  // Select all text
  selectAllText(input)

  // Show loading state
  icon.classList.add('loading')

  try {
    // Send to background for rewriting
    chrome.runtime.sendMessage({
      type: 'trigger-rewrite',
      selection: text,
      tabId: getCurrentTabId(),
      source: 'inline-icon',
    })

    // Store reference for replacement
    ;(window as any).aiOneclickActiveInput = input
  } catch (error: any) {
    logError('Failed to send inline rewrite message:', error)
    icon.classList.remove('loading')
    showErrorNotification('Failed to communicate with extension')
  }
}

log('Content script loaded and ready')

// Initialize inline AI icons for input fields
initializeInlineAIIcons()
