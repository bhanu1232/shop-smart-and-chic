
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Search, Menu, Star, Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(0);

  const featuredProducts = [
    {
      id: 1,
      name: "Premium Streetwear Hoodie",
      price: 89.99,
      originalPrice: 129.99,
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 124,
      isNew: true,
      category: "Hoodies"
    },
    {
      id: 2,
      name: "Urban Style Cargo Pants",
      price: 79.99,
      originalPrice: 99.99,
      image: "/placeholder.svg",
      rating: 4.6,
      reviews: 89,
      isNew: false,
      category: "Pants"
    },
    {
      id: 3,
      name: "Classic Denim Jacket",
      price: 119.99,
      originalPrice: 159.99,
      image: "/placeholder.svg",
      rating: 4.9,
      reviews: 156,
      isNew: true,
      category: "Jackets"
    },
    {
      id: 4,
      name: "Oversized T-Shirt",
      price: 39.99,
      originalPrice: 59.99,
      image: "/placeholder.svg",
      rating: 4.7,
      reviews: 203,
      isNew: false,
      category: "T-Shirts"
    }
  ];

  const categories = [
    { name: "Hoodies", image: "/placeholder.svg", count: 42 },
    { name: "T-Shirts", image: "/placeholder.svg", count: 38 },
    { name: "Pants", image: "/placeholder.svg", count: 29 },
    { name: "Jackets", image: "/placeholder.svg", count: 15 }
  ];

  const addToCart = (productId: number) => {
    setCartItems(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Skena.co
              </h1>
              <nav className="hidden md:flex space-x-6">
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Home</a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Products</a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Categories</a>
                <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">About</a>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 w-64 bg-gray-50 border-gray-200 focus:border-gray-400"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 transition-colors"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-600">
                    {cartItems}
                  </Badge>
                )}
              </Button>
              <Button className="hidden md:inline-flex bg-gray-900 hover:bg-gray-800 transition-colors">
                Sign In
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20"></div>
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-2xl animate-fade-in">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors">
              New Collection 2024
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Elevate Your
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Street Style
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Discover the latest trends in urban fashion. Premium quality meets cutting-edge design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-all duration-300 text-lg px-8 py-6"
                onClick={() => navigate('/products')}
              >
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-gray-900 hover:scale-105 transition-all duration-300 text-lg px-8 py-6"
              >
                View Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our curated collections designed for the modern lifestyle
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card 
                key={category.name} 
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 group-hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                  </div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600">{category.count} items</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-xl text-gray-600">Handpicked favorites from our latest collection</p>
            </div>
            <Button 
              variant="outline" 
              className="hidden md:inline-flex hover:bg-gray-900 hover:text-white transition-all duration-300"
              onClick={() => navigate('/products')}
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <Card 
                key={product.id} 
                className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 bg-white overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative">
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                  </div>
                  
                  {product.isNew && (
                    <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white">
                      New
                    </Badge>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-3 right-3 bg-white/80 hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">({product.reviews})</span>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3">{product.category}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-gray-900">
                        ${product.price}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gray-900 hover:bg-gray-800 transition-all duration-300 hover:scale-105"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product.id);
                      }}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Be the first to know about new arrivals, exclusive deals, and style tips
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              placeholder="Enter your email"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-white/40"
            />
            <Button className="bg-white text-gray-900 hover:bg-gray-100 hover:scale-105 transition-all duration-300">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Skena.co</h3>
              <p className="text-gray-600 mb-4">
                Premium streetwear for the modern individual. Quality meets style.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Hoodies</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">T-Shirts</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Pants</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Accessories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Shipping</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-12 pt-8 text-center text-gray-600">
            <p>&copy; 2024 Skena.co. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
