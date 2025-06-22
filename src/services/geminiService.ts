
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
    const prompt = `You are an enthusiastic and helpful AI shopping assistant for an e-commerce website. 
    ${context}
    
    User message: "${userMessage}"
    
    Please provide:
    1. A helpful, engaging response (max 60 words) that matches the user's tone and energy
    2. 4 relevant, actionable follow-up suggestions that users might ask (each max 8 words)
    
    For suggestions, make them:
    - Specific and actionable (like "Show me red dresses under ₹2000")
    - Varied in price ranges and categories
    - Engaging and conversational
    - Only related to shopping if products were found, otherwise general helpful suggestions
    
    Format your response as JSON:
    {
      "response": "your enthusiastic response here",
      "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"]
    }
    
    Match the user's energy level and be conversational!`;

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
      response: "I'm here to help you find amazing products! What are you looking for? 🛍️",
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
    const prompt = `Based on the search query "${searchQuery}", generate 4 related and more specific product search suggestions.
    
    Make them:
    - More specific than the original query
    - Include price ranges (like "under ₹1500", "under ₹3000")
    - Include colors, styles, or specific features
    - Be actionable shopping queries
    
    Examples:
    - "Show me black sneakers under ₹2000"
    - "Find formal shirts under ₹1500"
    - "I need winter jackets"
    - "Popular dresses this season"
    
    Return only 4 suggestions, one per line, without numbering.`;

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
          temperature: 0.9,
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
      const suggestions = textResponse.split('\n').filter(line => line.trim()).slice(0, 4);
      return suggestions.map(s => s.replace(/^\d+\.\s*/, '').trim());
    }

    return [];
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
};
