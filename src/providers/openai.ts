/**
 * OpenAI provider for GPT models
 */

import { BaseProvider, RewriteRequest, ProviderResponse } from './base'

export class OpenAIProvider extends BaseProvider {
  readonly name = 'OpenAI'
  readonly baseUrl = 'https://api.openai.com/v1'
  readonly defaultModel = 'gpt-4o-mini'
  readonly supportedModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo']

  async rewrite(request: RewriteRequest): Promise<ProviderResponse> {
    const startTime = Date.now()
    this.logRequest(request)

    try {
      const url = `${this.baseUrl}/chat/completions`
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
    return apiKey.startsWith('sk-') && apiKey.length > 20
  }

  protected getHeaders(apiKey: string): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    }
  }

  protected buildRequestPayload(request: RewriteRequest): any {
    return {
      model: request.config.model || this.defaultModel,
      messages: [
        {
          role: 'system',
          content: `You are a writing assistant. Rewrite the following text according to these instructions: ${request.instructions}. Return only the rewritten text, no explanations.`,
        },
        {
          role: 'user',
          content: request.text,
        },
      ],
      temperature: request.config.temperature || 0.7,
      max_tokens: request.config.maxTokens || 2000,
    }
  }

  protected parseResponse(responseData: any): ProviderResponse {
    const rewrittenText = responseData.choices?.[0]?.message?.content?.trim()

    if (!rewrittenText) {
      return {
        success: false,
        error: 'No rewritten text received from OpenAI',
      }
    }

    return {
      success: true,
      rewrittenText,
      usage: {
        promptTokens: responseData.usage?.prompt_tokens,
        completionTokens: responseData.usage?.completion_tokens,
        totalTokens: responseData.usage?.total_tokens,
      },
    }
  }
}
