import { getProvider, type RewriteRequest } from '@/providers'
import { DEFAULT_SETTINGS, ExtensionSettings } from '@/types'
// import { onMessage, sendMessage } from 'webext-bridge/background'

// Logging utility
let isDebugEnabled = false

const log = (...args: any[]) => {
  if (isDebugEnabled) {
    console.log(`[AI-OneClick-Rewrite INFO] ${new Date().toISOString()}:`, ...args)
  }
}

const logError = (...args: any[]) => {
  if (isDebugEnabled) {
    console.error(`[AI-OneClick-Rewrite ERROR] ${new Date().toISOString()}:`, ...args)
  }
}

// Load debug setting on startup
const updateDebugLogging = async () => {
  try {
    const cfg = await chrome.storage.sync.get(['debugLogs'])
    isDebugEnabled = cfg.debugLogs !== false
    log('Debug logging updated:', isDebugEnabled)
  } catch (error) {
    console.error('Failed to load debug setting:', error)
  }
}

// Ensure content script is ready
const ensureContentScriptReady = async (tabId: number): Promise<boolean> => {
  try {
    // Try to send a ping message to check if content script is ready
    await chrome.tabs.sendMessage(tabId, { type: 'ping' })
    return true
  } catch (error: any) {
    if (error.message?.includes('Receiving end does not exist')) {
      // Content script not ready, inject it
      log('Content script not ready, injecting...')
      try {
        await chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js']
        })
        
        // Wait for content script to initialize
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Try ping again
        try {
          await chrome.tabs.sendMessage(tabId, { type: 'ping' })
          log('Content script ready after injection')
          return true
        } catch (pingError: any) {
          log('Content script still not ready after injection')
          return false
        }
      } catch (injectionError: any) {
        // Check if this is a restricted page
        if (injectionError.message?.includes('cannot be scripted') || 
            injectionError.message?.includes('restricted') ||
            injectionError.message?.includes('chrome://') ||
            injectionError.message?.includes('chrome-extension://') ||
            injectionError.message?.includes('moz-extension://')) {
          log('Page is restricted - cannot inject content script')
          return false
        }
        log('Failed to inject content script:', injectionError.message)
        return false
      }
    }
    return false
  }
}

// Check if page is restricted
const isPageRestricted = async (tabId: number): Promise<boolean> => {
  try {
    const tab = await chrome.tabs.get(tabId)
    const url = tab.url || ''
    
    // Check for restricted URLs
    const restrictedPatterns = [
      'chrome://',
      'chrome-extension://',
      'moz-extension://',
      'edge://',
      'about:',
      'chrome-search://',
      'chrome-devtools://',
      'view-source:',
      'data:'
      // Note: Removed 'file://' to allow local testing
    ]
    
    return restrictedPatterns.some(pattern => url.startsWith(pattern))
  } catch (error) {
    log('Failed to check if page is restricted:', error)
    return false
  }
}

// Create user-friendly error messages
const createUserFriendlyError = (error: string, provider: string): string => {
  // Handle rate limit/quota exceeded errors
  if (error.includes('429') || error.includes('quota') || error.includes('rate limit')) {
    return `Too many requests! Your ${provider} account has reached its limit. Please try again later or check your billing settings.`
  }
  
  // Handle authentication errors
  if (error.includes('401') || error.includes('unauthorized') || error.includes('invalid api key')) {
    return `Authentication failed! Please check your ${provider} API key in the extension settings.`
  }
  
  // Handle network errors
  if (error.includes('network') || error.includes('connection') || error.includes('timeout')) {
    return `Connection error! Please check your internet connection and try again.`
  }
  
  // Handle model-specific errors
  if (error.includes('model') || error.includes('not found')) {
    return `Model not available! The selected ${provider} model may be temporarily unavailable. Please try a different model.`
  }
  
  // Handle billing errors
  if (error.includes('billing') || error.includes('payment') || error.includes('credit')) {
    return `Billing issue! Please check your ${provider} account billing status and add payment method if needed.`
  }
  
  // Default error message
  return `Something went wrong with ${provider}. Please try again or check your settings.`
}

