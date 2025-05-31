import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Search, Star, Heart, Grid, List, User, Filter, ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Product, fetchProducts, searchProducts } from "@/api/products";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useAuth } from "@/context/AuthContext";
import SignInModal from "@/components/SignInModal";
import Navbar from "@/components/Navbar";

// Skeleton component for product cards
const ProductCardSkeleton = ({ viewMode }: { viewMode: "grid" | "list" }) => (
  <Card className={`group border border-gray-100/80 bg-white/90 backdrop-blur-sm overflow-hidden ${viewMode === "list" ? "flex flex-row" : ""}`}>
    <div className={`relative ${viewMode === "list" ? "w-48 md:w-72 flex-shrink-0" : ""}`}>
      <div className={`bg-gray-200 animate-pulse ${viewMode === "list" ? "h-full" : "aspect-square"}`} />
    </div>
    <CardContent className={`p-4 md:p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
      <div className="flex items-center gap-1 mb-2 md:mb-3">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="w-8 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
      {viewMode === "list" && (
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
        <div className="w-16 h-5 bg-gray-200 rounded animate-pulse" />
        <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-20 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-28 h-9 bg-gray-200 rounded animate-pulse" />
      </div>
    </CardContent>
  </Card>
);

const Products = () => {
  const navigate = useNavigate();
  useScrollToTop();
  const { isAuthenticated, user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [colorsOpen, setColorsOpen] = useState(false);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

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

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      // If search is empty, load all products
      try {
        setLoading(true);
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchProducts(query);
      setProducts(results);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Get unique categories from products
  const categories = ["all", ...new Set(products.map(product => product.category))];

  // Filter products based on selected category
  const filteredProducts = products.filter(product => {
    if (selectedCategory === "all") return true;
    return product.category === selectedCategory;
  });

  // Sort products based on selected sort option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return new Date(b.meta?.createdAt || "").getTime() - new Date(a.meta?.createdAt || "").getTime();
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar Component */}
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <h2 className="font-medium text-gray-900">Filters</h2>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400/80 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10 h-10 text-sm bg-gray-50 border-gray-200/80 focus:border-gray-300/80 focus:ring-0"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Categories Dropdown */}
                <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border-b border-gray-100">
                    Categories
                    {categoriesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-2 py-3">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategory === category}
                          onCheckedChange={() => setSelectedCategory(category)}
                          className="border-gray-300"
                        />
                        <label
                          htmlFor={category}
                          className="text-sm text-gray-600 cursor-pointer flex-1 hover:text-gray-900 transition-colors"
                        >
                          {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                        </label>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                {/* Price Range Dropdown */}
                <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border-b border-gray-100">
                    Price Range
                    {priceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="py-3">
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger className="h-10 text-sm bg-gray-50 border-gray-200">
                        <SelectValue placeholder="Select price range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="under-50">Under $50</SelectItem>
                        <SelectItem value="50-100">$50 - $100</SelectItem>
                        <SelectItem value="100-150">$100 - $150</SelectItem>
                        <SelectItem value="over-150">Over $150</SelectItem>
                      </SelectContent>
                    </Select>
                  </CollapsibleContent>
                </Collapsible>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-6 h-10 text-sm border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    setSelectedCategory("all");
                    setPriceRange("all");
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Controls */}
              <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 md:p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48 h-10 bg-gray-50 border-gray-200">
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

                <div className="flex gap-2 md:ml-auto">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="h-10 w-10 transition-all duration-300"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="h-10 w-10 transition-all duration-300"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Products Grid Skeleton */}
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {[...Array(6)].map((_, index) => (
                  <ProductCardSkeleton key={index} viewMode={viewMode} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="md:hidden fixed bottom-6 right-6 z-40">
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button className="rounded-full h-14 w-14 bg-gray-900/90 hover:bg-gray-800/90 shadow-lg/50">
                <Filter className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] p-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-medium text-gray-900">Filters</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsFilterOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {/* Mobile Filter Content */}
                <div className="space-y-6">
                  {/* Categories */}
                  <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border-b border-gray-100">
                      Categories
                      {categoriesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2 py-3">
                      {categories.map(category => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={category}
                            checked={selectedCategory === category}
                            onCheckedChange={() => setSelectedCategory(category)}
                            className="border-gray-300"
                          />
                          <label
                            htmlFor={category}
                            className="text-sm text-gray-600 cursor-pointer flex-1 hover:text-gray-900 transition-colors"
                          >
                            {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                          </label>
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Price Range */}
                  <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border-b border-gray-100">
                      Price Range
                      {priceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="py-3">
                      <Select value={priceRange} onValueChange={setPriceRange}>
                        <SelectTrigger className="h-10 text-sm bg-gray-50 border-gray-200">
                          <SelectValue placeholder="Select price range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Prices</SelectItem>
                          <SelectItem value="under-50">Under $50</SelectItem>
                          <SelectItem value="50-100">$50 - $100</SelectItem>
                          <SelectItem value="100-150">$100 - $150</SelectItem>
                          <SelectItem value="over-150">Over $150</SelectItem>
                        </SelectContent>
                      </Select>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Colors */}
                  <Collapsible open={colorsOpen} onOpenChange={setColorsOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border-b border-gray-100">
                      Colors
                      {colorsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="py-3">
                      <div className="grid grid-cols-4 gap-3">
                        {["Black", "White", "Gray", "Blue", "Red", "Green", "Navy", "Brown"].map(color => (
                          <div
                            key={color}
                            className="w-8 h-8 rounded-full border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition-all duration-300 hover:scale-110"
                            style={{ backgroundColor: color.toLowerCase() === 'white' ? '#ffffff' : color.toLowerCase() }}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Size */}
                  <Collapsible open={sizeOpen} onOpenChange={setSizeOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border-b border-gray-100">
                      Size
                      {sizeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="py-3">
                      <div className="grid grid-cols-3 gap-2">
                        {["XS", "S", "M", "L", "XL", "XXL"].map(size => (
                          <Button
                            key={size}
                            variant="outline"
                            size="sm"
                            className="h-9 text-sm hover:bg-gray-900 hover:text-white transition-all duration-300"
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <SignInModal
          isOpen={isSignInModalOpen}
          onClose={() => setIsSignInModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Component */}
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="h-4 w-4 text-gray-600" />
                <h2 className="font-medium text-gray-900">Filters</h2>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400/80 h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10 h-10 text-sm bg-gray-50 border-gray-200/80 focus:border-gray-300/80 focus:ring-0"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Categories Dropdown */}
              <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border-b border-gray-100">
                  Categories
                  {categoriesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 py-3">
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategory === category}
                        onCheckedChange={() => setSelectedCategory(category)}
                        className="border-gray-300"
                      />
                      <label
                        htmlFor={category}
                        className="text-sm text-gray-600 cursor-pointer flex-1 hover:text-gray-900 transition-colors"
                      >
                        {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                      </label>
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Price Range Dropdown */}
              <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border-b border-gray-100">
                  Price Range
                  {priceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="py-3">
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="h-10 text-sm bg-gray-50 border-gray-200">
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Prices</SelectItem>
                      <SelectItem value="under-50">Under $50</SelectItem>
                      <SelectItem value="50-100">$50 - $100</SelectItem>
                      <SelectItem value="100-150">$100 - $150</SelectItem>
                      <SelectItem value="over-150">Over $150</SelectItem>
                    </SelectContent>
                  </Select>
                </CollapsibleContent>
              </Collapsible>

              {/* Clear Filters */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-6 h-10 text-sm border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setSelectedCategory("all");
                  setPriceRange("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 md:p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48 h-10 bg-gray-50 border-gray-200">
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

              <div className="flex gap-2 md:ml-auto">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-10 w-10 transition-all duration-300"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-10 w-10 transition-all duration-300"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
              {sortedProducts.map((product, index) => (
                <Card
                  key={product.id}
                  className={`group cursor-pointer hover:shadow-lg/50 transition-all duration-300 hover:-translate-y-1 border border-gray-100/80 bg-white/90 backdrop-blur-sm overflow-hidden ${viewMode === "list" ? "flex flex-row" : ""}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className={`relative ${viewMode === "list" ? "w-48 md:w-72 flex-shrink-0" : ""}`}>
                    <div className={`bg-gray-50/80 relative overflow-hidden ${viewMode === "list" ? "h-full" : "aspect-square"}`}>
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                    </div>

                    {product.discountPercentage > 0 && (
                      <Badge className="absolute top-4 left-4 bg-gray-900 hover:bg-gray-800 text-white text-xs px-3 py-1">
                        {Math.round(product.discountPercentage)}% OFF
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-4 right-4 bg-white/90 hover:bg-white/95 transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>

                  <CardContent className={`p-4 md:p-6 ${viewMode === "list" ? "flex-1" : ""}`}>
                    <div className="flex items-center gap-1 mb-2 md:mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-200"
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">({product.reviews.length})</span>
                    </div>

                    <h3 className="font-medium text-base md:text-lg text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                      {product.title}
                    </h3>

                    {viewMode === "list" && (
                      <p className="text-gray-600 mb-4 text-sm">{product.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                      <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                        {product.brand}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                        {product.category}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg md:text-xl font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                        {product.discountPercentage > 0 && (
                          <span className="text-sm text-gray-400 line-through">
                            ${(product.price * (1 + product.discountPercentage / 100)).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 hover:text-gray-900 transition-all duration-300 text-sm px-3 md:px-4"
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
                className="hover:bg-gray-900/90 hover:text-white transition-all duration-300 hover:scale-105 border-gray-200/80 text-sm px-6 md:px-8 py-5 md:py-6"
              >
                Load More Products
              </Button>
            </div>
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

export default Products;
