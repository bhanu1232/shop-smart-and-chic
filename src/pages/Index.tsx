import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Search, Menu, Star, Heart, ArrowRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Product, fetchProducts } from "@/api/products";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useAuth } from "@/context/AuthContext";
import SignInModal from "@/components/SignInModal";
import Navbar from "@/components/Navbar";
import { addWishlistItem, removeWishlistItem, isItemInWishlist, getWishlistItems } from "@/firebase/firestore";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  useScrollToTop();
  const { isAuthenticated, user } = useAuth();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({});
  const [loadingWishlist, setLoadingWishlist] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);

        // Check wishlist status immediately after loading products
        if (isAuthenticated && user) {
          try {
            const wishlistItems = await getWishlistItems(user.uid);
            const status: Record<string, boolean> = {};
            data.forEach(product => {
              status[product.id] = wishlistItems.some(item => item.id === product.id.toString());
            });
            setWishlistStatus(status);
          } catch (error) {
            console.error("Error loading wishlist:", error);
            toast.error("Failed to load wishlist status");
          }
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [isAuthenticated, user]);

  const handleWishlistToggle = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setIsSignInModalOpen(true);
      return;
    }

    if (!user) return;

    try {
      setLoadingWishlist(prev => ({ ...prev, [product.id]: true }));
      const isInWishlist = wishlistStatus[product.id];

      if (isInWishlist) {
        await removeWishlistItem(user.uid, product.id.toString());
        toast.success("Removed from wishlist");
      } else {
        await addWishlistItem(user.uid, {
          id: product.id.toString(),
          title: product.title,
          thumbnail: product.thumbnail,
          price: product.price,
          category: product.category
        });
        toast.success("Added to wishlist");
      }

      setWishlistStatus(prev => ({
        ...prev,
        [product.id]: !isInWishlist
      }));
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setLoadingWishlist(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const categories = [
    { name: "Hoodies", image: "/Home/hoodie.png", count: 42 },
    { name: "T-Shirts", image: "/Home/tshirt.png", count: 38 },
    { name: "Pants", image: "/Home/pant.png", count: 29 },
    { name: "Jackets", image: "/Home/jacket.png", count: 15 }
  ];

  const addToCart = (productId: number) => {
    setCartItems(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/Home/Hero.jpg')] bg-cover bg-center opacity-20"></div>
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
                className="border-white bg-transparent text-white hover:bg-white hover:text-gray-900 hover:scale-105 transition-all duration-300 text-lg px-8 py-6"
                onClick={() => navigate('/products')}
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
                onClick={() => navigate('/products')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full mx-auto mb-4 group-hover:bg-gray-200 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-gray-300 rounded-lg">
                      <img src={category.image} alt="" />
                    </div>
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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <Card
                  key={index}
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 bg-white overflow-hidden animate-pulse"
                >
                  <div className="relative">
                    <div className="aspect-square bg-gray-200 relative overflow-hidden" />
                  </div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="h-8 bg-gray-200 rounded w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.slice(0, 4).map((product, index) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 bg-white overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="relative">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                    </div>

                    {product.discountPercentage > 0 && (
                      <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-white">
                        {Math.round(product.discountPercentage)}% OFF
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-3 right-3 bg-white/80 hover:bg-white transition-all duration-300 opacity-0 group-hover:opacity-100 ${wishlistStatus[product.id] ? 'text-red-500' : ''}`}
                      onClick={(e) => handleWishlistToggle(e, product)}
                      disabled={loadingWishlist[product.id]}
                    >
                      {loadingWishlist[product.id] ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                      ) : (
                        <Heart className={`h-4 w-4 ${wishlistStatus[product.id] ? 'fill-current' : ''}`} />
                      )}
                    </Button>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">({product.reviews.length})</span>
                    </div>

                    <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {product.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3">{product.category}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.discountPercentage > 0 && (
                          <span className="text-sm text-gray-500 line-through">
                            ${(product.price * (1 + product.discountPercentage / 100)).toFixed(2)}
                          </span>
                        )}
                      </div>

                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
              <h3
                className="text-xl font-bold text-gray-900 mb-4 cursor-pointer"
                onClick={() => navigate('/')}
              >
                Skena.co
              </h3>
              <p className="text-gray-600 mb-4">
                Premium streetwear for the modern individual. Quality meets style.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-600">
                <li><button onClick={() => navigate('/about')} className="hover:text-gray-900 transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">Products</button></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Size Guide</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-600">
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">Hoodies</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">T-Shirts</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">Pants</button></li>
                <li><button onClick={() => navigate('/products')} className="hover:text-gray-900 transition-colors">Accessories</button></li>
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

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </div>
  );
};

export default Index;