// Provider system using the new modular providers

// Preview rewrite handler
const handlePreviewRewrite = async (selection: string, tabId: number, style: string, customInstructions?: string) => {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  log('Preview rewrite process starting', {
    tabId,
    selectionLength: selection.length,
    style,
    timestamp,
    processId: `${tabId}-${startTime}`,
  })

  try {
    // Validate selection
    if (!selection || selection.trim().length === 0) {
      throw new Error('No text selected')
    }

    // Load settings with timing
    const configStartTime = Date.now()
    const cfg = (await chrome.storage.sync.get(DEFAULT_SETTINGS)) as ExtensionSettings
    const configLoadTime = Date.now() - configStartTime

    const provider = cfg.provider || 'openai'
    const apiKey = cfg.keys[provider]
    const model = cfg.models[provider]

    log('Configuration loaded for preview', {
      provider,
      model,
      style,
      configLoadTimeMs: configLoadTime,
      hasApiKey: !!apiKey,
    })

    if (!apiKey) {
      // Send error message to content script
      await chrome.tabs.sendMessage(tabId, {
        type: 'update-preview-result',
        error: `No API key configured for ${provider}. Please configure your API key in the extension options.`,
      })
      return
    }

    // Use provided style or custom instructions
    const instructions = style === 'Custom' && customInstructions 
      ? customInstructions 
      : style

    log('Using configuration for preview', {
      provider,
      model,
      style: style === 'Custom' ? 'Custom' : style,
      instructionsLength: instructions.length,
    })

    // Get AI provider instance
    const providerInstance = getProvider(provider)
    log('AI provider instance obtained for preview', { providerName: providerInstance.name })

    const request: RewriteRequest = {
      text: selection,
      instructions,
      config: {
        apiKey,
        model,
        temperature: 0.7,
        maxTokens: 2000,
      },
    }

    // Track AI provider call timing
    const aiCallStartTime = Date.now()
    const result = await providerInstance.rewrite(request)
    const aiCallDuration = Date.now() - aiCallStartTime

    if (!result.success || !result.rewrittenText) {
      logError('AI provider call failed for preview', {
        provider,
        model,
        error: result.error,
        aiCallDurationMs: aiCallDuration,
        totalDurationMs: Date.now() - startTime,
      })
      
      // Create user-friendly error message
      const userFriendlyError = createUserFriendlyError(result.error || 'Failed to get rewritten text', provider)
      
      await chrome.tabs.sendMessage(tabId, {
        type: 'update-preview-result',
        error: userFriendlyError,
      })
      return
    }

    // Log successful AI response
    log('AI provider response received for preview', {
      provider,
      model,
      success: true,
      aiCallDurationMs: aiCallDuration,
      originalText: {
        length: selection.length,
        preview: selection.substring(0, 50) + (selection.length > 50 ? '...' : ''),
      },
      rewrittenText: {
        length: result.rewrittenText.length,
        preview: result.rewrittenText.substring(0, 50) + (result.rewrittenText.length > 50 ? '...' : ''),
      },
    })

    // Send result to content script
    await chrome.tabs.sendMessage(tabId, {
      type: 'update-preview-result',
      rewrittenText: result.rewrittenText,
      style: style,
    })

    log('Preview rewrite completed successfully', {
      provider,
      originalLength: selection.length,
      rewrittenLength: result.rewrittenText.length,
      aiCallDurationMs: aiCallDuration,
      totalDurationMs: Date.now() - startTime,
    })

  } catch (error: any) {
    logError('Preview rewrite process failed', {
      error: error.message,
      tabId,
      selectionLength: selection.length,
      totalDurationMs: Date.now() - startTime,
    })

    // Send error to content script
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'update-preview-result',
        error: error.message || 'An unexpected error occurred',
      })
    } catch (sendError: any) {
      logError('Failed to send error message to content script', { error: sendError.message })
    }
  }
}

