import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  User,
  ShoppingCart,
  Heart,
  Settings,
  LogOut,
  Package,
  CreditCard,
  MapPin,
  Mail,
  Phone,
  Edit2,
  Camera,
  Search,
  Menu
} from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const Profile = () => {
  const navigate = useNavigate();
  useScrollToTop();
  const { user, isAuthenticated, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [userDetails, setUserDetails] = useState({
    phone: "",
    address: ""
  });
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Reset imageLoadFailed state if user or photoURL changes
  useEffect(() => {
    setImageLoadFailed(false);
  }, [user?.photoURL]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const orders = [
    {
      id: "ORD-001",
      date: "2024-03-15",
      status: "Delivered",
      total: 189.99,
      items: 3
    },
    {
      id: "ORD-002",
      date: "2024-03-10",
      status: "Processing",
      total: 89.99,
      items: 1
    }
  ];

  const wishlist = [
    {
      id: 1,
      name: "Premium Streetwear Hoodie",
      price: 89.99,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Urban Style Cargo Pants",
      price: 79.99,
      image: "/placeholder.svg"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Component */}
      <Navbar />

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border border-gray-100 bg-white">
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="w-24 h-24 bg-gray-50/80 rounded-full overflow-hidden flex items-center justify-center">
                      {user?.photoURL && !imageLoadFailed ? (
                        <img
                          src={user.photoURL}
                          alt={user.name || 'User'}
                          className="w-full h-full object-cover"
                          onError={() => setImageLoadFailed(true)}
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full border-gray-200 bg-white hover:bg-gray-50"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">{user?.name || 'User'}</h2>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>

                <Separator className="bg-gray-100 mb-6" />

                <nav className="space-y-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm font-medium ${activeTab === "profile"
                      ? "text-gray-900 bg-gray-50"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                    onClick={() => setActiveTab("profile")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm font-medium ${activeTab === "orders"
                      ? "text-gray-900 bg-gray-50"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                    onClick={() => setActiveTab("orders")}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Orders
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm font-medium ${activeTab === "wishlist"
                      ? "text-gray-900 bg-gray-50"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                    onClick={() => setActiveTab("wishlist")}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Wishlist
                  </Button>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start text-sm font-medium ${activeTab === "settings"
                      ? "text-gray-900 bg-gray-50"
                      : "text-gray-600 hover:bg-gray-50"
                      }`}
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </nav>

                <Separator className="bg-gray-100 my-6" />

                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card className="border border-gray-100 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-medium">Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Full Name</Label>
                        <div className="flex gap-2">
                          <Input
                            value={user?.name || ''}
                            className="bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-0"
                            readOnly
                          />
                          <Button variant="outline" size="icon" className="border-gray-200 hover:bg-gray-50">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Email</Label>
                        <div className="flex gap-2">
                          <Input
                            value={user?.email || ''}
                            className="bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-0"
                            readOnly
                          />
                          <Button variant="outline" size="icon" className="border-gray-200 hover:bg-gray-50">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Phone</Label>
                        <div className="flex gap-2">
                          <Input
                            value={userDetails.phone}
                            onChange={(e) => setUserDetails(prev => ({ ...prev, phone: e.target.value }))}
                            className="bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-0"
                            placeholder="Add phone number"
                          />
                          <Button variant="outline" size="icon" className="border-gray-200 hover:bg-gray-50">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Address</Label>
                        <div className="flex gap-2">
                          <Input
                            value={userDetails.address}
                            onChange={(e) => setUserDetails(prev => ({ ...prev, address: e.target.value }))}
                            className="bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-0"
                            placeholder="Add address"
                          />
                          <Button variant="outline" size="icon" className="border-gray-200 hover:bg-gray-50">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-100 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-medium">Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">•••• •••• •••• 4242</p>
                          <p className="text-xs text-gray-600">Expires 12/25</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <Card className="border border-gray-100 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-medium">Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80 p-6 transition-all duration-300 hover:border-gray-200/80"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.id}</p>
                            <p className="text-xs text-gray-600">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">${order.total}</p>
                            <p className="text-xs text-gray-600">{order.items} items</p>
                          </div>
                          <Badge className="bg-gray-100 text-gray-900 hover:bg-gray-200">
                            {order.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist" className="space-y-6">
                <Card className="border border-gray-100 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-medium">Saved Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {wishlist.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80 p-6 transition-all duration-300 hover:border-gray-200/80"
                        >
                          <div className="w-24 h-24 bg-gray-50/80 rounded-lg overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-gray-100/80 to-gray-200/80"></div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 mb-1">{item.name}</h3>
                            <p className="text-sm font-medium text-gray-900">${item.price}</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 border-gray-200 hover:bg-gray-50"
                            >
                              Add to Cart
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card className="border border-gray-100 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-medium">Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Email Notifications</Label>
                        <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">Order Updates</p>
                            <p className="text-xs text-gray-600">Get notified about your order status</p>
                          </div>
                          <Button variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50">
                            Enabled
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-gray-600">Password</Label>
                        <Button
                          variant="outline"
                          className="w-full border-gray-200 hover:bg-gray-50"
                        >
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
