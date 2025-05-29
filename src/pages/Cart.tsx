
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, User, ShoppingCart, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Same as homepage */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100 transition-colors"
                onClick={() => navigate('/cart')}
              >
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {cartItems.length}
                </Badge>
              </Button>
              <Button 
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100 transition-colors"
                onClick={() => navigate('/profile')}
              >
                <User className="h-5 w-5" />
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Login</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="ml-2 text-sm font-medium text-blue-600">Information</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="ml-2 text-sm text-gray-500">Shipping</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="ml-2 text-sm text-gray-500">Payment</span>
            </div>
          </div>
        </div>

        {cartItems.length === 0 ? (
          // Empty Cart
          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added anything to your cart yet</p>
            <Button 
              onClick={() => navigate('/products')}
              className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h2>
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <Card 
                    key={item.id}
                    className="hover:shadow-lg transition-all duration-300 border bg-white overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {/* Product Image with number badge */}
                        <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                          <Badge className="absolute -top-2 -left-2 h-6 w-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                            {item.quantity}
                          </Badge>
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            Size: {item.size} • Color: {item.color}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-gray-900">
                              ${item.price.toFixed(2)}
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 hover:bg-gray-100"
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
                                className="h-8 w-8 hover:bg-gray-100"
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
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Continue Shopping */}
              <Button
                variant="ghost"
                onClick={() => navigate('/products')}
                className="mt-6 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to cart
              </Button>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24 border shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Promo Code */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-600">Gift card or discount code</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter code"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm">
                        Apply
                      </Button>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated taxes (?)</span>
                    <span className="font-medium">${estimatedTax.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)} USD</span>
                  </div>

                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300 py-3"
                    onClick={() => navigate('/checkout')}
                  >
                    Complete Order
                  </Button>

                  <div className="text-center text-xs text-gray-500">
                    All transactions are secure and encrypted.
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
