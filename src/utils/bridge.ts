/**
 * Webext-bridge utilities and setup
 * This file provides type-safe messaging between extension contexts
 */

import { allowWindowMessaging } from 'webext-bridge/content-script'

// Enable window messaging for better cross-context communication
// This allows content scripts to communicate with injected scripts if needed
export const setupBridge = () => {
  try {
    allowWindowMessaging('ai-one-click-rewrite')
  } catch (error) {
    console.warn('Failed to setup window messaging:', error)
  }
}

// Type-safe message sending utilities

/**
 * Common patterns for webext-bridge usage:
 *
 * Background script:
 * ```ts
 * import { onMessage, sendMessage } from 'webext-bridge/background'
 *
 * // Listen for messages
 * onMessage('trigger-rewrite', async ({ sender, data }) => {
 *   // Handle message
 * })
 *
 * // Send message to content script
 * await sendMessage('show-loading', { tabId }, { context: 'content-script', tabId })
 * ```
 *
 * Content script:
 * ```ts
 * import { onMessage, sendMessage } from 'webext-bridge/content-script'
 *
 * // Listen for messages
 * onMessage('show-loading', ({ data }) => {
 *   // Handle message
 * })
 *
 * // Send message to background
 * await sendMessage('trigger-rewrite', { selection }, 'background')
 * ```
 */
