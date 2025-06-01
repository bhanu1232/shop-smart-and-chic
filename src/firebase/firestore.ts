import { db } from "@/config/firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, updateDoc, query, where, writeBatch } from "firebase/firestore";

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
  orderDate?: string; // Made optional as it might be set in the order creation process
  status?: 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Added cancelled status and made optional
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
  orderDate: string; // This will be the timestamp of the order creation
  status: 'pending' | 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Added pending status
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
export const addToCart = async (userId: string, product: CartItem): Promise<void> => {
  const itemDocRef = doc(db, "users", userId, "cart", product.id);
  const itemDocSnap = await getDoc(itemDocRef);

  if (itemDocSnap.exists()) {
    // Item exists, update quantity
    const existingItem = itemDocSnap.data() as CartItem;
    await updateDoc(itemDocRef, {
      quantity: existingItem.quantity + product.quantity
    });
  } else {
    // Item does not exist, add new item
    await setDoc(itemDocRef, product);
  }
};

export const removeFromCart = async (userId: string, productId: string): Promise<void> => {
  const itemDocRef = doc(db, "users", userId, "cart", productId);
  await deleteDoc(itemDocRef);
};

export const getCartItems = async (userId: string): Promise<CartItem[]> => {
  const cartCollectionRef = collection(db, "users", userId, "cart");
  const querySnapshot = await getDocs(cartCollectionRef);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
};

export const isItemInCart = async (userId: string, productId: string): Promise<boolean> => {
  const itemDocRef = doc(db, "users", userId, "cart", productId);
  const itemDocSnap = await getDoc(itemDocRef);
  return itemDocSnap.exists();
};

export const clearCart = async (userId: string): Promise<void> => {
  const cartCollectionRef = collection(db, "users", userId, "cart");
  const querySnapshot = await getDocs(cartCollectionRef);
  
  // Use a batch write for efficiency if clearing many items
  const batch = writeBatch(db);
  querySnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
};

export const createOrder = async (userId: string, orderData: Omit<Order, 'id'>): Promise<string> => {
  const userOrdersCollectionRef = collection(db, "users", userId, "orders");
  const newOrderRef = doc(userOrdersCollectionRef);
  const orderId = newOrderRef.id;

  await setDoc(newOrderRef, {
    ...orderData,
    id: orderId,
    userId,
    orderDate: new Date().toISOString(),
    status: orderData.status || 'placed', // Use provided status or default to placed
  });

  return orderId;
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  const userOrdersCollectionRef = collection(db, "users", userId, "orders");
  const querySnapshot = await getDocs(userOrdersCollectionRef);
  
  // Map Firestore documents to Order type, including the document id
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Order));
}; 