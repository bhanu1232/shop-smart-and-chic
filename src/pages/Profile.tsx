
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, MapPin, CreditCard, Package, Heart, Settings, LogOut, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    avatar: "/placeholder.svg"
  });

  const orders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "Delivered",
      total: 289.97,
      items: 3
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "Shipped",
      total: 149.99,
      items: 2
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      status: "Processing",
      total: 79.99,
      items: 1
    }
  ];

  const wishlistItems = [
    {
      id: 1,
      name: "Premium Streetwear Hoodie",
      price: 89.99,
      originalPrice: 129.99,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Urban Style Cargo Pants",
      price: 79.99,
      originalPrice: 99.99,
      image: "/placeholder.svg"
    }
  ];

  const addresses = [
    {
      id: 1,
      type: "Home",
      name: "John Doe",
      street: "123 Main Street",
      city: "New York",
      state: "NY",
      zip: "10001",
      isDefault: true
    },
    {
      id: 2,
      type: "Work",
      name: "John Doe",
      street: "456 Business Ave",
      city: "New York",
      state: "NY",
      zip: "10002",
      isDefault: false
    }
  ];

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
              <a href="/cart" className="text-gray-700 hover:text-gray-900 transition-colors font-medium">Cart</a>
            </nav>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-900 to-gray-700 text-white overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500"></div>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
                  <p className="text-gray-300 mb-2">{user.email}</p>
                  <Badge className="bg-white/20 text-white border-white/30">
                    Premium Member
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white hover:text-gray-900"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Addresses
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order, index) => (
                    <div 
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-gray-900">Order {order.id}</h3>
                          <Badge 
                            variant={order.status === "Delivered" ? "default" : order.status === "Shipped" ? "secondary" : "outline"}
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {order.date} • {order.items} items • ${order.total}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Wishlist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlistItems.map((item, index) => (
                    <Card 
                      key={item.id}
                      className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-2 border-0 bg-white"
                      style={{ animationDelay: `${index * 0.1}s` }}
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      <div className="aspect-square bg-gray-100 relative overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">${item.price}</span>
                          <span className="text-sm text-gray-500 line-through">${item.originalPrice}</span>
                        </div>
                        <Button className="w-full mt-3 bg-gray-900 hover:bg-gray-800">
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Saved Addresses
                  </div>
                  <Button className="bg-gray-900 hover:bg-gray-800">
                    Add New Address
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {addresses.map((address, index) => (
                    <div 
                      key={address.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={address.isDefault ? "default" : "outline"}>
                          {address.type}
                        </Badge>
                        {address.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p className="font-medium text-gray-900">{address.name}</p>
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} {address.zip}</p>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="outline" size="sm">Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Full Name</label>
                    <Input value={user.name} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                    <Input value={user.email} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Phone</label>
                    <Input value={user.phone} />
                  </div>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800">
                    Update Information
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Current Password</label>
                    <Input type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">New Password</label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Confirm Password</label>
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                  <Button className="w-full bg-gray-900 hover:bg-gray-800">
                    Change Password
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
