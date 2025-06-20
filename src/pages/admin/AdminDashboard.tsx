import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createProduct,
  fetchCategories,
  fetchBrands,
  fetchProducts,
  updateProduct,
  deleteProduct,
  Product
} from "@/api/products";
import { Loader2, Edit, Trash2, Plus, Search, X } from "lucide-react";

const LOGIN_PASSWORD = "admin123";

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
  console.log("AdminDashboard component is rendering");
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();

  const { data: products = [], isLoading: isLoadingProducts, refetch } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => fetchProducts(100, 0),
    enabled: isAuthenticated,
  });

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;

    const query = searchQuery.toLowerCase();
    return products.filter(product =>
      product.title.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.id.toString().includes(query)
    );
  }, [products, searchQuery]);

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
    console.log("AdminDashboard mounted, isAuthenticated:", isAuthenticated);
  }, []);

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

  const resetForm = () => {
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
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      title: product.title,
      description: product.description,
      price: product.price,
      discountPercentage: product.discountPercentage,
      stock: product.stock,
      brand: product.brand,
      category: product.category,
      thumbnail: product.thumbnail,
      images: product.images.join(", "),
      rating: product.rating,
      availabilityStatus: product.availabilityStatus || "In Stock",
      dimensions: product.dimensions || "",
      weight: product.weight || 0,
      sku: product.sku || "",
      warrantyInformation: product.warrantyInformation || "",
      returnPolicy: product.returnPolicy || "",
      shippingInformation: product.shippingInformation || "",
      minimumOrderQuantity: product.minimumOrderQuantity || 1,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeletingProductId(productId);
    try {
      await deleteProduct(productId.toString());
      toast.success("Product deleted successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeletingProductId(null);
    }
  };

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const imagesArray = data.images.split(",").map(url => url.trim());

      const meta = {
        title: `${data.title} - ${data.brand}`,
        description: data.description.substring(0, 150),
        keywords: `${data.brand}, ${data.category}, ${data.title}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

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

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        toast.success(`Product "${productData.title}" updated successfully!`);
      } else {
        await createProduct(productData);
        toast.success(`Product "${productData.title}" created successfully!`);
      }

      resetForm();
      setIsDialogOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to save product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  console.log("Rendering AdminDashboard, isAuthenticated:", isAuthenticated);

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
          <div className="p-6 pt-0">
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
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </DialogTitle>
                <DialogDescription>
                  {editingProduct ? "Update the product details below." : "Fill in the product details below."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <FormLabel>Discount %</FormLabel>
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
                            placeholder="Product description"
                            className="min-h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <FormLabel>Image URLs</FormLabel>
                          <FormControl>
                            <Input placeholder="url1, url2, url3" {...field} />
                          </FormControl>
                          <FormDescription>Comma-separated URLs</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingProduct ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        editingProduct ? "Update Product" : "Create Product"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Bar Section */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Search Products</CardTitle>
            <CardDescription>
              Search by product name, brand, category, description, or ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-3 text-sm text-gray-600">
                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                {searchQuery && ` matching "${searchQuery}"`}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Products ({filteredProducts.length}{searchQuery ? ` of ${products.length}` : ''})
            </CardTitle>
            <CardDescription>
              {searchQuery ? `Search results for "${searchQuery}"` : "All products in your inventory"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">
                  {searchQuery ? (
                    <>
                      <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      No products found matching "{searchQuery}"
                    </>
                  ) : (
                    "No products available"
                  )}
                </div>
                {searchQuery && (
                  <Button variant="outline" onClick={clearSearch} className="mt-2">
                    Clear search
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img
                            src={product.thumbnail}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-500">
                          #{product.id}
                        </TableCell>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate" title={product.title}>
                            {searchQuery ? (
                              <span dangerouslySetInnerHTML={{
                                __html: product.title.replace(
                                  new RegExp(`(${searchQuery})`, 'gi'),
                                  '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                                )
                              }} />
                            ) : (
                              product.title
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {searchQuery ? (
                            <span dangerouslySetInnerHTML={{
                              __html: product.brand.replace(
                                new RegExp(`(${searchQuery})`, 'gi'),
                                '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                              )
                            }} />
                          ) : (
                            product.brand
                          )}
                        </TableCell>
                        <TableCell>
                          {searchQuery ? (
                            <span dangerouslySetInnerHTML={{
                              __html: product.category.replace(
                                new RegExp(`(${searchQuery})`, 'gi'),
                                '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                              )
                            }} />
                          ) : (
                            product.category
                          )}
                        </TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10
                              ? 'bg-green-100 text-green-800'
                              : product.stock > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {product.stock}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              disabled={deletingProductId === product.id}
                              title="Delete product"
                            >
                              {deletingProductId === product.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
