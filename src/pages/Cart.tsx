import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, User, ShoppingCart, Tag, Search, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useAuth } from "@/context/AuthContext";
import SignInModal from "@/components/SignInModal";
import Navbar from "@/components/Navbar";

const Cart = () => {
  const navigate = useNavigate();
  useScrollToTop();
  const { isAuthenticated, user } = useAuth();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Lakers LeBron James Jersey",
      price: 120.00,
      originalPrice: 150.00,
      quantity: 1,
      size: "L",
      color: "Purple",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Yankees Baseball Cap",
      price: 30.00,
      originalPrice: 45.00,
      quantity: 2,
      size: "One Size",
      color: "Navy",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Chiefs Travis Kelce T-Shirt",
      price: 35.00,
      originalPrice: 50.00,
      quantity: 1,
      size: "M",
      color: "Red",
      image: "/placeholder.svg"
    }
  ]);

  const [promoCode, setPromoCode] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setIsSignInModalOpen(true);
    }
  }, [isAuthenticated]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setCartItems(cartItems.filter(item => item.id !== id));
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = 9.99;
  const estimatedTax = subtotal * 0.08;
  const total = subtotal + shipping + estimatedTax;

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Component */}
      <Navbar />

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">Information</span>
            </div>
            <div className="w-12 h-px bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm text-gray-500">Shipping</span>
            </div>
            <div className="w-12 h-px bg-gray-200"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-gray-500">Payment</span>
            </div>
          </div>
        </div>

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
              <h2 className="text-2xl font-medium text-gray-900 mb-8">Shopping Cart</h2>
              {cartItems.map((item, index) => (
                <div
                  key={item.id}
                  className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80 p-4 md:p-6 transition-all duration-300 hover:border-gray-200/80"
                >
                  <div className="flex items-center gap-4">
                    {/* Product Image with number badge */}
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-50/80 rounded-lg overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-100/80 to-gray-200/80"></div>
                      <Badge className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
                        {item.quantity}
                      </Badge>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-medium text-lg text-gray-900 mb-2">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        Size: {item.size} • Color: {item.color}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-lg font-semibold text-gray-900">
                          ${item.price.toFixed(2)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 hover:bg-gray-50 border-gray-200"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-lg font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 hover:bg-gray-50 border-gray-200"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 ml-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-96">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80 p-6 sticky top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-medium">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Promo Code */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Gift card or discount code</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-0"
                      />
                      <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
                        Apply
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-gray-100" />

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">${shipping.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Estimated taxes</span>
                      <span className="font-medium">${estimatedTax.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator className="bg-gray-100" />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)} USD</span>
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
