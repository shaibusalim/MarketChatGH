"use client"

import { Button } from "@/components/ui/button"

import { Suspense, useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { AdminStatsCards } from "@/components/admin/admin-stats-cards"
import { AdminOnboardSellerForm } from "@/components/admin/admin-onboard-seller-form"
import { AdminProductsChart } from "@/components/admin/admin-products-chart"
import { AdminSellerSearch } from "@/components/admin/admin-seller-search"
import { AdminSellersTable } from "@/components/admin/admin-sellers-table"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Loader2 } from "lucide-react"
import { toast } from "react-hot-toast" // Ensure react-hot-toast is installed

// --- Types ---
interface Product {
  id: string
  imageUrl: string
  price: string
  description: string
  sellerId: string
  createdAt: string
  status: string
  stockStatus: string
  isAvailable: boolean
}

interface Seller {
  id: string
  name: string
  location: string
  active: boolean
  products: Product[]
}

function AdminDashboardContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [sellers, setSellers] = useState<Seller[]>([])
  const [chartSellers, setChartSellers] = useState<Seller[]>([]) // For the chart
  const [total, setTotal] = useState(0)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [page, setPage] = useState(Number.parseInt(searchParams.get("page") || "1", 10) || 1)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isChartLoading, setIsChartLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartError, setChartError] = useState<string | null>(null)

  const pageSize = 10 // Define pageSize here

  const fetchSellers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = new URL("/api/sellers", window.location.origin)
      url.searchParams.append("q", searchQuery)
      url.searchParams.append("page", page.toString())
      url.searchParams.append("pageSize", pageSize.toString()) // Pass pageSize to API

      console.log(`[Client] Fetching from ${url.toString()}`)
      const response = await fetch(url.toString())
      console.log(`[Client] Response status: ${response.status}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch sellers (Status: ${response.status})`)
      }

      const data = await response.json()
      console.log("[Client] Fetched data:", data)
      setSellers(data.sellers || [])
      setTotal(data.total || 0)
      // If your API returns lastDocId for pagination, you'd handle it here.
      // For simple page-based pagination, total and current page are sufficient.
    } catch (err) {
      console.error("[Client] Error fetching sellers:", err)
      setError((err as Error).message)
      toast.error("Failed to load sellers: " + (err as Error).message, { duration: 5000 })
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, page, pageSize]) // Include pageSize in dependencies

  useEffect(() => {
    fetchSellers()
  }, [fetchSellers])

  // Fetch all sellers for the chart
  useEffect(() => {
    const fetchAllSellersForChart = async () => {
      setIsChartLoading(true)
      setChartError(null)
      try {
        const url = new URL("/api/sellers", window.location.origin)
        url.searchParams.append("all", "true") // Signal to fetch all sellers

        const response = await fetch(url.toString())
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to fetch chart data (Status: ${response.status})`)
        }
        const data = await response.json()
        setChartSellers(data.sellers || [])
      } catch (err) {
        console.error("[Client] Error fetching chart data:", err)
        setChartError((err as Error).message)
        toast.error("Failed to load chart data: " + (err as Error).message)
      } finally {
        setIsChartLoading(false)
      }
    }
    fetchAllSellersForChart()
  }, [])

  const totalProducts = sellers.reduce((sum, seller) => sum + seller.products.length, 0)
  const activeSellers = sellers.filter((seller) => seller.active).length
  const totalPages = Math.ceil(total / pageSize)

  const handleSearch = (newQuery: string) => {
    setSearchQuery(newQuery)
    setPage(1) // Reset to first page on new search
    router.push(`/admin?q=${encodeURIComponent(newQuery)}&page=1`)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    router.push(`/admin?q=${encodeURIComponent(searchQuery)}&page=${newPage}`)
  }

  const handleDataRefresh = () => {
    fetchSellers() // Re-fetch data after an action
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <AdminSidebar isMobileMenuOpen={isSidebarOpen} setIsMobileMenuOpen={setIsSidebarOpen} />

      <div className="flex min-h-screen">
        {/* Main Content */}
        <div className="flex-1 md:ml-64 pt-16 md:pt-0 px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          {/* Stats Overview */}
          <AdminStatsCards
            totalSellers={total} // Use total from API for overall count
            activeSellers={activeSellers}
            totalProducts={totalProducts}
          />

          {/* Loading/Error State */}
          {isLoading && (
            <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700">
              <CardContent className="text-center py-8">
                <div className="animate-pulse">
                  <Loader2 className="h-8 w-8 mx-auto text-blue-600 dark:text-blue-400 animate-spin mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Loading sellers...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {error && (
            <Card className="mb-6 bg-red-50/90 dark:bg-red-900/50 shadow-md rounded-xl border border-red-200 dark:border-red-600">
              <CardContent className="text-center py-8">
                <p className="text-sm text-red-700 dark:text-red-400">Error: {error}</p>
                <Button
                  variant="outline"
                  onClick={handleDataRefresh} // Use handleDataRefresh to re-fetch
                  className="mt-4 text-sm border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-800/50 bg-transparent"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Onboard Seller */}
                <AdminOnboardSellerForm onSuccess={handleDataRefresh} />
                {/* Sellers Search */}
                <AdminSellerSearch searchQuery={searchQuery} onSearch={handleSearch} />
              </div>

              {/* Products Chart */}
              {isChartLoading ? (
                <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700">
                  <CardContent className="text-center py-8">
                    <Loader2 className="h-6 w-6 mx-auto text-blue-600 dark:text-blue-400 animate-spin" />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Loading Chart...</p>
                  </CardContent>
                </Card>
              ) : chartError ? (
                <Card className="mb-6 bg-red-50/90 dark:bg-red-900/50 shadow-md rounded-xl border border-red-200 dark:border-red-600">
                  <CardContent className="text-center py-8">
                    <p className="text-sm text-red-700 dark:text-red-400">Chart Error: {chartError}</p>
                  </CardContent>
                </Card>
              ) : (
                <AdminProductsChart sellers={chartSellers} />
              )}

              {/* Sellers Section */}
              <AdminSellersTable
                sellers={sellers}
                total={total}
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                onDataRefresh={handleDataRefresh}
              />
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading Admin Dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  )
}
