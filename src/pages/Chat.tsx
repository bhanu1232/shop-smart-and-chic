
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, ShoppingBag, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Product, searchProducts, fetchProducts } from "@/api/products";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { generateChatResponse, generateProductSearchSuggestions } from "@/services/geminiService";

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  products?: Product[];
  suggestions?: string[];
}

const Chat = () => {
  useScrollToTop();
  const navigate = useNavigate();
  
  const defaultSuggestions = [
    "Show me shirts under ₹1000",
    "I need a red dress",
    "Find me sneakers under ₹2000",
    "Show hoodies for winter"
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hello! I'm your AI shopping assistant. I can help you find products and answer questions about shopping. Try asking me something!",
      isBot: true,
      timestamp: new Date(),
      suggestions: defaultSuggestions
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractSearchTermsAndPrice = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced price extraction with more patterns
    const pricePatterns = [
      /under ₹?(\d+)k?/g,
      /below ₹?(\d+)k?/g,
      /less than ₹?(\d+)k?/g,
      /(\d+)k rupees?/g,
      /₹(\d+)k?/g,
      /rs\.? ?(\d+)k?/g,
      /budget ₹?(\d+)k?/g,
      /within ₹?(\d+)k?/g
    ];
    
    let maxPrice = null;
    for (const pattern of pricePatterns) {
      const matches = [...lowerMessage.matchAll(pattern)];
      if (matches.length > 0) {
        let price = parseInt(matches[0][1]);
        if (lowerMessage.includes('k') || price < 100) {
          price *= 1000;
        }
        maxPrice = price;
        break;
      }
    }

    // Enhanced product category mapping
    const categoryMappings = {
      // Clothing
      'shirt': ['shirt', 'shirts', 't-shirt', 't-shirts', 'tshirt', 'tshirts', 'polo', 'blouse'],
      'dress': ['dress', 'dresses', 'gown', 'frock', 'maxi', 'midi'],
      'jeans': ['jeans', 'denim', 'pants', 'trousers', 'chinos'],
      'jacket': ['jacket', 'jackets', 'blazer', 'coat', 'outerwear'],
      'hoodie': ['hoodie', 'hoodies', 'sweatshirt', 'pullover'],
      'sweater': ['sweater', 'jumper', 'cardigan', 'knitwear'],
      'skirt': ['skirt', 'mini skirt', 'maxi skirt'],
      'shorts': ['shorts', 'bermuda'],
      'top': ['top', 'tops', 'blouse', 'tank top', 'camisole'],
      
      // Footwear
      'shoes': ['shoes', 'footwear'],
      'sneakers': ['sneakers', 'trainers', 'running shoes', 'sport shoes'],
      'boots': ['boots', 'ankle boots', 'combat boots'],
      'sandals': ['sandals', 'flip flops', 'slippers'],
      'heels': ['heels', 'high heels', 'stilettos', 'pumps'],
      
      // Accessories
      'bag': ['bag', 'bags', 'handbag', 'purse', 'clutch', 'backpack', 'tote'],
      'watch': ['watch', 'watches', 'timepiece'],
      'jewelry': ['jewelry', 'jewellery', 'necklace', 'bracelet', 'earrings', 'ring'],
      'belt': ['belt', 'belts'],
      'hat': ['hat', 'cap', 'beanie'],
      'sunglasses': ['sunglasses', 'shades', 'glasses'],
      
      // General categories
      'accessories': ['accessories', 'accessory'],
      'clothing': ['clothing', 'clothes', 'apparel', 'wear']
    };

    // Color extraction
    const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'grey', 'gray', 'navy', 'maroon'];
    const foundColors = colors.filter(color => lowerMessage.includes(color));

    // Find matching categories
    let foundCategory = '';
    let foundTerms = [];
    
    for (const [category, terms] of Object.entries(categoryMappings)) {
      for (const term of terms) {
        if (lowerMessage.includes(term)) {
          foundCategory = category;
          foundTerms = terms;
          break;
        }
      }
      if (foundCategory) break;
    }

    // If no specific category, try to extract any product-related words
    if (!foundCategory) {
      const productWords = lowerMessage.split(' ').filter(word => 
        word.length > 3 && 
        !['show', 'find', 'need', 'want', 'under', 'below', 'than', 'with', 'from', 'this', 'that', 'some', 'good', 'nice', 'best'].includes(word)
      );
      if (productWords.length > 0) {
        foundCategory = productWords[0];
      }
    }
    
    return {
      searchTerms: foundCategory,
      allTerms: foundTerms,
      maxPrice,
      colors: foundColors,
      originalMessage: message
    };
  };

  const findProducts = async (searchInfo: any) => {
    try {
      let products: Product[] = [];
      
      console.log('Search info:', searchInfo);
      
      // Try multiple search strategies for better results
      if (searchInfo.searchTerms) {
        // Primary search with main term
        products = await searchProducts(searchInfo.searchTerms);
        
        // If no results with main term, try alternative terms
        if (products.length === 0 && searchInfo.allTerms && searchInfo.allTerms.length > 1) {
          for (const term of searchInfo.allTerms.slice(1)) {
            products = await searchProducts(term);
            if (products.length > 0) break;
          }
        }
        
        // If still no results, try broader category search
        if (products.length === 0) {
          const broadCategories = ['clothing', 'fashion', 'apparel'];
          for (const category of broadCategories) {
            if (searchInfo.searchTerms.includes(category.substring(0, 4))) {
              products = await searchProducts(category);
              if (products.length > 0) break;
            }
          }
        }
      } else {
        // Get trending/popular products if no specific search term
        products = await fetchProducts(20);
      }

      console.log('Found products before filtering:', products.length);

      // Enhanced filtering
      let filteredProducts = [...products];

      // Filter by price if specified
      if (searchInfo.maxPrice) {
        filteredProducts = filteredProducts.filter(product => product.price <= searchInfo.maxPrice);
        console.log('After price filter:', filteredProducts.length);
      }

      // Filter by color if mentioned
      if (searchInfo.colors && searchInfo.colors.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
          const productText = `${product.title} ${product.description}`.toLowerCase();
          return searchInfo.colors.some((color: string) => productText.includes(color));
        });
        console.log('After color filter:', filteredProducts.length);
      }

      // Sort by relevance (rating and discount)
      filteredProducts.sort((a, b) => {
        const aScore = (a.rating || 0) * 0.7 + (a.discountPercentage || 0) * 0.3;
        const bScore = (b.rating || 0) * 0.7 + (b.discountPercentage || 0) * 0.3;
        return bScore - aScore;
      });

      // Return top 6 products for better variety
      const finalProducts = filteredProducts.slice(0, 6);
      console.log('Final products returned:', finalProducts.length);
      
      return finalProducts;
    } catch (error) {
      console.error('Error finding products:', error);
      return [];
    }
  };

  const isProductQuery = (message: string) => {
    const productKeywords = ['show', 'find', 'need', 'want', 'looking for', 'search', 'buy', 'get'];
    const productCategories = ['shirt', 'dress', 'shoes', 'bag', 'jacket', 'jeans', 'hoodie', 'sneakers', 'accessories'];
    const lowerMessage = message.toLowerCase();
    
    const hasProductKeyword = productKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasCategory = productCategories.some(category => lowerMessage.includes(category));
    const hasPrice = /₹|\$|rupee|price|under|below|budget/i.test(message);
    
    return hasProductKeyword || hasCategory || hasPrice;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage(suggestion);
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue;
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!messageText) setInputValue("");
    setIsLoading(true);

    try {
      // Check if this is a product search query
      if (isProductQuery(text)) {
        const searchInfo = extractSearchTermsAndPrice(text);
        console.log('Extracted search info:', searchInfo);
        
        const products = await findProducts(searchInfo);
        
        let aiResponse;
        if (products.length > 0) {
          const context = `The user is looking for products. I found ${products.length} products for their search.`;
          aiResponse = await generateChatResponse(text, context);
          
          // Generate product-specific suggestions
          const productSuggestions = await generateProductSearchSuggestions(text);
          if (productSuggestions.length > 0) {
            aiResponse.suggestions = productSuggestions;
          }
        } else {
          const context = "The user is looking for products but I couldn't find any matching their criteria.";
          aiResponse = await generateChatResponse(text, context);
        }
        
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponse.response,
          isBot: true,
          timestamp: new Date(),
          products: products.length > 0 ? products : undefined,
          suggestions: aiResponse.suggestions,
        };

        setMessages(prev => [...prev, botResponse]);
      } else {
        // General conversation using Gemini AI
        const context = "The user is having a general conversation. Keep responses friendly and shopping-related.";
        const aiResponse = await generateChatResponse(text, context);
        
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponse.response,
          isBot: true,
          timestamp: new Date(),
          suggestions: aiResponse.suggestions,
        };
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble right now. Please try again in a moment!",
        isBot: true,
        timestamp: new Date(),
        suggestions: defaultSuggestions
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-[70px]">
        <Navbar />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-150px)] flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b bg-slate-900 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-full">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">AI Shopping Assistant</h1>
                <p className="text-sm text-gray-300">Powered by Gemini AI - Your smart shopping companion!</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] ${message.isBot ? 'bg-gray-100' : 'bg-slate-900 text-white'} rounded-lg p-3`}>
                  <div className="flex items-start gap-2">
                    {message.isBot && (
                      <Bot className="h-4 w-4 mt-1 text-slate-600" />
                    )}
                    {!message.isBot && (
                      <User className="h-4 w-4 mt-1 text-gray-300" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.text}</p>
                      
                      {/* Suggestion Pills */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-auto py-1 px-2 bg-white border-slate-300 hover:bg-slate-50"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              <Lightbulb className="h-3 w-3 mr-1" />
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      {/* Product Results */}
                      {message.products && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {message.products.map((product) => (
                            <Card 
                              key={product.id} 
                              className="cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => navigate(`/product/${product.id}`)}
                            >
                              <CardContent className="p-3">
                                <img
                                  src={product.thumbnail}
                                  alt={product.title}
                                  className="w-full h-32 object-cover rounded mb-2"
                                />
                                <h4 className="text-sm font-medium line-clamp-2 mb-1">
                                  {product.title}
                                </h4>
                                <p className="text-lg font-semibold text-slate-900">
                                  ₹{product.price}
                                </p>
                                {product.discountPercentage > 0 && (
                                  <p className="text-xs text-green-600">
                                    {Math.round(product.discountPercentage)}% OFF
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-slate-600" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Bar */}
          <div className="px-4 py-2 border-t bg-gray-50">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {defaultSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs whitespace-nowrap flex-shrink-0"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... (e.g., 'Hi there!' or 'show me shirts under 1000')"
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={() => handleSendMessage()} 
                disabled={!inputValue.trim() || isLoading}
                className="bg-slate-900 hover:bg-slate-800"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
