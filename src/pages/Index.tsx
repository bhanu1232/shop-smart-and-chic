
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Search, Menu, Star, ArrowRight, User, Play, TruckIcon, Shield, RotateCcw } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6">
                <Badge className="bg-slate-900 text-white px-4 py-2 text-sm font-medium rounded-full hover:bg-slate-800">
                  New Collection 2024
                </Badge>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-slate-900 leading-tight">
                  Style That
                  <br />
                  <span className="font-semibold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Speaks
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  Discover premium clothing that defines your unique style
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate('/products')}
                >
                  Shop Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-slate-300 text-slate-900 hover:bg-slate-50 px-8 py-6 text-lg font-medium rounded-lg transition-all duration-300"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Watch Lookbook
                </Button>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 justify-center lg:justify-start">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <feature.icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{feature.title}</p>
                      <p className="text-slate-600 text-xs">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="/Home/Hero.jpg" 
                  alt="Featured Fashion" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-slate-200">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {[1,2,3].map((i) => (
                      <div key={i} className="w-8 h-8 bg-slate-200 rounded-full border-2 border-white"></div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">10k+ Happy Customers</p>
                    <div className="flex items-center space-x-1">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                      <span className="text-xs text-slate-600 ml-1">4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-4">Shop by Category</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Explore our curated collection of premium clothing
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card
                key={category.name}
                className={`group cursor-pointer border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${category.color}`}
                onClick={() => navigate('/products')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="font-medium text-slate-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-slate-600">{category.count} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-slate-900 mb-2">New Arrivals</h2>
              <p className="text-slate-600">Fresh styles just landed</p>
            </div>
            <Button 
              variant="ghost" 
              className="text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              onClick={() => navigate('/products')}
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse bg-white">
                  <div className="aspect-square bg-slate-200" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-slate-200 rounded mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                    <div className="h-6 bg-slate-200 rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discountPercentage > 0 && (
                      <Badge className="absolute top-3 left-3 bg-slate-900 text-white px-2 py-1 text-xs">
                        {Math.round(product.discountPercentage)}% OFF
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span className="text-xs text-slate-600 uppercase tracking-wide">{product.category}</span>
                    </div>
                    <h3 className="font-medium text-slate-900 mb-2 line-clamp-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-slate-900">${product.price}</span>
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

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 rounded-3xl p-12 md:p-16 text-center text-white">
            <h2 className="text-3xl md:text-5xl font-light mb-6">
              Join the Style Revolution
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Get exclusive access to new collections, special offers, and style inspiration
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-300 focus:border-white focus:ring-0"
              />
              <Button className="bg-white text-slate-900 hover:bg-slate-100 px-8 font-medium">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-light mb-6">Skena.co</h3>
              <p className="text-slate-400 leading-relaxed">
                Premium streetwear for the modern individual. Quality meets style in every piece.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-6">Quick Links</h4>
              <ul className="space-y-3 text-slate-400">
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Products</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-6">Categories</h4>
              <ul className="space-y-3 text-slate-400">
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">T-Shirts</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Hoodies</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Jeans</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Sneakers</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-6">Support</h4>
              <ul className="space-y-3 text-slate-400">
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
