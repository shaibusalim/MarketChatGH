"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, AlertCircle, Trash2, Edit } from "lucide-react"
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"

interface Product {
  id: string
  imageUrl: string
  price: string
  description: string
  sellerId: string
  status: string
  stockStatus: string
  isAvailable: boolean
}

interface SellerInfo {
  id: string
  name: string
  location: string
  active: boolean
}

interface SellerData {
  seller: SellerInfo | null
  products: Product[]
}

export default function AdminSellerDetailsPage() {
  const { sellerId } = useParams() as { sellerId: string }
  const router = useRouter()
  const { data: session, status } = useSession()
  const [seller, setSeller] = useState<SellerInfo | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'

  useEffect(() => {
    console.log('[AdminSellerDetails] Session:', { status, isAdmin: session?.user?.isAdmin })
    if (status === 'loading') return
    if (!session || !session.user?.isAdmin) {
      console.log('[AdminSellerDetails] Redirecting to /admin/signin')
      router.push('/admin/signin')
    }
  }, [status, session, router])

  const fetchSellerData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = new URL(`/api/sellers/${sellerId}`, baseUrl)
      console.log(`[AdminSellerDetails] Fetching from ${url.toString()}`)
      const response = await fetch(url.toString())
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || `Failed to fetch seller data (Status: ${response.status})`)
      }
      const data: SellerData = await response.json()
      setSeller(data.seller)
      setProducts(data.products)
    } catch (err) {
      console.error(`[AdminSellerDetails] Error fetching seller data for ${sellerId}:`, err)
      setError((err as Error).message)
      toast.error("Failed to load seller data: " + (err as Error).message, { duration: 5000 })
    } finally {
      setIsLoading(false)
    }
  }, [sellerId, baseUrl])

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.isAdmin) {
      fetchSellerData()
    }
  }, [status, session, fetchSellerData])

  const handleDeleteSeller = async () => {
    if (!confirm(`Are you sure you want to delete seller ${seller?.name || sellerId}? This action cannot be undone.`)) {
      return
    }
    setIsDeleting(true)
    try {
      const response = await fetch(`${baseUrl}/api/admin/delete-seller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete seller')
      }
      toast.success('Seller deleted successfully')
      router.push('/admin')
    } catch (err) {
      console.error('[AdminSellerDetails] Error deleting seller:', err)
      toast.error('Failed to delete seller: ' + (err as Error).message, { duration: 5000 })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditSeller = () => {
    // Placeholder for edit functionality
    toast('Edit seller functionality is not yet implemented.', { duration: 5000 })
    // Future implementation: Open a modal or redirect to an edit form
    // e.g., router.push(`/admin/sellers/${sellerId}/edit`)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="sr-only">Loading seller details...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
        <Button
          onClick={fetchSellerData}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Seller Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">The seller does not exist or has been removed.</p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
          <a href="/admin">Back to Dashboard</a>
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8"
    >
      <div className="container mx-auto px-4">
        <Button
          asChild
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          <a href="/admin">Back to Dashboard</a>
        </Button>
        <Card className="bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">Seller Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Name: </span>
                <span className="text-gray-900 dark:text-white">{seller.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">ID: </span>
                <span className="text-gray-900 dark:text-white font-mono">{seller.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Location: </span>
                <span className="text-gray-900 dark:text-white">{seller.location}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Number of Products: </span>
                <span className="text-gray-900 dark:text-white">{products.length}</span>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <Button
                onClick={handleEditSeller}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded-md"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Seller
              </Button>
              <Button
                onClick={handleDeleteSeller}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Seller
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card className="mt-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">Products</CardTitle>
          </CardHeader>
          <CardContent>
            {products.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Availability</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product, index) => (
                    <TableRow
                      key={product.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "both" }}
                    >
                      <TableCell>
                        <TwilioMediaDisplay
                          mediaUrl={product.imageUrl}
                          alt={product.description}
                          width={40}
                          height={40}
                          className="rounded-md"
                        />
                      </TableCell>
                      <TableCell className="text-gray-900 dark:text-white">{product.description}</TableCell>
                      <TableCell className="text-green-600 dark:text-green-400">₵{product.price}</TableCell>
                      <TableCell>
                        <span
                          className={
                            product.isAvailable
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {product.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-600 dark:text-gray-300 text-center py-4">No products found for this seller.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