// Main rewrite handler
const handleRewrite = async (selection: string, tabId: number) => {
  const startTime = Date.now()
  const timestamp = new Date().toISOString()

  log('Rewrite process starting', {
    tabId,
    selectionLength: selection.length,
    timestamp,
    processId: `${tabId}-${startTime}`,
  })

  try {
    // Validate selection
    if (!selection || selection.trim().length === 0) {
      throw new Error('No text selected')
    }

    // Load settings with timing
    const configStartTime = Date.now()
    const cfg = (await chrome.storage.sync.get(DEFAULT_SETTINGS)) as ExtensionSettings
    const configLoadTime = Date.now() - configStartTime

    const provider = cfg.provider || 'openai'
    const apiKey = cfg.keys[provider]
    const model = cfg.models[provider]

    log('Configuration loaded', {
      provider,
      model,
      configLoadTimeMs: configLoadTime,
      hasApiKey: !!apiKey,
      availableProviders: Object.keys(cfg.keys).filter(
        (k) => !!cfg.keys[k as keyof typeof cfg.keys]
      ),
    })

    if (!apiKey) {
      // Log API key validation failure
      log('API key validation failed', {
        provider,
        availableKeys: Object.keys(cfg.keys).filter((k) => !!cfg.keys[k as keyof typeof cfg.keys]),
        requestedProvider: provider,
      })

      // Send special message for missing API key
      chrome.tabs.sendMessage(tabId, {
        type: 'show-setup-required',
        tabId,
        provider,
      })
      return
    }

    // Get instructions (preset or custom)
    const preset = cfg.presets[provider] || 'Professional concise'
    const instructions =
      preset === 'Custom' ? cfg.customPresets[provider] || 'Professional concise' : preset

    log('Using configuration', {
      provider,
      model,
      preset: preset === 'Custom' ? 'Custom' : preset,
      instructionsLength: instructions.length,
      hasApiKey: !!apiKey,
      configurationCompleteTimeMs: Date.now() - startTime,
    })

    // Show loading state (non-blocking)
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'show-loading', tabId })
      log('Loading state message sent successfully')
    } catch (error: any) {
      if (error.message?.includes('Receiving end does not exist')) {
        log('Content script not ready for loading message - continuing anyway')
      } else {
        log('Failed to send loading state message', { error: error.message })
      }
    }

    // Get AI provider instance
    const providerInstance = getProvider(provider)
    log('AI provider instance obtained', { providerName: providerInstance.name })

    // Update loading message with provider info (non-blocking)
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'update-loading',
        message: `Connecting to ${providerInstance.name}...`,
      })
      log('Connecting message sent successfully')
    } catch (error: any) {
      if (error.message?.includes('Receiving end does not exist')) {
        log('Content script not ready for connecting message - continuing anyway')
      } else {
        log('Failed to send connecting message', { error: error.message })
      }
    }

    // Update loading message for AI processing (non-blocking)
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'update-loading',
        message: `Processing with ${providerInstance.name}...`,
      })
      log('Processing message sent successfully')
    } catch (error: any) {
      if (error.message?.includes('Receiving end does not exist')) {
        log('Content script not ready for processing message - continuing anyway')
      } else {
        log('Failed to send processing message', { error: error.message })
      }
    }

    const request: RewriteRequest = {
      text: selection,
      instructions,
      config: {
        apiKey,
        model,
        temperature: 0.7,
        maxTokens: 2000,
      },
    }

    // Log request details
    log('AI provider request initiated', {
      provider,
      model,
      requestSize: selection.length,
      instructions: instructions.substring(0, 100) + (instructions.length > 100 ? '...' : ''),
      config: {
        temperature: 0.7,
        maxTokens: 2000,
      },
    })

    // Track AI provider call timing
    const aiCallStartTime = Date.now()
    const result = await providerInstance.rewrite(request)
    const aiCallDuration = Date.now() - aiCallStartTime

    // Update loading message for completion (non-blocking)
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'update-loading',
        message: 'Finalizing rewrite...',
      })
      log('Finalizing message sent successfully')
    } catch (error: any) {
      if (error.message?.includes('Receiving end does not exist')) {
        log('Content script not ready for finalizing message - continuing anyway')
      } else {
        log('Failed to send finalizing message', { error: error.message })
      }
    }

    if (!result.success || !result.rewrittenText) {
      // Log failure details
      logError('AI provider call failed', {
        provider,
        model,
        error: result.error,
        aiCallDurationMs: aiCallDuration,
        totalDurationMs: Date.now() - startTime,
        requestSize: selection.length,
      })
      
      // Create user-friendly error message
      const userFriendlyError = createUserFriendlyError(result.error || 'Failed to get rewritten text', provider)
      
      // Send error to content script
      try {
        await chrome.tabs.sendMessage(tabId, {
          type: 'show-error',
          error: userFriendlyError,
          provider,
        })
      } catch (error: any) {
        log('Failed to send error message to content script', { error: error.message })
      }
      
      throw new Error(result.error || 'Failed to get rewritten text')
    }

    // Log successful AI response with detailed metrics
    log('AI provider response received', {
      provider,
      model,
      success: true,
      aiCallDurationMs: aiCallDuration,
      originalText: {
        length: selection.length,
        preview: selection.substring(0, 50) + (selection.length > 50 ? '...' : ''),
      },
      rewrittenText: {
        length: result.rewrittenText.length,
        preview:
          result.rewrittenText.substring(0, 50) + (result.rewrittenText.length > 50 ? '...' : ''),
      },
      usage: result.usage || null,
      compressionRatio: (result.rewrittenText.length / selection.length).toFixed(2),
      wordsPerSecond: Math.round((result.rewrittenText.split(' ').length / aiCallDuration) * 1000),
    })

    log('AI rewrite completed successfully', {
      provider,
      originalLength: selection.length,
      rewrittenLength: result.rewrittenText.length,
      aiCallDurationMs: aiCallDuration,
      totalDurationMs: Date.now() - startTime,
      compressionRatio: (result.rewrittenText.length / selection.length).toFixed(2),
      efficiency: `${Math.round((result.rewrittenText.split(' ').length / aiCallDuration) * 1000)} words/sec`,
    })

    // Replace text (auto-replace mode) with retry and fallback
    let textReplaced = false
    let retryCount = 0
    const maxRetries = 3
    const isContentScriptReady = readyTabs.has(tabId)

    log('Starting text replacement', {
      tabId,
      isContentScriptReady,
      retryAttempts: maxRetries,
    })

    while (!textReplaced && retryCount < maxRetries) {
      try {
        await chrome.tabs.sendMessage(tabId, {
          type: 'replace-selection',
          tabId,
          rewrittenText: result.rewrittenText,
        })
        log('Text replacement message sent successfully')
        textReplaced = true
      } catch (error: any) {
        retryCount++
        if (error.message?.includes('Receiving end does not exist')) {
          log(`Content script not ready for text replacement - retry ${retryCount}/${maxRetries}`, {
            contentScriptReady: readyTabs.has(tabId),
            waitTime: retryCount < maxRetries ? 500 : 0,
          })
          if (retryCount < maxRetries) {
            // Wait a bit before retrying
            await new Promise((resolve) => setTimeout(resolve, 500))
          }
        } else {
          log('Failed to send text replacement message', { error: error.message })
          break // Don't retry for other types of errors
        }
      }
    }

    if (!textReplaced) {
      // Fallback: Try direct script injection for text replacement
      try {
        chrome.scripting
          .executeScript({
            target: { tabId },
            func: (newText: string, originalText: string) => {
              const replaceTextDirectly = () => {
                const selection = window.getSelection()
                if (!selection || selection.rangeCount === 0) {
                  console.log('[AI-OneClick-Rewrite] No selection found for direct replacement')
                  return false
                }

                try {
                  const range = selection.getRangeAt(0)
                  const selectedText = range.toString()

                  // Verify this is the text we're trying to replace
                  if (selectedText.trim() !== originalText.trim()) {
                    console.log(
                      '[AI-OneClick-Rewrite] Selected text has changed, cannot replace safely'
                    )
                    return false
                  }

                  // Handle input fields
                  const activeElement = document.activeElement as
                    | HTMLInputElement
                    | HTMLTextAreaElement
                  if (
                    activeElement &&
                    (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
                  ) {
                    const start = activeElement.selectionStart || 0
                    const end = activeElement.selectionEnd || 0
                    const currentValue = activeElement.value

                    activeElement.value =
                      currentValue.substring(0, start) + newText + currentValue.substring(end)
                    activeElement.selectionStart = start
                    activeElement.selectionEnd = start + newText.length

                    // Trigger change event
                    activeElement.dispatchEvent(new Event('input', { bubbles: true }))
                    console.log(
                      '[AI-OneClick-Rewrite] Text replaced in input field via direct injection'
                    )
                    return true
                  } else {
                    // Handle regular text content
                    range.deleteContents()
                    range.insertNode(document.createTextNode(newText))

                    // Clear selection
                    selection.removeAllRanges()
                    console.log(
                      '[AI-OneClick-Rewrite] Text replaced in content via direct injection'
                    )
                    return true
                  }
                } catch (error: any) {
                  console.error('[AI-OneClick-Rewrite] Failed to replace text directly:', error)
                  return false
                }
              }

              return replaceTextDirectly()
            },
            args: [result.rewrittenText, selection],
          })
          .then((results) => {
            if (results && results[0] && results[0].result === true) {
              log('Text replacement succeeded via direct script injection')
              textReplaced = true

              // Show success notification via script injection
              chrome.scripting
                .executeScript({
                  target: { tabId },
                  func: () => {
                    const showSuccessNotification = (message: string) => {
                      const notification = document.createElement('div')
                      notification.id = 'ai-oneclick-success-notification'

                      Object.assign(notification.style, {
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        fontFamily:
                          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        fontSize: '14px',
                        fontWeight: '600',
                        boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                        zIndex: '2147483647',
                        animation: 'slideInFromRight 0.3s ease-out',
                      })

                      notification.textContent = message

                      const style = document.createElement('style')
                      style.textContent = `
                    @keyframes slideInFromRight {
                      0% { transform: translateX(100%); opacity: 0; }
                      100% { transform: translateX(0); opacity: 1; }
                    }
                  `
                      document.head.appendChild(style)
                      document.body.appendChild(notification)

                      setTimeout(() => {
                        notification.remove()
                        style.remove()
                      }, 3000)
                    }

                    showSuccessNotification('Text rewritten successfully!')
                  },
                })
                .catch(() => {
                  log('Failed to show success notification via injection')
                })
            } else {
              log('Direct text replacement failed, falling back to manual copy instructions')

              // Ultimate fallback: Log the result for manual copy
              logError('REWRITTEN TEXT READY - Copy from here:', {
                provider,
                originalText: selection,
                rewrittenText: result.rewrittenText,
                instructions:
                  '👆 Copy the rewrittenText above and paste it to replace your selected text',
              })

              // Try to create a browser notification if permission exists
              try {
                chrome.notifications.create({
                  type: 'basic',
                  iconUrl: 'icons/icon48.png',
                  title: 'AI Rewrite Complete!',
                  message: `Text rewritten successfully! Check browser console (F12) for the result.`,
                })
              } catch (notificationError) {
                log('Could not create notification - check console for rewritten text')
              }
            }
          })
      } catch (injectionError: any) {
        log('Failed to inject direct text replacement script', { error: injectionError.message })

        // Ultimate fallback: Log the result for manual copy
        logError('REWRITTEN TEXT READY - Copy from here:', {
          provider,
          originalText: selection,
          rewrittenText: result.rewrittenText,
          instructions:
            '👆 Copy the rewrittenText above and paste it to replace your selected text',
        })
      }
    }



    // Hide loading state (non-blocking)
    try {
      await chrome.tabs.sendMessage(tabId, { type: 'hide-loading', tabId })
      log('Hide loading message sent successfully')
    } catch (error: any) {
      if (error.message?.includes('Receiving end does not exist')) {
        log('Content script not ready for hide loading message - continuing anyway')
      } else {
        log('Failed to send hide loading message', { error: error.message })
      }
    }

    const totalTime = Date.now() - startTime
    log('Rewrite process completed successfully', {
      totalTimeMs: totalTime,
      performance: {
        charactersPerSecond: Math.round((selection.length / totalTime) * 1000),
        efficiency:
          totalTime < 2000
            ? 'excellent'
            : totalTime < 5000
              ? 'good'
              : totalTime < 10000
                ? 'fair'
                : 'slow',
      },
      processId: `${tabId}-${startTime}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    const totalDuration = Date.now() - startTime
    logError('Rewrite process failed', {
      error: error.message,
      stack: error.stack,
      totalDurationMs: totalDuration,
      selectionLength: selection.length,
      timestamp: new Date().toISOString(),
      errorType: error.name || 'Unknown',
      phase:
        totalDuration < 1000
          ? 'initialization'
          : totalDuration < 5000
            ? 'ai-processing'
            : 'completion',
    })

    // Send error to content script
    try {
      await chrome.tabs.sendMessage(tabId, {
        type: 'show-error',
        tabId,
        error: error.message,
      })

      // Hide loading state (non-blocking)
      try {
        await chrome.tabs.sendMessage(tabId, { type: 'hide-loading', tabId })
        log('Error hide loading message sent successfully')
      } catch (hideError: any) {
        if (hideError.message?.includes('Receiving end does not exist')) {
          log('Content script not ready for error hide loading message - continuing anyway')
        } else {
          log('Failed to send error hide loading message', { error: hideError.message })
        }
      }
    } catch (msgError: any) {
      if (msgError.message?.includes('Receiving end does not exist')) {
        log(
          'Content script not ready for error message - error occurred but user may not see notification'
        )
      } else {
        logError('Failed to send error message to content script:', msgError)
      }
    }


  }
}

// Event handlers
chrome.runtime.onStartup.addListener(async () => {
  const startupTime = Date.now()
  log('Extension startup initiated', {
    timestamp: new Date().toISOString(),
    version: chrome.runtime.getManifest().version,
  })

  await updateDebugLogging()

  // Recreate context menu
  try {
    await chrome.contextMenus.removeAll()
    chrome.contextMenus.create({
      id: 'rewrite-text',
      title: 'Rewrite with AI',
      contexts: ['selection'],
    })

    // Context menu created successfully
    log('Context menu created during startup')

    log('Extension startup completed', {
      startupDurationMs: Date.now() - startupTime,
      contextMenuCreated: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logError('Failed to create context menu during startup:', error)
  }
})

chrome.runtime.onInstalled.addListener(async (details) => {
  const installTime = Date.now()
  log('Extension installation/update event', {
    reason: details.reason,
    previousVersion: details.previousVersion,
    currentVersion: chrome.runtime.getManifest().version,
    timestamp: new Date().toISOString(),
  })

  await updateDebugLogging()

  // Create context menu
  try {
    chrome.contextMenus.create({
      id: 'rewrite-text',
      title: 'Rewrite with AI',
      contexts: ['selection'],
    })

    // Context menu created successfully
    log('Context menu created during installation')

    log('Extension installation completed', {
      reason: details.reason,
      installDurationMs: Date.now() - installTime,
      contextMenuCreated: true,
      version: chrome.runtime.getManifest().version,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logError('Failed to create context menu during installation:', error)
  }
})

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  log('Context menu clicked', {
    menuItemId: info.menuItemId,
    hasTab: !!tab,
    tabId: tab?.id,
    hasSelection: !!info.selectionText,
    selectionLength: info.selectionText?.length || 0,
  })

  if (info.menuItemId === 'rewrite-text' && tab?.id && info.selectionText) {
    log('Context menu triggered - processing rewrite', {
      tabId: tab.id,
      selectionLength: info.selectionText.length,
      menuItemId: info.menuItemId,
      timestamp: new Date().toISOString(),
    })



    try {
      // Check if page is restricted first
      const pageRestricted = await isPageRestricted(tab.id)
      if (pageRestricted) {
        // Show notification that extension doesn't work on this page
        try {
          await chrome.tabs.sendMessage(tab.id, {
            type: 'show-error',
            error: 'This extension cannot work on browser system pages. Please try on a regular website.',
          })
        } catch (notifyError: any) {
          // If we can't send message, show a system notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon48.png',
            title: 'AI One-Click Rewrite',
            message: 'This extension cannot work on browser system pages. Please try on a regular website.'
          })
        }
        return
      }
      
      // Ensure content script is ready first
      const contentScriptReady = await ensureContentScriptReady(tab.id)
      if (!contentScriptReady) {
        throw new Error('Content script could not be loaded')
      }
      
      // Check current mode and handle accordingly
      const cfg = (await chrome.storage.sync.get(DEFAULT_SETTINGS)) as ExtensionSettings
      
      if (cfg.mode === 'preview') {
        // Preview mode: send message to open preview panel
        await chrome.tabs.sendMessage(tab.id, {
          type: 'show-preview-panel',
          selectedText: info.selectionText
        })
        log('Preview panel opened via context menu')
      } else {
        // Auto-replace mode: proceed with immediate rewrite
        await handleRewrite(info.selectionText, tab.id)
      }
    } catch (error: any) {
      logError('Context menu rewrite failed', {
        error: error.message,
        tabId: tab.id,
        selectionLength: info.selectionText.length,
      })
      
      // Show user-friendly error notification
      try {
        await chrome.tabs.sendMessage(tab.id, {
          type: 'show-error',
          error: 'Extension cannot work on this page. Please try on a regular website like Google Docs, Gmail, or any other website.',
        })
      } catch (notifyError: any) {
        // If we can't send message, show a system notification
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'AI One-Click Rewrite',
          message: 'Extension cannot work on this page. Please try on a regular website.'
        })
      }
    }
  } else {
    log('Context menu clicked but conditions not met', {
      correctMenuItem: info.menuItemId === 'rewrite-text',
      hasTab: !!tab,
      hasTabId: !!tab?.id,
      hasSelection: !!info.selectionText,
    })
  }
})

// Handle extension icon clicks
chrome.action.onClicked.addListener((_tab) => {
  log('Extension icon clicked, opening options page')
  chrome.runtime.openOptionsPage()
})



// Track which tabs have ready content scripts
const readyTabs = new Set<number>()

// Handle messages from content script using standard Chrome messaging
chrome.runtime.onMessage.addListener(async (message, sender, _sendResponse) => {
  if (message.type === 'content-script-ready' && sender.tab?.id) {
    readyTabs.add(sender.tab.id)
    log('Content script ready for tab:', sender.tab.id)
    return
  }

  if (message.type === 'trigger-rewrite' && sender.tab?.id && message.selection) {
    log('Rewrite triggered from content script (floating button)', {
      tabId: sender.tab.id,
      selectionLength: message.selection.length,
      trigger: 'floating-button',
      timestamp: new Date().toISOString(),
    })

    // Handle rewrite asynchronously without keeping message channel open
    handleRewrite(message.selection, sender.tab.id).catch((error) => {
      logError('Background rewrite handler failed', { error: error.message })
    })
  }

  if (message.type === 'rewrite-preview' && sender.tab?.id && message.selection) {
    log('Preview rewrite requested', {
      tabId: sender.tab.id,
      selectionLength: message.selection.length,
      style: message.style,
      timestamp: new Date().toISOString(),
    })

    // Handle preview rewrite with custom style
    handlePreviewRewrite(message.selection, sender.tab.id, message.style, message.customInstructions).catch((error) => {
      logError('Preview rewrite handler failed', { error: error.message })
    })
  }
})

// Handle regular Chrome runtime messages (for opening options page)
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'openOptions') {
    log('Opening options page via runtime message')
    chrome.runtime.openOptionsPage()
    sendResponse({ success: true })
    return true // Keep channel open for this response
  }
})

// Handle storage changes for debug logging
chrome.storage.onChanged.addListener((changes) => {
  if (changes.debugLogs) {
    isDebugEnabled = changes.debugLogs.newValue !== false
    log('Debug logging setting changed:', isDebugEnabled)
  }
})

// Initialize on script load
updateDebugLogging()

log('Background script loaded and ready')
