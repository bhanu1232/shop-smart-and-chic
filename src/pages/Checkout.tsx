import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getCartItems, createOrder, clearCart } from "@/firebase/firestore";
import { CartItem, Order } from "@/firebase/firestore";
import { toast } from "sonner";
import { Loader2, Check, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

const RAZORPAY_KEY_ID = "rzp_test_pchob9uGTCiVc5";

const Checkout = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: ""
  });

  const steps = [
    { id: 1, name: "Information", description: "Contact & Shipping" },
    { id: 2, name: "Payment", description: "Complete Payment" }
  ];

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

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) return;

    setProcessing(true);
    try {
      // Create order
      const orderData: Omit<Order, 'id'> = {
        userId: user.uid,
        items: cartItems.map(item => ({
          ...item,
          orderDate: new Date().toISOString(),
          status: 'pending'
        })),
        total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        shippingAddress,
        paymentMethod: 'razorpay',
        orderDate: new Date().toISOString(),
        status: 'pending'
      };

      const orderId = await createOrder(user.uid, orderData);

      // Clear cart
      await clearCart(user.uid);

      toast.success("Order placed successfully!");
      navigate(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error("Failed to process order");
    } finally {
      setProcessing(false);
    }
  };

  const handlePayment = async () => {
    if (!isAuthenticated || !user) return;

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY_ID,
      amount: subtotal * 100,
      currency: "INR",
      name: "Shop Smart & Chic",
      description: "Payment for your order",
      handler: async function (response: RazorpayResponse) {
        try {
          setProcessing(true);
          const orderData: Omit<Order, 'id'> = {
            userId: user.uid,
            items: cartItems.map(item => ({
              ...item,
              orderDate: new Date().toISOString(),
              status: 'pending'
            })),
            total: subtotal,
            shippingAddress,
            paymentMethod: 'razorpay',
            orderDate: new Date().toISOString(),
            status: 'pending',
            paymentId: response.razorpay_payment_id,
            paymentStatus: 'completed'
          };

          const orderId = await createOrder(user.uid, orderData);
          await clearCart(user.uid);

          toast.success("Payment successful! Order placed.");
          navigate('/'); // Navigate to home page after successful payment
        } catch (error) {
          console.error("Error processing order:", error);
          toast.error("Failed to process order");
        } finally {
          setProcessing(false);
        }
      },
      modal: {
        ondismiss: function () {
          toast.error("Payment cancelled");
          setCurrentStep(2);
        }
      },
      prefill: {
        name: user.displayName || "",
        email: user.email || "",
        contact: ""
      },
      theme: {
        color: "#000000"
      }
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error initializing Razorpay:", error);
      toast.error("Failed to initialize payment gateway");
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="text-center py-20">
            <h2 className="text-2xl font-medium text-gray-900 mb-3">Please Sign In</h2>
            <p className="text-gray-600 mb-8">You need to be signed in to checkout</p>
            <Button onClick={() => navigate('/signin')}>Sign In</Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${currentStep >= step.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-200 text-gray-600"
                    }`}>
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-semibold ${currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                      }`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${currentStep > step.id ? "bg-gray-900" : "bg-gray-200"
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Step 1: Information */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        name="street"
                        value={shippingAddress.street}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        name="zipCode"
                        value={shippingAddress.zipCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={shippingAddress.country}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <Button onClick={() => {
                    nextStep();
                    setTimeout(handlePayment, 100);
                  }} className="w-full mt-4">
                    Continue to Payment
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment Status */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Payment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">Please complete your payment to place the order.</p>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={prevStep} className="flex-1">
                      Back
                    </Button>
                    <Button
                      onClick={handlePayment}
                      className="flex-1"
                      disabled={processing || cartItems.length === 0}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Pay Now"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
