import axios from 'axios';

export interface OpenRouterModel {
    id: string;
    name: string;
    description?: string;
    context_length?: number;
}

export class OpenRouterModels {
    private readonly MODELS_API = 'https://openrouter.ai/api/v1/models?supported_parameters=free';

    async getFreeModels(): Promise<OpenRouterModel[]> {
        try {
            const response = await axios.get(this.MODELS_API);
            
            // Filter and format models
            const models = response.data.data
                .filter((model: any) => {
                    // Filter for completely free models (prompt and completion = 0)
                    return model.pricing && 
                           model.pricing.prompt === "0" && 
                           model.pricing.completion === "0";
                })
                .slice(0, 30) // Increase limit to 30 models
                .map((model: any) => ({
                    id: model.id,
                    name: this._formatModelName(model.name, model.id),
                    description: model.description,
                    context_length: model.context_length
                }))
                .sort((a, b) => {
                    // Prioritize Qwen models, especially qwen3-coder
                    if (a.id.includes('qwen/qwen3-coder')) return -1;
                    if (b.id.includes('qwen/qwen3-coder')) return 1;
                    if (a.id.includes('qwen')) return -1;
                    if (b.id.includes('qwen')) return 1;
                    
                    // Prioritize other coding-specialized models
                    const aIsCoder = a.id.includes('coder') || a.id.includes('code');
                    const bIsCoder = b.id.includes('coder') || b.id.includes('code');
                    if (aIsCoder && !bIsCoder) return -1;
                    if (!aIsCoder && bIsCoder) return 1;
                    
                    return 0;
                });
            
            return models;
        } catch (error: any) {
            throw new Error(`Failed to fetch models: ${error.message || 'Unknown error'}`);
        }
    }

    private _formatModelName(name: string, id: string): string {
        // Special formatting for Qwen models
        if (id.includes('qwen/qwen3-coder')) {
            return `Qwen3 Coder (free)`;
        }
        
        if (id.includes('qwen')) {
            // Format other Qwen models
            let formattedName = name.replace(':free', '');
            if (id.endsWith(':free')) {
                formattedName += ' (free)';
            }
            return formattedName;
        }
        
        // Add (free) tag for other free models
        if (id.endsWith(':free')) {
            name = name.replace(':free', '') + ' (free)';
        }
        
        // Clean up model name for display
        return name.length > 50 ? name.substring(0, 47) + '...' : name;
    }
}
