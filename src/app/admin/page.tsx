"use client";

import { adminFirestore } from "@/lib/firebase-admin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
import { Shield, User, Package, Menu, X } from "lucide-react";
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay";
import LogoutButton from "@/components/LogoutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { cache } from 'react';
import { useState } from "react";

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
  location: string;
  active: boolean;
  products: Product[];
}

// --- Cached Firestore query ---
const getSellersAndProducts = cache(async (
  searchQuery: string = '',
  page: number = 1,
  pageSize: number = 10,
  startAfterDoc?: any
): Promise<{ sellers: Seller[]; total: number; lastDoc?: any }> => {
  let sellersQuery = adminFirestore.collection("sellers").orderBy("name").limit(pageSize);
  if (startAfterDoc) {
    sellersQuery = sellersQuery.startAfter(startAfterDoc);
  }
  if (searchQuery) {
    sellersQuery = sellersQuery.where("name", ">=", searchQuery).where("name", "<=", searchQuery + '\uf8ff');
  }

  const sellersSnapshot = await sellersQuery.get();
  const productsSnapshot = await adminFirestore.collection("products").get();

  const sellers: Seller[] = [];
  sellersSnapshot.forEach((sellerDoc) => {
    const sellerId = sellerDoc.id;
    const data = sellerDoc.data();
    const active = data.active ?? true;

    const products = productsSnapshot.docs
      .filter((p) => p.data().sellerId === sellerId)
      .map((doc) => {
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

    sellers.push({
      id: sellerId,
      name: data.name ?? "Unnamed Seller",
      location: data.location ?? "Unknown",
      active,
      products,
    });
  });

  const lastDoc = sellersSnapshot.docs[sellersSnapshot.docs.length - 1];
  const totalSnapshot = await adminFirestore.collection("sellers").get();
  const total = totalSnapshot.size;

  return { sellers, total, lastDoc };
});

// --- Admin page component ---
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q = '', page = '1' } = await searchParams;
  const pageNumber = parseInt(page, 10) || 1;
  const pageSize = 10;
  const startAfterDoc = pageNumber > 1 ? (await getSellersAndProducts(q, pageNumber - 1, pageSize)).lastDoc : undefined;
  const { sellers, total } = await getSellersAndProducts(q, pageNumber, pageSize, startAfterDoc);
  const totalProducts = sellers.reduce((sum, seller) => sum + seller.products.length, 0);
  const activeSellers = sellers.filter((seller) => seller.active).length;
  const totalPages = Math.ceil(total / pageSize);

  // Client-side state for mobile sidebar
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <div className="flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-md p-4 flex justify-between items-center z-50">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X className="h-6 w-6 text-gray-600 dark:text-gray-300" /> : <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />}
            </Button>
          </div>
        </header>

        {/* Mobile Sidebar (Drawer) */}
        <div
          className={`fixed top-0 left-0 h-full w-full max-w-[16rem] bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 md:hidden ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">MarketChat Admin</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
            </div>
            <nav className="space-y-2">
              <a
                href="/admin"
                className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-sm sm:text-base"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Sellers
              </a>
              <a
                href="/admin/products"
                className="flex items-center gap-2 p-2 sm:p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm sm:text-base"
              >
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                Products
              </a>
              <div className="mt-4 pt-4">
                <LogoutButton />
              </div>
            </nav>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block fixed top-0 left-0 h-full w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl z-40">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">MarketChat Admin</h2>
              </div>
              <ThemeToggle />
            </div>
            <nav className="space-y-2">
              <a
                href="/admin"
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold"
              >
                <User className="h-5 w-5" />
                Sellers
              </a>
              <a
                href="/admin/products"
                className="flex items-center gap-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
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

        {/* Main Content */}
        <div className="w-full md:ml-64 px-4 sm:px-6 md:px-8 py-6 sm:py-8 max-w-7xl mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
              <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">Total Sellers</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{sellers.length}</p>
                </div>
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-full p-2" />
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
              <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">Active Sellers</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{activeSellers}</p>
                </div>
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 rounded-full p-2" />
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl">
              <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 font-medium">Total Products</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 sm:h-10 sm:w-10 text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 rounded-full p-2" />
              </CardContent>
            </Card>
          </div>

          {/* Products Chart */}
          <Card className="mb-6 sm:mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Products per Seller
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 sm:h-64 overflow-x-auto">
                <svg
                  className="w-full h-full"
                  viewBox={`0 0 ${Math.min(sellers.length, 10) * 40 + 40} 200`}
                  preserveAspectRatio="xMidYMid meet"
                >
                  {sellers.slice(0, 10).map((seller, index) => {
                    const barWidth = 30;
                    const maxHeight = 150;
                    const productCount = seller.products.length;
                    const maxProducts = Math.max(...sellers.map((s) => s.products.length), 1);
                    const height = (productCount / maxProducts) * maxHeight;
                    return (
                      <g key={seller.id}>
                        <rect
                          x={index * (barWidth + 10) + 20}
                          y={200 - height}
                          width={barWidth}
                          height={height}
                          fill={seller.active ? '#10b981' : '#ef4444'}
                          className="transition-opacity duration-300 hover:opacity-80"
                        />
                        <text
                          x={index * (barWidth + 10) + 20 + barWidth / 2}
                          y={190 - height}
                          textAnchor="middle"
                          fill="#1f2937"
                          className="text-xs sm:text-sm dark:fill-white"
                        >
                          {productCount}
                        </text>
                        <text
                          x={index * (barWidth + 10) + 20 + barWidth / 2}
                          y="195"
                          textAnchor="middle"
                          fill="#6b7280"
                          className="text-[10px] sm:text-xs dark:fill-gray-300"
                          transform={`rotate(-45, ${index * (barWidth + 10) + 20 + barWidth / 2}, 195)`}
                        >
                          {seller.name.length > 8 ? `${seller.name.slice(0, 5)}...` : seller.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Onboard Seller */}
          <Card className="mb-6 sm:mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Onboard New Seller
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action="/admin/onboard-seller" method="POST" className="grid grid-cols-1 gap-3">
                <input
                  name="sellerId"
                  required
                  placeholder="Phone Number (e.g. +233501234567)"
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-white/50 dark:bg-gray-700/50"
                />
                <input
                  name="name"
                  required
                  placeholder="Seller Name"
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-white/50 dark:bg-gray-700/50"
                />
                <input
                  name="location"
                  required
                  placeholder="Location"
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-white/50 dark:bg-gray-700/50"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg py-2 text-sm sm:text-base transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Register Seller
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sellers Search */}
          <Card className="mb-6 sm:mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Search Sellers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action="/admin" method="GET" className="flex flex-col sm:flex-row gap-3">
                <input
                  name="q"
                  placeholder="Search by name or ID..."
                  defaultValue={q}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-white/50 dark:bg-gray-700/50"
                />
                <input type="hidden" name="page" value="1" />
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm sm:text-base"
                >
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sellers Section */}
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-600 dark:text-blue-400">
                <User className="h-4 w-4 sm:h-5 sm:w-5" /> Sellers ({sellers.length} of {total})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sellers.length > 0 ? (
                <>
                  <Accordion type="single" collapsible className="w-full">
                    {sellers.map((seller, index) => (
                      <AccordionItem
                        value={seller.id}
                        key={seller.id}
                        className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <AccordionTrigger className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-3 sm:py-4 text-sm sm:text-base">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-2">
                              <strong className="text-base sm:text-lg">{seller.name}</strong>
                              <Badge
                                variant="outline"
                                className={`${
                                  seller.active
                                    ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-600"
                                    : "bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-600"
                                } text-xs sm:text-sm`}
                              >
                                {seller.active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                              ID: {seller.id} • {seller.location} • {seller.products.length} products
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                            <form
                              action={`/admin/toggle-seller?sellerId=${seller.id}&active=${!seller.active}`}
                              method="post"
                            >
                              <Button
                                type="submit"
                                variant={seller.active ? "destructive" : "default"}
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg text-xs sm:text-sm py-2"
                              >
                                {seller.active ? "Deactivate Seller" : "Reactivate Seller"}
                              </Button>
                            </form>
                          </div>

                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                                  <TableHead className="hidden sm:table-cell w-16 sm:w-20">Image</TableHead>
                                  <TableHead className="text-xs sm:text-sm">Description</TableHead>
                                  <TableHead className="text-xs sm:text-sm">Price</TableHead>
                                  <TableHead className="text-xs sm:text-sm">Status</TableHead>
                                  <TableHead className="text-xs sm:text-sm">Stock</TableHead>
                                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {seller.products.map((product, index) => (
                                  <TableRow
                                    key={product.id}
                                    className="hover:bg-blue-50/30 dark:hover:bg-blue-900/30 transition-all duration-200"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                  >
                                    <TableCell className="hidden sm:table-cell">
                                      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden group">
                                        <TwilioMediaDisplay
                                          mediaUrl={product.imageUrl}
                                          alt={product.description}
                                          width={64}
                                          height={64}
                                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                        />
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-xs sm:text-sm max-w-[150px] sm:max-w-xs truncate">{product.description}</TableCell>
                                    <TableCell className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">₵{product.price}</TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className="text-xs sm:text-sm capitalize bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-600"
                                      >
                                        {product.status}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        variant="outline"
                                        className={`text-xs sm:text-sm ${
                                          product.isAvailable
                                            ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-600"
                                            : "bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-600"
                                        }`}
                                      >
                                        {product.stockStatus}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <form action="/admin/update-product" method="post" className="flex flex-col gap-2">
                                        <input type="hidden" name="productId" value={product.id} />
                                        <Button
                                          type="submit"
                                          name="action"
                                          value="markAvailable"
                                          size="sm"
                                          className="text-xs sm:text-sm bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white shadow-md hover:shadow-lg py-1.5"
                                        >
                                          In Stock
                                        </Button>
                                        <Button
                                          type="submit"
                                          name="action"
                                          value="markOutOfStock"
                                          variant="outline"
                                          size="sm"
                                          className="text-xs sm:text-sm border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 py-1.5"
                                        >
                                          Out of Stock
                                        </Button>
                                        <Button
                                          type="submit"
                                          name="action"
                                          value="delete"
                                          variant="destructive"
                                          size="sm"
                                          className="text-xs sm:text-sm bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 shadow-md hover:shadow-lg py-1.5"
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
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  {/* Pagination Controls */}
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 sm:mt-6 gap-3">
                    <Button
                      variant="outline"
                      disabled={pageNumber <= 1}
                      asChild
                      className="text-xs sm:text-sm py-2"
                    >
                      <a href={`/admin?q=${encodeURIComponent(q)}&page=${pageNumber - 1}`}>
                        Previous
                      </a>
                    </Button>
                    <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                      Page {pageNumber} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={pageNumber >= totalPages}
                      asChild
                      className="text-xs sm:text-sm py-2"
                    >
                      <a href={`/admin?q=${encodeURIComponent(q)}&page=${pageNumber + 1}`}>
                        Next
                      </a>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 sm:py-12 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                  <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">No Sellers Found</h2>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
                    Once sellers start adding products, they will appear here.
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