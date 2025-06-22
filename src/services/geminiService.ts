
interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

const GEMINI_API_KEY = 'AIzaSyB73gVVIQZKuCAmtNMLduYHWCPcFVS7YmQ';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

export const generateChatResponse = async (userMessage: string, context: string = ''): Promise<{ response: string; suggestions: string[] }> => {
  try {
    const prompt = `You are a helpful shopping assistant for an e-commerce website. 
    ${context}
    
    User message: "${userMessage}"
    
    Please provide:
    1. A helpful, friendly response (max 50 words)
    2. 4 relevant follow-up suggestions that users might ask (each max 6 words)
    
    Format your response as JSON:
    {
      "response": "your response here",
      "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]
    }
    
    Make suggestions specific to shopping like "Show me red dresses", "Find shoes under ₹2000", etc.`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const data: GeminiResponse = await response.json();
    const textResponse = data.candidates[0]?.content?.parts[0]?.text;

    if (!textResponse) {
      throw new Error('No response from Gemini');
    }

    // Try to parse JSON response
    try {
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          response: parsed.response || textResponse,
          suggestions: parsed.suggestions || []
        };
      }
    } catch (e) {
      console.log('Could not parse JSON, using raw response');
    }

    // Fallback if JSON parsing fails
    return {
      response: textResponse,
      suggestions: [
        "Show me trending products",
        "Find clothes under ₹1000", 
        "I need accessories",
        "What's on sale?"
      ]
    };

  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      response: "I'm here to help you find great products! What are you looking for?",
      suggestions: [
        "Show me shirts under ₹1000",
        "Find red dresses",
        "I need sneakers", 
        "Popular items"
      ]
    };
  }
};

export const generateProductSearchSuggestions = async (searchQuery: string): Promise<string[]> => {
  try {
    const prompt = `Generate 4 related product search suggestions for: "${searchQuery}"
    
    Make them specific shopping queries like "Show me [item] under ₹[price]" or "Find [color] [item]".
    Return only the suggestions, one per line.`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200,
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }

    const data: GeminiResponse = await response.json();
    const textResponse = data.candidates[0]?.content?.parts[0]?.text;

    if (textResponse) {
      return textResponse.split('\n').filter(line => line.trim()).slice(0, 4);
    }

    return [];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
};
