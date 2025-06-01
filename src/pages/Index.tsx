
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Star, TruckIcon, Shield, RotateCcw, Award } from "lucide-react";
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

  const features = [
    { icon: TruckIcon, title: "Free Worldwide Shipping", desc: "On orders over $150" },
    { icon: Shield, title: "Secure Payments", desc: "256-bit SSL encryption" },
    { icon: RotateCcw, title: "Easy Returns", desc: "60-day return policy" },
    { icon: Award, title: "Premium Quality", desc: "Curated collections" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section - Based on reference image */}
      <section className="relative bg-gray-100 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8 items-center min-h-[70vh] py-12">
            {/* Left Product Image */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-64 h-80 bg-white rounded-2xl shadow-lg overflow-hidden">
                  <img 
                    src="/Home/Hero.jpg" 
                    alt="Women's Cardigan" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Center Content */}
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-light text-gray-900 leading-tight">
                  The hidden gems in fashion trends
                </h1>
                <p className="text-lg text-gray-600 max-w-md mx-auto">
                  Step into the realm of unparalleled style with our unbeatable t-shirt trendsetter of today.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline"
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-2 rounded-md font-medium transition-all duration-300"
                  onClick={() => navigate('/products?gender=women')}
                >
                  Shop Women
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 py-2 rounded-md font-medium transition-all duration-300"
                  onClick={() => navigate('/products?gender=men')}
                >
                  Shop Men
                </Button>
              </div>
            </div>

            {/* Right Product Image */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <div className="w-64 h-80 bg-white rounded-2xl shadow-lg overflow-hidden">
                  <img 
                    src="/Home/Hero2.jpg" 
                    alt="Men's T-Shirt" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-2">Recent products</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse bg-white border border-gray-200">
                  <div className="aspect-square bg-gray-200" />
                  <CardContent className="p-4">
                    <div className="h-3 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.slice(0, 8).map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 bg-white"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-gray-600 text-white text-xs px-2 py-1">
                        {product.category === 'mens-shirts' ? 'Men' : 'Women'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 text-sm leading-tight">
                      {product.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        ${product.price.toFixed(2)} USD
                      </span>
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">Why Choose Skena.co</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Experience luxury fashion with uncompromising quality and service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-white rounded-xl group-hover:bg-gray-900 group-hover:text-white transition-all duration-300 shadow-sm">
                    <feature.icon className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-3xl font-light mb-4">
              Stay in Style
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Get exclusive access to new collections, styling tips, and special member-only offers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-white/40"
              />
              <Button className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-md font-medium">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Skena.co</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
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
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><button onClick={() => navigate('/about')} className="hover:text-gray-900 transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">All Products</button></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Care Instructions</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Collections</h4>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">Women's Fashion</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">Men's Collection</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">Accessories</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">New Arrivals</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Customer Care</h4>
              <ul className="space-y-3 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Returns & Exchanges</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
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
