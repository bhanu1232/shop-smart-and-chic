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
import ProductFilters from "@/components/ProductFilters";
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

const ITEMS_PER_PAGE = 9;

const Products = () => {
  const navigate = useNavigate();
  useScrollToTop();
  const { isAuthenticated, user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [priceRange, setPriceRange] = useState("all");
  const [categoriesOpen, setCategoriesOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [offset, setOffset] = useState(1);
  const [isInView, setIsInView] = useState(false);
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
      const skip = offset * ITEMS_PER_PAGE;

      // Fetch next set of products from API
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

      // Update products and visible products
      setProducts(prev => [...prev, ...extendedProducts]);
      setVisibleProducts(prev => [...prev, ...extendedProducts]);
      setOffset(prev => prev + 1);
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
  }, [offset, isLoadingMore, hasMore, isAuthenticated, user]);

  // Setup Intersection Observer
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

  // Update visible products when filters change
  useEffect(() => {
    setVisibleProducts(sortedProducts.slice(0, ITEMS_PER_PAGE));
    setOffset(1);
    setHasMore(sortedProducts.length > ITEMS_PER_PAGE);
  }, [sortedProducts]);

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
      setVisibleProducts(extendedProducts);
      setHasMore(data.length === ITEMS_PER_PAGE);
      setOffset(1);

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

  // Move these functions before the productGrid useMemo
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

  // Memoize the product grid to prevent unnecessary re-renders
  const productGrid = useMemo(() => (
    <div
      ref={containerRef}
      className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}
    >
      {visibleProducts.map((product, index) => {
        const recalculatedDelay = index >= ITEMS_PER_PAGE * 2
          ? (index - ITEMS_PER_PAGE * (offset - 1)) / 15
          : index / 15;

        return (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.25, 0, 1],
              delay: recalculatedDelay,
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
        );
      })}
    </div>
  ), [visibleProducts, viewMode, wishlistStatus, loadingWishlist, handleNavigate, handleWishlistToggle, offset]);

  // Memoize the loading indicator
  const loadingIndicator = useMemo(() => (
    isLoading && (
      <div className="flex justify-center items-center py-8">
        <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6 w-full`}>
          {[...Array(3)].map((_, index) => (
            <ProductCardSkeleton key={`loading-${index}`} viewMode={viewMode} />
          ))}
        </div>
      </div>
    )
  ), [isLoading, viewMode]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      // If search is empty, load all products
      try {
        setLoading(true);
        const data = await fetchProducts();
        const extendedProducts: Product[] = data.map(product => ({
          ...product,
          meta: {
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }));
        setProducts(extendedProducts);
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
      const extendedResults: Product[] = results.map(product => ({
        ...product,
        meta: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
      setProducts(extendedResults);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

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
        {/* Navbar Component */}
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                priceRange={priceRange}
                searchQuery={searchQuery}
                categoriesOpen={categoriesOpen}
                priceOpen={priceOpen}
                onCategoryChange={setSelectedCategory}
                onPriceRangeChange={setPriceRange}
                onSearchChange={setSearchQuery}
                onCategoriesOpenChange={setCategoriesOpen}
                onPriceOpenChange={setPriceOpen}
                onClearFilters={handleClearFilters}
              />
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* View Toggle */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">
                  Loading products...
                </p>
              </div>

              {/* Products Grid/List */}
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
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
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              searchQuery={searchQuery}
              categoriesOpen={categoriesOpen}
              priceOpen={priceOpen}
              onCategoryChange={setSelectedCategory}
              onPriceRangeChange={setPriceRange}
              onSearchChange={setSearchQuery}
              onCategoriesOpenChange={setCategoriesOpen}
              onPriceOpenChange={setPriceOpen}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* View Toggle */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-gray-600">
                {filteredProducts.length} products found
              </p>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}>
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-100/80 overflow-hidden">
                    <Skeleton className="w-full aspect-square" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
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
                <div
                  ref={containerRef}
                  className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6`}
                >
                  {visibleProducts.map((product, index) => {
                    const recalculatedDelay = index >= ITEMS_PER_PAGE * 2
                      ? (index - ITEMS_PER_PAGE * (offset - 1)) / 15
                      : index / 15;

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.4,
                          ease: [0.25, 0.25, 0, 1],
                          delay: recalculatedDelay,
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
                    );
                  })}
                </div>
                {hasMore && (
                  <div ref={loadingRef} className="flex justify-center items-center py-8">
                    <div className={`grid ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"} gap-6 w-full`}>
                      {[...Array(3)].map((_, index) => (
                        <ProductCardSkeleton key={`loading-${index}`} viewMode={viewMode} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
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
