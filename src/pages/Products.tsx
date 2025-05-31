
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Search, Star, Heart, Grid, List, User, Filter, ChevronDown, ChevronUp, Menu, X, ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
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
import ProductFilters from "@/components/ProductFilters";

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
  const isInitialLoad = useRef(true);

  // Memoize filtered and sorted products
  const filteredProducts = useMemo(() => {
    console.log("Filtering products:", products.length, "Search:", searchQuery, "Category:", selectedCategory, "Price:", priceRange);
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

  // Cleanup observer on unmount or when dependencies change
  const cleanupObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  }, []);

  // Load more products function with better error handling
  const loadMoreProducts = useCallback(async () => {
    if (isLoadingMore || !hasMore || searchQuery.trim()) {
      console.log("Load more blocked:", { isLoadingMore, hasMore, searchQuery });
      return;
    }

    try {
      console.log("Loading more products, skip:", skip);
      setIsLoadingMore(true);
      const newProducts = await fetchProducts(ITEMS_PER_PAGE, skip);
      console.log("Loaded products:", newProducts.length);

      if (newProducts.length === 0) {
        setHasMore(false);
        console.log("No more products available");
        return;
      }

      const extendedProducts: Product[] = newProducts.map(product => ({
        ...product,
        meta: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));

      setProducts(prev => {
        const updated = [...prev, ...extendedProducts];
        console.log("Total products after load:", updated.length);
        return updated;
      });
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
  }, [skip, isLoadingMore, hasMore, isAuthenticated, user, searchQuery]);

  // Setup Intersection Observer with cleanup
  useEffect(() => {
    cleanupObserver();

    if (!hasMore || searchQuery.trim()) {
      console.log("Observer not needed:", { hasMore, searchQuery });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        console.log("Observer triggered:", entry.isIntersecting, "Loading:", isLoadingMore);
        if (entry.isIntersecting && !isLoadingMore && hasMore && !searchQuery.trim()) {
          loadMoreProducts();
        }
      },
      {
        root: null,
        rootMargin: '200px',
        threshold: 0.1,
      }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
      console.log("Observer attached to loading ref");
    }

    observerRef.current = observer;

    return cleanupObserver;
  }, [loadMoreProducts, isLoadingMore, hasMore, searchQuery, cleanupObserver]);

  // Initial products load
  const loadProducts = useCallback(async () => {
    try {
      console.log("Loading initial products");
      setLoading(true);
      setProducts([]);
      setSkip(0);
      setHasMore(true);
      
      const data = await fetchProducts(ITEMS_PER_PAGE, 0);
      console.log("Initial products loaded:", data.length);

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
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      loadProducts();
    }
  }, [loadProducts]);

  // Reset pagination when filters change
  useEffect(() => {
    if (!isInitialLoad.current) {
      console.log("Filters changed, reloading products");
      cleanupObserver();
      loadProducts();
    }
  }, [selectedCategory, priceRange, loadProducts, cleanupObserver]);

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
    console.log("Search query:", query);
    setSearchQuery(query);
    cleanupObserver();
    
    if (!query.trim()) {
      loadProducts();
      return;
    }

    try {
      setIsSearching(true);
      setLoading(true);
      const results = await searchProducts(query);
      console.log("Search results:", results.length);
      
      const extendedResults: Product[] = results.map(product => ({
        ...product,
        meta: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
      setProducts(extendedResults);
      setHasMore(false); // Disable infinite scroll for search results
      setSkip(0);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  }, [loadProducts, cleanupObserver]);

  // Get unique categories from products
  const categories = ["all", ...new Set(products.map(product => product.category))];

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange("all");
  };

  // Add state for back to top button
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Add scroll handler for back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
            {/* Sidebar Skeleton */}
            <div className="hidden lg:block">
              <div className="sticky top-24 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80 p-6 shadow-sm">
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
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8 border-gray-200">
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 border-gray-200">
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Loading products...</p>
              </div>

              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "grid-cols-1"} gap-6`}>
                {[...Array(8)].map((_, index) => (
                  <ProductCardSkeleton key={index} viewMode={viewMode} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              searchQuery={searchQuery}
              categoriesOpen={categoriesOpen}
              priceOpen={priceOpen}
              onCategoryChange={setSelectedCategory}
              onPriceRangeChange={setPriceRange}
              onSearchChange={handleSearch}
              onCategoriesOpenChange={setCategoriesOpen}
              onPriceOpenChange={setPriceOpen}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Mobile Filter Sheet */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden fixed top-20 left-4 z-20 bg-white/90 backdrop-blur-sm border-gray-200">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0 bg-white">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Filter className="h-4 w-4 text-gray-600" />
                  <h2 className="font-medium text-gray-900">Filters</h2>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search products..."
                      className="pl-10 h-10 text-sm bg-gray-50 border-gray-200"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-4 mb-6">
                  <h3 className="font-medium text-gray-900 text-sm">Categories</h3>
                  {categories.map(category => (
                    <div key={category} className="flex items-center space-x-3">
                      <Checkbox
                        id={`mobile-${category}`}
                        checked={selectedCategory === category}
                        onCheckedChange={() => setSelectedCategory(category)}
                        className="border-gray-300"
                      />
                      <label htmlFor={`mobile-${category}`} className="text-sm text-gray-600 cursor-pointer">
                        {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 text-sm mb-3">Price Range</h3>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger className="h-10 text-sm bg-gray-50 border-gray-200">
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
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-gray-200 hover:bg-gray-50"
                  onClick={handleClearFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Main Content */}
          <div className="space-y-6">
            {/* Header Controls */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100/80 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    className="h-9 w-9 border-gray-200"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    className="h-9 w-9 border-gray-200"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-9 w-48 text-sm border-gray-200 bg-white">
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
                  <div className="text-sm text-gray-500 font-medium">
                    {sortedProducts.length} products found
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length === 0 && !loading ? (
              <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-xl border border-gray-100/80">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="border-gray-200 hover:bg-gray-50"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "grid-cols-1"} gap-6`}>
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
                {hasMore && !searchQuery.trim() && (
                  <div ref={loadingRef} className="flex justify-center items-center py-8">
                    {isLoadingMore && (
                      <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "grid-cols-1"} gap-6 w-full`}>
                        {[...Array(4)].map((_, index) => (
                          <ProductCardSkeleton key={`loading-${index}`} viewMode={viewMode} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {(!hasMore || searchQuery.trim()) && sortedProducts.length > 0 && (
                  <div className="text-center py-8 bg-white/30 backdrop-blur-sm rounded-xl border border-gray-100/50">
                    <p className="text-gray-500">
                      {searchQuery.trim() ? "End of search results." : "You've reached the end of the products."}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-colors z-50 backdrop-blur-sm"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </div>
  );
};

export default Products;
