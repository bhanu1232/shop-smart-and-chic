
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, TruckIcon, Shield, RotateCcw, Award, Sparkles, Users, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Product, fetchProducts } from "@/api/products";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useAuth } from "@/context/AuthContext";
import SignInModal from "@/components/SignInModal";
import Navbar from "@/components/Navbar";

const Index = () => {
  const navigate = useNavigate();
  useScrollToTop();
  const { isAuthenticated } = useAuth();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts(20);
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
    { name: "Women's Fashion", image: "/Home/Hero.jpg", count: "2000+ Products" },
    { name: "Men's Collection", image: "/Home/Hero2.jpg", count: "1500+ Products" },
    { name: "Accessories", image: "/Home/Hero.jpg", count: "800+ Products" },
    { name: "Footwear", image: "/Home/Hero2.jpg", count: "600+ Products" }
  ];

  const features = [
    { icon: TruckIcon, title: "Free Delivery", desc: "On orders above $50", color: "bg-blue-50 text-blue-600" },
    { icon: Shield, title: "Secure Payment", desc: "100% protected payment", color: "bg-green-50 text-green-600" },
    { icon: RotateCcw, title: "Easy Returns", desc: "7 days return policy", color: "bg-orange-50 text-orange-600" },
    { icon: Award, title: "Quality Products", desc: "Premium quality assured", color: "bg-purple-50 text-purple-600" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-slate-100 pt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh] py-12">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  New Collection Available
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                  Fashion That 
                  <span className="text-slate-600 block">Speaks Style</span>
                </h1>
                <p className="text-xl text-slate-600 max-w-lg">
                  Discover the latest trends in fashion with our curated collection of premium clothing and accessories.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-full text-lg font-medium"
                  onClick={() => navigate('/products')}
                >
                  Shop Now <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-2 border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-full text-lg font-medium"
                  onClick={() => navigate('/about')}
                >
                  Learn More
                </Button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">50K+</div>
                  <div className="text-sm text-slate-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">10K+</div>
                  <div className="text-sm text-slate-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">4.8★</div>
                  <div className="text-sm text-slate-600">Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <img 
                      src="/Home/Hero.jpg" 
                      alt="Fashion Item" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div className="mt-3">
                      <div className="font-semibold text-slate-900">Designer Dress</div>
                      <div className="text-slate-600">$89.99</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <img 
                      src="/Home/Hero2.jpg" 
                      alt="Fashion Item" 
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <div className="mt-3">
                      <div className="font-semibold text-slate-900">Casual Wear</div>
                      <div className="text-slate-600">$45.99</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <img 
                      src="/Home/Hero2.jpg" 
                      alt="Fashion Item" 
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <div className="mt-3">
                      <div className="font-semibold text-slate-900">Premium Style</div>
                      <div className="text-slate-600">$129.99</div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-lg">
                    <img 
                      src="/Home/Hero.jpg" 
                      alt="Fashion Item" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <div className="mt-3">
                      <div className="font-semibold text-slate-900">Elegant Collection</div>
                      <div className="text-slate-600">$199.99</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-white py-6 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`p-2 rounded-lg ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{feature.title}</div>
                  <div className="text-slate-600 text-xs">{feature.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Shop by Category</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Explore our diverse collection across different categories
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card 
                key={index}
                className="group cursor-pointer overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300"
                onClick={() => navigate('/products')}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.count}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Trending Products</h2>
              <p className="text-slate-600">Discover what's popular right now</p>
            </div>
            <Button 
              variant="outline" 
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
              onClick={() => navigate('/products')}
            >
              View All <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="aspect-square bg-slate-200" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-slate-200 rounded mb-2" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {products.slice(0, 10).map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden bg-white border-0"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.discountPercentage > 0 && (
                      <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs">
                        {Math.round(product.discountPercentage)}% OFF
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 hover:bg-white text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-slate-900 mb-2 line-clamp-2 text-sm">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-slate-600">{product.rating}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.discountPercentage > 0 && (
                        <span className="text-xs text-slate-400 line-through">
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

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Us</h2>
            <p className="text-slate-600 text-lg">We're committed to providing the best shopping experience</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-900 transition-colors duration-300">
                <Users className="w-8 h-8 text-slate-600 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">10M+ Customers</h3>
              <p className="text-slate-600">Trusted by millions of shoppers worldwide</p>
            </div>
            <div className="text-center group">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-900 transition-colors duration-300">
                <Award className="w-8 h-8 text-slate-600 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">Premium Quality</h3>
              <p className="text-slate-600">Carefully curated products from top brands</p>
            </div>
            <div className="text-center group">
              <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-900 transition-colors duration-300">
                <Shield className="w-8 h-8 text-slate-600 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-2">Secure Shopping</h3>
              <p className="text-slate-600">Your privacy and security are our priority</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Get exclusive offers, style tips, and new arrivals delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg bg-white text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <Button className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-lg font-medium">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Strendzy</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Your destination for trendy, affordable fashion. Quality clothing that fits your style and budget.
              </p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-slate-600 ml-2">4.8 (25k+ reviews)</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Quick Links</h4>
              <ul className="space-y-3 text-slate-600 text-sm">
                <li><button onClick={() => navigate('/about')} className="hover:text-slate-900 transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-slate-900 transition-colors">All Products</button></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Shipping Info</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Categories</h4>
              <ul className="space-y-3 text-slate-600 text-sm">
                <li><button onClick={() => navigate('/products')} className="hover:text-slate-900 transition-colors">Women's Fashion</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-slate-900 transition-colors">Men's Collection</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-slate-900 transition-colors">Accessories</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-slate-900 transition-colors">New Arrivals</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Support</h4>
              <ul className="space-y-3 text-slate-600 text-sm">
                <li><a href="#" className="hover:text-slate-900 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Returns & Exchanges</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-6 text-center text-slate-500 text-sm">
            <p>&copy; 2024 Strendzy. All rights reserved. Made with ❤️ for fashion lovers.</p>
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
