import axios from 'axios';

export interface OpenRouterModel {
    id: string;
    name: string;
    description?: string;
    context_length?: number;
    pricing?: {
        prompt: string;
        completion: string;
    };
}

export class OpenRouterModels {
    private readonly MODELS_API = 'https://openrouter.ai/api/v1/models?supported_parameters=free';

    async getFreeModels(): Promise<OpenRouterModel[]> {
        try {
            // Gunakan timeout untuk mencegah hanging
            const response = await axios.get(this.MODELS_API, {
                timeout: 10000, // 10 detik timeout
                headers: {
                    'User-Agent': 'QCode-Chat/1.0'
                }
            });
            
            // Validasi response
            if (!response.data || !response.data.data) {
                throw new Error('Invalid response format from OpenRouter API');
            }
            
            // Filter dan format models
            const models = response.data.data
                .filter((model: any) => {
                    // Filter untuk model yang benar-benar gratis
                    return model.pricing && 
                           model.pricing.prompt === "0" && 
                           model.pricing.completion === "0";
                })
                .slice(0, 25) // Batasi ke 25 model pertama untuk performance
                .map((model: any) => ({
                    id: model.id,
                    name: this._formatModelName(model.name, model.id),
                    description: model.description,
                    context_length: model.context_length,
                    pricing: model.pricing
                }))
                .sort((a: OpenRouterModel, b: OpenRouterModel) => {
                    // Prioritaskan model Qwen, terutama qwen3-coder
                    if (a.id.includes('qwen/qwen3-coder')) return -1;
                    if (b.id.includes('qwen/qwen3-coder')) return 1;
                    if (a.id.includes('qwen')) return -1;
                    if (b.id.includes('qwen')) return 1;
                    
                    // Prioritaskan model coding-specialized
                    const aIsCoder = a.id.includes('coder') || a.id.includes('code');
                    const bIsCoder = b.id.includes('coder') || b.id.includes('code');
                    if (aIsCoder && !bIsCoder) return -1;
                    if (!aIsCoder && bIsCoder) return 1;
                    
                    // Urutkan berdasarkan popularitas (model yang lebih umum digunakan)
                    const popularModels = [
                        'openai/gpt-3.5-turbo',
                        'openai/gpt-4',
                        'google/gemini-pro',
                        'meta-llama/llama-3',
                        'mistralai/mistral'
                    ];
                    
                    const aIndex = popularModels.indexOf(a.id);
                    const bIndex = popularModels.indexOf(b.id);
                    
                    if (aIndex !== -1 && bIndex !== -1) {
                        return aIndex - bIndex;
                    }
                    if (aIndex !== -1) return -1;
                    if (bIndex !== -1) return 1;
                    
                    return 0;
                });
            
            return models;
        } catch (error: any) {
            // Tangani error dengan lebih baik
            if (error.code === 'ECONNABORTED') {
                throw new Error('Connection timeout - OpenRouter API is taking too long to respond');
            }
            if (error.response) {
                throw new Error(`API Error: ${error.response.status} - ${error.response.statusText}`);
            }
            throw new Error(`Failed to fetch models: ${error.message || 'Unknown error'}`);
        }
    }

    private _formatModelName(name: string, id: string): string {
        // Formatting khusus untuk model Qwen
        if (id.includes('qwen/qwen3-coder')) {
            return `Qwen3 Coder (free)`;
        }
        
        if (id.includes('qwen')) {
            // Format model Qwen lainnya
            let formattedName = name.replace(':free', '');
            if (id.endsWith(':free')) {
                formattedName += ' (free)';
            }
            return formattedName;
        }
        
        // Tambahkan tag (free) untuk model gratis lainnya
        if (id.endsWith(':free')) {
            name = name.replace(':free', '') + ' (free)';
        }
        
        // Bersihkan nama model untuk tampilan
        let cleanName = name
            .replace(/\(.*?\)/g, '') // Hapus kurung
            .replace(/\s+/g, ' ')   // Normalisasi spasi
            .trim();
            
        // Tambahkan kembali tag (free) jika diperlukan
        if (id.endsWith(':free') && !cleanName.includes('(free)')) {
            cleanName += ' (free)';
        }
        
        // Batasi panjang nama
        return cleanName.length > 45 ? cleanName.substring(0, 42) + '...' : cleanName;
    }
}
