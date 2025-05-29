
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Star, ShoppingCart, Minus, Plus, ArrowLeft, Truck, Shield, RotateCcw } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Mock product data - in real app, fetch based on id
  const product = {
    id: 1,
    name: "Premium Streetwear Hoodie",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.8,
    reviews: 124,
    isNew: true,
    category: "Hoodies",
    description: "Elevate your street style with our premium hoodie. Crafted from ultra-soft cotton blend fabric, this hoodie offers the perfect combination of comfort and style. Features include a spacious kangaroo pocket, adjustable drawstring hood, and ribbed cuffs for a snug fit.",
    features: [
      "100% Premium Cotton Blend",
      "Pre-shrunk for perfect fit",
      "Kangaroo pocket with hidden zip",
      "Adjustable drawstring hood",
      "Ribbed cuffs and hem",
      "Machine washable"
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Gray", "Navy"],
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
  };

  const relatedProducts = [
    {
      id: 2,
      name: "Urban Style Cargo Pants",
      price: 79.99,
      image: "/placeholder.svg",
      rating: 4.6
    },
    {
      id: 3,
      name: "Classic Denim Jacket",
      price: 119.99,
      image: "/placeholder.svg",
      rating: 4.9
    },
    {
      id: 4,
      name: "Oversized T-Shirt",
      price: 39.99,
      image: "/placeholder.svg",
      rating: 4.7
    }
  ];

  const updateQuantity = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 
              className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate('/')}
            >
              Skena.co
            </h1>
            <Button className="bg-gray-900 hover:bg-gray-800">Sign In</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="p-0 h-auto text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <span>/</span>
          <span>Products</span>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative group">
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
              {product.isNew && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  New
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white transition-all duration-300"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((_, index) => (
                <div
                  key={index}
                  className={`aspect-square bg-gray-100 rounded-lg cursor-pointer transition-all duration-300 ${
                    selectedImage === index ? "ring-2 ring-gray-900" : "hover:opacity-80"
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
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
                <span className="text-sm text-gray-600">({product.reviews} reviews)</span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.price}
                </span>
                <span className="text-xl text-gray-500 line-through">
                  ${product.originalPrice}
                </span>
                <Badge variant="destructive" className="bg-red-100 text-red-700">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </Badge>
              </div>
            </div>

            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Size</h3>
              <div className="flex gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    className={`w-12 h-12 ${
                      selectedSize === size 
                        ? "bg-gray-900 text-white" 
                        : "hover:bg-gray-100"
                    } transition-all duration-300`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(-1)}
                  disabled={quantity <= 1}
                  className="hover:bg-gray-100 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateQuantity(1)}
                  className="hover:bg-gray-100 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full bg-gray-900 hover:bg-gray-800 transition-all duration-300 hover:scale-105 text-lg py-6"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart - ${(product.price * quantity).toFixed(2)}
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full hover:bg-gray-900 hover:text-white transition-all duration-300 text-lg py-6"
              >
                Buy Now
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium text-gray-900">Free Shipping</p>
                <p className="text-xs text-gray-600">Orders over $50</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                <p className="text-xs text-gray-600">SSL Protected</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                <p className="text-xs text-gray-600">30-day policy</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="details" className="mb-16">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Product Details</TabsTrigger>
            <TabsTrigger value="shipping">Shipping & Returns</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="shipping" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Shipping Information</h3>
                    <p className="text-gray-700">Free standard shipping on orders over $50. Express shipping available.</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Returns Policy</h3>
                    <p className="text-gray-700">Easy 30-day returns. Items must be unworn with original tags.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews" className="mt-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-600">
                  <p>Customer reviews coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((product) => (
              <Card 
                key={product.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetail;
