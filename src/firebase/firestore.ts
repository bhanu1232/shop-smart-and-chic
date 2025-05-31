import { db } from "@/config/firebase";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

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