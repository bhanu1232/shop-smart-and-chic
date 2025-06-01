
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User, Search, Menu, X, Home, Package, Info } from "lucide-react";
import SignInModal from "./SignInModal";
import { useAuth } from "@/context/AuthContext";
import { getCartItems } from "@/firebase/firestore";
import { CartItem } from "@/firebase/firestore";

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
        { name: "Products", path: "/products", icon: Package },
        { name: "About", path: "/about", icon: Info },
    ];

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <h1
                                className="text-2xl font-bold text-slate-900 cursor-pointer hover:text-slate-700 transition-colors"
                                onClick={() => navigate('/')}
                            >
                                Skena.co
                            </h1>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            {menuItems.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => navigate(item.path)}
                                    className="text-slate-700 hover:text-slate-900 font-medium transition-colors duration-200 relative group"
                                >
                                    {item.name}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-200 group-hover:w-full"></span>
                                </button>
                            ))}
                        </nav>

                        {/* Desktop Search */}
                        <div className="hidden lg:flex items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <Input
                                    placeholder="Search clothing..."
                                    className="pl-10 w-64 bg-slate-50 border-slate-200 focus:border-slate-400 focus:ring-0"
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Cart */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative hover:bg-slate-100 transition-colors"
                                onClick={handleCartClick}
                            >
                                <ShoppingCart className="h-5 w-5 text-slate-700" />
                                {cartCount > 0 && (
                                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center">
                                        {cartCount}
                                    </Badge>
                                )}
                            </Button>

                            {/* User Account */}
                            {isAuthenticated ? (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="hover:bg-slate-100 transition-colors"
                                    onClick={() => navigate('/profile')}
                                >
                                    <div className="relative flex items-center justify-center h-6 w-6 rounded-full bg-slate-200 overflow-hidden">
                                        <img
                                            src={user?.photoURL || ''}
                                            alt={user?.name || 'User'}
                                            className={`h-full w-full object-cover ${(!user?.photoURL || imageLoadFailed) ? 'hidden' : ''}`}
                                            onError={() => setImageLoadFailed(true)}
                                        />
                                        <User className={`h-4 w-4 text-slate-600 ${(!user?.photoURL || imageLoadFailed) ? '' : 'hidden'}`} />
                                    </div>
                                </Button>
                            ) : (
                                <Button
                                    className="hidden md:inline-flex bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                                    onClick={() => setIsSignInModalOpen(true)}
                                >
                                    Sign In
                                </Button>
                            )}

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden hover:bg-slate-100 transition-colors"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-5 w-5 text-slate-700" />
                                ) : (
                                    <Menu className="h-5 w-5 text-slate-700" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden bg-white border-t border-slate-200">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                {/* Mobile Search */}
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search clothing..."
                                        className="pl-10 w-full bg-slate-50 border-slate-200 focus:border-slate-400 focus:ring-0"
                                    />
                                </div>

                                {/* Mobile Navigation */}
                                {menuItems.map((item) => (
                                    <button
                                        key={item.name}
                                        onClick={() => {
                                            navigate(item.path);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="flex items-center space-x-3 w-full px-3 py-2 text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </button>
                                ))}

                                {/* Mobile Sign In */}
                                {!isAuthenticated && (
                                    <Button
                                        className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white"
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
