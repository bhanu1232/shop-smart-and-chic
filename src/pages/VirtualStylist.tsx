import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2, ShoppingBag, Zap, TrendingUp, Shirt, Briefcase, Music, Dumbbell } from 'lucide-react';
import { Product, fetchProducts } from '@/api/products';
import { generateOutfits } from '@/services/outfitService';
import { GeneratedOutfit, OccasionType } from '@/types/stylist';
import OutfitCard from '@/components/OutfitCard';
import Navbar from '@/components/Navbar';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { toast } from 'sonner';

const OCCASIONS = [
    { id: 'casual' as OccasionType, label: 'Casual Day Out', icon: Shirt, description: 'Relaxed & comfortable' },
    { id: 'formal' as OccasionType, label: 'Office/Formal', icon: Briefcase, description: 'Professional & polished' },
    { id: 'party' as OccasionType, label: 'Party Night', icon: Music, description: 'Stylish & trendy' },
    { id: 'gym' as OccasionType, label: 'Gym/Workout', icon: Dumbbell, description: 'Active & sporty' }
];

export default function VirtualStylist() {
    useScrollToTop();
    const [selectedOccasion, setSelectedOccasion] = useState<OccasionType | ''>('');
    const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetchingProducts, setFetchingProducts] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);

    const handleGenerateOutfits = async () => {
        if (!selectedOccasion) {
            toast.error('Please select an occasion first!');
            return;
        }

        try {
            setLoading(true);

            // Fetch products if not already loaded
            let productsToUse = products;
            if (products.length === 0) {
                setFetchingProducts(true);
                toast.info('Loading products...', {
                    description: 'Gathering items for your perfect outfit'
                });

                const response = await fetchProducts(50);
                setProducts(response.products);
                productsToUse = response.products;
                setFetchingProducts(false);
            }

            toast.info('AI is creating your perfect outfits...', {
                description: 'This may take a few seconds'
            });

            // Generate outfits
            const generated = await generateOutfits(productsToUse, {
                occasion: selectedOccasion
            });

            setOutfits(generated);

            toast.success(`Created ${generated.length} amazing outfits!`, {
                description: 'Scroll down to see your personalized recommendations'
            });
        } catch (error) {
            console.error('Error generating outfits:', error);
            toast.error('Failed to generate outfits', {
                description: error instanceof Error ? error.message : 'Please try again or select a different occasion'
            });
        } finally {
            setLoading(false);
            setFetchingProducts(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="h-[70px]">
                <Navbar />
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full mb-4 border border-slate-200">
                        <Sparkles className="h-4 w-4 text-slate-900" />
                        <span className="text-sm font-medium text-slate-900">AI-Powered Styling</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                        Your Personal AI Stylist
                    </h1>

                    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
                        Let our AI create perfect outfit combinations tailored to your occasion.
                        Get instant style recommendations with smart color matching and compatibility scoring.
                    </p>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-8">
                        <div className="flex items-center gap-2">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <ShoppingBag className="h-5 w-5 text-slate-900" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-slate-600">Outfit Combos</p>
                                <p className="text-lg font-bold text-slate-900">1000+</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <Zap className="h-5 w-5 text-slate-900" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-slate-600">AI Accuracy</p>
                                <p className="text-lg font-bold text-slate-900">95%</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-slate-900" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-slate-600">User Satisfaction</p>
                                <p className="text-lg font-bold text-slate-900">4.8/5</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Occasion Selector */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-6 text-center text-slate-900">Select Your Occasion</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {OCCASIONS.map(occasion => {
                            const IconComponent = occasion.icon;
                            return (
                                <Card
                                    key={occasion.id}
                                    className={`cursor-pointer transition-all duration-300 ${selectedOccasion === occasion.id
                                        ? 'border-2 border-slate-900 shadow-md bg-white'
                                        : 'hover:shadow-md border border-slate-200 bg-white'
                                        }`}
                                    onClick={() => setSelectedOccasion(occasion.id)}
                                >
                                    <CardContent className="p-6 text-center">
                                        <div className="w-16 h-16 mx-auto mb-3 bg-slate-50 rounded-lg flex items-center justify-center">
                                            <IconComponent className="h-8 w-8 text-slate-900" />
                                        </div>
                                        <h3 className="text-sm font-semibold mb-1 text-slate-900">{occasion.label}</h3>
                                        <p className="text-xs text-slate-600">{occasion.description}</p>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Generate Button */}
                <div className="text-center mb-12">
                    <Button
                        size="lg"
                        onClick={handleGenerateOutfits}
                        disabled={!selectedOccasion || loading}
                        className="px-10 py-6 text-lg bg-slate-900 hover:bg-black shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                Creating Your Outfits...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-3 h-6 w-6" />
                                Generate AI Outfits
                            </>
                        )}
                    </Button>

                    {!selectedOccasion && !loading && (
                        <p className="text-sm text-slate-500 mt-3">
                            Select an occasion above to get started
                        </p>
                    )}
                </div>

                {/* Loading State with Skeleton */}
                {loading && (
                    <div className="animate-in fade-in duration-500">
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
                                <h2 className="text-2xl font-bold text-slate-900">
                                    {fetchingProducts ? 'Loading Products...' : 'Creating Your Outfits...'}
                                </h2>
                            </div>
                            <p className="text-slate-600">
                                {fetchingProducts
                                    ? 'Gathering the best items for you'
                                    : 'AI is analyzing combinations and styles'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="overflow-hidden border border-slate-200">
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {/* Header skeleton */}
                                            <div className="flex items-center justify-between">
                                                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                                                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
                                            </div>

                                            {/* Product items skeleton */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {[1, 2, 3, 4].map((j) => (
                                                    <div key={j} className="space-y-2">
                                                        <div className="aspect-square bg-slate-200 rounded animate-pulse" />
                                                        <div className="h-4 bg-slate-200 rounded animate-pulse" />
                                                        <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Description skeleton */}
                                            <div className="space-y-2 pt-2">
                                                <div className="h-3 bg-slate-200 rounded animate-pulse" />
                                                <div className="h-3 w-4/5 bg-slate-200 rounded animate-pulse" />
                                            </div>

                                            {/* Button skeleton */}
                                            <div className="h-10 bg-slate-200 rounded animate-pulse" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Generated Outfits */}
                {outfits.length > 0 && !loading && (
                    <div className="animate-in fade-in duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold mb-2 text-slate-900">Your Personalized Outfits</h2>
                            <p className="text-slate-600">
                                AI-curated combinations perfect for your {selectedOccasion} occasion
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {outfits.map(outfit => (
                                <OutfitCard key={outfit.id} outfit={outfit} />
                            ))}
                        </div>

                        {/* Try Another Button */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleGenerateOutfits}
                                disabled={loading}
                                className="border-2 border-slate-900 hover:bg-slate-50 text-slate-900"
                            >
                                <Sparkles className="mr-2 h-5 w-5" />
                                Regenerate Outfits
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                    setOutfits([]);
                                    setSelectedOccasion('');
                                }}
                                className="border-2 border-slate-300 hover:bg-slate-50"
                            >
                                Try Another Occasion
                            </Button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {outfits.length === 0 && !loading && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="h-12 w-12 text-slate-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            Ready to discover your perfect style?
                        </h3>
                        <p className="text-slate-600">
                            Select an occasion and let our AI create amazing outfit combinations for you!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
