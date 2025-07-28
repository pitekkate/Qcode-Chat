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
            // Optimasi parameter untuk model tertentu
            const isQwenModel = model.includes('qwen');
            const isCodingModel = model.includes('coder') || model.includes('code');
            
            const parameters: any = {
                model: model,
                messages: [
                    { 
                        role: 'system', 
                        content: this._getSystemPrompt(model)
                    },
                    { role: 'user', content: prompt }
                ],
                temperature: isQwenModel ? 0.7 : 0.7,
                max_tokens: isQwenModel ? 2000 : 1500
            };

            // Tambahkan parameter spesifik berdasarkan kemampuan model
            if (isCodingModel) {
                parameters.temperature = 0.6; // Lebih konsisten untuk coding
                parameters.max_tokens = 2000;
            }

            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', parameters, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://qcode.dev',
                    'X-Title': 'QCode Chat'
                },
                timeout: 30000 // 30 detik timeout
            });

            return response.data.choices[0]?.message?.content?.trim() || 'No response';
        } catch (error: any) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Request timeout - the model is taking too long to respond');
            }
            throw new Error(`Failed to send message: ${error.message || 'Unknown error'}`);
        }
    }

    private _getSystemPrompt(model: string): string {
        const isCodingModel = model.includes('coder') || model.includes('code');
        const isQwenModel = model.includes('qwen');
        
        if (isCodingModel) {
            return 'You are an expert coding assistant specializing in multiple programming languages. Provide clear, well-explained code examples with comments. Focus on best practices, efficiency, and readability. When showing code, use proper syntax with triple backticks and specify the language.';
        }
        
        if (isQwenModel) {
            return 'You are Qwen, a large-scale language model developed by Tongyi Lab. You are a helpful coding assistant. Provide clear, concise answers with code examples when appropriate. When showing code, use proper syntax with triple backticks and specify the language.';
        }
        
        return 'You are a helpful coding assistant. Provide clear, concise answers with code examples when appropriate. When showing code, use proper syntax with triple backticks and specify the language.';
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
