import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Heart, Loader2, Share2, ShoppingCart } from "lucide-react";
import { Product } from "@/api/products";
import { memo } from "react";

interface ProductCardProps {
    product: Product;
    viewMode: "grid" | "list";
    index: number;
    wishlistStatus: boolean;
    loadingWishlist: boolean;
    onWishlistToggle: () => void;
    onNavigate: () => void;
}

const ProductCard = memo(({
    product,
    viewMode,
    index,
    wishlistStatus,
    loadingWishlist,
    onWishlistToggle,
    onNavigate
}: ProductCardProps) => {
    const [isImageLoading, setIsImageLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSharing(true);
        try {
            if (navigator.share) {
                await navigator.share({
                    title: product.title,
                    text: product.description,
                    url: window.location.href,
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                await navigator.clipboard.writeText(window.location.href);
                // You might want to show a toast notification here
            }
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <Card
            className={`group relative border border-gray-100/80 bg-white/90 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg/50 hover:border-gray-200/80 ${viewMode === "list" ? "flex flex-row" : ""
                }`}
            style={{ animationDelay: `${index * 0.1}s` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`relative ${viewMode === "list" ? "w-48 md:w-72 flex-shrink-0" : ""}`}
                onClick={onNavigate}
            >
                {isImageLoading && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                <img
                    src={product.thumbnail}
                    alt={product.title}
                    className={`w-full object-cover transition-all duration-500 ${isImageLoading ? "opacity-0" : "opacity-100"
                        } ${viewMode === "list" ? "h-full" : "aspect-square"} ${isHovered ? "scale-105" : "scale-100"
                        }`}
                    onLoad={() => setIsImageLoading(false)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />

                <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-all duration-300 ${isSharing ? "text-blue-500" : "text-gray-400 hover:text-gray-500"
                            }`}
                        onClick={handleShare}
                        disabled={isSharing}
                    >
                        {isSharing ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Share2 className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-all duration-300 ${wishlistStatus ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-gray-500"
                            }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            onWishlistToggle();
                        }}
                        disabled={loadingWishlist}
                    >
                        {loadingWishlist ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Heart className={`h-4 w-4 ${wishlistStatus ? "fill-current" : ""}`} />
                        )}
                    </Button>
                </div>

                {product.discountPercentage > 0 && (
                    <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-white">
                        -{product.discountPercentage}%
                    </Badge>
                )}
            </div>

            <CardContent
                className={`p-4 md:p-6 ${viewMode === "list" ? "flex-1" : ""}`}
                onClick={onNavigate}
            >
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

                <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 h-12 group-hover:text-gray-700 transition-colors">
                    {product.title}
                </h3>

                {viewMode === "list" && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                        {product.description}
                    </p>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                            ${product.price.toFixed(2)}
                        </span>
                        {product.discountPercentage > 0 && (
                            <span className="text-sm text-gray-500 line-through">
                                ${(product.price * (1 + product.discountPercentage / 100)).toFixed(2)}
                            </span>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 text-sm border-gray-200 hover:border-gray-300 hover:bg-gray-50 group-hover:bg-gray-900 group-hover:text-white group-hover:border-gray-900 transition-all duration-300"
                        onClick={(e) => {
                            e.stopPropagation();
                            // Add to cart functionality will be implemented here
                        }}
                    >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 