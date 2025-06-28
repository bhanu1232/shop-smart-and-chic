import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, ShoppingBag, Lightbulb, Sparkles, TrendingUp, Heart, Star, Zap } from "lucide-react";
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
  followUpQuestions?: string[];
  isProactive?: boolean;
}

interface SearchInfo {
  searchTerms: string;
  allTerms: string[];
  maxPrice: number | string | null;
  colors: string[];
  originalMessage: string;
  size?: string;
  occasion?: string;
  style?: string;
  season?: string;
}

interface UserPreferences {
  size?: string;
  style?: string;
  budget?: number;
  colors?: string[];
  occasions?: string[];
  lastSearch?: string;
}

const Chat = () => {
  useScrollToTop();
  const navigate = useNavigate();

  const defaultSuggestions = [
    "Show me trendy summer dresses",
    "Find casual t-shirts under ₹1000",
    "Show me latest fashion collections",
    "Browse winter wear collection"
  ];

  const proactiveGreetings = [
    "Hi there! Looking for something specific today? 👗",
    "Welcome! Tell me your size and style preference—I'll recommend some outfits! ✨",
    "Hello! What's your budget and occasion? I'll find the perfect pieces for you! 🛍️",
    "Hey fashionista! Ready to discover some amazing styles? What are you looking for? 💫"
  ];

  const followUpQuestions = {
    size: ["What's your size preference?", "Do you prefer S, M, L, or XL?", "Any specific size you're looking for?"],
    budget: ["What's your budget range?", "Are you looking for something under ₹1000, ₹2000, or higher?", "What price range works for you?"],
    occasion: ["What's the occasion?", "Is this for casual wear, office, party, or something else?", "When will you be wearing this?"],
    style: ["What's your style preference?", "Do you prefer casual, formal, ethnic, or western?", "Any specific style you love?"],
    color: ["Any color preferences?", "Do you have a favorite color?", "Looking for something specific like black, white, or colorful?"]
  };

  const CLOTHING_CATEGORIES = {
    tops: ['t-shirt', 'shirt', 'top', 'blouse', 'sweater', 'sweatshirt', 'hoodie', 'tank top'],
    bottoms: ['jeans', 'pants', 'trousers', 'shorts', 'skirt', 'leggings'],
    dresses: ['dress', 'gown', 'jumpsuit', 'romper'],
    outerwear: ['jacket', 'coat', 'blazer', 'cardigan', 'windbreaker'],
    ethnic: ['kurta', 'saree', 'salwar', 'kurti', 'lehenga'],
    activewear: ['sportswear', 'gym wear', 'yoga', 'athletic'],
    accessories: ['scarf', 'belt', 'tie', 'socks', 'hat', 'cap']
  };

  const NON_CLOTHING_KEYWORDS = [
    'electronics', 'phone', 'laptop', 'computer', 'gadget', 'furniture', 'food',
    'grocery', 'book', 'toy', 'game', 'kitchen', 'home', 'beauty', 'makeup',
    'skincare', 'tool', 'automotive', 'car', 'bike'
  ];

  const GREETINGS = [
    'hi', 'hello', 'hey', 'hlo', 'hii', 'hola', 'greetings', 'good morning', 'good afternoon', 'good evening'
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      text: proactiveGreetings[Math.floor(Math.random() * proactiveGreetings.length)],
      isBot: true,
      timestamp: new Date(),
      suggestions: defaultSuggestions,
      isProactive: true
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({});
  const [conversationContext, setConversationContext] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced intent detection with more context
  const detectIntent = (message: string): string => {
    const lowerMessage = message.toLowerCase();

    if (GREETINGS.some(greeting => lowerMessage.startsWith(greeting))) {
      return 'greeting';
    }

    if (lowerMessage.includes('size') || lowerMessage.includes('s m l xl')) {
      return 'size_preference';
    }

    if (lowerMessage.includes('budget') || lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return 'budget_preference';
    }

    if (lowerMessage.includes('occasion') || lowerMessage.includes('party') || lowerMessage.includes('office') || lowerMessage.includes('casual')) {
      return 'occasion_preference';
    }

    if (lowerMessage.includes('style') || lowerMessage.includes('casual') || lowerMessage.includes('formal') || lowerMessage.includes('ethnic')) {
      return 'style_preference';
    }

    if (lowerMessage.includes('color') || lowerMessage.includes('red') || lowerMessage.includes('blue') || lowerMessage.includes('black')) {
      return 'color_preference';
    }

    if (lowerMessage.includes('show') || lowerMessage.includes('find') || lowerMessage.includes('need') || lowerMessage.includes('want')) {
      return 'product_search';
    }

    return 'general_conversation';
  };

  // Extract user preferences from messages
  const extractUserPreferences = (message: string): Partial<UserPreferences> => {
    const lowerMessage = message.toLowerCase();
    const preferences: Partial<UserPreferences> = {};

    // Extract size
    const sizeMatch = lowerMessage.match(/\b(s|m|l|xl|xxl|small|medium|large)\b/);
    if (sizeMatch) {
      preferences.size = sizeMatch[1].toUpperCase();
    }

    // Extract budget
    const budgetMatch = lowerMessage.match(/₹?(\d+)k?/);
    if (budgetMatch) {
      preferences.budget = parseInt(budgetMatch[1]) * (lowerMessage.includes('k') ? 1000 : 1);
    }

    // Extract colors
    const colors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange', 'brown', 'grey', 'gray', 'navy', 'maroon'];
    const foundColors = colors.filter(color => lowerMessage.includes(color));
    if (foundColors.length > 0) {
      preferences.colors = foundColors;
    }

    // Extract occasions
    const occasions = ['casual', 'formal', 'party', 'office', 'wedding', 'date', 'vacation', 'gym', 'sports'];
    const foundOccasions = occasions.filter(occasion => lowerMessage.includes(occasion));
    if (foundOccasions.length > 0) {
      preferences.occasions = foundOccasions;
    }

    // Extract style
    const styles = ['casual', 'formal', 'ethnic', 'western', 'traditional', 'modern', 'vintage', 'bohemian'];
    const foundStyles = styles.filter(style => lowerMessage.includes(style));
    if (foundStyles.length > 0) {
      preferences.style = foundStyles[0];
    }

    return preferences;
  };

  const extractSearchTermsAndPrice = (message: string): SearchInfo => {
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

  const isGreeting = (message: string): boolean => {
    return GREETINGS.some(greeting =>
      message.toLowerCase().trim().startsWith(greeting)
    );
  };

  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Enhanced product finding with better upselling
  const findProducts = async (searchInfo: SearchInfo) => {
    try {
      let products: Product[] = [];

      // Handle "latest" or "new arrivals" queries
      if (searchInfo.searchTerms.toLowerCase().includes('latest') ||
        searchInfo.searchTerms.toLowerCase().includes('new') ||
        searchInfo.searchTerms.toLowerCase().includes('recent')) {
        products = await fetchProducts(30);
        products.sort((a, b) => b.id.localeCompare(a.id));
        return products.slice(0, 6);
      }

      // If no specific search terms, get trending products
      if (!searchInfo.searchTerms) {
        products = await fetchProducts(30);
        products.sort((a, b) => {
          const scoreA = (a.rating * 2) + (a.discountPercentage / 10);
          const scoreB = (b.rating * 2) + (b.discountPercentage / 10);
          return scoreB - scoreA;
        });
        return products.slice(0, 6);
      }

      // Try multiple search strategies
      const searchStrategies = [
        searchInfo.searchTerms,
        ...searchInfo.allTerms,
        searchInfo.searchTerms.split(' ')[0],
        'clothing'
      ];

      // Fetch more products initially
      for (const term of searchStrategies) {
        if (!term) continue;
        const results = await searchProducts(term);
        if (results.length > 0) {
          products = results;
          break;
        }
      }

      // Apply filters
      const filteredProducts = products.filter(product => {
        // Enhanced price filter
        if (searchInfo.maxPrice !== null) {
          const maxPriceNum = typeof searchInfo.maxPrice === 'number'
            ? searchInfo.maxPrice
            : parseInt(searchInfo.maxPrice.toString().replace('k', '000'));

          // Strict price filtering
          return !isNaN(maxPriceNum) && product.price <= maxPriceNum;
        }

        // Color filter
        if (searchInfo.colors.length > 0) {
          const productText = `${product.title} ${product.description}`.toLowerCase();
          return searchInfo.colors.some(color => productText.includes(color));
        }

        return true;
      });

      // Sort by relevance score with price consideration
      const sortedProducts = filteredProducts.sort((a, b) => {
        const getRelevanceScore = (product: Product) => {
          let score = 0;
          score += product.rating * 2;
          score += product.discountPercentage / 10;

          // Boost score for products matching search terms
          if (product.title.toLowerCase().includes(searchInfo.searchTerms.toLowerCase())) {
            score += 5;
          }

          // Price-based scoring (prioritize items well under the max price)
          if (searchInfo.maxPrice !== null) {
            const maxPriceNum = typeof searchInfo.maxPrice === 'number'
              ? searchInfo.maxPrice
              : parseInt(searchInfo.maxPrice.toString().replace('k', '000'));

            if (!isNaN(maxPriceNum)) {
              const priceRatio = 1 - (product.price / maxPriceNum);
              score += priceRatio * 3;
            }
          }

          return score;
        };

        return getRelevanceScore(b) - getRelevanceScore(a);
      });

      // Return up to 6 products, ensuring we show more products under the price limit
      return sortedProducts.slice(0, Math.min(6, sortedProducts.length));
    } catch (error) {
      console.error('Error finding products:', error);
      return [];
    }
  };

  const isClothingQuery = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();

    // Check if contains non-clothing keywords
    if (NON_CLOTHING_KEYWORDS.some(keyword => lowerMessage.includes(keyword))) {
      return false;
    }

    // Check if contains clothing categories or terms
    return Object.values(CLOTHING_CATEGORIES).flat().some(term =>
      lowerMessage.includes(term)
    ) || [
      'cloth', 'wear', 'dress', 'fashion', 'outfit', 'apparel', 'collection',
      'style', 'trend', 'seasonal', 'wardrobe', 'fit', 'size'
    ].some(term => lowerMessage.includes(term));
  };

  const isProductQuery = (message: string) => {
    const productKeywords = [
      'show', 'find', 'need', 'want', 'looking', 'search', 'buy', 'get',
      'where', 'how', 'what', 'which', 'recommend', 'suggest', 'browse',
      'available', 'price', 'cost', 'sale', 'discount', 'offer'
    ];
    const lowerMessage = message.toLowerCase();

    const hasProductKeyword = productKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasPrice = /₹|\$|rupee|price|under|below|budget|cost|cheap|expensive/i.test(message);

    return hasProductKeyword || hasPrice;
  };

  // Generate smart follow-up questions based on context
  const generateFollowUpQuestions = (intent: string, searchInfo: SearchInfo): string[] => {
    const questions: string[] = [];

    switch (intent) {
      case 'size_preference':
        questions.push(...followUpQuestions.size);
        break;
      case 'budget_preference':
        questions.push(...followUpQuestions.budget);
        break;
      case 'occasion_preference':
        questions.push(...followUpQuestions.occasion);
        break;
      case 'style_preference':
        questions.push(...followUpQuestions.style);
        break;
      case 'color_preference':
        questions.push(...followUpQuestions.color);
        break;
      case 'product_search':
        // If we have some info but missing others, ask follow-ups
        if (!searchInfo.maxPrice) {
          questions.push("What's your budget range?");
        }
        if (!searchInfo.colors.length) {
          questions.push("Any color preferences?");
        }
        if (!userPreferences.size) {
          questions.push("What's your size preference?");
        }
        break;
      default:
        questions.push("What type of clothing are you looking for?");
        questions.push("Do you have a specific budget in mind?");
        questions.push("What's the occasion?");
    }

    return questions.slice(0, 3); // Limit to 3 questions
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    handleSendMessage(suggestion);
  };

  const generateDynamicSuggestions = async (searchInfo: SearchInfo, products: Product[]) => {
    if (products.length === 0) return defaultSuggestions;

    // Get unique categories and styles from found products
    const categories = [...new Set(products.map(p => p.category))];
    const styles = [...new Set(products.flatMap(p =>
      p.title.toLowerCase().split(' ').filter(word =>
        ['casual', 'formal', 'party', 'ethnic', 'western', 'traditional'].includes(word)
      )
    ))];

    // Generate style-based suggestions
    const styleSuggestions = styles.map(style =>
      `Show me ${style} ${searchInfo.searchTerms || 'outfits'}`
    );

    // Generate price-based suggestions
    const avgPrice = products.reduce((acc, p) => acc + p.price, 0) / products.length;
    const priceSuggestions = [
      `Find ${searchInfo.searchTerms || 'clothes'} under ₹${Math.round(avgPrice)}`,
      `Show me premium ${categories[0] || 'fashion'} collection`
    ];

    // Generate seasonal suggestions based on current month
    const month = new Date().getMonth();
    const seasonalSuggestion = month >= 3 && month <= 8
      ? "Browse summer collection"
      : "Check out winter wear";

    // Combine all suggestions
    const allSuggestions = [
      ...styleSuggestions,
      ...priceSuggestions,
      seasonalSuggestion,
      `Explore new arrivals in ${categories[0] || 'fashion'}`
    ];

    return allSuggestions
      .filter(Boolean)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
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
      // Extract user preferences and update context
      const newPreferences = extractUserPreferences(text);
      setUserPreferences(prev => ({ ...prev, ...newPreferences }));

      // Detect intent
      const intent = detectIntent(text);

      // Handle greetings with proactive engagement
      if (isGreeting(text)) {
        const timeGreeting = getTimeBasedGreeting();
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: `${timeGreeting}! 👋 I'm your personal shopping assistant. I'd love to help you find the perfect fashion pieces! What's your style preference and budget?`,
          isBot: true,
          timestamp: new Date(),
          suggestions: [
            "Tell me your size preference",
            "What's your budget range?",
            "Show me trending fashion",
            "I need outfit recommendations"
          ],
          followUpQuestions: [
            "What's your size preference?",
            "What's your budget range?",
            "What occasion are you shopping for?"
          ]
        };
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
        return;
      }

      // Check if query is about non-clothing items
      if (!isClothingQuery(text) && isProductQuery(text)) {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: "I apologize, but Shop Smart & Chic specializes in fashion and clothing items only. We offer a wide range of trendy clothes, accessories, and fashion items. Would you like me to show you our latest fashion collection instead?",
          isBot: true,
          timestamp: new Date(),
          suggestions: defaultSuggestions,
        };
        setMessages(prev => [...prev, botResponse]);
        setIsLoading(false);
        return;
      }

      if (isProductQuery(text)) {
        const searchInfo = extractSearchTermsAndPrice(text);
        const products = await findProducts(searchInfo);

        let aiResponse;
        if (products.length > 0) {
          const context = `The user is looking for fashion items. I found ${products.length} stylish pieces for their search: "${text}". Be enthusiastic and fashion-focused in the response, highlighting style elements, seasonal relevance, and trending aspects. Include upselling suggestions for trending items.`;
          aiResponse = await generateChatResponse(text, context);

          const dynamicSuggestions = await generateDynamicSuggestions(searchInfo, products);
          aiResponse.suggestions = dynamicSuggestions;
        } else {
          const context = `The user is looking for fashion items: "${text}" but I couldn't find exact matches. Suggest similar fashion categories or trending styles.`;
          aiResponse = await generateChatResponse(text, context);
          aiResponse.suggestions = defaultSuggestions;
        }

        // Generate follow-up questions based on intent
        const followUpQuestions = generateFollowUpQuestions(intent, searchInfo);

        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponse.response,
          isBot: true,
          timestamp: new Date(),
          products: products.length > 0 ? products : undefined,
          suggestions: aiResponse.suggestions,
          followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined
        };

        setMessages(prev => [...prev, botResponse]);
      } else {
        // General fashion conversation with proactive engagement
        const context = "The user is having a general conversation. Keep the focus on fashion, style advice, and clothing trends. Be like a knowledgeable fashion consultant. Ask follow-up questions to understand their preferences better.";
        const aiResponse = await generateChatResponse(text, context);

        const showSuggestions = text.toLowerCase().includes('fashion') ||
          text.toLowerCase().includes('style') ||
          text.toLowerCase().includes('clothes') ||
          text.toLowerCase().includes('wear');

        const followUpQuestions = generateFollowUpQuestions(intent, { searchTerms: '', allTerms: [], maxPrice: null, colors: [], originalMessage: text });

        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: aiResponse.response,
          isBot: true,
          timestamp: new Date(),
          suggestions: showSuggestions ? defaultSuggestions : [],
          followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined
        };
        setMessages(prev => [...prev, botResponse]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment! 👗",
        isBot: true,
        timestamp: new Date(),
        suggestions: []
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="h-[70px]">
        <Navbar />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-[calc(100vh-150px)] flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-700/50 rounded-xl backdrop-blur-lg">
                <Bot className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  Sun Fashion Assistant
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </h1>
                <p className="text-sm text-gray-300 flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Your personal shopping guide
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] ${message.isBot ? 'bg-gray-50 border border-gray-200' : 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'
                  } rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200`}>
                  <div className="flex items-start gap-3">
                    {message.isBot ? (
                      <div className="p-1.5 bg-gray-700 rounded-lg flex-shrink-0">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <User className="h-5 w-5 mt-0.5 text-gray-300 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">{message.text}</p>

                      {/* Follow-up Questions */}
                      {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Zap className="h-3 w-3" />
                            <span>Quick questions:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.followUpQuestions.map((question, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className={`text-xs h-auto py-2 px-3 ${message.isBot
                                  ? 'bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 text-blue-700'
                                  : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
                                  } rounded-full transition-all duration-200`}
                                onClick={() => handleSuggestionClick(question)}
                              >
                                <Heart className="h-3 w-3 mr-1.5" />
                                {question}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Lightbulb className="h-3 w-3" />
                            <span>Quick suggestions:</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className={`text-xs h-auto py-2 px-3 ${message.isBot
                                  ? 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
                                  : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700'
                                  } rounded-full transition-all duration-200`}
                                onClick={() => handleSuggestionClick(suggestion)}
                              >
                                <Sparkles className="h-3 w-3 mr-1.5" />
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Products Grid */}
                      {message.products && (
                        <div className="mt-4 space-y-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <ShoppingBag className="h-4 w-4 text-gray-600" />
                            <span>Found {message.products.length} products for you:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {message.products.map((product) => (
                              <Card
                                key={product.id}
                                className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-gray-300 overflow-hidden"
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
                                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                        {Math.round(product.discountPercentage)}% OFF
                                      </div>
                                    )}
                                    {product.rating >= 4.5 && (
                                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <Star className="h-3 w-3" />
                                        Trending
                                      </div>
                                    )}
                                  </div>
                                  <div className="p-3">
                                    <h4 className="text-sm font-semibold line-clamp-2 mb-2 group-hover:text-gray-700">
                                      {product.title}
                                    </h4>
                                    <div className="flex items-center justify-between">
                                      <p className="text-lg font-bold text-gray-900">
                                        ₹{product.price}
                                      </p>
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm text-yellow-500">★</span>
                                        <span className="text-sm text-gray-600">
                                          {product.rating.toFixed(1)}
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
                  <p className="text-xs text-gray-400 mt-2 ml-8">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 max-w-[80%]">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-gray-700 rounded-lg">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
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

          {/* Input Area */}
          <div className="p-6 bg-white border-t border-gray-100">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about our fashion collection..."
                className="flex-1 border-gray-200 focus:border-gray-300 focus:ring-gray-300 bg-gray-50/50"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="bg-gray-900 hover:bg-gray-800 transition-all duration-200"
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
