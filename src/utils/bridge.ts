/**
 * Chrome messaging utilities
 * This file provides utilities for standard Chrome extension messaging
 */

// Note: This extension uses standard Chrome messaging instead of webext-bridge
// for better compatibility and simpler debugging

/**
 * Common patterns for Chrome messaging:
 *
 * Background script:
 * ```ts
 * // Listen for messages
 * chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
 *   if (message.type === 'trigger-rewrite') {
 *     // Handle message
 *   }
 * })
 *
 * // Send message to content script
 * chrome.tabs.sendMessage(tabId, { type: 'show-loading' })
 * ```
 *
 * Content script:
 * ```ts
 * // Listen for messages
 * chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
 *   if (message.type === 'show-loading') {
 *     // Handle message
 *   }
 * })
 *
 * // Send message to background
 * chrome.runtime.sendMessage({ type: 'trigger-rewrite', selection: text })
 * ```
 */
