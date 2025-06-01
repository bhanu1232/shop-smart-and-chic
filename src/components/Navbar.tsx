
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User, Menu, X, Home, Package, Info } from "lucide-react";
import SignInModal from "./SignInModal";
import { useAuth } from "@/context/AuthContext";
import { getCartItems } from "@/firebase/firestore";

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleCartClick = () => {
        if (!isAuthenticated) {
            setIsSignInModalOpen(true);
        } else {
            navigate('/cart');
        }
    };

    // Reset imageLoadFailed state if user or photoURL changes
    useEffect(() => {
        setImageLoadFailed(false);
    }, [user?.photoURL]);

    useEffect(() => {
        const fetchCartCount = async () => {
            if (!isAuthenticated || !user) {
                setCartCount(0);
                return;
            }

            try {
                const cartItems = await getCartItems(user.uid);
                const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalItems);
            } catch (error) {
                console.error("Error fetching cart count:", error);
            }
        };

        fetchCartCount();
    }, [isAuthenticated, user]);

    const menuItems = [
        { name: "Home", path: "/", icon: Home },
        { name: "About", path: "/about", icon: Info },
    ];

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        {/* Logo */}
                        <div className="flex items-center">
                            <h1
                                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-gray-700 transition-colors"
                                onClick={() => navigate('/')}
                            >
                                Strendzy
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-6">
                            {menuItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => navigate(item.path)}
                                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200"
                                >
                                    {item.name}
                                </button>
                            ))}
                            <button
                                onClick={() => navigate('/products')}
                                className="text-gray-700 hover:text-gray-900 font-medium transition-colors duration-200 flex items-center space-x-1"
                            >
                                <span>Pages</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </nav>

                        {/* Right Actions */}
                        <div className="flex items-center space-x-3">
                            {/* Cart */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative hover:bg-gray-100 transition-colors h-9 w-9"
                                onClick={handleCartClick}
                            >
                                <ShoppingCart className="h-4 w-4 text-gray-700" />
                                {cartCount > 0 && (
                                    <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center text-[10px] min-w-[16px]">
                                        {cartCount}
                                    </Badge>
                                )}
                            </Button>

                            {/* User Account */}
                            {isAuthenticated ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-gray-100 transition-colors h-9 w-9"
                                    onClick={() => navigate('/profile')}
                                >
                                    <div className="relative flex items-center justify-center h-5 w-5 rounded-full bg-gray-200 overflow-hidden">
                                        <img
                                            src={user?.photoURL || ''}
                                            alt={user?.name || 'User'}
                                            className={`h-full w-full object-cover ${(!user?.photoURL || imageLoadFailed) ? 'hidden' : ''}`}
                                            onError={() => setImageLoadFailed(true)}
                                        />
                                        <User className={`h-3 w-3 text-gray-600 ${(!user?.photoURL || imageLoadFailed) ? '' : 'hidden'}`} />
                                    </div>
                                </Button>
                            ) : (
                                <Button
                                    className="hidden md:inline-flex bg-gray-900 hover:bg-gray-800 text-white transition-colors h-8 px-4 text-sm"
                                    onClick={() => setIsSignInModalOpen(true)}
                                >
                                    Sign In
                                </Button>
                            )}

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden hover:bg-gray-100 transition-colors h-9 w-9"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-4 w-4 text-gray-700" />
                                ) : (
                                    <Menu className="h-4 w-4 text-gray-700" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden bg-white border-t border-gray-200">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {/* Mobile Navigation */}
                                {menuItems.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => {
                                            navigate(item.path);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center space-x-3 w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </button>
                                ))}
                                
                                <button
                                    onClick={() => {
                                        navigate('/products');
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center space-x-3 w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                                >
                                    <Package className="h-5 w-5" />
                                    <span>Products</span>
                                </button>

                                {/* Mobile Sign In */}
                                {!isAuthenticated && (
                                    <Button
                                        className="w-full mt-4 bg-gray-900 hover:bg-gray-800 text-white"
                                        onClick={() => {
                                            setIsSignInModalOpen(true);
                                            setIsMobileMenuOpen(false);
                                        }}
                                    >
                                        Sign In
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            <SignInModal
                isOpen={isSignInModalOpen}
                onClose={() => setIsSignInModalOpen(false)}
            />
        </>
    );
};

export default Navbar;
