import * as vscode from 'vscode';
import axios from 'axios';

export class OpenRouterProvider {
  private readonly CONFIG_KEY = 'qcode-chat.apiKey';

  async sendMessage(prompt: string, model: string): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('API key not set');

    try {
      const isQwenModel = model.includes('qwen');
      const isCodingModel = model.includes('coder') || model.includes('code');

      const parameters = {
        model,
        messages: [
          { role: 'system', content: this._getSystemPrompt(model) },
          { role: 'user', content: prompt }
        ],
        temperature: isCodingModel ? 0.6 : 0.7,
        max_tokens: isQwenModel ? 2000 : 1500
      };

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        parameters,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://qcode.dev',
            'X-Title': 'QCode Chat',
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return response.data.choices?.[0]?.message?.content?.trim() || 'No response';
    } catch (error: any) {
      if (error.code === 'ECONNABORTED') throw new Error('Request timeout');
      if (error.response?.status === 401) throw new Error('Invalid API key');
      throw new Error(`Error: ${error.message}`);
    }
  }

  private _getSystemPrompt(model: string): string {
    if (model.includes('coder') || model.includes('code')) {
      return 'You are an expert coding assistant. Provide clear, well-explained code with comments.';
    }
    if (model.includes('qwen')) {
      return 'You are Qwen, a helpful coding assistant. Be concise and use code blocks.';
    }
    return 'You are a helpful coding assistant. Use code blocks when showing code.';
  }

  getApiKey(): string {
    const config = vscode.workspace.getConfiguration();
    return config.get(this.CONFIG_KEY, '');
  }

  async setApiKey(apiKey: string): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    await config.update(this.CONFIG_KEY, apiKey, vscode.ConfigurationTarget.Global);
  }
}