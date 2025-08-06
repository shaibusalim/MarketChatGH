"use client";

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
import { Shield, Package, Menu, User, X } from "lucide-react";
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import LogoutButton from "@/components/LogoutButton";
import { useState, useEffect, Suspense } from 'react';
import { getProducts } from "@/lib/product-actions";
import type { Product, Seller } from "@/lib/product-actions";
import { useSearchParams } from 'next/navigation';

function ProductsComponent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [sellers, setSellers] = useState<Map<string, Seller>>(new Map());
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [lastDocId, setLastDocId] = useState<string | undefined>(undefined);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const q = searchParams.get('q') || '';
  const filter = searchParams.get('filter') || 'all';
  const sort = searchParams.get('sort') || 'createdAt-desc';
  const page = searchParams.get('page') || '1';
  const startAfter = searchParams.get('startAfter');

  useEffect(() => {
    console.log('[ProductsComponent] Fetching with params:', { q, filter, sort, page, startAfter });
    const pageNum = parseInt(page, 10) || 1;
    setPageNumber(pageNum);
    const fetchData = async () => {
      try {
        const pageSize = 10;
        const { products, sellers, total, lastDocId } = await getProducts(q, filter, sort, pageSize, startAfter || undefined);
        console.log('[ProductsComponent] Fetch result:', { products: products.length, total, lastDocId });
        setProducts(products);
        setSellers(sellers);
        setTotal(total);
        setTotalPages(Math.ceil(total / pageSize));
        setLastDocId(lastDocId);
      } catch (error) {
        console.error('[ProductsComponent] Error fetching products:', error);
      }
    };
    fetchData();
  }, [q, filter, sort, page, startAfter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl z-50 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:translate-x-0 md:flex flex-col`}>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">MarketChat Admin</h2>
          </div>
        </div>
        <nav className="flex-grow px-4 space-y-2">
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
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </aside>

      <main className="md:pl-64 w-full">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-md p-4 flex justify-between items-center z-40">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Products</h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 max-w-6xl">
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
                          <TableHead className="hidden md:table-cell">Seller</TableHead>
                          <TableHead className="hidden md:table-cell">Price</TableHead>
                          <TableHead className="hidden sm:table-cell">Status</TableHead>
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
                            <TableCell className="max-w-xs truncate">
                              <p className="font-medium">{product.description}</p>
                              <p className="text-sm text-gray-500 md:hidden">
                                {sellers.get(product.sellerId)?.name || 'Unknown'} - ₵{product.price}
                              </p>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{sellers.get(product.sellerId)?.name || 'Unknown'}</TableCell>
                            <TableCell className="hidden md:table-cell text-green-600 dark:text-green-400 font-medium">₵{product.price}</TableCell>
                            <TableCell className="hidden sm:table-cell">
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
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                  type="submit"
                                  name="action"
                                  value="markAvailable"
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                  In Stock
                                </Button>
                                <Button
                                  type="submit"
                                  name="action"
                                  value="markOutOfStock"
                                  variant="outline"
                                  size="sm"
                                >
                                  Out of Stock
                                </Button>
                                <Button
                                  type="submit"
                                  name="action"
                                  value="delete"
                                  variant="destructive"
                                  size="sm"
                                >
                                  Delete
                                </Button>
                              </div>
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
                      <a href={`/admin/products?q=${encodeURIComponent(q)}&filter=${filter}&sort=${sort}&page=${pageNumber + 1}&startAfter=${lastDocId}`}>
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
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsComponent />
    </Suspense>
  );
}