import axios from 'axios';

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: { prompt: string | number; completion: string | number };
}

export class OpenRouterModels {
  private readonly MODELS_API = 'https://openrouter.ai/api/v1/models';
  private cachedModels: OpenRouterModel[] | null = null;
  private lastFetchTime = 0;
  private readonly CACHE_TTL = 5 * 60 * 1000;

  async getFreeModels(): Promise<OpenRouterModel[]> {
    const now = Date.now();
    if (this.cachedModels && now - this.lastFetchTime < this.CACHE_TTL) {
      return this.cachedModels;
    }

    try {
      const response = await axios.get(this.MODELS_API, {
        timeout: 10000,
        headers: { 'User-Agent': 'QCode-Chat-Extension/1.0 (https://qcode.dev)' }
      });

      if (!response.data?.data) throw new Error('Invalid response');

      const models = response.data.data
        .filter((m: any) => {
          const p = m.pricing;
          return p && (p.prompt === "0" || p.prompt === 0) && (p.completion === "0" || p.completion === 0);
        })
        .slice(0, 25)
        .map((m: any) => ({
          id: m.id,
          name: this._formatModelName(m.name, m.id),
          description: m.description,
          context_length: m.context_length,
          pricing: m.pricing
        }))
        .sort(this._sortModels);

      this.cachedModels = models;
      this.lastFetchTime = now;
      return models;
    } catch (error: any) {
      if (this.cachedModels) return this.cachedModels;
      throw new Error(`Failed to load models: ${error.message}`);
    }
  }

  private _sortModels(a: OpenRouterModel, b: OpenRouterModel): number {
    if (a.id.includes('qwen/qwen3-coder')) return -1;
    if (b.id.includes('qwen/qwen3-coder')) return 1;
    if (a.id.includes('qwen')) return -1;
    if (b.id.includes('qwen')) return 1;
    return 0;
  }

  private _formatModelName(name: string, id: string): string {
    if (id.includes('qwen/qwen3-coder')) return 'Qwen3 Coder (free)';
    if (id.includes('qwen')) return name.replace(':free', '') + ' (free)';
    return id.endsWith(':free') ? name.replace(':free', '') + ' (free)' : name;
  }
}