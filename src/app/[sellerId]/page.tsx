"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Star,
  Store,
  MapPin,
  Package,
  ShoppingBag,
  Eye,
  MessageCircle,
  Search,
  Loader2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay"
import { SellerReviewsDisplay } from "@/components/seller-review-display"
import { toast } from "react-hot-toast"

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
  rating?: number
  reviewCount?: number
}

interface SellerData {
  seller: SellerInfo | null
  products: Product[]
}

export default function SellerPage({ params }: { params: { sellerId: string } }) {
  // The warning indicates params might be a Promise in Next.js 15.
  // Use React.use to unwrap it safely.
  const { sellerId } = useParams() as { sellerId: string }
  const router = useRouter()
  const searchParams = useSearchParams()

  const [seller, setSeller] = useState<SellerInfo | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [currentProductSearchQuery, setCurrentProductSearchQuery] = useState(searchParams.get("productQ") || "")
  const [currentProductFilterStatus, setCurrentProductFilterStatus] = useState(
    searchParams.get("productStatus") || "all",
  )

  // State to track the query/status that was actually used for the last fetch
  const [fetchedProductSearchQuery, setFetchedProductSearchQuery] = useState(searchParams.get("productQ") || "")
  const [fetchedProductFilterStatus, setFetchedProductFilterStatus] = useState(
    searchParams.get("productStatus") || "all",
  )

  const fetchSellerData = useCallback(
    async (query: string, status: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const url = new URL(`/api/sellers/${sellerId}`, window.location.origin)
        if (query) {
          url.searchParams.append("productQ", query)
        }
        if (status !== "all") {
          url.searchParams.append("productStatus", status)
        }

        const response = await fetch(url.toString())
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || `Failed to fetch seller data (Status: ${response.status})`)
        }
        const data: SellerData = await response.json()
        setSeller(data.seller)
        setProducts(data.products)
        setFetchedProductSearchQuery(query) // Update fetched state
        setFetchedProductFilterStatus(status) // Update fetched state
      } catch (err) {
        console.error(`Error fetching seller data for ${sellerId}:`, err)
        setError((err as Error).message)
        toast.error("Failed to load seller data: " + (err as Error).message, { duration: 5000 })
      } finally {
        setIsLoading(false)
      }
    },
    [sellerId],
  ) // Dependencies are now only sellerId

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSellerData(currentProductSearchQuery, currentProductFilterStatus)

      // Update URL after debounce
      const newSearchParams = new URLSearchParams(searchParams.toString())
      if (currentProductSearchQuery) {
        newSearchParams.set("productQ", currentProductSearchQuery)
      } else {
        newSearchParams.delete("productQ")
      }
      if (currentProductFilterStatus !== "all") {
        newSearchParams.set("productStatus", currentProductFilterStatus)
      } else {
        newSearchParams.delete("productStatus")
      }
      router.replace(`?${newSearchParams.toString()}`, { scroll: false })
    }, 500) // Debounce delay of 500ms

    return () => {
      clearTimeout(handler)
    }
  }, [currentProductSearchQuery, currentProductFilterStatus, fetchSellerData, router, searchParams])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentProductSearchQuery(e.target.value)
    // The URL update is now handled by the debounced useEffect
  }

  const handleFilterChange = (value: string) => {
    setCurrentProductFilterStatus(value)
    // The URL update is now handled by the debounced useEffect
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-purple-50 dark:bg-purple-950">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600 dark:text-purple-400" />
        <span className="sr-only">Loading seller store...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 dark:bg-red-950 p-4 text-center">
        <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400 mb-6" />
        <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-3">Something went wrong!</h2>
        <p className="text-red-700 dark:text-red-300 mb-6">
          An error occurred while loading this seller's store. Please try again.
        </p>
        <Button
          onClick={() => fetchSellerData(currentProductSearchQuery, currentProductFilterStatus)} // Retry fetching data
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg"
        >
          Try again
        </Button>
      </div>
    )
  }

  if (!seller) {
    // This case should ideally be handled by notFound() in a Server Component,
    // but as a Client Component, we handle it here.
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Seller Not Found</h2>
        <p className="text-muted-foreground mb-6">The seller you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link href="/sellers">Browse All Sellers</Link>
        </Button>
      </div>
    )
  }

  if (!seller.active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 flex items-center justify-center px-4">
        <Card className="shadow-xl p-12 text-center max-w-md mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl border border-gray-100 dark:border-gray-700">
          <CardContent>
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Store Temporarily Closed
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              This store has been temporarily deactivated. Please contact our support team for more information.
            </p>
            <Button
              asChild
              className="mt-8 bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              <a href="https://wa.me/+233551234567" target="_blank" rel="noopener noreferrer">
                Contact Support
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 transition-colors duration-300">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900 overflow-hidden pt-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat",
            }}
          ></div>
        </div>
        <div className="relative container mx-auto px-4 py-16 text-white">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Store className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">{seller.name}</h1>
            <div className="flex items-center justify-center gap-6 text-white/90 mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{seller.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span className="text-lg">{products.length} Products</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2 text-base">
                <Star className="w-4 h-4 mr-2 fill-current" />
                {seller.rating && seller.reviewCount ? (
                  <span>
                    {seller.rating.toFixed(1)} ({seller.reviewCount} reviews)
                  </span>
                ) : (
                  "No Reviews Yet"
                )}
              </Badge>
              {seller.active && (
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-100 border-green-400/30 px-4 py-2 text-base"
                >
                  Active Now
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <CardContent className="flex items-center justify-between p-0">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <CardContent className="flex items-center justify-between p-0">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Available Items</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {products.filter((p) => p.isAvailable).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
            <CardContent className="flex items-center justify-between p-0">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Seller ID</p>
                <p className="text-lg font-mono text-gray-900 dark:text-white truncate">{sellerId}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Products Section */}
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Featured Products</h2>
              <p className="text-gray-600 dark:text-gray-300">Discover amazing products from this seller</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={currentProductSearchQuery} // Use the current input state
                  onChange={handleSearchChange}
                  className="pl-10 w-full sm:w-auto"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <Select value={currentProductFilterStatus} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="available">In Stock</SelectItem>
                  <SelectItem value="outOfStock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <Card
                  key={product.id}
                  className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-fade-in-up`}
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden">
                    <div className="aspect-square relative">
                      <TwilioMediaDisplay
                        mediaUrl={product.imageUrl}
                        alt={product.description}
                        width={400}
                        height={400}
                        className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {!product.isAvailable && (
                        <Badge className="bg-red-500 text-white dark:bg-red-600">Out of Stock</Badge>
                      )}
                      {product.status === "new" && (
                        <Badge className="bg-green-500 text-white dark:bg-green-600">New</Badge>
                      )}
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge
                        variant="secondary"
                        className="bg-white/90 text-gray-700 dark:bg-gray-700/90 dark:text-gray-200"
                      >
                        {product.stockStatus}
                      </Badge>
                    </div>
                  </div>
                  {/* Product Content */}
                  <CardContent className="p-6">
                    <h3
                      className="font-bold text-lg text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors overflow-hidden"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {product.description}
                    </h3>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">₵{product.price}</p>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {seller.rating ? seller.rating.toFixed(1) : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant="outline"
                        className={`${
                          product.isAvailable
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/50 dark:text-green-400 dark:border-green-600"
                            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-400 dark:border-red-600"
                        }`}
                      >
                        {product.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 bg-transparent"
                      >
                        <Link
                          href={`/sellers/${sellerId}/product/${product.id}`}
                          className="flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700"
                      >
                        <a
                          href={`https://wa.me/${sellerId}?text=I'm%20interested%20in%20buying%20your%20product:%20"${encodeURIComponent(
                            product.description,
                          )}"%20for%20${encodeURIComponent(product.price)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Chat
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
              <CardContent>
                <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-8">
                  <Package className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  No Products Found
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                  {currentProductSearchQuery || currentProductFilterStatus !== "all"
                    ? "No products match your current search and filter criteria."
                    : "This seller hasn't added any products to their store yet. Check back later for amazing deals!"}
                </p>
                <div className="flex justify-center gap-4">
                  <Button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800">
                    Notify Me
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="px-6 py-3 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 bg-transparent"
                  >
                    <Link href="/sellers">Browse Other Sellers</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
        {/* Reviews Section */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Customer Reviews for {seller.name}
          </h2>
          <SellerReviewsDisplay sellerId={sellerId} />
        </section>
      </main>
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">MarketChat GH</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Connecting buyers and sellers across Ghana</p>
            <div className="flex items-center justify-center gap-6">
              <a
                href="https://wa.me/+233209832978"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
