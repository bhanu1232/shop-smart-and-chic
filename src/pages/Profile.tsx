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
  Menu,
  XCircle,
  Trash2,
  Loader2
} from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { getUserProfile, setUserProfile, getWishlistItems, removeWishlistItem, WishlistItem, getOrders, Order } from "@/firebase/firestore";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  useScrollToTop();
  const { user, isAuthenticated, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: "",
    address: ""
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userProfile = await getUserProfile(user.uid);
        if (userProfile) {
          setProfileData({
            name: userProfile.name || user.name || '',
            email: userProfile.email || user.email || '',
            phone: userProfile.phone || '',
            address: userProfile.address || ''
          });
        } else {
          setProfileData({
            name: user.name || '',
            email: user.email || '',
            phone: '',
            address: '',
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setWishlistItems([]);
      return;
    }

    const fetchWishlist = async () => {
      setLoadingWishlist(true);
      try {
        const items = await getWishlistItems(user.uid);
        setWishlistItems(items);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        toast.error("Failed to load wishlist.");
      } finally {
        setLoadingWishlist(false);
      }
    };

    fetchWishlist();
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setOrders([]);
      return;
    }

    const fetchOrders = async () => {
      setLoadingOrders(true);
      try {
        const userOrders = await getOrders(user.uid);
        setOrders(userOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders.");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleEditClick = () => {
    setIsEditingProfile(true);
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setUserProfile(user.uid, {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
      });
      toast.success("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveFromWishlist = async (itemId: string) => {
    if (!user) return;
    setRemovingItemId(itemId);
    try {
      await removeWishlistItem(user.uid, itemId);
      setWishlistItems(prevItems => prevItems.filter(item => item.id !== itemId));
      toast.success("Item removed from wishlist.");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove item from wishlist.");
    } finally {
      setRemovingItemId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error("Failed to sign out.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.name || 'User'}
                          className="w-full h-full object-cover"
                          onError={(e) => e.currentTarget.src = ''}
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">{profileData.name || 'User'}</h2>
                  <p className="text-sm text-gray-600">{profileData.email || 'No email'}</p>
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
                    Wishlist ({loadingWishlist ? '...' : wishlistItems.length})
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
                  <CardHeader className="pb-4 flex flex-row items-center justify-between">
                    <CardTitle className="text-xl font-medium">Personal Information</CardTitle>
                    {!isEditingProfile ? (
                      <Button variant="outline" size="sm" onClick={handleEditClick}>
                        Edit Profile
                      </Button>
                    ) : null}
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm text-gray-600">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={handleInputChange}
                          className={`bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-0 ${!isEditingProfile ? 'read-only:bg-gray-100 read-only:cursor-not-allowed' : ''
                            }`}
                          placeholder="Enter your name"
                          readOnly={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm text-gray-600">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          readOnly
                          className="bg-gray-50/80 border-gray-200/80 cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm text-gray-600">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          className={`bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-0 ${!isEditingProfile ? 'read-only:bg-gray-100 read-only:cursor-not-allowed' : ''
                            }`}
                          placeholder="Add phone number"
                          readOnly={!isEditingProfile}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-sm text-gray-600">Address</Label>
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={handleInputChange}
                          className={`bg-gray-50 border-gray-200 focus:border-gray-300 focus:ring-0 ${!isEditingProfile ? 'read-only:bg-gray-100 read-only:cursor-not-allowed' : ''
                            }`}
                          placeholder="Add address"
                          readOnly={!isEditingProfile}
                        />
                      </div>
                    </div>

                    {isEditingProfile ? (
                      <div className="flex justify-end">
                        <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-gray-900 hover:bg-gray-800 transition-colors">
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                {/* Payment Methods - Static for now */}
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

              {/* Orders Tab - Fetching data from Firebase */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingOrders ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">No orders found</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {orders.map((order) => (
                          <Card key={order.id} className="border border-gray-100">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                                    <Badge className={getStatusColor(order.status)}>
                                      {order.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    Placed on {new Date(order.orderDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex flex-col md:items-end gap-1">
                                  <p className="font-semibold">${order.total.toFixed(2)}</p>
                                  <p className="text-sm text-gray-500">
                                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                  </p>
                                </div>
                              </div>
                              <Separator className="my-4" />
                              <div className="space-y-3">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-4">
                                    <img
                                      src={item.thumbnail}
                                      alt={item.title}
                                      className="w-16 h-16 object-cover rounded-md"
                                    />
                                    <div className="flex-1">
                                      <p className="font-medium">{item.title}</p>
                                      <p className="text-sm text-gray-500">
                                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                                      </p>
                                    </div>
                                    <p className="font-medium">
                                      ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              {order.paymentStatus && (
                                <div className="mt-4 pt-4 border-t">
                                  <p className="text-sm text-gray-500">
                                    Payment Status: <span className="font-medium">{order.paymentStatus}</span>
                                  </p>
                                  {order.paymentId && (
                                    <p className="text-sm text-gray-500">
                                      Payment ID: {order.paymentId}
                                    </p>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wishlist Tab - Fetching data from Firebase */}
              <TabsContent value="wishlist" className="space-y-6">
                <Card className="border border-gray-100 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-medium">Your Wishlist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingWishlist ? (
                      <div className="text-center text-gray-500">Loading wishlist...</div>
                    ) : wishlistItems.length === 0 ? (
                      <div className="text-center text-gray-500">Your wishlist is empty.</div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-4">
                        {wishlistItems.map((item) => (
                          <div
                            key={item.id}
                            className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100/80 p-4 transition-all duration-300 hover:border-gray-200/80 flex items-center gap-4 cursor-pointer"
                            onClick={() => navigate(`/product/${item.id}`)}
                          >
                            <div className="w-16 h-16 bg-gray-50/80 rounded-lg overflow-hidden flex-shrink-0">
                              <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex justify-between items-start">
                              <div>
                                <h3 className="text-sm font-medium text-gray-900 mb-1 hover:text-blue-600 transition-colors">{item.title}</h3>
                                <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-500 hover:text-red-600 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFromWishlist(item.id);
                                }}
                                disabled={removingItemId === item.id}
                              >
                                {removingItemId === item.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab - Static for now */}
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
