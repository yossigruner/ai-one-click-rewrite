/**
 * Google Gemini provider
 */

import { BaseProvider, RewriteRequest, ProviderResponse } from './base'

export class GeminiProvider extends BaseProvider {
  readonly name = 'Gemini'
  readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta'
  readonly defaultModel = 'gemini-1.5-flash-latest'
  readonly supportedModels = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest']

  async rewrite(request: RewriteRequest): Promise<ProviderResponse> {
    const startTime = Date.now()
    this.logRequest(request)

    try {
      const model = request.config.model || this.defaultModel
      const url = `${this.baseUrl}/models/${model}:generateContent?key=${request.config.apiKey}`
      const headers = this.getHeaders(request.config.apiKey)
      const payload = this.buildRequestPayload(request)

      const responseData = await this.makeRequest(url, headers, payload)
      const response = this.parseResponse(responseData)

      this.logResponse(response, Date.now() - startTime)
      return response
    } catch (error: any) {
      const errorResponse: ProviderResponse = {
        success: false,
        error: error.message,
      }
      this.logResponse(errorResponse, Date.now() - startTime)
      return errorResponse
    }
  }

  validateApiKey(apiKey: string): boolean {
    return apiKey.startsWith('AIza') && apiKey.length > 30
  }

  protected getHeaders(_apiKey: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      // API key is passed in URL for Gemini
    }
  }

  protected buildRequestPayload(request: RewriteRequest): any {
    return {
      contents: [
        {
          parts: [
            {
              text: `Rewrite the following text according to these instructions: ${request.instructions}. Return only the rewritten text, no explanations.\n\nText to rewrite: ${request.text}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: request.config.temperature || 0.7,
        maxOutputTokens: request.config.maxTokens || 2000,
        topP: 0.8,
        topK: 10,
      },
    }
  }

  protected parseResponse(responseData: any): ProviderResponse {
    const rewrittenText = responseData.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!rewrittenText) {
      // Check for safety ratings or other issues
      const candidate = responseData.candidates?.[0]
      if (candidate?.finishReason === 'SAFETY') {
        return {
          success: false,
          error: 'Content was blocked due to safety filters',
        }
      }

      return {
        success: false,
        error: 'No rewritten text received from Gemini',
      }
    }

    return {
      success: true,
      rewrittenText,
      usage: {
        // Gemini doesn't provide detailed token usage in the response
        promptTokens: responseData.usageMetadata?.promptTokenCount,
        completionTokens: responseData.usageMetadata?.candidatesTokenCount,
        totalTokens: responseData.usageMetadata?.totalTokenCount,
      },
    }
  }

  /**
   * Override makeRequest to handle Gemini's URL-based API key
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

        // Handle specific Gemini errors
        if (response.status === 400 && errorData.error?.message?.includes('API key')) {
          throw new Error('Invalid API key for Gemini')
        }

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
}
