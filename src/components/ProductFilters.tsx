import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Filter, Search, ChevronDown, ChevronUp } from "lucide-react";
import { memo } from "react";

interface ProductFiltersProps {
    categories: string[];
    selectedCategory: string;
    priceRange: { min: number; max: number };
    searchQuery: string;
    categoriesOpen: boolean;
    priceOpen: boolean;
    onCategoryChange: (category: string) => void;
    onPriceRangeChange: (range: { min: number; max: number }) => void;
    onSearchChange: (query: string) => void;
    onCategoriesOpenChange: (open: boolean) => void;
    onPriceOpenChange: (open: boolean) => void;
    onClearFilters: () => void;
}

const ProductFilters = memo(({
    categories,
    selectedCategory,
    priceRange,
    searchQuery,
    categoriesOpen,
    priceOpen,
    onCategoryChange,
    onPriceRangeChange,
    onSearchChange,
    onCategoriesOpenChange,
    onPriceOpenChange,
    onClearFilters
}: ProductFiltersProps) => {
    return (
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
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories Dropdown */}
            <Collapsible open={categoriesOpen} onOpenChange={onCategoriesOpenChange}>
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
                                onCheckedChange={() => onCategoryChange(category)}
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
            <Collapsible open={priceOpen} onOpenChange={onPriceOpenChange}>
                <CollapsibleTrigger className="flex items-center justify-between w-full py-3 text-sm font-medium text-gray-700 hover:text-gray-900 border-b border-gray-100">
                    Price Range
                    {priceOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
                <CollapsibleContent className="py-3">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                placeholder="Min"
                                value={priceRange.min || ''}
                                onChange={(e) => onPriceRangeChange({ ...priceRange, min: Number(e.target.value) || 0 })}
                                className="w-full"
                            />
                            <span className="text-slate-500">to</span>
                            <Input
                                type="number"
                                placeholder="Max"
                                value={priceRange.max || ''}
                                onChange={(e) => onPriceRangeChange({ ...priceRange, max: Number(e.target.value) || 0 })}
                                className="w-full"
                            />
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>

            {/* Clear Filters */}
            <Button
                variant="outline"
                size="sm"
                className="w-full mt-6 h-10 text-sm border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                onClick={onClearFilters}
            >
                Clear All Filters
            </Button>
        </div>
    );
});

ProductFilters.displayName = 'ProductFilters';

export default ProductFilters;
