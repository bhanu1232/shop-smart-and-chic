
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Search, Star, Heart, Grid, List, User, Filter, ChevronDown, ChevronUp, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Product as ApiProduct, fetchProducts, searchProducts } from "@/api/products";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useAuth } from "@/context/AuthContext";
import SignInModal from "@/components/SignInModal";
import Navbar from "@/components/Navbar";
import { addWishlistItem, removeWishlistItem, isItemInWishlist, getWishlistItems } from "@/firebase/firestore";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { debounce } from "lodash";
import { motion } from "framer-motion";

// Extend the API Product type to include meta information
interface Product extends Omit<ApiProduct, 'meta'> {
  meta: {
    createdAt: string;
    updatedAt: string;
  };
}

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

const ITEMS_PER_PAGE = 12;

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
  const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({});
  const [loadingWishlist, setLoadingWishlist] = useState<Record<string, boolean>>({});
  
  // Infinite scroll states
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [skip, setSkip] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // Memoize filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice = priceRange === "all" ||
        (priceRange === "under-50" && product.price < 50) ||
        (priceRange === "50-100" && product.price >= 50 && product.price <= 100) ||
        (priceRange === "100-200" && product.price > 100 && product.price <= 200) ||
        (priceRange === "over-200" && product.price > 200);
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [products, searchQuery, selectedCategory, priceRange]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
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
  }, [filteredProducts, sortBy]);

  // Load more products function
  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const newProducts = await fetchProducts(ITEMS_PER_PAGE, skip);

      if (newProducts.length === 0) {
        setHasMore(false);
        return;
      }

      const extendedProducts: Product[] = newProducts.map(product => ({
        ...product,
        meta: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));

      setProducts(prev => [...prev, ...extendedProducts]);
      setSkip(prev => prev + ITEMS_PER_PAGE);
      setHasMore(newProducts.length === ITEMS_PER_PAGE);

      // Update wishlist status for new products
      if (isAuthenticated && user) {
        try {
          const wishlistItems = await getWishlistItems(user.uid);
          const status: Record<string, boolean> = {};
          extendedProducts.forEach(product => {
            status[product.id.toString()] = wishlistItems.some(item => item.id === product.id.toString());
          });
          setWishlistStatus(prev => ({ ...prev, ...status }));
        } catch (error) {
          console.error("Error loading wishlist:", error);
        }
      }
    } catch (error) {
      console.error('Error loading more products:', error);
      toast.error('Failed to load more products');
    } finally {
      setIsLoadingMore(false);
    }
  }, [skip, isLoadingMore, hasMore, isAuthenticated, user]);

  // Setup Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore && hasMore) {
          loadMoreProducts();
        }
      },
      {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMoreProducts, isLoadingMore, hasMore]);

  // Initial products load
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProducts(ITEMS_PER_PAGE, 0);

      const extendedProducts: Product[] = data.map(product => ({
        ...product,
        meta: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));

      setProducts(extendedProducts);
      setSkip(ITEMS_PER_PAGE);
      setHasMore(data.length === ITEMS_PER_PAGE);

      if (isAuthenticated && user) {
        try {
          const wishlistItems = await getWishlistItems(user.uid);
          const status: Record<string, boolean> = {};
          extendedProducts.forEach(product => {
            status[product.id.toString()] = wishlistItems.some(item => item.id === product.id.toString());
          });
          setWishlistStatus(status);
        } catch (error) {
          console.error("Error loading wishlist:", error);
          toast.error("Failed to load wishlist status");
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  // Initial load
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset pagination when filters change
  useEffect(() => {
    setProducts([]);
    setSkip(0);
    setHasMore(true);
    loadProducts();
  }, [selectedCategory, priceRange, searchQuery]);

  const handleNavigate = useCallback((productId: string) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  const handleWishlistToggle = useCallback(async (productId: string) => {
    if (!user) {
      setIsSignInModalOpen(true);
      return;
    }

    setLoadingWishlist(prev => ({ ...prev, [productId]: true }));
    try {
      if (wishlistStatus[productId]) {
        await removeWishlistItem(user.uid, productId);
        setWishlistStatus(prev => ({ ...prev, [productId]: false }));
        toast.success("Removed from wishlist");
      } else {
        const product = products.find(p => p.id.toString() === productId);
        if (product) {
          await addWishlistItem(user.uid, {
            id: product.id.toString(),
            title: product.title,
            thumbnail: product.thumbnail,
            price: product.price,
            category: product.category
          });
          setWishlistStatus(prev => ({ ...prev, [productId]: true }));
          toast.success("Added to wishlist");
        }
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setLoadingWishlist(prev => ({ ...prev, [productId]: false }));
    }
  }, [user, wishlistStatus, products]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setProducts([]);
      setSkip(0);
      setHasMore(true);
      loadProducts();
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchProducts(query);
      const extendedResults: Product[] = results.map(product => ({
        ...product,
        meta: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
      setProducts(extendedResults);
      setHasMore(false); // Disable infinite scroll for search results
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsSearching(false);
    }
  }, [loadProducts]);

  // Get unique categories from products
  const categories = ["all", ...new Set(products.map(product => product.category))];

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          {/* Fixed Sidebar */}
          <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-100 p-4 overflow-y-auto z-10">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 h-9 text-sm"
                  disabled
                />
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-8 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 ml-64 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">Loading products...</p>
              </div>
            </div>

            <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}>
              {[...Array(8)].map((_, index) => (
                <ProductCardSkeleton key={index} viewMode={viewMode} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-100 p-4 overflow-y-auto z-10">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                className="pl-10 h-9 text-sm"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Categories */}
            <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
                Categories
                {categoriesOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={category}
                      checked={selectedCategory === category}
                      onCheckedChange={() => setSelectedCategory(category)}
                    />
                    <label htmlFor={category} className="text-sm cursor-pointer">
                      {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Price Range */}
            <Collapsible open={priceOpen} onOpenChange={setPriceOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
                Price Range
                {priceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-50">Under $50</SelectItem>
                    <SelectItem value="50-100">$50 - $100</SelectItem>
                    <SelectItem value="100-200">$100 - $200</SelectItem>
                    <SelectItem value="over-200">Over $200</SelectItem>
                  </SelectContent>
                </Select>
              </CollapsibleContent>
            </Collapsible>

            {/* Colors */}
            <Collapsible open={colorsOpen} onOpenChange={setColorsOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
                Colors
                {colorsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="grid grid-cols-4 gap-2">
                  {["Black", "White", "Gray", "Blue", "Red", "Green", "Navy", "Brown"].map(color => (
                    <div
                      key={color}
                      className="w-6 h-6 rounded-full border-2 border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color.toLowerCase() === 'white' ? '#ffffff' : color.toLowerCase() }}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Size */}
            <Collapsible open={sizeOpen} onOpenChange={setSizeOpen}>
              <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium">
                Size
                {sizeOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="grid grid-cols-3 gap-1">
                  {["XS", "S", "M", "L", "XL", "XXL"].map(size => (
                    <Button
                      key={size}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Clear Filters */}
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 ml-64 p-6">
          {/* View Toggle and Sort */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 w-40 text-sm">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600">
                  {sortedProducts.length} products found
                </p>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length === 0 && !loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}>
                {sortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: [0.25, 0.25, 0, 1],
                      delay: (index % ITEMS_PER_PAGE) * 0.05,
                    }}
                  >
                    <ProductCard
                      product={product}
                      viewMode={viewMode}
                      index={index}
                      wishlistStatus={wishlistStatus[product.id.toString()] || false}
                      loadingWishlist={loadingWishlist[product.id.toString()] || false}
                      onWishlistToggle={() => handleWishlistToggle(product.id.toString())}
                      onNavigate={() => handleNavigate(product.id.toString())}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Infinite Scroll Loading Indicator */}
              {hasMore && (
                <div ref={loadingRef} className="flex justify-center items-center py-8">
                  {isLoadingMore && (
                    <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6 w-full`}>
                      {[...Array(4)].map((_, index) => (
                        <ProductCardSkeleton key={`loading-${index}`} viewMode={viewMode} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {!hasMore && sortedProducts.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">You've reached the end of the products.</p>
                </div>
              )}
            </>
          )}
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
