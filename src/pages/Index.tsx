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

const Index = () => {
  const navigate = useNavigate();
  useScrollToTop();
  const { isAuthenticated, user } = useAuth();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
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

  return (
    <div className="min-h-screen bg-white">
      <div className="h-[70px]">
        <Navbar />
      </div>

      {/* Hero Banner Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/Home/Hero.webp"
            alt="Hero Banner"
            className="w-full h-full object-cover"
          />

          <div onClick={() => navigate(`/products`)} className="absolute cursor-pointer inset-0 hover:bg-black/30"></div>
        </div>

      </section>

      {/* Features Bar */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-6">
                <div className="p-4 bg-slate-100 rounded-full">
                  <feature.icon className="h-7 w-7 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">{feature.title}</h3>
                  <p className="text-slate-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Shop by Category</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Find your perfect style from our curated collection of premium streetwear</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {categories.map((category) => (
              <Card
                key={category.name}
                className={`group cursor-pointer border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${category.color}`}
                onClick={() => navigate('/products')}
              >
                <CardContent className="p-8 text-center">
                  <div className="text-5xl mb-6">{category.icon}</div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{category.name}</h3>
                  <p className="text-slate-600">{category.count} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Categories */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">Trending Categories</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Explore our most popular collections and stay ahead of the fashion curve</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingCategories.map((category, index) => (
              <Card key={index} className="group cursor-pointer overflow-hidden">
                <div className="relative h-96">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <h3 className="text-2xl font-bold mb-3">{category.name}</h3>
                    <p className="text-white/90">{category.count} items</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16">
            <div className="text-center md:text-left mb-8 md:mb-0">
              <h2 className="text-4xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Featured Products</h2>
              <p className="text-lg text-slate-600">Handpicked favorites from our latest collection</p>
            </div>
            <Button
              variant="outline"
              className="rounded-full px-8 py-6 text-lg"
              onClick={() => navigate('/products')}
            >
              View All
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="aspect-square bg-slate-200" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-slate-200 rounded mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-4" />
                    <div className="h-6 bg-slate-200 rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.slice(0, 4).map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discountPercentage > 0 && (
                      <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                        {Math.round(product.discountPercentage)}% OFF
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Heart className="h-5 w-5" />
                    </Button>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span className="text-xs text-slate-600 uppercase tracking-wide">{product.category}</span>
                    </div>
                    <h3 className="font-medium text-slate-900 mb-2 line-clamp-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-semibold text-slate-900">${product.price}</span>
                      {product.discountPercentage > 0 && (
                        <span className="text-sm text-slate-500 line-through">
                          ${(product.price * (1 + product.discountPercentage / 100)).toFixed(2)}
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

      {/* Newsletter Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
            <p className="text-xl text-slate-300 mb-8">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-white/40 rounded-full px-6 py-6"
              />
              <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-full px-8 py-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Skena.co</h3>
              <p className="text-slate-400 leading-relaxed">
                Premium streetwear for the modern individual. Quality meets style in every piece.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-4 text-slate-400">
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Products</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6">Categories</h4>
              <ul className="space-y-4 text-slate-400">
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">T-Shirts</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Hoodies</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Jeans</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Sneakers</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-6">Support</h4>
              <ul className="space-y-4 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Skena.co. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </div>
  );
};

export default Index;
