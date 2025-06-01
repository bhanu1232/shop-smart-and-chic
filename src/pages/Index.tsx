
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Search, Menu, Star, ArrowRight, User, Play } from "lucide-react";
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
    { name: "Personal Care", icon: "🧴", count: 42, color: "bg-blue-50 border-blue-200" },
    { name: "Accessories", icon: "⌚", count: 38, color: "bg-green-50 border-green-200" },
    { name: "Coats", icon: "🧥", count: 29, color: "bg-purple-50 border-purple-200" },
    { name: "Street Pants", icon: "👖", count: 15, color: "bg-pink-50 border-pink-200" },
    { name: "Perfume", icon: "🌸", count: 24, color: "bg-yellow-50 border-yellow-200" },
    { name: "T-Shirt", icon: "👕", count: 56, color: "bg-indigo-50 border-indigo-200" },
    { name: "Sweaters", icon: "🧺", count: 33, color: "bg-teal-50 border-teal-200" },
    { name: "Bags", icon: "👜", count: 27, color: "bg-orange-50 border-orange-200" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Modern Hero Section */}
      <section className="relative bg-gray-100 min-h-[85vh] flex items-center overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <Badge className="bg-black text-white px-4 py-2 text-sm font-medium rounded-full">
                  LIMITED TO STOCK
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-light text-gray-900 leading-tight">
                  Simple
                  <br />
                  <span className="font-normal">is More.</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-md leading-relaxed">
                  DESIGNED TO
                  <br />
                  STAND OUT
                </p>
              </div>
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="bg-black hover:bg-gray-800 text-white px-8 py-6 rounded-none font-medium"
                  onClick={() => navigate('/products')}
                >
                  Shop Collection
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-black text-black hover:bg-black hover:text-white px-8 py-6 rounded-none font-medium"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Watch Film
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden">
                <img 
                  src="/Home/Hero.jpg" 
                  alt="Featured Model" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-light text-gray-900">Shop by Category</h2>
            <Button variant="ghost" className="text-teal-600 hover:text-teal-700">
              See all
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Card
                key={category.name}
                className={`group cursor-pointer border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${category.color}`}
                onClick={() => navigate('/products')}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600">{category.count} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-light text-gray-900">New Arrivals</h2>
            <Button variant="ghost" className="text-teal-600 hover:text-teal-700">
              See All
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
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
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discountPercentage > 0 && (
                      <Badge className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 text-xs">
                        {Math.round(product.discountPercentage)}% OFF
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-xs text-gray-600 uppercase tracking-wide">{product.category}</span>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">${product.price}</span>
                      {product.discountPercentage > 0 && (
                        <span className="text-sm text-gray-500 line-through">
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

      {/* Modern CTA Sections */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left CTA */}
            <Card className="bg-gradient-to-br from-teal-400 to-teal-600 text-white border-0 overflow-hidden">
              <CardContent className="p-12 relative">
                <div className="space-y-6">
                  <div className="text-sm font-medium tracking-wide opacity-90">STELLA</div>
                  <h3 className="text-3xl font-light leading-tight">
                    Your Style,
                    <br />
                    Delivered.
                    <br />
                    <span className="font-normal">Exclusively Online.</span>
                  </h3>
                  <Button className="bg-white text-teal-600 hover:bg-gray-100 px-6 py-3 rounded-none font-medium">
                    Shop Now
                  </Button>
                </div>
                <div className="absolute bottom-4 right-4 text-xs opacity-75">
                  www.stella.com
                </div>
              </CardContent>
            </Card>

            {/* Right CTAs */}
            <div className="space-y-8">
              <Card className="bg-gray-100 border-0 overflow-hidden">
                <CardContent className="p-8 flex items-center gap-6">
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 mb-2">EXCLUSIVE DEALS</div>
                    <h4 className="text-xl font-medium text-gray-900 mb-3">
                      Discover our
                      <br />
                      accessories collection
                    </h4>
                    <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-none">
                      Shop Now
                    </Button>
                  </div>
                  <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                </CardContent>
              </Card>

              <Card className="bg-gray-100 border-0 overflow-hidden">
                <CardContent className="p-8 flex items-center gap-6">
                  <div className="flex-1">
                    <div className="text-xs text-gray-600 mb-2">FIND YOUR PERFECT</div>
                    <h4 className="text-xl font-medium text-gray-900 mb-3">
                      Explore our shoes
                      <br />
                      collection
                    </h4>
                    <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-none">
                      Shop Now
                    </Button>
                  </div>
                  <div className="w-24 h-24 bg-gray-200 rounded-lg"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Deals Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="text-3xl font-light text-gray-900 mb-12">Featured Deals</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 overflow-hidden">
              <CardContent className="p-12">
                <div className="space-y-6">
                  <div className="text-sm font-medium tracking-wide opacity-90">STELLA</div>
                  <h3 className="text-3xl font-light">
                    Indulge in
                    <br />
                    <span className="font-normal">exclusive deals</span>
                  </h3>
                  <p className="text-lg opacity-90">Shop now and enjoy special discounts</p>
                  <Button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-none font-medium">
                    Shop Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-teal-500 to-green-500 text-white border-0 overflow-hidden">
              <CardContent className="p-12">
                <div className="space-y-6">
                  <h3 className="text-2xl font-light">
                    Welcome offer just
                    <br />
                    <span className="font-normal">for you</span>
                  </h3>
                  <p className="text-lg opacity-90">Get 20% off on your first order</p>
                  <Button className="bg-white text-teal-600 hover:bg-gray-100 px-6 py-3 rounded-none font-medium">
                    GET DISCOUNT
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <div className="max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl font-light text-gray-900">Stay Updated</h2>
            <p className="text-lg text-gray-600">
              Subscribe to our newsletter and be the first to know about new collections and exclusive offers.
            </p>
            <div className="flex gap-4 max-w-md mx-auto">
              <Input
                placeholder="Enter your email"
                className="rounded-none border-gray-300 focus:border-teal-500"
              />
              <Button className="bg-teal-500 hover:bg-teal-600 text-white px-8 rounded-none">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-light mb-6">Skena.co</h3>
              <p className="text-gray-400 leading-relaxed">
                Premium streetwear for the modern individual. Quality meets style in every piece.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-6">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Products</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-6">Categories</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Accessories</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">T-Shirts</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Sweaters</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-white transition-colors">Bags</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
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
