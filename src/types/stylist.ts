import { Product } from '@/api/products';

export interface StylePreferences {
  userId: string;
  personality: 'minimalist' | 'bold' | 'classic' | 'trendy' | 'eclectic';
  favoriteColors: string[];
  priceRange: { min: number; max: number };
  preferredFit: 'slim' | 'regular' | 'loose' | 'oversized';
  occasions: string[];
  bodyType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GeneratedOutfit {
  id: string;
  occasion: string;
  items: Product[];
  totalPrice: number;
  discountedPrice?: number;
  compatibilityScore: number;
  reasoning: string;
  colorScheme: string[];
  createdAt: Date;
}

export interface OutfitRequest {
  occasion: string;
  budget?: number;
  colorPreference?: string[];
  style?: string;
  excludeCategories?: string[];
}

export type OccasionType = 'casual' | 'formal' | 'party' | 'gym';

export interface OccasionConfig {
  id: OccasionType;
  label: string;
  icon: string;
  categories: string[];
  avoid: string[];
  priceMultiplier: number;
}
