'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, User, Package, Menu, X } from 'lucide-react';
import { TwilioMediaDisplay } from '@/components/TwilioMediaDisplay';
import LogoutButton from '@/components/LogoutButton';
import ThemeToggle from '@/components/ThemeToggle';

// --- Types ---
interface Product {
  id: string;
  imageUrl: string;
  price: string;
  description: string;
  sellerId: string;
  createdAt: string;
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

export default function AdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [total, setTotal] = useState(0);
  const [lastDocId, setLastDocId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10) || 1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    const fetchSellers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = new URL('/api/sellers', window.location.origin);
        url.searchParams.append('q', searchQuery);
        url.searchParams.append('page', page.toString());
        if (lastDocId && page > 1) {
          url.searchParams.append('startAfterDoc', lastDocId);
        }

        console.log(`[Client] Fetching from ${url.toString()}`);
        const response = await fetch(url.toString());
        console.log(`[Client] Response status: ${response.status}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `Failed to fetch sellers (Status: ${response.status})`
          );
        }
        const data = await response.json();
        console.log('[Client] Fetched data:', data);

        setSellers(data.sellers || []);
        setTotal(data.total || 0);
        setLastDocId(data.lastDocId);
      } catch (error) {
        console.error('[Client] Error fetching sellers:', error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellers();
  }, [searchQuery, page, lastDocId]);

  const totalProducts = sellers.reduce((sum, seller) => sum + seller.products.length, 0);
  const activeSellers = sellers.filter((seller) => seller.active).length;
  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQuery = formData.get('q') as string;
    setSearchQuery(newQuery);
    setPage(1);
    router.push(`/admin?q=${encodeURIComponent(newQuery)}&page=1`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    router.push(`/admin?q=${encodeURIComponent(searchQuery)}&page=${newPage}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      <div className="flex min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-md z-50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
              className="h-8 w-8"
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </Button>
          </div>
        </header>

        {/* Mobile Sidebar (Drawer) */}
        <div
          className={`fixed top-0 left-0 h-full w-11/12 max-w-[280px] bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl z-50 transform transition-transform duration-300 md:hidden ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">MarketChat Admin</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                aria-label="Close menu"
                className="h-8 w-8"
              >
                <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </Button>
            </div>
            <nav className="space-y-2">
              <a
                href="/admin"
                className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-sm"
              >
                <User className="h-4 w-4" />
                Sellers
              </a>
              <a
                href="/admin/products"
                className="flex items-center gap-2 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
              >
                <Package className="h-4 w-4" />
                Products
              </a>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <LogoutButton />
              </div>
            </nav>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block fixed top-0 left-0 h-full w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border-r border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Shield className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">MarketChat Admin</h2>
              </div>
              <ThemeToggle />
            </div>
            <nav className="space-y-2">
              <a
                href="/admin"
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-sm"
              >
                <User className="h-5 w-5" />
                Sellers
              </a>
              <a
                href="/admin/products"
                className="flex items-center gap-3 p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm"
              >
                <Package className="h-5 w-5" />
                Products
              </a>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <LogoutButton />
              </div>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 md:ml-64 pt-16 md:pt-0 px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 animate-fade-in">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 dark:border-gray-700">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Total Sellers</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{sellers.length}</p>
                </div>
                <User className="h-8 w-8 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-full p-2" />
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 dark:border-gray-700">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Active Sellers</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">{activeSellers}</p>
                </div>
                <User className="h-8 w-8 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 rounded-full p-2" />
              </CardContent>
            </Card>
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 dark:border-gray-700">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Total Products</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 rounded-full p-2" />
              </CardContent>
            </Card>
          </div>

          {/* Loading/Error State */}
          {isLoading && (
            <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
              <CardContent className="text-center py-8">
                <div className="animate-pulse">
                  <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-600 rounded mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Loading sellers...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {error && (
            <Card className="mb-6 bg-red-50/90 dark:bg-red-900/50 shadow-md rounded-xl border border-red-200 dark:border-red-600 animate-fade-in">
              <CardContent className="text-center py-8">
                <p className="text-sm text-red-700 dark:text-red-400">Error: {error}</p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4 text-sm border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-800/50"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Products Chart */}
          {!isLoading && !error && (
            <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Products per Seller
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 overflow-x-auto">
                  <svg
                    className="w-full h-full"
                    viewBox={`0 0 ${Math.min(sellers.length, 10) * 50 + 60} 200`}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {sellers.slice(0, 10).map((seller, index) => {
                      const barWidth = 40;
                      const maxHeight = 150;
                      const productCount = seller.products.length;
                      const maxProducts = Math.max(...sellers.map((s) => s.products.length), 1);
                      const height = (productCount / maxProducts) * maxHeight;
                      return (
                        <g key={seller.id}>
                          <rect
                            x={index * (barWidth + 10) + 30}
                            y={200 - height}
                            width={barWidth}
                            height={height}
                            fill={seller.active ? '#10b981' : '#ef4444'}
                            className="transition-all duration-300 hover:opacity-80"
                          />
                          <text
                            x={index * (barWidth + 10) + 30 + barWidth / 2}
                            y={190 - height}
                            textAnchor="middle"
                            fill="#1f2937"
                            className="text-xs dark:fill-white"
                          >
                            {productCount}
                          </text>
                          <text
                            x={index * (barWidth + 10) + 30 + barWidth / 2}
                            y="195"
                            textAnchor="middle"
                            fill="#6b7280"
                            className="text-[10px] dark:fill-gray-300"
                            transform={`rotate(-45, ${index * (barWidth + 10) + 30 + barWidth / 2}, 195)`}
                          >
                            {seller.name.length > 10 ? `${seller.name.slice(0, 7)}...` : seller.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Onboard Seller */}
          <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Onboard New Seller
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action="/admin/onboard-seller" method="POST" className="grid grid-cols-1 gap-4">
                <input
                  name="sellerId"
                  required
                  placeholder="Phone Number (e.g. +233501234567)"
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-700/80 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <input
                  name="name"
                  required
                  placeholder="Seller Name"
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-700/80 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <input
                  name="location"
                  required
                  placeholder="Location"
                  className="border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-700/80 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg py-2 text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Register Seller
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sellers Search */}
          <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Search Sellers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <input
                  name="q"
                  placeholder="Search by name or ID..."
                  defaultValue={searchQuery}
                  className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:outline-none transition-all duration-200 bg-white/80 dark:bg-gray-700/80 placeholder-gray-400 dark:placeholder-gray-500"
                />
                <input type="hidden" name="page" value="1" />
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm"
                >
                  Search
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sellers Section */}
          {!isLoading && !error && (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700 animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-blue-600 dark:text-blue-400">
                  <User className="h-5 w-5" /> Sellers ({sellers.length} of {total})
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
                        >
                          <AccordionTrigger className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-3 text-sm">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <strong className="text-sm">{seller.name}</strong>
                                <Badge
                                  variant="outline"
                                  className={`${
                                    seller.active
                                      ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-600'
                                      : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-600'
                                  } text-xs`}
                                >
                                  {seller.active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-300">
                                ID: {seller.id} • {seller.location} • {seller.products.length} products
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                              <form
                                action={`/admin/toggle-seller?sellerId=${seller.id}&active=${!seller.active}`}
                                method="post"
                              >
                                <Button
                                  type="submit"
                                  variant={seller.active ? 'destructive' : 'default'}
                                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg text-xs py-2"
                                >
                                  {seller.active ? 'Deactivate Seller' : 'Reactivate Seller'}
                                </Button>
                              </form>
                              <a
                                href={`/admin/sellers/${seller.id}`}
                                className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
                              >
                                View Details
                              </a>
                            </div>

                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                                    <TableHead className="w-16 text-xs">Image</TableHead>
                                    <TableHead className="text-xs">Description</TableHead>
                                    <TableHead className="text-xs">Price</TableHead>
                                    <TableHead className="text-xs">Status</TableHead>
                                    <TableHead className="text-xs">Stock</TableHead>
                                    <TableHead className="text-xs">Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {seller.products.map((product) => (
                                    <TableRow
                                      key={product.id}
                                      className="hover:bg-blue-50/30 dark:hover:bg-blue-900/30 transition-all duration-200"
                                    >
                                      <TableCell>
                                        <div className="relative w-12 h-12 rounded-md overflow-hidden group">
                                          <TwilioMediaDisplay
                                            mediaUrl={product.imageUrl}
                                            alt={product.description}
                                            width={48}
                                            height={48}
                                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                                          />
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-xs max-w-[120px] truncate">
                                        {product.description}
                                      </TableCell>
                                      <TableCell className="text-xs text-green-600 dark:text-green-400 font-medium">
                                        ₵{product.price}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant="outline"
                                          className="text-xs capitalize bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-600"
                                        >
                                          {product.status}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${
                                            product.isAvailable
                                              ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-600'
                                              : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-600'
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
                                            className="text-xs bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white shadow-md hover:shadow-lg py-1"
                                          >
                                            In Stock
                                          </Button>
                                          <Button
                                            type="submit"
                                            name="action"
                                            value="markOutOfStock"
                                            variant="outline"
                                            size="sm"
                                            className="text-xs border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 py-1"
                                          >
                                            Out of Stock
                                          </Button>
                                          <Button
                                            type="submit"
                                            name="action"
                                            value="delete"
                                            variant="destructive"
                                            size="sm"
                                            className="text-xs bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 shadow-md hover:shadow-lg py-1"
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
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
                      <Button
                        variant="outline"
                        disabled={page <= 1}
                        onClick={() => handlePageChange(page - 1)}
                        className="text-xs py-2 px-4 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Previous
                      </Button>
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        Page {page} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        disabled={page >= totalPages}
                        onClick={() => handlePageChange(page + 1)}
                        className="text-xs py-2 px-4 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Next
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
                    <Package className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">No Sellers Found</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
                      Once sellers start adding products, they will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}