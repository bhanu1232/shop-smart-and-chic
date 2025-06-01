import { db } from "@/config/firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, updateDoc, query, where } from "firebase/firestore";

interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// Define a type for wishlist items - assuming structure similar to product data
export interface WishlistItem {
  id: string; // Firestore document ID (should match product ID)
  title: string;
  thumbnail: string;
  price: number;
  category: string;
  // Add other relevant product fields you want to store
}

export interface CartItem {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  quantity: number;
}

export interface OrderItem extends CartItem {
  orderDate: string;
  status: 'placed' | 'processing' | 'shipped' | 'delivered';
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
    address: string;
  };
  paymentMethod: string;
  orderDate: string;
  status: 'placed' | 'processing' | 'shipped' | 'delivered';
  paymentId?: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
}

// Function to get user profile data from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data() as UserProfile;
  } else {
    // Document doesn't exist
    return null;
  }
};

// Function to set or update user profile data in Firestore
export const setUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
  const userDocRef = doc(db, "users", uid);
  await setDoc(userDocRef, data, { merge: true });
};

// Function to add an item to a user's wishlist
export const addWishlistItem = async (userId: string, item: WishlistItem): Promise<void> => {
  const itemDocRef = doc(db, "users", userId, "wishlist", item.id);
  await setDoc(itemDocRef, item);
};

// Function to remove an item from a user's wishlist
export const removeWishlistItem = async (userId: string, itemId: string): Promise<void> => {
  const itemDocRef = doc(db, "users", userId, "wishlist", itemId);
  await deleteDoc(itemDocRef);
};

// Function to fetch all items in a user's wishlist
export const getWishlistItems = async (userId: string): Promise<WishlistItem[]> => {
  const wishlistCollectionRef = collection(db, "users", userId, "wishlist");
  const querySnapshot = await getDocs(wishlistCollectionRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WishlistItem));
};

// Function to check if an item is in a user's wishlist
export const isItemInWishlist = async (userId: string, itemId: string): Promise<boolean> => {
  const itemDocRef = doc(db, "users", userId, "wishlist", itemId);
  const itemDocSnap = await getDoc(itemDocRef);
  return itemDocSnap.exists();
};

// Cart Functions
export const addToCart = async (userId: string, product: {
  id: string;
  title: string;
  thumbnail: string;
  price: number;
  quantity: number;
}) => {
  const cartRef = doc(db, 'carts', userId);
  const cartDoc = await getDoc(cartRef);

  if (!cartDoc.exists()) {
    // Create new cart if it doesn't exist
    await setDoc(cartRef, {
      items: [product]
    });
  } else {
    // Update existing cart
    const cartData = cartDoc.data();
    const existingItemIndex = cartData.items.findIndex((item: CartItem) => item.id === product.id);

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      const updatedItems = [...cartData.items];
      updatedItems[existingItemIndex].quantity += product.quantity;
      await updateDoc(cartRef, { items: updatedItems });
    } else {
      // Add new item if it doesn't exist
      await updateDoc(cartRef, {
        items: [...cartData.items, product]
      });
    }
  }
};

export const removeFromCart = async (userId: string, productId: string) => {
  const cartRef = doc(db, 'carts', userId);
  const cartDoc = await getDoc(cartRef);

  if (cartDoc.exists()) {
    const cartData = cartDoc.data();
    const updatedItems = cartData.items.filter((item: CartItem) => item.id !== productId);
    await updateDoc(cartRef, { items: updatedItems });
  }
};

export const getCartItems = async (userId: string) => {
  const cartRef = doc(db, 'carts', userId);
  const cartDoc = await getDoc(cartRef);

  if (cartDoc.exists()) {
    return cartDoc.data().items;
  }
  return [];
};

export const isItemInCart = async (userId: string, productId: string) => {
  const cartRef = doc(db, 'carts', userId);
  const cartDoc = await getDoc(cartRef);

  if (cartDoc.exists()) {
    const cartData = cartDoc.data();
    return cartData.items.some((item: CartItem) => item.id === productId);
  }
  return false;
};

export const createOrder = async (userId: string, orderData: Omit<Order, 'id'>): Promise<string> => {
  const ordersRef = collection(db, 'orders');
  const newOrderRef = doc(ordersRef);
  const orderId = newOrderRef.id;

  await setDoc(newOrderRef, {
    ...orderData,
    id: orderId,
    userId,
    orderDate: new Date().toISOString(),
    status: 'pending'
  });

  return orderId;
};

export const clearCart = async (userId: string): Promise<void> => {
  const cartRef = doc(db, 'carts', userId);
  await setDoc(cartRef, { items: [] });
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Order));
}; 