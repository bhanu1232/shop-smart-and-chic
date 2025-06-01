
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, TruckIcon, Shield, RotateCcw, Award, Users, Sparkles } from "lucide-react";
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
    { name: "Women's Fashion", desc: "Elegant & Modern", count: 156, image: "/Home/s1.webp" },
    { name: "Men's Collection", desc: "Classic & Contemporary", count: 89, image: "/Home/s2.webp" },
    { name: "Accessories", desc: "Complete Your Look", count: 234, image: "/Home/s3.webp" },
    { name: "Seasonal", desc: "Trending Now", count: 67, image: "/Home/s4.webp" }
  ];

  const features = [
    { icon: TruckIcon, title: "Free Worldwide Shipping", desc: "On orders over $150" },
    { icon: Shield, title: "Secure Payments", desc: "256-bit SSL encryption" },
    { icon: RotateCcw, title: "Easy Returns", desc: "60-day return policy" },
    { icon: Award, title: "Premium Quality", desc: "Curated collections" }
  ];

  const luxuryFeatures = [
    { icon: Users, title: "50K+", desc: "Happy Customers Worldwide" },
    { icon: Award, title: "Premium", desc: "Luxury Fashion House" },
    { icon: Sparkles, title: "Exclusive", desc: "Limited Edition Collections" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section - Inspired by the uploaded image */}
      <section className="relative bg-gray-50 min-h-screen flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[80vh]">
            {/* Left Side - Women's Cardigan */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-96 bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <img 
                    src="/Home/Hero.jpg" 
                    alt="Women's Cardigan" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-4 -left-4 w-16 h-20 bg-amber-100 rounded-full opacity-60"></div>
                <div className="absolute -bottom-6 -right-6 w-12 h-16 bg-gray-200 rounded-full opacity-60"></div>
              </div>
            </div>

            {/* Center Content */}
            <div className="text-center lg:text-left space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-gray-900 leading-tight">
                  The hidden gems in
                  <br />
                  <span className="font-medium">fashion trends</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                  Step into the realm of unparalleled style with our unbeatable collection of today's trendsetter.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-6 text-lg font-medium rounded-full transition-all duration-300"
                  onClick={() => navigate('/products?gender=women')}
                >
                  Shop Women
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-6 text-lg font-medium rounded-full transition-all duration-300"
                  onClick={() => navigate('/products?gender=men')}
                >
                  Shop Men
                </Button>
              </div>

              {/* Luxury Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                {luxuryFeatures.map((feature, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <feature.icon className="h-5 w-5 text-gray-700" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{feature.title}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Men's T-Shirt */}
            <div className="relative flex justify-center lg:justify-start lg:order-last">
              <div className="relative">
                <div className="w-80 h-96 bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <img 
                    src="/Home/Hero2.jpg" 
                    alt="Men's T-Shirt" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -top-6 -right-4 w-20 h-16 bg-amber-200 rounded-full opacity-60"></div>
                <div className="absolute -bottom-4 -left-6 w-14 h-18 bg-gray-300 rounded-full opacity-60"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Collections Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-gray-100 text-gray-800 px-4 py-2 text-sm font-medium rounded-full mb-4">
              Premium Collections
            </Badge>
            <h2 className="text-3xl md:text-5xl font-light text-gray-900 mb-6">Curated for Excellence</h2>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
              Discover our handpicked selection of luxury fashion pieces that define modern elegance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <Card
                key={category.name}
                className="group cursor-pointer border-0 bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden rounded-3xl"
                onClick={() => navigate('/products')}
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{category.desc}</p>
                  <p className="text-gray-500 text-xs">{category.count} pieces</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-3xl md:text-5xl font-light text-gray-900 mb-4">Latest Arrivals</h2>
              <p className="text-gray-600 text-xl">Fresh styles, endless possibilities</p>
            </div>
            <Button 
              variant="ghost" 
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full px-6"
              onClick={() => navigate('/products')}
            >
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse bg-white rounded-3xl border-0">
                  <div className="aspect-square bg-gray-200" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.slice(0, 4).map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-500 overflow-hidden border-0 bg-white rounded-3xl hover:-translate-y-1"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {product.discountPercentage > 0 && (
                      <Badge className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-1 text-xs rounded-full">
                        {Math.round(product.discountPercentage)}% OFF
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-3 line-clamp-2 leading-relaxed">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-semibold text-gray-900">${product.price}</span>
                      {product.discountPercentage > 0 && (
                        <span className="text-sm text-gray-400 line-through">
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

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-light text-gray-900 mb-6">Why Choose Skena.co</h2>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto">
              Experience luxury fashion with uncompromising quality and service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-gray-100 rounded-2xl group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                    <feature.icon className="h-8 w-8" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl md:text-5xl font-light mb-6">
              Stay in Style
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get exclusive access to new collections, styling tips, and special member-only offers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-white/40"
              />
              <Button className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full font-medium">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Skena.co</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Redefining luxury fashion with curated collections that speak to your unique style and sophistication.
              </p>
              <div className="flex space-x-1">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-sm text-gray-600 ml-2">4.9 (12k+ reviews)</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-6">Quick Links</h4>
              <ul className="space-y-4 text-gray-600">
                <li><button onClick={() => navigate('/about')} className="hover:text-gray-900 transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">All Products</button></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Care Instructions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-6">Collections</h4>
              <ul className="space-y-4 text-gray-600">
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">Women's Fashion</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">Men's Collection</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">Accessories</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">New Arrivals</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-6">Customer Care</h4>
              <ul className="space-y-4 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Returns & Exchanges</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-gray-500">
            <p>&copy; 2024 Skena.co. All rights reserved. Crafted with passion for fashion.</p>
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
