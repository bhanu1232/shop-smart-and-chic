import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/config/firebase';

interface User {
    id: string; // Firebase UID
    uid: string; // Explicitly add uid for clarity and type checking
    name: string | null;
    email: string | null;
    photoURL: string | null;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (userData: User) => void;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in
                const appUser: User = {
                    id: firebaseUser.uid,
                    uid: firebaseUser.uid, // Map uid here
                    name: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL,
                };
                setUser(appUser);
                setIsAuthenticated(true);
            } else {
                // User is signed out
                setUser(null);
                setIsAuthenticated(false);
            }
        });

        // Clean up the subscription
        return () => unsubscribe();
    }, []);

    const signIn = (userData: User) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error; // Re-throw to be caught by the component
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 