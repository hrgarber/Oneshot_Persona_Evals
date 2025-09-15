// Unified LLM Service with Ollama as default, OpenAI as fallback
// HYPOTHESIS: Using Ollama as default reduces costs while maintaining functionality

import OpenAI from 'openai';

interface LLMProvider {
  name: 'ollama' | 'openai';
  available: boolean;
  endpoint?: string;
  model?: string;
  lastChecked?: Date;
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface LLMOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface LLMUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  usage?: LLMUsage;
}

interface OllamaModel {
  name: string;
  model?: string;
  modified_at?: string;
  size?: number;
  digest?: string;
  details?: any;
}

// Legacy aliases for backward compatibility
type ChatMessage = LLMMessage;
type ChatResponse = LLMResponse;

class LLMService {
  private ollamaStatus: LLMProvider = {
    name: 'ollama',
    available: false,
    endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'qwen3-coder'
  };

  private openaiStatus: LLMProvider = {
    name: 'openai',
    available: false,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini'
  };

  private lastHealthCheck: Date | null = null;
  private healthCheckInterval = 30000; // 30 seconds cache

  async checkOllama(): Promise<boolean> {
    try {
      // HACK: Simple health check - just see if endpoint responds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${this.ollamaStatus.endpoint}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Check if our preferred model exists
        const models: OllamaModel[] = data.models || [];

        this.ollamaStatus.available = models.length > 0;
        this.ollamaStatus.lastChecked = new Date();

        if (models.length > 0) {
          // Check for qwen3-coder first, then other preferred models
          const preferredModel = models.find((m: OllamaModel) =>
            m.name === 'qwen3-coder' ||
            m.name === 'qwen3-coder:latest' ||
            m.name === 'qwen3:latest' ||
            m.name === 'qwen3:8b'
          );

          if (preferredModel) {
            this.ollamaStatus.model = preferredModel.name;
          } else {
            // Use configured model or first available
            const configuredModel = process.env.OLLAMA_MODEL || 'qwen3-coder';
            const hasConfigured = models.find((m: OllamaModel) => m.name === configuredModel);
            this.ollamaStatus.model = hasConfigured ? configuredModel : models[0].name;
          }
        }

        return this.ollamaStatus.available;
      }

      this.ollamaStatus.available = false;
      return false;
    } catch (error) {
      // Ollama not running or network error
      this.ollamaStatus.available = false;
      return false;
    }
  }

  async checkOpenAI(): Promise<boolean> {
    const apiKey = process.env.OPENAI_API_KEY;
    this.openaiStatus.available = !!apiKey && apiKey.trim().length > 0;
    return this.openaiStatus.available;
  }

  async ensureProviders(): Promise<void> {
    // Check if we need to refresh health status
    const now = new Date();
    if (!this.lastHealthCheck ||
        (now.getTime() - this.lastHealthCheck.getTime()) > this.healthCheckInterval) {

      // Check both providers in parallel
      await Promise.all([
        this.checkOllama(),
        this.checkOpenAI()
      ]);

      this.lastHealthCheck = now;
    }
  }

  async chat(messages: LLMMessage[], options: LLMOptions = {}): Promise<LLMResponse> {
    await this.ensureProviders();

    // Try Ollama first if available
    if (this.ollamaStatus.available) {
      try {
        console.log('[LLM Service] Attempting Ollama with model:', this.ollamaStatus.model);
        const response = await this.chatWithOllama(messages, options);
        console.log('[LLM Service] Ollama response successful');
        return response;
      } catch (error) {
        console.error('[LLM Service] Ollama chat failed:', error);
        console.warn('[LLM Service] Falling back to OpenAI...');
        // Fall through to OpenAI
      }
    }

    // Fallback to OpenAI
    if (this.openaiStatus.available) {
      console.log('[LLM Service] Using OpenAI with model:', this.openaiStatus.model);
      return await this.chatWithOpenAI(messages, options);
    }

    throw new Error('No LLM provider available. Please configure Ollama or OpenAI.');
  }

  private async chatWithOllama(messages: LLMMessage[], options: LLMOptions): Promise<LLMResponse> {
    // Use Ollama's model, not the OpenAI model name passed in options
    const modelToUse = this.ollamaStatus.model;

    // Use Ollama's chat endpoint for better compatibility
    const response = await fetch(`${this.ollamaStatus.endpoint}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelToUse,
        messages: messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.max_tokens || 1000
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama request failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    return {
      content: data.message?.content || data.response || '',
      provider: 'ollama',
      model: modelToUse!,
      usage: {
        prompt_tokens: data.prompt_eval_count || 0,
        completion_tokens: data.eval_count || 0,
        total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      }
    };
  }

  private async chatWithOpenAI(messages: LLMMessage[], options: LLMOptions): Promise<LLMResponse> {
    // Direct OpenAI call using ES6 import
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: options.model || this.openaiStatus.model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000
    });

    return {
      content: response.choices[0].message.content,
      provider: 'openai',
      model: options.model || this.openaiStatus.model!,
      usage: response.usage
    };
  }

  async getStatus() {
    await this.ensureProviders();

    return {
      primary: this.ollamaStatus.available ? 'ollama' : 'openai',
      ollama: {
        available: this.ollamaStatus.available,
        endpoint: this.ollamaStatus.endpoint,
        model: this.ollamaStatus.model,
        lastChecked: this.ollamaStatus.lastChecked
      },
      openai: {
        available: this.openaiStatus.available,
        configured: !!process.env.OPENAI_API_KEY,
        model: this.openaiStatus.model
      }
    };
  }
}

// Singleton instance
const llmService = new LLMService();
export default llmService;