export interface Product {
  id: number;
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
  reviews: {
    rating: number;
    comment: string;
    reviewerName: string;
    date: string;
  }[];
  meta?: {
    createdAt: string;
    updatedAt: string;
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('https://dummyjson.com/products');
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  const data = await response.json();
  return data.products;
}

export async function fetchProductById(id: number): Promise<Product> {
  const response = await fetch(`https://dummyjson.com/products/${id}`);
  if (!response.ok) {
    throw new Error('Product not found');
  }
  return response.json();
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await fetch(`https://dummyjson.com/products/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search products');
  }
  const data = await response.json();
  return data.products;
} 