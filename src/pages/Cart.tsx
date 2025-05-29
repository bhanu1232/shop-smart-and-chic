
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Premium Streetwear Hoodie",
      price: 89.99,
      originalPrice: 129.99,
      quantity: 2,
      size: "L",
      color: "Black",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Urban Style Cargo Pants",
      price: 79.99,
      originalPrice: 99.99,
      quantity: 1,
      size: "M",
      color: "Khaki",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Classic Denim Jacket",
      price: 119.99,
      originalPrice: 159.99,
      quantity: 1,
      size: "L",
      color: "Blue",
      image: "/placeholder.svg"
    }
  ]);

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
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
              <a href="/" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Home</a>
              <a href="/products" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Products</a>
              <a href="/about" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">About</a>
              <a href="/cart" className="text-gray-900 font-bold">Cart</a>
            </nav>
            <Button className="bg-gray-900 hover:bg-gray-800">Sign In</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/products')}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600">{cartItems.length} items in your cart</p>
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
              className="bg-gray-900 hover:bg-gray-800 hover:scale-105 transition-all duration-300"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item, index) => (
                <Card 
                  key={item.id}
                  className="hover:shadow-lg transition-all duration-300 border-0 bg-white"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                            {item.name}
                          </h3>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex gap-4 mb-3">
                          <Badge variant="outline">Size: {item.size}</Badge>
                          <Badge variant="outline">Color: {item.color}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-gray-900">
                              ${item.price}
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              ${item.originalPrice}
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3">
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-24 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  {shipping > 0 && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-700">
                        Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                      </p>
                    </div>
                  )}

                  <Button 
                    className="w-full bg-gray-900 hover:bg-gray-800 hover:scale-105 transition-all duration-300"
                    onClick={() => navigate('/checkout')}
                  >
                    Proceed to Checkout
                  </Button>

                  <Button 
                    variant="outline" 
                    className="w-full hover:bg-gray-50"
                    onClick={() => navigate('/products')}
                  >
                    Continue Shopping
                  </Button>

                  <div className="text-center">
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                      <Heart className="h-4 w-4 mr-2" />
                      Save for Later
                    </Button>
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
