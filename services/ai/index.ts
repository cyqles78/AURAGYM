import { IAIService } from './types';
import { GeminiAdapter } from './GeminiAdapter';
import { MockAdapter } from './MockAdapter';

/**
 * AI Service Factory
 * Returns the appropriate AI service based on configuration
 */
const getAIService = (): IAIService => {
    // Check if Gemini API key is configured
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const aiProvider = import.meta.env.VITE_AI_PROVIDER || 'gemini';

    // If provider is set to gemini and we have an API key, use Gemini
    if (aiProvider === 'gemini' && geminiApiKey) {
        console.log('✓ AI Service: Using Gemini 2.5 Flash');
        return new GeminiAdapter();
    }

    // Otherwise fallback to Mock
    console.warn('⚠ AI Service: Using Mock Provider (Gemini not configured or disabled)');
    console.warn('  To enable Gemini, set VITE_GEMINI_API_KEY in your .env file');
    return new MockAdapter();
};

export const AIService = getAIService();
export * from './types';