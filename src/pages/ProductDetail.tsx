import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart, Share2, Star, ChevronLeft, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react";
import { Product, fetchProductById } from "@/api/products";
import { useAuth } from "@/context/AuthContext";
import { addWishlistItem, removeWishlistItem, isItemInWishlist, addToCart, isItemInCart } from "@/firebase/firestore";
import { toast } from "sonner";
import SignInModal from "@/components/SignInModal";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("Product ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await fetchProductById(parseInt(id));
        setProduct(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load product");
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  // Add useEffect to check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!isAuthenticated || !user || !id) return;

      try {
        const status = await isItemInWishlist(user.uid, id);
        setIsInWishlist(status);
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      }
    };

    checkWishlistStatus();
  }, [isAuthenticated, user, id]);

  // Add useEffect to check cart status
  useEffect(() => {
    const checkCartStatus = async () => {
      if (!isAuthenticated || !user || !id) return;

      try {
        const status = await isItemInCart(user.uid, id);
        setIsInCart(status);
      } catch (error) {
        console.error("Error checking cart status:", error);
      }
    };

    checkCartStatus();
  }, [isAuthenticated, user, id]);

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      setIsSignInModalOpen(true);
      return;
    }

    if (!user || !product) return;

    try {
      setIsWishlistLoading(true);
      if (isInWishlist) {
        await removeWishlistItem(user.uid, product.id.toString());
        toast.success("Removed from wishlist");
      } else {
        await addWishlistItem(user.uid, {
          id: product.id.toString(),
          title: product.title,
          thumbnail: product.thumbnail,
          price: product.price,
          category: product.category // Add the missing category property
        });
        toast.success("Added to wishlist");
      }

      setIsInWishlist(!isInWishlist);
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleShare = async () => {
    if (!product) return;

    setIsSharing(true);
    try {
      const shareUrl = `${window.location.origin}/product/${product.id}`;
      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: shareUrl,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Product link copied to clipboard!");
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("Failed to share product");
    } finally {
      setIsSharing(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setIsSignInModalOpen(true);
      return;
    }

    if (!user || !product) return;

    setIsCartLoading(true);
    try {
      await addToCart(user.uid, {
        id: product.id.toString(),
        title: product.title,
        thumbnail: product.thumbnail,
        price: product.price,
        quantity: quantity
      });
      setIsInCart(true);
      toast.success("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleCartClick = () => {
    if (isInCart) {
      navigate('/cart');
    } else {
      handleAddToCart();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {error || "Product not found"}
        </h1>
        <Button onClick={() => navigate('/products')}>Back to Products</Button>
      </div>
    );
  }

  const originalPrice = product.price / (1 - product.discountPercentage / 100);
  const discountAmount = originalPrice - product.price;
  const discountPercentage = Math.round(product.discountPercentage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/products')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Product Images - Compact */}
          <div className="lg:col-span-5 space-y-3">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.discountPercentage > 0 && (
                <Badge className="absolute top-3 left-3 bg-red-500 text-white text-xs">
                  {discountPercentage}% OFF
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`aspect-square bg-gray-100 rounded cursor-pointer ${selectedImage === index ? 'ring-2 ring-gray-900' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image}
                    alt={`${product.title} - ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info - Compact */}
          <div className="lg:col-span-7 space-y-4">
            {/* Header Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">({product.reviews.length})</span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">{product.title}</h1>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-lg text-gray-500 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                    <Badge variant="destructive" className="bg-red-100 text-red-700 text-xs">
                      Save ${discountAmount.toFixed(2)}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed">{product.description}</p>

            {/* Stock & Actions Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
                <span className="font-medium text-gray-900 text-sm">Qty:</span>
                <div className="flex items-center border rounded">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className={`flex-1 text-sm ${isInCart ? "bg-gray-900 hover:bg-gray-800" : ""}`}
                  disabled={product.stock === 0 || isCartLoading}
                  onClick={handleCartClick}
                >
                  {isCartLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ) : (
                    <ShoppingCart className="mr-2 h-4 w-4" />
                  )}
                  {isInCart ? "Go to Cart" : `Add - $${(product.price * quantity).toFixed(2)}`}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={`h-9 w-9 ${isInWishlist ? "text-red-500" : ""}`}
                  onClick={handleWishlistToggle}
                  disabled={isWishlistLoading}
                >
                  {isWishlistLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                  ) : (
                    <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current" : ""}`} />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={handleShare}
                  disabled={isSharing}
                >
                  {isSharing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                  ) : (
                    <Share2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Compact Info Cards */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <Card className="p-3">
                <div className="flex flex-col items-center text-center">
                  <Truck className="h-5 w-5 text-gray-400 mb-1" />
                  <span className="text-xs font-medium">Free Shipping</span>
                  <span className="text-xs text-gray-500">Orders $50+</span>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex flex-col items-center text-center">
                  <Shield className="h-5 w-5 text-gray-400 mb-1" />
                  <span className="text-xs font-medium">1 Year Warranty</span>
                  <span className="text-xs text-gray-500">Full coverage</span>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex flex-col items-center text-center">
                  <RotateCcw className="h-5 w-5 text-gray-400 mb-1" />
                  <span className="text-xs font-medium">30-Day Returns</span>
                  <span className="text-xs text-gray-500">Easy process</span>
                </div>
              </Card>
            </div>

            {/* Compact Tabs */}
            <Tabs defaultValue="details" className="mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details" className="text-sm">Details</TabsTrigger>
                <TabsTrigger value="reviews" className="text-sm">Reviews ({product.reviews.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Brand</span>
                    <p className="font-medium">{product.brand}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Category</span>
                    <p className="font-medium">{product.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Stock</span>
                    <p className="font-medium">{product.stock} units</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Rating</span>
                    <p className="font-medium">{product.rating}/5</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-4">
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {product.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-3 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 text-sm mb-1">{review.comment}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{review.reviewerName}</span>
                        <span>{review.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </div>
  );
};

export default ProductDetail;
