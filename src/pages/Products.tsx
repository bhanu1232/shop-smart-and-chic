
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShoppingCart, Search, Filter, Star, Heart, Grid, List } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const products = [
    {
      id: 1,
      name: "Premium Streetwear Hoodie",
      price: 89.99,
      originalPrice: 129.99,
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 124,
      isNew: true,
      category: "hoodies",
      description: "Ultra-soft cotton blend hoodie with modern fit"
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
      category: "pants",
      description: "Durable cargo pants with multiple pockets"
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
      category: "jackets",
      description: "Timeless denim jacket with vintage wash"
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
      category: "tshirts",
      description: "Comfortable oversized fit cotton t-shirt"
    },
    {
      id: 5,
      name: "Athletic Sweatpants",
      price: 69.99,
      originalPrice: 89.99,
      image: "/placeholder.svg",
      rating: 4.5,
      reviews: 78,
      isNew: false,
      category: "pants",
      description: "Performance sweatpants for active lifestyle"
    },
    {
      id: 6,
      name: "Bomber Jacket",
      price: 149.99,
      originalPrice: 199.99,
      image: "/placeholder.svg",
      rating: 4.8,
      reviews: 92,
      isNew: true,
      category: "jackets",
      description: "Modern bomber jacket with premium materials"
    }
  ];

  const categories = [
    { value: "all", label: "All Categories" },
    { value: "hoodies", label: "Hoodies" },
    { value: "tshirts", label: "T-Shirts" },
    { value: "pants", label: "Pants" },
    { value: "jackets", label: "Jackets" }
  ];

  const filteredProducts = products.filter(product => 
    selectedCategory === "all" || product.category === selectedCategory
  );

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
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Home</a>
              <a href="/products" className="text-gray-900 font-bold">Products</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Categories</a>
              <a href="#" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">About</a>
            </nav>
            <Button className="bg-gray-900 hover:bg-gray-800">Sign In</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Products</h1>
          <p className="text-xl text-gray-600">Discover our complete collection of premium streetwear</p>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 p-6 bg-white rounded-xl shadow-sm border">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="transition-all duration-300"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="transition-all duration-300"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className={`grid gap-6 ${
          viewMode === "grid" 
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
            : "grid-cols-1"
        }`}>
          {filteredProducts.map((product, index) => (
            <Card 
              key={product.id}
              className={`group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-white overflow-hidden ${
                viewMode === "list" ? "flex flex-row" : ""
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className={`relative ${viewMode === "list" ? "w-64 flex-shrink-0" : ""}`}>
                <div className={`bg-gray-100 relative overflow-hidden ${
                  viewMode === "list" ? "h-full" : "aspect-square"
                }`}>
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

              <CardContent className={`p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
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
                
                {viewMode === "list" && (
                  <p className="text-gray-600 mb-4">{product.description}</p>
                )}
                
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
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            className="hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            Load More Products
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Products;
