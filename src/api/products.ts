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

export const fetchProducts = async (limit: number = 10, skip: number = 0) => {
  try {
    const response = await fetch(`https://items-api-ivory.vercel.app/api/products?limit=${limit}&skip=${skip}`);
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

export async function fetchProductById(id: string): Promise<Product> {
  const response = await fetch(`https://items-api-ivory.vercel.app/api/products/${id}`);
  if (!response.ok) {
    throw new Error('Product not found');
  }
  return response.json();
}

export async function searchProducts(query: string): Promise<Product[]> {
  const response = await fetch(`https://items-api-ivory.vercel.app/api/products/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) {
    throw new Error('Failed to search products');
  }
  const data = await response.json();
  return data.products;
}

export async function createProduct(productData: Omit<Product, "id">): Promise<Product> {
  try {
    const response = await fetch('https://items-api-ivory.vercel.app/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create product');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
  try {
    const response = await fetch(`https://items-api-ivory.vercel.app/api/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to update product');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const response = await fetch(`https://items-api-ivory.vercel.app/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to delete product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

export async function fetchCategories(): Promise<string[]> {
  const response = await fetch('https://items-api-ivory.vercel.app/api/products/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

export async function fetchBrands(): Promise<string[]> {
  const response = await fetch('https://items-api-ivory.vercel.app/api/products/brands');
  if (!response.ok) {
    throw new Error('Failed to fetch brands');
  }
  return response.json();
}
