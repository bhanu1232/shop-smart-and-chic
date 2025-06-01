import { createContext } from 'react';
import { User as FirebaseUser } from 'firebase/auth';

export interface User {
    id: string; // Firebase UID
    uid: string; // Explicitly add uid for clarity and type checking
    name: string | null;
    email: string | null;
    photoURL: string; // photoURL will always be a string with fallback
    displayName: string | null;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (userData: User) => void;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined); 