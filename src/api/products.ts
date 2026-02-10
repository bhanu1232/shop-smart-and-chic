import { db } from '@/config/firebase';
import { collection, getDocs, query, limit as firestoreLimit, where, orderBy, startAfter, DocumentSnapshot } from 'firebase/firestore';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  reviews?: {
    rating: number;
    comment: string;
    reviewerName: string;
    date: string;
  }[];
  meta?: {
    createdAt: string;
    updatedAt: string;
    title?: string;
    description?: string;
    keywords?: string;
  };
  availabilityStatus?: string;
  dimensions?: string;
  weight?: number;
  sku?: string;
  warrantyInformation?: string;
  returnPolicy?: string;
  shippingInformation?: string;
  minimumOrderQuantity?: number;
}

export interface ProductsResponse {
  products: Product[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Fetch products from Firebase with cursor-based pagination
 */
export const fetchProducts = async (
  limit: number = 10,
  lastDoc: DocumentSnapshot | null = null
): Promise<ProductsResponse> => {
  try {
    const productsRef = collection(db, 'products');

    // Build query with cursor-based pagination
    let q = query(
      productsRef,
      orderBy('title'), // Order by title for consistent pagination
      firestoreLimit(limit + 1) // Fetch one extra to check if there are more
    );

    // If we have a last document, start after it
    if (lastDoc) {
      q = query(
        productsRef,
        orderBy('title'),
        startAfter(lastDoc),
        firestoreLimit(limit + 1)
      );
    }

    const snapshot = await getDocs(q);
    const docs = snapshot.docs;

    // Check if there are more products
    const hasMore = docs.length > limit;

    // Get the actual products (excluding the extra one)
    const productDocs = hasMore ? docs.slice(0, limit) : docs;

    const products: Product[] = productDocs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    } as Product));

    // Get the last document for next pagination
    const newLastDoc = productDocs.length > 0 ? productDocs[productDocs.length - 1] : null;

    return {
      products,
      lastDoc: newLastDoc,
      hasMore
    };
  } catch (error) {
    console.error('Error fetching products from Firebase:', error);
    throw error;
  }
};

/**
 * Fetch product by ID from Firebase
 */
export async function fetchProductById(id: string): Promise<Product> {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const doc = snapshot.docs.find(d => d.id === id);
    if (!doc) {
      throw new Error('Product not found');
    }

    return {
      id: doc.id,
      ...doc.data()
    } as Product;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
}

/**
 * Search products in Firebase
 */
export async function searchProducts(searchQuery: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const lowerQuery = searchQuery.toLowerCase();
    const products: Product[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const title = (data.title || '').toLowerCase();
      const description = (data.description || '').toLowerCase();
      const category = (data.category || '').toLowerCase();
      const brand = (data.brand || '').toLowerCase();

      if (
        title.includes(lowerQuery) ||
        description.includes(lowerQuery) ||
        category.includes(lowerQuery) ||
        brand.includes(lowerQuery)
      ) {
        products.push({
          id: doc.id,
          ...data
        } as Product);
      }
    });

    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
}

/**
 * Fetch all unique categories
 */
export async function fetchCategories(): Promise<string[]> {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const categories = new Set<string>();
    snapshot.forEach((doc) => {
      const category = doc.data().category;
      if (category) {
        categories.add(category);
      }
    });

    return Array.from(categories).sort();
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Fetch all unique brands
 */
export async function fetchBrands(): Promise<string[]> {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);

    const brands = new Set<string>();
    snapshot.forEach((doc) => {
      const brand = doc.data().brand;
      if (brand) {
        brands.add(brand);
      }
    });

    return Array.from(brands).sort();
  } catch (error) {
    console.error('Error fetching brands:', error);
    throw error;
  }
}
