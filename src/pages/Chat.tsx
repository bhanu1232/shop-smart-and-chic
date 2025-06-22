
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, ShoppingBag, Lightbulb, Sparkles, TrendingUp } from "lucide-react";
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
    "Show me trending products",
    "Find clothes under ₹1000",
    "I need winter jackets",
    "What's on sale today?"
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "🛍️ Hey there! I'm your AI shopping assistant powered by Gemini AI. I can help you discover amazing products, find great deals, and answer any shopping questions you have. What can I help you find today?",
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
          const context = `The user is looking for products. I found ${products.length} relevant products for their search: "${text}". Be enthusiastic about the results and highlight key features like price ranges, discounts, or popular items.`;
          aiResponse = await generateChatResponse(text, context);
          
          // Generate product-specific suggestions only if products were found
          const productSuggestions = await generateProductSearchSuggestions(text);
          if (productSuggestions.length > 0) {
            aiResponse.suggestions = productSuggestions;
          }
        } else {
          const context = `The user is looking for products: "${text}" but I couldn't find any matching products. Apologize and suggest alternative search terms or broader categories.`;
          aiResponse = await generateChatResponse(text, context);
          // Don't generate suggestions if no products found
          aiResponse.suggestions = [
            "Show me all products",
            "Find trending items",
            "Search for clothing",
            "Browse accessories"
          ];
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
        const context = "The user is having a general conversation. Be friendly, helpful, and try to guide them towards shopping-related topics. Keep responses conversational and engaging.";
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
        text: "Sorry, I'm having trouble connecting right now. Please try again in a moment! 😊",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="h-[70px]">
        <Navbar />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 h-[calc(100vh-150px)] flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  AI Shopping Assistant
                  <Sparkles className="h-5 w-5 text-yellow-400 animate-pulse" />
                </h1>
                <p className="text-sm text-slate-300 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Powered by Gemini AI - Your smart shopping companion!
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white/50 to-slate-50/50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] ${
                  message.isBot 
                    ? 'bg-white/90 backdrop-blur-sm border border-slate-200 shadow-md' 
                    : 'bg-gradient-to-r from-slate-900 to-slate-700 text-white shadow-lg'
                } rounded-2xl p-4 transition-all duration-200 hover:shadow-lg`}>
                  <div className="flex items-start gap-3">
                    {message.isBot && (
                      <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {!message.isBot && (
                      <User className="h-5 w-5 mt-0.5 text-slate-300 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      
                      {/* Enhanced Suggestion Pills */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Lightbulb className="h-3 w-3" />
                            <span>Try asking:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-auto py-2 px-3 bg-gradient-to-r from-white to-slate-50 border-slate-300 hover:from-slate-50 hover:to-slate-100 hover:border-slate-400 transition-all duration-200 rounded-full shadow-sm hover:shadow-md"
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                <Sparkles className="h-3 w-3 mr-1.5 text-blue-500" />
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Enhanced Product Results */}
                      {message.products && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <ShoppingBag className="h-4 w-4 text-blue-600" />
                            <span>Found {message.products.length} products for you:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {message.products.map((product) => (
                              <Card 
                                key={product.id} 
                                className="group cursor-pointer hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-blue-300 bg-white/90 backdrop-blur-sm overflow-hidden"
                                onClick={() => navigate(`/product/${product.id}`)}
                              >
                                <CardContent className="p-0">
                                  <div className="relative overflow-hidden">
                                    <img
                                      src={product.thumbnail}
                                      alt={product.title}
                                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {product.discountPercentage > 0 && (
                                      <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {Math.round(product.discountPercentage)}% OFF
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-3">
                                    <h4 className="text-sm font-semibold line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                      {product.title}
                                    </h4>
                                    <div className="flex items-center justify-between">
                                      <p className="text-lg font-bold text-slate-900">
                                        ₹{product.price}
                                      </p>
                                      <div className="flex items-center gap-1">
                                        <div className="flex">
                                          {[...Array(5)].map((_, i) => (
                                            <div
                                              key={i}
                                              className={`w-3 h-3 ${
                                                i < Math.floor(product.rating)
                                                  ? "text-yellow-400"
                                                  : "text-gray-200"
                                              }`}
                                            >
                                              ⭐
                                            </div>
                                          ))}
                                        </div>
                                        <span className="text-xs text-slate-600">
                                          ({product.rating})
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 ml-8">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl p-4 max-w-[80%] shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Quick Suggestions Bar */}
          <div className="px-6 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-slate-200">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {defaultSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs whitespace-nowrap flex-shrink-0 bg-white/80 hover:bg-white border-slate-300 hover:border-blue-400 transition-all duration-200"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Enhanced Input */}
          <div className="p-6 bg-white/90 backdrop-blur-sm border-t border-slate-200">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything... (e.g., 'Hi there!' or 'show me shirts under ₹1000')"
                className="flex-1 border-slate-300 focus:border-blue-400 focus:ring-blue-400 bg-white/90 backdrop-blur-sm"
                disabled={isLoading}
              />
              <Button 
                onClick={() => handleSendMessage()} 
                disabled={!inputValue.trim() || isLoading}
                className="bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 transition-all duration-200 shadow-lg hover:shadow-xl"
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
