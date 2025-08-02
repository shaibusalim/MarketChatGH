'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
import { Shield, User, Package, Menu, X, ArrowLeft, Trash2 } from 'lucide-react';
import { TwilioMediaDisplay } from '@/components/TwilioMediaDisplay';
import LogoutButton from '@/components/LogoutButton';
import ThemeToggle from '@/components/ThemeToggle';
import { toast } from 'react-hot-toast';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';

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

export default function SellerPage() {
  const router = useRouter();
  const params = useParams();
  const sellerId = params.sellerId as string;
  const [seller, setSeller] = useState<Seller | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        const response = await fetch(`/api/sellers/${sellerId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const data = await response.json();
        if (data.seller) {
          setSeller({
            id: data.seller.id,
            name: data.seller.name,
            location: data.seller.location,
            active: data.seller.active,
            products: data.products,
          });
        } else {
          setSeller(null);
        }
      } catch (error) {
        console.error('[Client] Error fetching seller:', error);
        toast.error(`Failed to load seller: ${(error as Error).message}`, { duration: 3000 });
      }
    };

    if (sellerId) fetchSeller();
  }, [sellerId]);

  const handleDeleteSeller = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/admin/delete-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId }),
      });

      if (!response.ok) throw new Error('Failed to delete seller');

      toast.success('Seller deleted successfully', {
        position: 'top-center',
        duration: 3000,
      });
      router.push('/admin');
    } catch (error) {
      toast.error(`Failed to delete seller: ${(error as Error).message}`, {
        position: 'top-center',
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <div className="flex flex-col min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-md p-4 flex justify-between items-center z-50">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Seller Dashboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            >
              {isSidebarOpen ? <X className="h-6 w-6 text-gray-600 dark:text-gray-300" /> : <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />}
            </Button>
          </div>
        </header>

        {/* Mobile Sidebar (Drawer) */}
        <div
          className={`fixed top-0 left-0 h-full w-full max-w-[16rem] bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-2xl z-50 transform transition-transform duration-300 md:hidden ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
          {seller ? (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-blue-600 dark:text-blue-400">
                    <User className="h-4 w-4 sm:h-5 sm:w-5" /> Seller: {seller.name}
                  </CardTitle>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/admin')}
                      className="text-xs sm:text-sm border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-300">ID: {seller.id}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Location: {seller.location}</p>
                  <Badge
                    variant="outline"
                    className={`${
                      seller.active
                        ? 'bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-600'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-600'
                    } text-xs sm:text-sm mt-2`}
                  >
                    {seller.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <form
                    action={`/admin/toggle-seller?sellerId=${seller.id}&active=${!seller.active}`}
                    method="post"
                  >
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        type="submit"
                        variant={seller.active ? 'destructive' : 'default'}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg text-xs sm:text-sm py-2"
                      >
                        {seller.active ? 'Deactivate Seller' : 'Reactivate Seller'}
                      </Button>
                    </motion.div>
                  </form>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                   <Button
        variant="destructive"
        onClick={() => setIsDeleteDialogOpen(true)}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {isDeleting ? 'Deleting...' : 'Delete Seller'}
      </Button>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteSeller}
        title="Confirm Deletion"
        description={`Are you sure you want to delete seller ${seller?.name} (ID: ${sellerId})? This will also delete all their products.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete'}
      />
                  </motion.div>
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
                          <TableCell className="text-xs sm:text-sm max-w-[150px] sm:max-w-xs truncate">
                            {product.description}
                          </TableCell>
                          <TableCell className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                            ₵{product.price}
                          </TableCell>
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
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-xl border border-gray-100 dark:border-gray-700">
              <CardContent className="text-center py-8 sm:py-12">
                <Package className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Seller Not Found</h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
                  No seller found with ID {sellerId}.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}