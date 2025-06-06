
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createProduct, fetchCategories, fetchBrands } from "@/api/products";
import { Loader2 } from "lucide-react";

const LOGIN_PASSWORD = "admin123"; // In a real application, this should be stored securely

// Form schema for the product data
const productFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  discountPercentage: z.coerce.number().min(0).max(100),
  stock: z.coerce.number().int().nonnegative(),
  brand: z.string().min(1, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  thumbnail: z.string().url("Please enter a valid URL"),
  images: z.string().refine(s => {
    try {
      const urls = s.split(",").map(url => url.trim());
      return urls.every(url => url.startsWith("http"));
    } catch {
      return false;
    }
  }, "Enter comma-separated valid URLs"),
  rating: z.coerce.number().min(0).max(5).optional(),
  availabilityStatus: z.string().optional(),
  dimensions: z.string().optional(),
  weight: z.coerce.number().positive().optional(),
  sku: z.string().optional(),
  warrantyInformation: z.string().optional(),
  returnPolicy: z.string().optional(),
  shippingInformation: z.string().optional(),
  minimumOrderQuantity: z.coerce.number().int().positive().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      discountPercentage: 0,
      stock: 0,
      brand: "",
      category: "",
      thumbnail: "",
      images: "",
      rating: 0,
      availabilityStatus: "In Stock",
      minimumOrderQuantity: 1,
    },
  });

  useEffect(() => {
    const loadCategoriesAndBrands = async () => {
      try {
        const [fetchedCategories, fetchedBrands] = await Promise.all([
          fetchCategories(),
          fetchBrands()
        ]);
        setCategories(fetchedCategories);
        setBrands(fetchedBrands);
      } catch (error) {
        console.error("Failed to load categories and brands:", error);
        toast.error("Failed to load categories and brands");
      }
    };

    if (isAuthenticated) {
      loadCategoriesAndBrands();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      if (password === LOGIN_PASSWORD) {
        setIsAuthenticated(true);
        toast.success("Login successful");
      } else {
        toast.error("Incorrect password");
      }
      setIsAuthenticating(false);
    }, 1000);
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      // Convert comma-separated image URLs to array
      const imagesArray = data.images.split(",").map(url => url.trim());
      
      // Prepare meta object
      const meta = {
        title: `${data.title} - ${data.brand}`,
        description: data.description.substring(0, 150),
        keywords: `${data.brand}, ${data.category}, ${data.title}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Create product with properly typed data
      const productData = {
        title: data.title,
        description: data.description,
        price: data.price,
        discountPercentage: data.discountPercentage,
        rating: data.rating || 0,
        stock: data.stock,
        brand: data.brand,
        category: data.category,
        thumbnail: data.thumbnail,
        images: imagesArray,
        meta,
        availabilityStatus: data.availabilityStatus,
        dimensions: data.dimensions,
        weight: data.weight,
        sku: data.sku,
        warrantyInformation: data.warrantyInformation,
        returnPolicy: data.returnPolicy,
        shippingInformation: data.shippingInformation,
        minimumOrderQuantity: data.minimumOrderQuantity,
      };
      
      const product = await createProduct(productData);
      
      toast.success(`Product "${product.title}" created successfully!`);
      
      // Reset form
      form.reset({
        title: "",
        description: "",
        price: 0,
        discountPercentage: 0,
        stock: 0,
        brand: "",
        category: "",
        thumbnail: "",
        images: "",
        rating: 0,
        availabilityStatus: "In Stock",
        minimumOrderQuantity: 1,
      });
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Admin Dashboard</CardTitle>
            <CardDescription>Enter the password to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input 
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  placeholder="Enter admin password"
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleLogin} 
              className="w-full"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-gray-900 text-white">
            <CardTitle className="text-2xl font-bold">Product Management</CardTitle>
            <CardDescription className="text-gray-300">
              Add new products to your store
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Title</FormLabel>
                        <FormControl>
                          <Input placeholder="iPhone 15 Pro Max" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" placeholder="1199.99" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Discount Percentage</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="45" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Apple" 
                            list="brands-list"
                            {...field} 
                          />
                        </FormControl>
                        {brands.length > 0 && (
                          <datalist id="brands-list">
                            {brands.map(brand => (
                              <option key={brand} value={brand} />
                            ))}
                          </datalist>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="smartphones" 
                            list="categories-list"
                            {...field} 
                          />
                        </FormControl>
                        {categories.length > 0 && (
                          <datalist id="categories-list">
                            {categories.map(category => (
                              <option key={category} value={category} />
                            ))}
                          </datalist>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Latest iPhone with titanium design, A17 Pro chip, and advanced camera system" 
                          className="min-h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="thumbnail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URLs (comma-separated)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/1.jpg, https://example.com/2.jpg" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter multiple image URLs separated by commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rating (0-5)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" min="0" max="5" placeholder="4.9" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="availabilityStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability Status</FormLabel>
                        <FormControl>
                          <Input placeholder="In Stock" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dimensions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dimensions</FormLabel>
                        <FormControl>
                          <Input placeholder="159.9 x 76.7 x 8.25 mm" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (g)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="221" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="APL-IP15PM-256" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="minimumOrderQuantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Order Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="warrantyInformation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty Information</FormLabel>
                        <FormControl>
                          <Input placeholder="1 year limited warranty" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="returnPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Return Policy</FormLabel>
                        <FormControl>
                          <Input placeholder="30-day return policy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="shippingInformation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Information</FormLabel>
                        <FormControl>
                          <Input placeholder="Ships within 2-3 business days" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Product...
                    </>
                  ) : (
                    "Create Product"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
