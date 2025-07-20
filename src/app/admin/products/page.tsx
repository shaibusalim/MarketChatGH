import { adminFirestore } from "@/lib/firebase-admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Package, Menu, User } from "lucide-react";
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import { cache } from 'react';

// --- Types ---
interface Product {
  id: string;
  imageUrl: string;
  price: string;
  description: string;
  sellerId: string;
  createdAt: Date;
  status: string;
  stockStatus: string;
  isAvailable: boolean;
}

interface Seller {
  id: string;
  name: string;
}

// --- Cached Firestore query ---
const getProducts = cache(async (
  searchQuery: string = '',
  filter: string = 'all',
  sort: string = 'createdAt-desc',
  page: number = 1,
  pageSize: number = 10,
  startAfterDoc?: any
): Promise<{ products: Product[]; sellers: Map<string, Seller>; total: number; lastDoc?: any }> => {
  let productsQuery = adminFirestore.collection("products").limit(pageSize);
  if (startAfterDoc) {
    productsQuery = productsQuery.startAfter(startAfterDoc);
  }
  if (searchQuery) {
    productsQuery = productsQuery.where("description", ">=", searchQuery).where("description", "<=", searchQuery + '\uf8ff');
  }
  if (filter !== 'all') {
    if (filter === 'in-stock') productsQuery = productsQuery.where("isAvailable", "==", true);
    if (filter === 'out-of-stock') productsQuery = productsQuery.where("isAvailable", "==", false);
    if (filter === 'new') productsQuery = productsQuery.where("status", "==", "new");
    if (filter === 'used') productsQuery = productsQuery.where("status", "==", "used");
  }
  const sortField = sort.includes('price') ? 'price' : 'createdAt';
  const sortDirection = sort.includes('desc') ? 'desc' : 'asc';
  productsQuery = productsQuery.orderBy(sortField, sortDirection);

  const productsSnapshot = await productsQuery.get();
  const sellersSnapshot = await adminFirestore.collection("sellers").get();

  const sellers: Map<string, Seller> = new Map();
  sellersSnapshot.forEach((doc) => {
    const data = doc.data();
    sellers.set(doc.id, { id: doc.id, name: data.name ?? "Unnamed Seller" });
  });

  const products = productsSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      imageUrl: data.imageUrl ?? "/placeholder-product.jpg",
      price: data.price ?? "Price not specified",
      description: data.description ?? "No description",
      sellerId: data.sellerId ?? "",
      createdAt: data.createdAt?.toDate?.() ?? new Date(),
      status: data.status ?? "unknown",
      stockStatus: data.stockStatus ?? "unknown",
      isAvailable: data.isAvailable ?? false,
    } as Product;
  });

  const lastDoc = productsSnapshot.docs[productsSnapshot.docs.length - 1];
  const totalSnapshot = await adminFirestore.collection("products").get();
  const total = totalSnapshot.size;

  return { products, sellers, total, lastDoc };
});

// --- Products page component ---
export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string; sort?: string; page?: string }> }) {
  const { q = '', filter = 'all', sort = 'createdAt-desc', page = '1' } = await searchParams;
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = 10;
  const startAfterDoc = pageNumber > 1 ? (await getProducts(q, filter, sort, pageNumber - 1, pageSize)).lastDoc : undefined;
  const { products, sellers, total } = await getProducts(q, filter, sort, pageNumber, pageSize, startAfterDoc);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed top-0 left-0 h-full w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl z-50 hidden md:block">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">MarketChat Admin</h2>
              </div>
              <ThemeToggle />
            </div>
            <nav className="space-y-2">
              <a
                href="/admin"
                className="flex items-center gap-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <User className="h-5 w-5" />
                Sellers
              </a>
              <a
                href="/admin/products"
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold"
              >
                <Package className="h-5 w-5" />
                Products
              </a>
              <div className="mt-auto pt-4">
                <LogoutButton />
              </div>
            </nav>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-md p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Products</h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="md:ml-64 container mx-auto px-4 py-8 max-w-6xl">
          {/* Search and Filter */}
          <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-100 dark:border-gray-700 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                Search & Filter Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action="/admin/products" method="GET" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  name="q"
                  placeholder="Search by description or seller ID..."
                  defaultValue={q}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-white/50 dark:bg-gray-700/50"
                />
                <select
                  name="filter"
                  defaultValue={filter}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-white/50 dark:bg-gray-700/50"
                >
                  <option value="all">All Products</option>
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
                <select
                  name="sort"
                  defaultValue={sort}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-white/50 dark:bg-gray-700/50"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <input type="hidden" name="page" value="1" />
                <Button
                  type="submit"
                  className="col-span-full sm:col-span-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 mt-2 sm:mt-0"
                >
                  Apply
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-100 dark:border-gray-700 animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl text-blue-600 dark:text-blue-400">
                <Package className="h-5 w-5" /> Products ({products.length} of {total})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {products.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                          <TableHead className="w-20 sm:w-24">Image</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Seller</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product, index) => (
                          <TableRow
                            key={product.id}
                            className="hover:bg-blue-50/30 dark:hover:bg-blue-900/30 transition-all duration-200 animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <TableCell>
                              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-md overflow-hidden group">
                                <TwilioMediaDisplay
                                  mediaUrl={product.imageUrl}
                                  alt={product.description}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                            <TableCell>{sellers.get(product.sellerId)?.name || 'Unknown'}</TableCell>
                            <TableCell className="text-green-600 dark:text-green-400 font-medium">₵{product.price}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className="capitalize bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-600"
                              >
                                {product.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={`${
                                  product.isAvailable
                                    ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-600"
                                    : "bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-600"
                                }`}
                              >
                                {product.stockStatus}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <form action="/admin/update-product" method="post"
                              className="flex flex-col gap-2">
                                <input type="hidden" name="productId" value={product.id} />
                                <Button
                                  type="submit"
                                  name="action"
                                  value="markAvailable"
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                                >
                                  In Stock
                                </Button>
                                <Button
                                  type="submit"
                                  name="action"
                                  value="markOutOfStock"
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  Out of Stock
                                </Button>
                                <Button
                                  type="submit"
                                  name="action"
                                  value="delete"
                                  variant="destructive"
                                  size="sm"
                                  className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 shadow-md hover:shadow-lg"
                                >
                                  Delete
                                </Button>
                              </form>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Pagination Controls */}
                  <div className="flex justify-between items-center mt-6">
                    <Button
                      variant="outline"
                      disabled={pageNumber <= 1}
                      asChild
                    >
                      <a href={`/admin/products?q=${encodeURIComponent(q)}&filter=${filter}&sort=${sort}&page=${pageNumber - 1}`}>
                        Previous
                      </a>
                    </Button>
                    <span className="text-gray-600 dark:text-gray-300">
                      Page {pageNumber} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={pageNumber >= totalPages}
                      asChild
                    >
                      <a href={`/admin/products?q=${encodeURIComponent(q)}&filter=${filter}&sort=${sort}&page=${pageNumber + 1}`}>
                        Next
                      </a>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg animate-fade-in">
                  <Package className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">No Products Found</h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
                    No products match the current filters.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}