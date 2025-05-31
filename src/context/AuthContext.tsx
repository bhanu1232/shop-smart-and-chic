import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';

interface User {
    id: string;
    name: string;
    email: string;
    photoURL?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (userData: User) => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                setUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || '',
                    email: firebaseUser.email || '',
                    photoURL: firebaseUser.photoURL || ''
                });
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const signIn = (userData: User) => {
        setUser(userData);
    };

    const signOut = () => {
        auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
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