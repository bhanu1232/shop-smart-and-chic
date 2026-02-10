import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Star, Sparkles } from 'lucide-react';
import { GeneratedOutfit } from '@/types/stylist';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface OutfitCardProps {
    outfit: GeneratedOutfit;
}

export default function OutfitCard({ outfit }: OutfitCardProps) {
    const navigate = useNavigate();

    const handleAddAllToCart = () => {
        toast.success('Added all items to cart!', {
            description: `${outfit.items.length} items added for ₹${outfit.totalPrice}`
        });
    };

    const handleSaveOutfit = () => {
        toast.success('Outfit saved to your collection!');
    };

    // Get score badge styling based on compatibility score
    const getScoreBadgeStyle = (score: number) => {
        if (score >= 90) return 'bg-green-50 text-green-700 border border-green-200';
        if (score >= 75) return 'bg-blue-50 text-blue-700 border border-blue-200';
        if (score >= 60) return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
        return 'bg-red-50 text-red-700 border border-red-200';
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-all duration-300 border border-gray-200 bg-white">
            <CardContent className="p-0">
                {/* Outfit Preview Grid */}
                <div className="grid grid-cols-2 gap-1 bg-gray-50 p-2">
                    {outfit.items.slice(0, 4).map((item, index) => (
                        <div
                            key={index}
                            className="aspect-square bg-white rounded-lg overflow-hidden cursor-pointer group"
                            onClick={() => navigate(`/product/${item.id}`)}
                        >
                            <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                    ))}
                </div>

                {/* Outfit Details */}
                <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="capitalize text-xs bg-slate-100 text-slate-700">
                            {outfit.occasion}
                        </Badge>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${getScoreBadgeStyle(outfit.compatibilityScore)}`}>
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs font-semibold">
                                {outfit.compatibilityScore}/100
                            </span>
                        </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="mb-4 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <Sparkles className="h-4 w-4 text-slate-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-slate-700 leading-relaxed">
                                {outfit.reasoning}
                            </p>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 mb-4 bg-gray-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Outfit Items
                        </p>
                        {outfit.items.map((item, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center text-xs hover:bg-white p-1 rounded transition-colors cursor-pointer"
                                onClick={() => navigate(`/product/${item.id}`)}
                            >
                                <span className="truncate flex-1 text-gray-700">{item.title}</span>
                                <span className="font-semibold ml-2 text-gray-900">₹{item.price}</span>
                            </div>
                        ))}
                    </div>

                    {/* Color Scheme */}
                    {outfit.colorScheme.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">Color Palette</p>
                            <div className="flex gap-2 flex-wrap">
                                {outfit.colorScheme.map((color, index) => (
                                    <Badge key={index} variant="outline" className="text-xs capitalize">
                                        {color}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Price & Actions */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Total Price</p>
                                <p className="text-2xl font-bold text-gray-900">₹{outfit.totalPrice}</p>
                            </div>
                            {outfit.discountedPrice && (
                                <Badge variant="destructive" className="text-sm">
                                    Save ₹{outfit.totalPrice - outfit.discountedPrice}
                                </Badge>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                className="flex-1 bg-slate-900 hover:bg-black"
                                onClick={handleAddAllToCart}
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Add All
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleSaveOutfit}
                                className="border-slate-300 hover:bg-slate-50"
                            >
                                <Heart className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
