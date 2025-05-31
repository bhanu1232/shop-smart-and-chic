import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, User, Search, Menu } from "lucide-react";
import SignInModal from "./SignInModal";
import { useAuth } from "@/context/AuthContext";

const Navbar = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
    const [imageLoadFailed, setImageLoadFailed] = useState(false);

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

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/80">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-8">
                            <h1
                                className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent cursor-pointer"
                                onClick={() => navigate('/')}
                            >
                                Skena.co
                            </h1>
                            <nav className="hidden md:flex space-x-6">
                                <button onClick={() => navigate('/')} className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Home</button>
                                <button onClick={() => navigate('/products')} className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Products</button>
                                <button onClick={() => navigate('/about')} className="text-gray-700 hover:text-gray-900 transition-colors font-medium">About</button>
                            </nav>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative hidden md:block">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400/80 h-4 w-4" />
                                <Input
                                    placeholder="Search products..."
                                    className="pl-10 w-64 bg-gray-50/80 border-gray-200/80 focus:border-gray-400/80"
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="relative hover:bg-gray-100 transition-colors"
                                onClick={handleCartClick}
                            >
                                <ShoppingCart className="h-5 w-5" />
                                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
                                    3
                                </Badge>
                            </Button>
                            <div className="flex items-center">
                                {isAuthenticated ? (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:bg-gray-100 transition-colors"
                                        onClick={() => navigate('/profile')}
                                    >
                                        <div className="relative flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 overflow-hidden">
                                            <img
                                                src={user?.photoURL || ''}
                                                alt={user?.name || 'User'}
                                                className={`h-full w-full object-cover ${(!user?.photoURL || imageLoadFailed) ? 'hidden' : ''}`}
                                                onError={() => setImageLoadFailed(true)}
                                            />
                                            <User className={`h-5 w-5 text-gray-600 ${(!user?.photoURL || imageLoadFailed) ? '' : 'hidden'}`} />
                                        </div>
                                    </Button>
                                ) : (
                                    <Button
                                        className="hidden md:inline-flex bg-gray-900 hover:bg-gray-800 transition-colors"
                                        onClick={() => setIsSignInModalOpen(true)}
                                    >
                                        Sign In
                                    </Button>
                                )}
                            </div>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
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