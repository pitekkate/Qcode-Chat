import * as vscode from 'vscode';
import axios from 'axios';

export class OpenRouterProvider {
    private readonly CONFIG_KEY = 'qcode-chat.apiKey';

    async sendMessage(prompt: string, model: string): Promise<string> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            throw new Error('API key not set');
        }

        try {
            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                model: model,
                messages: [
                    { 
                        role: 'system', 
                        content: 'You are a helpful coding assistant. Provide clear, concise answers with code examples when appropriate.' 
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 1000
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://qcode.dev',
                    'X-Title': 'QCode Chat'
                }
            });

            return response.data.choices[0]?.message?.content?.trim() || 'No response';
        } catch (error) {
            throw new Error(`Failed to send message: ${error}`);
        }
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
