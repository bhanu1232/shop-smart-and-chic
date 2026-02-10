import { Product } from '@/api/products';
import { GeneratedOutfit, OutfitRequest, OccasionType } from '@/types/stylist';
import { generateChatResponse } from './geminiService';

// Occasion-based rules for outfit generation
const OCCASION_RULES: Record<OccasionType, { categories: string[]; avoid: string[]; priceMultiplier: number }> = {
    casual: {
        categories: ['t-shirt', 'shirt', 'jeans', 'sneakers', 'hoodie', 'jacket', 'top'],
        avoid: ['formal', 'suit', 'blazer', 'heels'],
        priceMultiplier: 1.0
    },
    formal: {
        categories: ['shirt', 'trousers', 'blazer', 'dress', 'shoes', 'pants'],
        avoid: ['sneakers', 't-shirt', 'shorts', 'hoodie'],
        priceMultiplier: 1.5
    },
    party: {
        categories: ['dress', 'jacket', 'shirt', 'jeans', 'shoes', 'accessories'],
        avoid: ['gym', 'sportswear', 'casual'],
        priceMultiplier: 1.3
    },
    gym: {
        categories: ['sportswear', 'sneakers', 'activewear', 'shorts', 'top'],
        avoid: ['formal', 'jeans', 'dress'],
        priceMultiplier: 1.0
    }
};

/**
 * Generate outfit combinations based on occasion and preferences
 */
export const generateOutfits = async (
    products: Product[],
    request: OutfitRequest
): Promise<GeneratedOutfit[]> => {
    try {
        console.log('Generating outfits for:', request);

        // 1. Filter products by occasion and budget
        const filtered = filterProductsByOccasion(products, request);
        console.log('Filtered products:', filtered.length);

        if (filtered.length < 3) {
            throw new Error('Not enough products to create outfits');
        }

        // 2. Create outfit combinations
        const combinations = createOutfitCombinations(filtered, request);
        console.log('Created combinations:', combinations.length);

        // 3. Score each combination
        const scored = combinations.map(combo => ({
            ...combo,
            compatibilityScore: calculateCompatibilityScore(combo.items)
        }));

        // 4. Get top 3 combinations
        const top3 = scored
            .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
            .slice(0, 3);

        // 5. Enhance with AI descriptions
        const enhanced = await Promise.all(
            top3.map(outfit => enhanceWithAI(outfit, request))
        );

        return enhanced;
    } catch (error) {
        console.error('Error generating outfits:', error);
        throw error;
    }
};

/**
 * Filter products based on occasion rules and budget
 */
const filterProductsByOccasion = (
    products: Product[],
    request: OutfitRequest
): Product[] => {
    const rules = OCCASION_RULES[request.occasion as OccasionType];
    if (!rules) return products;

    return products.filter(product => {
        const productText = `${product.category} ${product.title}`.toLowerCase();

        // Check category match
        const categoryMatch = rules.categories.some(cat =>
            productText.includes(cat.toLowerCase())
        );

        // Check avoid list
        const shouldAvoid = rules.avoid.some(avoid =>
            productText.includes(avoid.toLowerCase())
        );

        // Check budget
        const withinBudget = !request.budget || product.price <= request.budget;

        return categoryMatch && !shouldAvoid && withinBudget;
    });
};

/**
 * Create multiple outfit combinations from filtered products
 */
const createOutfitCombinations = (
    products: Product[],
    request: OutfitRequest
): Partial<GeneratedOutfit>[] => {
    const combinations: Partial<GeneratedOutfit>[] = [];

    // Group products by category
    const byCategory = products.reduce((acc, product) => {
        const cat = product.category.toLowerCase();
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    const categories = Object.keys(byCategory);
    const maxCombinations = 5;

    // Create diverse combinations
    for (let i = 0; i < maxCombinations && categories.length >= 3; i++) {
        const outfit: Product[] = [];
        let totalPrice = 0;
        const usedCategories = new Set<string>();

        // Try to pick 3-4 items from different categories
        const targetItems = Math.min(4, categories.length);
        let attempts = 0;

        while (outfit.length < targetItems && attempts < 20) {
            const randomCat = categories[Math.floor(Math.random() * categories.length)];

            if (!usedCategories.has(randomCat) && byCategory[randomCat]?.length > 0) {
                const items = byCategory[randomCat];
                const randomItem = items[Math.floor(Math.random() * items.length)];

                outfit.push(randomItem);
                totalPrice += randomItem.price;
                usedCategories.add(randomCat);
            }

            attempts++;
        }

        if (outfit.length >= 3) {
            combinations.push({
                id: `outfit-${Date.now()}-${i}`,
                occasion: request.occasion,
                items: outfit,
                totalPrice: Math.round(totalPrice),
                createdAt: new Date()
            });
        }
    }

    return combinations;
};

/**
 * Calculate compatibility score for an outfit
 */
const calculateCompatibilityScore = (items: Product[]): number => {
    let score = 100;

    // Price balance (prefer similar price ranges)
    const prices = items.map(i => i.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const priceVariance = prices.reduce((acc, p) => acc + Math.abs(p - avgPrice), 0) / prices.length;
    score -= Math.min(20, priceVariance / 100);

    // Category diversity (good to have different categories)
    const uniqueCategories = new Set(items.map(i => i.category)).size;
    score += uniqueCategories * 5;

    // Rating bonus
    const avgRating = items.reduce((acc, i) => acc + i.rating, 0) / items.length;
    score += avgRating * 2;

    // Discount bonus
    const avgDiscount = items.reduce((acc, i) => acc + i.discountPercentage, 0) / items.length;
    score += avgDiscount / 5;

    return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Enhance outfit with AI-generated reasoning
 */
const enhanceWithAI = async (
    outfit: Partial<GeneratedOutfit>,
    request: OutfitRequest
): Promise<GeneratedOutfit> => {
    try {
        const prompt = `You are a professional fashion stylist. Explain why this outfit works well for ${request.occasion}:

Items:
${outfit.items?.map((item, i) => `${i + 1}. ${item.title} (₹${item.price})`).join('\n')}

Provide a brief, enthusiastic 2-sentence explanation focusing on style, color harmony, and occasion appropriateness. Keep it under 50 words.`;

        const response = await generateChatResponse(prompt, 'You are a professional fashion stylist with expertise in creating cohesive outfits.');

        return {
            ...outfit,
            reasoning: response.response || 'This outfit combines style and comfort perfectly for your occasion!',
            colorScheme: extractColors(outfit.items || [])
        } as GeneratedOutfit;
    } catch (error) {
        console.error('Error enhancing with AI:', error);
        // Fallback reasoning if AI fails
        return {
            ...outfit,
            reasoning: `Perfect ${request.occasion} outfit combining ${outfit.items?.length || 0} stylish pieces that work great together!`,
            colorScheme: extractColors(outfit.items || [])
        } as GeneratedOutfit;
    }
};

/**
 * Extract color keywords from product titles
 */
const extractColors = (items: Product[]): string[] => {
    const colorKeywords = ['black', 'white', 'blue', 'red', 'green', 'yellow', 'pink', 'purple', 'brown', 'gray', 'grey', 'navy', 'beige'];
    const colors = new Set<string>();

    items.forEach(item => {
        const title = item.title.toLowerCase();
        colorKeywords.forEach(color => {
            if (title.includes(color)) colors.add(color);
        });
    });

    return Array.from(colors);
};
