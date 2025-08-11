/**
 * Provider registry and factory
 */

import { BaseProvider } from './base'
import { OpenAIProvider } from './openai'
import { AnthropicProvider } from './anthropic'
import { GeminiProvider } from './gemini'
import type { AIProvider } from '@/types'

// Provider registry
const providers: Record<AIProvider, BaseProvider> = {
  openai: new OpenAIProvider(),
  anthropic: new AnthropicProvider(),
  gemini: new GeminiProvider(),
}

/**
 * Get a provider instance by name
 */
export function getProvider(name: AIProvider): BaseProvider {
  const provider = providers[name]
  if (!provider) {
    throw new Error(`Unknown provider: ${name}`)
  }
  return provider
}

/**
 * Get all available providers
 */
export function getAllProviders(): Record<AIProvider, BaseProvider> {
  return providers
}

/**
 * Get provider names
 */
export function getProviderNames(): AIProvider[] {
  return Object.keys(providers) as AIProvider[]
}

/**
 * Validate if a provider name is supported
 */
export function isValidProvider(name: string): name is AIProvider {
  return name in providers
}

/**
 * Get supported models for a provider
 */
export function getSupportedModels(providerName: AIProvider): string[] {
  return getProvider(providerName).supportedModels
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(providerName: AIProvider): string {
  return getProvider(providerName).defaultModel
}

/**
 * Validate API key for a specific provider
 */
export function validateApiKey(providerName: AIProvider, apiKey: string): boolean {
  return getProvider(providerName).validateApiKey(apiKey)
}

// Re-export types and base class for external use
export type { ProviderResponse, RewriteRequest, ProviderConfig, APIUsage } from './base'
export { BaseProvider } from './base'

// Re-export individual providers
export { OpenAIProvider } from './openai'
export { AnthropicProvider } from './anthropic'
export { GeminiProvider } from './gemini'
