
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

export const fetchProducts = async (limit: number = 10, skip: number = 0) => {
  try {
    const response = await fetch(`https://products-api-2tb6.onrender.com/products?limit=${limit}&skip=${skip}`);
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export async function fetchProductById(id: number): Promise<Product> {
  const response = await fetch(`https://products-api-2tb6.onrender.com/products/${id}`);
  if (!response.ok) {
    throw new Error('Product not found');
  }
  return response.json();
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await fetch(`https://products-api-2tb6.onrender.com/products/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search products');
  }
  const data = await response.json();
  return data.products;
}
