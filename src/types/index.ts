// AI Provider types
export type AIProvider = 'openai' | 'anthropic' | 'gemini'

export interface ProviderConfig {
  openai: {
    key: string
    model: string
    preset: string
    customPreset: string
  }
  anthropic: {
    key: string
    model: string
    preset: string
    customPreset: string
  }
  gemini: {
    key: string
    model: string
    preset: string
    customPreset: string
  }
}

// Extension Settings
export interface ExtensionSettings {
  provider: AIProvider
  keys: Record<AIProvider, string>
  models: Record<AIProvider, string>
  presets: Record<AIProvider, string>
  customPresets: Record<AIProvider, string>
  mode: 'auto-replace' | 'preview'
  debugLogs: boolean
  keyboardShortcut: string
}

// API Response types
export interface APIResponse {
  success: boolean
  rewrittenText?: string
  error?: string
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
}

// Webext-bridge message protocol definitions
import type { ProtocolWithReturn } from 'webext-bridge'

export interface ProtocolMap {
  // Background -> Content messages
  'show-loading': { tabId: number }
  'hide-loading': { tabId: number }
  'replace-selection': { tabId: number; rewrittenText: string }
  'show-error': { tabId: number; error: string }

  // Content -> Background messages
  'trigger-rewrite': { selection: string; tabId: number }
  'get-selection': void
}

// Create typed protocol
export type Protocol = ProtocolWithReturn<
  ProtocolMap,
  {
    'get-selection': string
  }
>

// Legacy support (can be removed later)
export type MessageType = keyof ProtocolMap

export interface ChromeMessage {
  type: MessageType
  data?: any
  selection?: string
  rewrittenText?: string
  error?: string
}

// Preset options
export const PRESET_OPTIONS = [
  'Professional concise',
  'Friendly & clear',
  'Polish grammar only (no rewording)',
  'Shorten to 1–2 sentences',
  'Make it more assertive',
  'Make it more casual (Friday vibe)',
  'Fix typos, keep tone',
  'Summarize as bullet points (max 5)',
  'Rewrite for Slack (tight & punchy)',
  'Rewrite for email (warm, direct)',
  'Custom',
] as const

export type PresetOption = (typeof PRESET_OPTIONS)[number]

// Model options per provider (dynamically imported from providers)
export const MODEL_OPTIONS = {
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  anthropic: ['claude-3-haiku-20240307', 'claude-3-5-sonnet-20240620', 'claude-3-opus-20240229'],
  gemini: ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest'],
} as const

// Re-export provider types for convenience
export type { ProviderResponse, RewriteRequest, APIUsage } from '@/providers'

// Default settings
export const DEFAULT_SETTINGS: ExtensionSettings = {
  provider: 'openai',
  keys: {
    openai: '',
    anthropic: '',
    gemini: '',
  },
  models: {
    openai: 'gpt-4o-mini',
    anthropic: 'claude-3-haiku-20240307',
    gemini: 'gemini-1.5-flash-latest',
  },
  presets: {
    openai: 'Professional concise',
    anthropic: 'Professional concise',
    gemini: 'Professional concise',
  },
  customPresets: {
    openai: '',
    anthropic: '',
    gemini: '',
  },
  mode: 'auto-replace',
  debugLogs: true,
  keyboardShortcut: 'Alt+R',
}
