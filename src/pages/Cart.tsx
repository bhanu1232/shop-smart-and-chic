import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, User, ShoppingCart, Tag, Search, Menu, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useAuth } from "@/context/AuthContext";
import SignInModal from "@/components/SignInModal";
import Navbar from "@/components/Navbar";
import { getCartItems, removeFromCart } from "@/firebase/firestore";
import { CartItem } from "@/firebase/firestore";
import { toast } from "sonner";

const Cart = () => {
  const navigate = useNavigate();
  useScrollToTop();
  const { isAuthenticated, user } = useAuth();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false);
        return;
      }

      try {
        const items = await getCartItems(user.uid);
        setCartItems(items);
      } catch (error) {
        console.error("Error fetching cart items:", error);
        toast.error("Failed to load cart items");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [isAuthenticated, user]);

  const handleRemoveItem = async (productId: string) => {
    if (!isAuthenticated || !user) return;

    setUpdating(productId);
    try {
      await removeFromCart(user.uid, productId);
      setCartItems(prev => prev.filter(item => item.id !== productId));
      toast.success("Item removed from cart");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdating(null);
    }
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navbar Component */}
        <Navbar />

        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="text-center py-20">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-200 mb-6" />
            <h2 className="text-2xl font-medium text-gray-900 mb-3">Please Sign In</h2>
            <p className="text-gray-600 mb-8">You need to be signed in to view your cart</p>
            <Button
              onClick={() => setIsSignInModalOpen(true)}
              className="bg-gray-900 hover:bg-gray-800 hover:scale-105 transition-all duration-300 text-sm px-8 py-6"
            >
              Sign In
            </Button>
          </div>
        </div>

        <SignInModal
          isOpen={isSignInModalOpen}
          onClose={() => {
            setIsSignInModalOpen(false);
            if (!isAuthenticated) {
              navigate('/');
            }
          }}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Component */}
      <div className="h-[70px]">
        <Navbar />
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl">

        {cartItems.length === 0 ? (
          // Empty Cart
          <div className="text-center py-20">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-200 mb-6" />
            <h2 className="text-2xl font-medium text-gray-900 mb-3">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet</p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-gray-900 hover:bg-gray-800 hover:scale-105 transition-all duration-300 text-sm px-8 py-6"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="mb-4">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-gray-600">${item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            className="w-20"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={updating === item.id}
                          >
                            {updating === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-96">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80 p-6 sticky top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-medium">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                  </div>

                  <Separator className="bg-gray-100" />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  <Button
                    className="w-full bg-gray-900/90 hover:bg-gray-800/90 transition-all duration-300"
                    onClick={() => navigate('/checkout')}
                  >
                    Complete Order
                  </Button>

                  <div className="text-center text-xs text-gray-500">
                    All transactions are secure and encrypted.
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        )}
      </div>

      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
      />
    </div>
  );
};

export default Cart;
