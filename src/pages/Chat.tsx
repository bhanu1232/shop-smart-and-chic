
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, ShoppingBag, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Product, searchProducts, fetchProducts } from "@/api/products";
import { useScrollToTop } from "@/hooks/useScrollToTop";

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
  
  const suggestionMessages = [
    "Show me shirts under ₹1000",
    "I need a red dress",
    "Find me sneakers under ₹2000",
    "Show hoodies for winter",
    "I want jeans under ₹1500",
    "Find me accessories",
    "Show me bags under ₹800",
    "I need a jacket"
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hello! I'm your shopping assistant. I can help you find products and answer questions about shopping. You can ask me things like:",
      isBot: true,
      timestamp: new Date(),
      suggestions: suggestionMessages.slice(0, 4)
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

  const getGreetingResponse = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey')) {
      return {
        text: "Hello! Welcome to our store! 👋 I'm here to help you find amazing products. What are you looking for today?",
        suggestions: ["Show me trending products", "I need clothing", "Find me accessories", "What's on sale?"]
      };
    }
    
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you do')) {
      return {
        text: "I'm doing great, thank you for asking! I'm excited to help you discover some amazing products. What can I help you find today?",
        suggestions: suggestionMessages.slice(0, 4)
      };
    }
    
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
      return {
        text: "You're welcome! I'm always happy to help. Is there anything else you'd like to find?",
        suggestions: ["Show me more products", "I need something specific", "What's popular?", "Browse categories"]
      };
    }
    
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
      return {
        text: "Goodbye! Thanks for shopping with us. Come back anytime if you need help finding products! 👋",
        suggestions: []
      };
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return {
        text: "I can help you find products based on your preferences! Just tell me what you're looking for. I can search by category, price range, color, or specific items. Try asking me something like:",
        suggestions: suggestionMessages.slice(0, 6)
      };
    }
    
    return null;
  };

  const getGeneralResponse = (message: string) => {
    const responses = [
      {
        text: "I'd love to help you find some great products! Could you tell me what you're looking for? For example, you could ask:",
        suggestions: suggestionMessages.slice(0, 4)
      },
      {
        text: "That's interesting! Let me help you find some amazing products. What type of items are you shopping for today?",
        suggestions: ["Clothing", "Accessories", "Shoes", "Bags"]
      },
      {
        text: "I'm here to make your shopping experience amazing! What kind of products can I help you discover?",
        suggestions: suggestionMessages.slice(2, 6)
      }
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const extractSearchTermsAndPrice = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Extract price range
    const priceMatch = lowerMessage.match(/under (\d+)|below (\d+)|less than (\d+)|(\d+)\s*k|(\d+)\s*thousand/);
    let maxPrice = null;
    
    if (priceMatch) {
      const price = priceMatch[1] || priceMatch[2] || priceMatch[3] || priceMatch[4] || priceMatch[5];
      maxPrice = parseInt(price);
      if (lowerMessage.includes('k') || lowerMessage.includes('thousand')) {
        maxPrice *= 1000;
      }
    }

    // Extract product categories/terms
    const productTerms = [
      'shirt', 'shirts', 't-shirt', 't-shirts', 'tshirt', 'tshirts',
      'dress', 'dresses', 'jeans', 'pants', 'trousers',
      'shoes', 'sneakers', 'boots', 'sandals',
      'jacket', 'jackets', 'hoodie', 'hoodies',
      'bag', 'bags', 'watch', 'watches',
      'accessories', 'jewelry'
    ];

    const foundTerms = productTerms.filter(term => lowerMessage.includes(term));
    
    return {
      searchTerms: foundTerms.length > 0 ? foundTerms[0] : '',
      maxPrice,
      originalMessage: message
    };
  };

  const findProducts = async (searchTerms: string, maxPrice: number | null) => {
    try {
      let products: Product[] = [];
      
      if (searchTerms) {
        products = await searchProducts(searchTerms);
      } else {
        const allProducts = await fetchProducts(20);
        products = allProducts;
      }

      // Filter by price if specified
      if (maxPrice) {
        products = products.filter(product => product.price <= maxPrice);
      }

      // Return top 4 products
      return products.slice(0, 4);
    } catch (error) {
      console.error('Error finding products:', error);
      return [];
    }
  };

  const generateBotResponse = (searchTerms: string, maxPrice: number | null, productsFound: Product[]) => {
    if (productsFound.length === 0) {
      return {
        text: "I couldn't find any products matching your criteria. Try searching for something else or browse our full collection.",
        suggestions: ["Show me all products", "Try different category", "Popular items", "What's trending?"]
      };
    }

    let response = `I found ${productsFound.length} great products for you`;
    
    if (searchTerms) {
      response += ` related to "${searchTerms}"`;
    }
    
    if (maxPrice) {
      response += ` under ₹${maxPrice}`;
    }
    
    response += ". Here are some amazing options:";
    
    return {
      text: response,
      suggestions: ["Show me more like these", "Different price range", "Other categories", "Add to favorites"]
    };
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
      // Check for greetings and common phrases first
      const greetingResponse = getGreetingResponse(text);
      
      if (greetingResponse) {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: greetingResponse.text,
          isBot: true,
          timestamp: new Date(),
          suggestions: greetingResponse.suggestions,
        };
        setMessages(prev => [...prev, botResponse]);
        return;
      }

      // Check if message contains product search terms
      const { searchTerms, maxPrice } = extractSearchTermsAndPrice(text);
      
      if (searchTerms || maxPrice) {
        // Product search
        const products = await findProducts(searchTerms, maxPrice);
        const responseData = generateBotResponse(searchTerms, maxPrice, products);
        
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: responseData.text,
          isBot: true,
          timestamp: new Date(),
          products: products.length > 0 ? products : undefined,
          suggestions: responseData.suggestions,
        };

        setMessages(prev => [...prev, botResponse]);
      } else {
        // General conversation
        const generalResponse = getGeneralResponse(text);
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: generalResponse.text,
          isBot: true,
          timestamp: new Date(),
          suggestions: generalResponse.suggestions,
        };
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble right now. Please try again later.",
        isBot: true,
        timestamp: new Date(),
        suggestions: ["Try again", "Browse products", "Contact support"]
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
                <h1 className="text-lg font-semibold">Shopping Assistant</h1>
                <p className="text-sm text-gray-300">Your personal shopping companion!</p>
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
              {suggestionMessages.slice(0, 4).map((suggestion, index) => (
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
                placeholder="Type your message... (e.g., 'Hi', 'show me shirts under 1000')"
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
