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

// Type definitions
type SortOption = 'newest' | 'price-low' | 'price-high' | 'popular' | 'rating';

interface PriceRange {
  min: number;
  max: number;
}

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
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 1000 });
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

  // Price range handler
  const handlePriceRangeChange = useCallback((field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    setPriceRange(prev => ({
      ...prev,
      [field]: numValue
    }));
  }, []);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "rating":
          return b.rating - a.rating;
        case "newest":
          return new Date(b.meta?.createdAt || "").getTime() - new Date(a.meta?.createdAt || "").getTime();
        case "popular":
          return b.stock - a.stock;
        default:
          return 0;
      }
    });
    return sorted;
  }, [products, sortBy]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchesSearch && matchesCategory && matchesPrice;
    });
  }, [sortedProducts, searchQuery, selectedCategory, priceRange]);

  // Navigation handler
  const handleNavigate = useCallback((productId: number) => {
    navigate(`/product/${productId}`);
  }, [navigate]);

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange({ min: 0, max: 1000 });
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

      // Update products by appending new products to the existing ones
      setProducts(prevProducts => [...prevProducts, ...extendedProducts]);
      setSkip(prevSkip => prevSkip + ITEMS_PER_PAGE);
      setHasMore(newProducts.length === ITEMS_PER_PAGE);

      // Update wishlist status for new products in the background
      if (isAuthenticated && user) {
        getWishlistItems(user.uid)
          .then(wishlistItems => {
            const status: Record<string, boolean> = {};
            extendedProducts.forEach(product => {
              status[product.id.toString()] = wishlistItems.some(item => item.id === product.id.toString());
            });
            setWishlistStatus(prev => ({ ...prev, ...status }));
          })
          .catch(error => {
            console.error("Error loading wishlist:", error);
          });
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
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Don't set up observer if we're searching or have no more products
    if (!hasMore || searchQuery.trim()) {
      console.log("Observer not needed:", { hasMore, searchQuery });
      return;
    }

    // Create new observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore && hasMore && !searchQuery.trim()) {
          console.log("Loading more products triggered by observer");
          loadMoreProducts();
        }
      },
      { root: null, rootMargin: '200px', threshold: 0.1 }
    );

    // Observe loading ref if it exists
    if (loadingRef.current) {
      observer.observe(loadingRef.current);
      console.log("Observer attached to loading ref");
    }

    observerRef.current = observer;

    // Cleanup on unmount or when dependencies change
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [loadMoreProducts, isLoadingMore, hasMore, searchQuery]);

  // Initial products load
  const loadProducts = useCallback(async () => {
    try {
      console.log("Loading initial products");
      setLoading(true);

      // Reset products state
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

      // Update wishlist status for new products in the background
      if (isAuthenticated && user) {
        getWishlistItems(user.uid)
          .then(wishlistItems => {
            const status: Record<string, boolean> = {};
            extendedProducts.forEach(product => {
              status[product.id.toString()] = wishlistItems.some(item => item.id === product.id.toString());
            });
            setWishlistStatus(prev => ({ ...prev, ...status }));
          })
          .catch(error => {
            console.error("Error loading wishlist:", error);
          });
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

  // Reset pagination when filters change (except for initial load)
  useEffect(() => {
    if (!isInitialLoad.current && (selectedCategory !== "all" || priceRange.min !== 0 || priceRange.max !== 1000)) {
      console.log("Filters changed, reloading products");
      setProducts([]);
      setSkip(0);
      setHasMore(true);
      loadProducts();
    }
  }, [selectedCategory, priceRange, loadProducts]);

  // Add handlePriceFilter function
  const handlePriceFilter = useCallback(() => {
    // Re-filter the current products based on price range
    // Note: This assumes filtering is done client-side after initial fetch/search
    // For large datasets, server-side filtering would be more performant
    const filtered = products.filter(product => {
      const price = product.price;
      return price >= priceRange.min && price <= priceRange.max;
    });
    setProducts(filtered);
    setHasMore(false); // Disable infinite scroll after client-side filtering
  }, [products, priceRange]);

  // Create debounced search function outside useCallback
  const debouncedSearch = useMemo(
    () => debounce(async (query: string) => {
      console.log("Debounced search query:", query);
      if (!query.trim()) {
        loadProducts(); // Load initial products if search query is empty
        return;
      }

      try {
        setIsSearching(true);
        const results = await searchProducts(query); // Use searchProducts API call
        console.log("Search results:", results.length);

        const extendedResults: Product[] = results.map(product => ({
          ...product,
          meta: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } // Add meta data
        }));
        setProducts(extendedResults);
        setHasMore(false); // Disable infinite scroll for search results
        setSkip(0); // Reset skip
      } catch (error) {
        console.error('Error searching products:', error);
        toast.error('Failed to search products');
      } finally {
        setIsSearching(false);
      }
    }, 500), // Debounce delay
    [loadProducts] // Dependency array includes loadProducts
  );

  // Update handleSearch to use debounced search
  const handleSearch = useCallback((query: string) => {
    console.log("Search query:", query);
    setSearchQuery(query);
    // Trigger debounced search only after a delay
    debouncedSearch(query);
  }, [debouncedSearch]);

  // Cleanup debounced search on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel(); // Cancel any pending debounced calls
    };
  }, [debouncedSearch]);

  // Get unique categories from products (consider fetching categories separately if needed)
  const categories = useMemo(() =>
    ["all", ...new Set(products.map(product => product.category).filter(Boolean))], // Filter out potential undefined/null categories
    [products]
  );

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add handleWishlistToggle before productGrid
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

  // Memoize the product grid to prevent unnecessary re-renders
  const productGrid = useMemo(() => (
    <>
      {/* Initial Loading Skeleton */}
      {loading && (
        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8 w-full`}>
          {[...Array(3)].map((_, index) => (
            <ProductCardSkeleton key={`initial-loading-${index}`} viewMode={viewMode} />
          ))}
        </div>
      )}

      {/* No Products Found Message */}
      {!loading && filteredProducts.length === 0 ? (
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
          {/* Actual Product Grid */}
          {!loading && filteredProducts.length > 0 && (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-8`}>
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.25, 0.25, 0, 1],
                    delay: (index % ITEMS_PER_PAGE) * 0.05,
                  }}
                  className="w-full"
                >
                  <ProductCard
                    product={product}
                    viewMode={viewMode}
                    index={index}
                    wishlistStatus={wishlistStatus[product.id.toString()] || false}
                    loadingWishlist={loadingWishlist[product.id.toString()] || false}
                    onWishlistToggle={() => handleWishlistToggle(product.id.toString())}
                    onNavigate={() => handleNavigate(product.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Infinite Scroll Loading Indicator */}
          {hasMore && !searchQuery.trim() && ( /* Keep this as is */
            <div ref={loadingRef} className="flex justify-center items-center py-8">
              {isLoadingMore && (
                <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-8 w-full`}>
                  {[...Array(3)].map((_, index) => (
                    <ProductCardSkeleton key={`loading-${index}`} viewMode={viewMode} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* End of Results Message */}
          {(!hasMore || searchQuery.trim()) && !isLoadingMore && filteredProducts.length > 0 && (
            <div className="text-center py-8 bg-white/30 backdrop-blur-sm rounded-xl border border-gray-100/50">
              <p className="text-gray-500">
                {searchQuery.trim() ? "End of search results." : "You've reached the end of the products."}
              </p>
            </div>
          )}
        </>
      )}
    </>
  ), [filteredProducts, viewMode, wishlistStatus, loadingWishlist, handleNavigate, handleWishlistToggle, loading, hasMore, searchQuery, isLoadingMore, handleClearFilters]);

  // Price range presets
  const priceRanges = [
    { label: "All Prices", value: { min: 0, max: 1000 } },
    { label: "Under $50", value: { min: 0, max: 50 } },
    { label: "$50 - $100", value: { min: 50, max: 100 } },
    { label: "$100 - $200", value: { min: 100, max: 200 } },
    { label: "$200 - $500", value: { min: 200, max: 500 } },
    { label: "Over $500", value: { min: 500, max: 1000 } }
  ];

  // Handle price range selection
  const handlePriceRangeSelect = useCallback((range: PriceRange) => {
    setPriceRange(range);
    // Reset pagination when price range changes
    setProducts([]);
    setSkip(0);
    setHasMore(true);
    loadProducts();
  }, [loadProducts]);

  // Update the sidebar JSX
  const sidebar = useMemo(() => (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="sticky top-24 space-y-8">
        {/* Search Bar */}
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 bg-gray-50/50 border-gray-200 focus:border-gray-300 focus:ring-0"
            />
          </div>
        </div>

        {/* Sort Dropdown */}
        <div>
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-full bg-gray-50/50 border-gray-200 focus:border-gray-300 focus:ring-0">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Categories Filter */}
        <div>
          <Select
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value)}
          >
            <SelectTrigger className="w-full bg-gray-50/50 border-gray-200 focus:border-gray-300 focus:ring-0">
              <SelectValue placeholder="Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.filter(cat => cat !== "all").map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price Range Filter */}
        <div>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={priceRange.min || ''}
                onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                className="w-full bg-gray-50/50 border-gray-200 focus:border-gray-300 focus:ring-0"
              />
              <span className="text-slate-400">to</span>
              <Input
                type="number"
                placeholder="Max"
                value={priceRange.max || ''}
                onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                className="w-full bg-gray-50/50 border-gray-200 focus:border-gray-300 focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        <Button
          variant="ghost"
          className="w-full text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          onClick={handleClearFilters}
        >
          Clear Filters
        </Button>
      </div>
    </div>
  ), [categories, selectedCategory, priceRange, sortBy, handlePriceRangeChange, handleClearFilters, searchQuery, handleSearch]);

  // Memoize the header controls to prevent re-renders
  const headerControls = useMemo(() => (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-gray-100/50 p-3 shadow-sm hidden lg:block">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          {filteredProducts.length} products
        </div>
      </div>
    </div>
  ), [viewMode, filteredProducts.length]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="h-[40px]">
        <Navbar />
      </div>

      <div className="container mx-auto px-0 py-6 lg:grid lg:grid-cols-[280px_1fr] lg:gap-8">
        {/* Filters Sidebar */}
        <div className="hidden lg:block lg:relative z-10">
          <div className="lg:fixed lg:top-[70px] lg:bottom-0 lg:w-[280px] lg:overflow-y-auto lg:p-6 lg:bg-white/80 lg:backdrop-blur-sm lg:border-r lg:border-gray-100/50">
            {sidebar}
          </div>
        </div>

        {/* Products Grid/List and Controls */}
        <div className="lg:col-start-2 px-4 lg:px-0">
          {/* Mobile Filter Toggle Button */}
          <div className="lg:hidden mb-6">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full bg-white/80 backdrop-blur-sm border-gray-200">
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-6 overflow-y-auto bg-white/95 backdrop-blur-sm">
                <h2 className="text-lg font-medium mb-6">Filters</h2>
                {sidebar}
                <Button className="w-full mt-4" onClick={() => setIsFilterOpen(false)}>Close</Button>
              </SheetContent>
            </Sheet>
          </div>

          {/* Products Grid/List Display */}
          <div className="mt-6">
            {productGrid}
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
          className="fixed bottom-6 right-6 bg-white/80 hover:bg-white text-gray-900 p-2.5 rounded-full shadow-lg transition-colors z-50 backdrop-blur-sm border border-gray-100"
          aria-label="Back to top"
        >
          <ArrowUp className="h-4 w-4" />
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
