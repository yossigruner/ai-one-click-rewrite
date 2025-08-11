/**
 * Base provider interface for AI text rewriting services
 */

export interface APIUsage {
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
}

export interface ProviderResponse {
  success: boolean
  rewrittenText?: string
  error?: string
  usage?: APIUsage
}

export interface ProviderConfig {
  apiKey: string
  model: string
  temperature?: number
  maxTokens?: number
}

export interface RewriteRequest {
  text: string
  instructions: string
  config: ProviderConfig
}

/**
 * Base abstract class for AI providers
 */
export abstract class BaseProvider {
  abstract readonly name: string
  abstract readonly baseUrl: string
  abstract readonly defaultModel: string
  abstract readonly supportedModels: string[]

  /**
   * Rewrite text using the provider's API
   */
  abstract rewrite(request: RewriteRequest): Promise<ProviderResponse>

  /**
   * Validate API key format (basic validation)
   */
  abstract validateApiKey(apiKey: string): boolean

  /**
   * Get headers for API requests
   */
  protected abstract getHeaders(apiKey: string): Record<string, string>

  /**
   * Build request payload for the API
   */
  protected abstract buildRequestPayload(request: RewriteRequest): any

  /**
   * Parse response from the API
   */
  protected abstract parseResponse(response: any): ProviderResponse

  /**
   * Common fetch wrapper with error handling
   */
  protected async makeRequest(
    url: string,
    headers: Record<string, string>,
    payload: any
  ): Promise<any> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `${this.name} API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`
        )
      }

      return await response.json()
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to ${this.name} API`)
      }
      throw error
    }
  }

  /**
   * Log API request (without exposing sensitive data)
   */
  protected logRequest(request: RewriteRequest, isDebug: boolean = true) {
    if (isDebug) {
      console.log(`[${this.name} API] Request starting`, {
        model: request.config.model,
        textLength: request.text.length,
        instructions: request.instructions.substring(0, 50) + '...',
        hasApiKey: !!request.config.apiKey,
      })
    }
  }

  /**
   * Log API response (without exposing sensitive data)
   */
  protected logResponse(response: ProviderResponse, timeMs: number, isDebug: boolean = true) {
    if (isDebug) {
      console.log(`[${this.name} API] Request completed`, {
        success: response.success,
        outputLength: response.rewrittenText?.length,
        responseTimeMs: timeMs,
        tokensUsed: response.usage || {},
        hasError: !!response.error,
      })
    }
  }
}
