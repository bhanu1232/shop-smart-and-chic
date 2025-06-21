
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, ShoppingBag } from "lucide-react";
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
}

const Chat = () => {
  useScrollToTop();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: "Hello! I'm your shopping assistant. I can help you find products. Try asking me something like 'show me shirts under 1000' or 'I need a red dress'.",
      isBot: true,
      timestamp: new Date(),
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
      return `I couldn't find any products matching your criteria. Try searching for something else or browse our full collection.`;
    }

    let response = `I found ${productsFound.length} products for you`;
    
    if (searchTerms) {
      response += ` related to "${searchTerms}"`;
    }
    
    if (maxPrice) {
      response += ` under ₹${maxPrice}`;
    }
    
    response += ". Here are some great options:";
    
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { searchTerms, maxPrice } = extractSearchTermsAndPrice(inputValue);
      const products = await findProducts(searchTerms, maxPrice);
      
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(searchTerms, maxPrice, products),
        isBot: true,
        timestamp: new Date(),
        products: products.length > 0 ? products : undefined,
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble finding products right now. Please try again later.",
        isBot: true,
        timestamp: new Date(),
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
                <p className="text-sm text-gray-300">Ask me to find products for you!</p>
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

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me to find products... (e.g., 'show me shirts under 1000')"
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
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
