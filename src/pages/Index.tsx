import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Search, Menu, Star, ArrowRight, User, Play, TruckIcon, Shield, RotateCcw, TrendingUp, Heart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Product, fetchProducts } from "@/api/products";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useAuth } from "@/context/AuthContext";
import SignInModal from "@/components/SignInModal";
import Navbar from "@/components/Navbar";
import ChatBubble from "@/components/ChatBubble";
import { db } from "@/config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  useScrollToTop();
  const { isAuthenticated, user } = useAuth();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await fetchProducts(8); // Fetch 8 products for home page
        setProducts(response.products);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const categories = [
    { name: "T-Shirts", icon: "👕", count: 56, color: "bg-slate-50 border-slate-200 hover:bg-slate-100" },
    { name: "Hoodies", icon: "🧥", count: 29, color: "bg-slate-50 border-slate-200 hover:bg-slate-100" },
    { name: "Jeans", icon: "👖", count: 15, color: "bg-slate-50 border-slate-200 hover:bg-slate-100" },
    { name: "Sneakers", icon: "👟", count: 33, color: "bg-slate-50 border-slate-200 hover:bg-slate-100" },
    { name: "Accessories", icon: "⌚", count: 38, color: "bg-slate-50 border-slate-200 hover:bg-slate-100" },
    { name: "Jackets", icon: "🧥", count: 24, color: "bg-slate-50 border-slate-200 hover:bg-slate-100" },
    { name: "Bags", icon: "👜", count: 27, color: "bg-slate-50 border-slate-200 hover:bg-slate-100" },
    { name: "Watches", icon: "⌚", count: 42, color: "bg-slate-50 border-slate-200 hover:bg-slate-100" }
  ];

  const features = [
    { icon: TruckIcon, title: "Free Shipping", desc: "On orders over $100" },
    { icon: Shield, title: "Secure Payment", desc: "100% secure checkout" },
    { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" }
  ];

  const trendingCategories = [
    { name: "Summer Collection", image: "/Home/s4.webp", count: 45 },
    { name: "Winter Essentials", image: "/Home/s3.webp", count: 32 },
    { name: "Street Style", image: "/Home/s2.webp", count: 28 }
  ];

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setIsSubscribing(true);
      await addDoc(collection(db, "newsletter"), {
        email,
        subscribedAt: serverTimestamp(),
      });

      toast.success("Thank you for subscribing to our newsletter!", {
        description: "You'll be the first to know about our latest updates and offers.",
        duration: 5000,
      });
      setEmail(""); // Clear the input
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      toast.error("Failed to subscribe. Please try again later.", {
        description: "There was an error processing your request.",
        duration: 5000,
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[70px]">
        <Navbar />
      </div>

      {/* Offers Banner */}
      <div className="bg-slate-900 text-white py-2 mb-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2 animate-pulse">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>Free Shipping on Orders Over $100</span>
            </div>
            <div className="hidden md:flex items-center gap-2 animate-pulse">
              <Shield className="h-4 w-4 text-green-400" />
              <span>Secure Payment</span>
            </div>
            <div className="hidden md:flex items-center gap-2 animate-pulse">
              <RotateCcw className="h-4 w-4 text-blue-400" />
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner Section */}
      <section className="relative mx-4 md:mx-[15px] h-[300px] md:h-[550px] overflow-hidden group cursor-pointer" onClick={() => navigate('/products')}>
        <div className="absolute inset-0">
          <img
            src="/Home/Hero1.avif"
            alt="Hero Banner"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/30 md:bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            size="lg"
            className="bg-black/60 md:bg-black/40 border-[1px] border-white text-white px-6 md:px-8 py-4 md:py-5 text-sm rounded-full font-medium opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            Shop Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-[200px] items-center">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 w-full md:w-auto">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <feature.icon className="h-5 w-5 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-xs text-slate-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h2 className="text-2xl font-medium text-slate-900 mb-3">Featured Products</h2>
              <p className="text-sm text-slate-600">Curated selection of our finest pieces</p>
            </div>
            <Button
              variant="outline"
              className="rounded-full px-6 py-4 text-sm font-medium"
              onClick={() => navigate('/products')}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="aspect-square bg-slate-200" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-slate-200 rounded mb-3" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
                    <div className="h-5 bg-slate-200 rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-md transition-all duration-300 overflow-hidden"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discountPercentage > 0 && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-0.5">
                        {Math.round(product.discountPercentage)}% OFF
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                      <span className="text-xs text-slate-600 uppercase tracking-wider">{product.category}</span>
                    </div>
                    <h3 className="text-sm font-medium text-slate-900 mb-2 line-clamp-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-slate-900">₹{product.price}</span>
                      {product.discountPercentage > 0 && (
                        <span className="text-sm text-slate-500 line-through">
                          ₹{(product.price * (1 + product.discountPercentage / 100)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-medium text-slate-900 mb-3">Shop by Category</h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Curated collections for every style preference
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card
                key={category.name}
                className={`group cursor-pointer border transition-all duration-300 hover:shadow-md ${category.color}`}
                onClick={() => navigate('/products')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-sm font-medium text-slate-900 mb-1">{category.name}</h3>
                  <p className="text-xs text-slate-600">{category.count} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Categories */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Large Left Section */}
            <Card onClick={() => navigate('/products')} className="group cursor-pointer overflow-hidden">
              <div className="relative h-[600px]">
                <img
                  src={trendingCategories[0].image}
                  alt={trendingCategories[0].name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-medium mb-3">{trendingCategories[0].name}</h3>
                      <p className="text-base text-white/90">{trendingCategories[0].count} items</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="bg-white/10 hover:bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <ArrowRight className="h-6 w-6 text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Right Stacked Sections */}
            <div className="flex flex-col gap-4">
              {trendingCategories.slice(1).map((category, index) => (
                <Card onClick={() => navigate('/products')} key={index} className="group cursor-pointer overflow-hidden">
                  <div className="relative h-[290px]">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-medium mb-2">{category.name}</h3>
                          <p className="text-sm text-white/90">{category.count} items</p>
                        </div>
                        <Button
                          onClick={() => navigate('/products')}
                          variant="ghost"
                          size="icon"
                          className="bg-white/10 hover:bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                        >
                          <ArrowRight className="h-5 w-5 text-white" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-medium mb-4">Join Our Community</h2>
            <p className="text-sm text-slate-300 mb-6">
              Subscribe to get special offers and updates
            </p>
            <form onSubmit={handleNewsletterSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-white/40 rounded-full px-4 py-3 text-sm"
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-6 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-medium mb-4">Skena.co</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Premium streetwear for the modern individual
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Products</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4">Categories</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">T-Shirts</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Hoodies</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Jeans</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Sneakers</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm text-slate-400">
            <p>&copy; 2024 Skena.co. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Chat Bubble */}
      <ChatBubble />

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </div>
  );
};

export default Index;
