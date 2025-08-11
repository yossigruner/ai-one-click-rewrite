/**
 * Anthropic provider for Claude models
 */

import { BaseProvider, RewriteRequest, ProviderResponse } from './base'

export class AnthropicProvider extends BaseProvider {
  readonly name = 'Anthropic'
  readonly baseUrl = 'https://api.anthropic.com/v1'
  readonly defaultModel = 'claude-3-haiku-20240307'
  readonly supportedModels = [
    'claude-3-haiku-20240307',
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
  ]

  async rewrite(request: RewriteRequest): Promise<ProviderResponse> {
    const startTime = Date.now()
    this.logRequest(request)

    try {
      const url = `${this.baseUrl}/messages`
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
    return apiKey.startsWith('sk-ant-') && apiKey.length > 30
  }

  protected getHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }
  }

  protected buildRequestPayload(request: RewriteRequest): any {
    return {
      model: request.config.model || this.defaultModel,
      max_tokens: request.config.maxTokens || 2000,
      temperature: request.config.temperature || 0.7,
      messages: [
        {
          role: 'user',
          content: `Rewrite the following text according to these instructions: ${request.instructions}. Return only the rewritten text, no explanations.\n\nText to rewrite: ${request.text}`,
        },
      ],
    }
  }

  protected parseResponse(responseData: any): ProviderResponse {
    const rewrittenText = responseData.content?.[0]?.text?.trim()

    if (!rewrittenText) {
      return {
        success: false,
        error: 'No rewritten text received from Anthropic',
      }
    }

    return {
      success: true,
      rewrittenText,
      usage: {
        promptTokens: responseData.usage?.input_tokens,
        completionTokens: responseData.usage?.output_tokens,
        totalTokens:
          (responseData.usage?.input_tokens || 0) + (responseData.usage?.output_tokens || 0),
      },
    }
  }
}
