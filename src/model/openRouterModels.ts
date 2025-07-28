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
                    // Filter for free models
                    return model.pricing && 
                           model.pricing.prompt === "0" && 
                           model.pricing.completion === "0";
                })
                .slice(0, 20) // Limit to first 20 free models
                .map((model: any) => ({
                    id: model.id,
                    name: this._formatModelName(model.name),
                    description: model.description,
                    context_length: model.context_length
                }));
            
            return models;
        } catch (error) {
            throw new Error(`Failed to fetch models: ${error}`);
        }
    }

    private _formatModelName(name: string): string {
        // Clean up model name for display
        return name.length > 50 ? name.substring(0, 47) + '...' : name;
    }
}
