import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Heart, Share2, Star, ChevronLeft, Minus, Plus, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";
import { Product, fetchProductById } from "@/api/products";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

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
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => navigate('/products')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group">
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.discountPercentage > 0 && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  {discountPercentage}% OFF
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`aspect-square bg-gray-100 rounded-lg cursor-pointer ${selectedImage === index ? 'ring-2 ring-gray-900' : ''
                    }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image}
                    alt={`${product.title} - Image ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
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
                <span className="text-sm text-gray-600">({product.reviews.length} reviews)</span>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.title}</h1>

              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                    <Badge variant="destructive" className="bg-red-100 text-red-700">
                      Save ${discountAmount.toFixed(2)}
                    </Badge>
                  </>
                )}
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {product.stock > 0 ? `${product.stock} units in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-semibold text-gray-900">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                className="flex-1"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart - ${(product.price * quantity).toFixed(2)}
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Product Details Tabs */}
            <Tabs defaultValue="details" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Product Details</TabsTrigger>
                <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({product.reviews.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Description</h3>
                    <p className="text-gray-700">{product.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Specifications</h3>
                    <div className="grid grid-cols-2 gap-4">
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
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="shipping" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Truck className="h-6 w-6 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Shipping Information</h3>
                      <p className="text-gray-700">
                        Free shipping on orders over $50. Standard delivery takes 3-5 business days.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Shield className="h-6 w-6 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Warranty</h3>
                      <p className="text-gray-700">
                        1-year manufacturer warranty on all products.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <RotateCcw className="h-6 w-6 text-gray-400 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Return Policy</h3>
                      <p className="text-gray-700">
                        30-day return policy. Items must be unused and in original packaging.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <div className="space-y-6">
                  {product.reviews.map((review, index) => (
                    <div key={index} className="border-b pb-6 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                              }`}
                          />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
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
    </div>
  );
};

export default ProductDetail;
