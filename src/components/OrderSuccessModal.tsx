
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CartItem } from "@/firebase/firestore";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderItems: CartItem[];
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
}

const OrderSuccessModal = ({ 
  isOpen, 
  onClose, 
  orderId, 
  orderItems, 
  total, 
  shippingAddress 
}: OrderSuccessModalProps) => {
  const navigate = useNavigate();

  const handleViewOrders = () => {
    onClose();
    navigate('/profile'); // Navigate to orders page (profile contains order history)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Order Successful!
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order ID */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Order ID</p>
            <p className="font-mono text-sm font-medium text-gray-900">{orderId}</p>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Order Items
            </h3>
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-lg text-gray-900">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-900">{shippingAddress.street}</p>
              <p className="text-sm text-gray-900">
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
              </p>
              <p className="text-sm text-gray-900">{shippingAddress.country}</p>
              <p className="text-sm text-gray-600 mt-2">Phone: {shippingAddress.phone}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={handleViewOrders}
              className="flex-1 bg-gray-900 hover:bg-gray-800"
            >
              View Orders
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderSuccessModal;
