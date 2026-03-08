"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Plus, 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  LogOut,
  Loader2,
  Search,
  MoreVertical,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink
} from "lucide-react"
import { signOut } from "next-auth/react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { updateProductStatus } from "@/app/admin/actions"

interface Product {
  id: string
  imageUrl: string
  price: string
  description: string
  status: string
  stockStatus: string
  isAvailable: boolean
}

export default function SellerDashboardPage() {
  const { data: session } = useSession()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0
  })

  const fetchSellerData = useCallback(async () => {
    if (!session?.user?.id) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/sellers/${session.user.id}`)
      if (!response.ok) throw new Error("Failed to fetch shop data")
      const data = await response.json()
      setProducts(data.products || [])
      
      const active = data.products.filter((p: Product) => p.isAvailable).length
      setStats({
        total: data.products.length,
        active: active,
        outOfStock: data.products.length - active
      })
    } catch (error) {
      console.error(error)
      toast.error("Could not load your shop data")
    } finally {
      setIsLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    fetchSellerData()
  }, [fetchSellerData])

  const handleToggleStatus = async (productId: string, currentAvailable: boolean) => {
    const formData = new FormData()
    formData.append("productId", productId)
    formData.append("action", currentAvailable ? "markOutOfStock" : "markAvailable")

    const result = await updateProductStatus(formData)
    if (result.success) {
      toast.success(result.message)
      fetchSellerData()
    } else {
      toast.error(result.message)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    const formData = new FormData()
    formData.append("productId", productId)
    formData.append("action", "delete")

    const result = await updateProductStatus(formData)
    if (result.success) {
      toast.success(result.message)
      fetchSellerData()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed h-full z-20">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-green-500 p-1.5 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl dark:text-white">MarketChat</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start gap-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 dark:text-gray-400">
            <Package className="h-5 w-5" /> My Products
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-600 dark:text-gray-400">
            <Settings className="h-5 w-5" /> Shop Settings
          </Button>
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="h-5 w-5" /> Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 sm:p-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shop Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">Welcome back, {(session?.user as any)?.name || 'Seller'}</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="rounded-xl border-gray-200">
              <Link href={`/${session?.user?.id}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" /> View Shop
              </Link>
            </Button>
            <Button className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20">
              <Plus className="h-5 w-5 mr-2" /> Add Product
            </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-2xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Total Products</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-2xl text-blue-600">
                <Package className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-2xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">In Stock</p>
                <p className="text-3xl font-bold mt-1 text-green-600">{stats.active}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/40 p-3 rounded-2xl text-green-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-2xl">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Out of Stock</p>
                <p className="text-3xl font-bold mt-1 text-red-500">{stats.outOfStock}</p>
              </div>
              <div className="bg-red-100 dark:bg-red-900/40 p-3 rounded-2xl text-red-500">
                <XCircle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card className="border-none shadow-sm bg-white dark:bg-gray-900 rounded-3xl overflow-hidden">
          <CardHeader className="border-b border-gray-50 dark:border-gray-800 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-xl font-bold">My Products</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-green-500 mb-4" />
                <p className="text-gray-500">Loading your catalog...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 text-center">
                <div className="bg-gray-100 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold">No products yet</h3>
                <p className="text-gray-500 mb-6">Start by adding your first product to your shop.</p>
                <Button className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl px-8 py-6">
                  <Plus className="h-5 w-5 mr-2" /> Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold">Price</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Stock</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative flex-shrink-0">
                              <Image 
                                src={product.imageUrl} 
                                alt={product.description} 
                                fill 
                                className="object-cover"
                              />
                            </div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 max-w-[200px]">
                              {product.description}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400 text-sm">
                          ₵{product.price}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="capitalize text-[10px] px-2 py-0 h-5 border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800">
                            {product.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleToggleStatus(product.id, product.isAvailable)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                              product.isAvailable 
                                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" 
                                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                            }`}
                          >
                            <div className={`h-1.5 w-1.5 rounded-full ${product.isAvailable ? "bg-green-500" : "bg-red-500"}`} />
                            {product.stockStatus}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
