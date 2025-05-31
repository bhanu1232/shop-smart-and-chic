import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDzumEwtQtiH8J1GkO4NlPW8i5TIS2478Q",
  authDomain: "shop-3ca39.firebaseapp.com",
  projectId: "shop-3ca39",
  storageBucket: "shop-3ca39.firebasestorage.app",
  messagingSenderId: "189514635955",
  appId: "1:189514635955:web:61e3f47d72920394da2ec6",
  measurementId: "G-N4VLF1R1RZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app; 
