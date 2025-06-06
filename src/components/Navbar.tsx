import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import SignInModal from "@/components/SignInModal";
import { db } from "@/config/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        let unsubscribe = () => { }; // Initialize with a no-op function

        if (isAuthenticated && user?.uid) {
            const userId = user.uid;
            const cartCollectionRef = collection(db, "cart");
            const userCartQuery = query(cartCollectionRef, where("userId", "==", userId));

            unsubscribe = onSnapshot(userCartQuery, (snapshot) => {
                let count = 0;
                snapshot.forEach((doc) => {
                    // Assuming each document in the cart collection has a 'quantity' field
                    const item = doc.data();
                    if (item && typeof item.quantity === 'number') {
                        count += item.quantity;
                    }
                });
                setCartCount(count);
            }, (error) => {
                console.error("Error fetching cart count:", error);
                // Optionally reset cart count or show an error toast
                setCartCount(0);
            });
        }

        // Cleanup function to unsubscribe from the listener
        return () => unsubscribe();
    }, [isAuthenticated, user?.uid]); // Re-run effect if auth state or user changes

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white backdrop-blur-sm border-b">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div
                        className="text-2xl font-bold max-sm:text-lg text-slate-900 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        Sun_fashion
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Button variant="ghost" onClick={() => navigate('/products')}>
                            Products
                        </Button>
                        <Button variant="ghost" onClick={() => navigate('/about')}>
                            About
                        </Button>
                        <Button variant="ghost" onClick={() => navigate('/contact')}>
                            Contact
                        </Button>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="relative"
                            onClick={() => navigate('/cart')}
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {isAuthenticated && cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-slate-900 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {cartCount}
                                </span>
                            )}
                        </Button>

                        {isAuthenticated ? (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/profile')}
                            >
                                {user?.photoURL ? (
                                    <img
                                        src={user.photoURL}
                                        alt="Profile"
                                        className="w-6 h-6 rounded-full"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://ui-avatars.com/api/?name=User";
                                        }}
                                    />
                                ) : (
                                    <User className="h-5 w-5" />
                                )}
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                onClick={() => setIsSignInModalOpen(true)}
                            >
                                Sign In
                            </Button>
                        )}

                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <Menu className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t">
                        <div className="flex flex-col gap-2">
                            <Button variant="ghost" onClick={() => navigate('/products')}>
                                Products
                            </Button>
                            <Button variant="ghost" onClick={() => navigate('/about')}>
                                About
                            </Button>
                            <Button variant="ghost" onClick={() => navigate('/contact')}>
                                Contact
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <SignInModal
                isOpen={isSignInModalOpen}
                onClose={() => setIsSignInModalOpen(false)}
            />
        </nav>
    );
};

export default Navbar;
