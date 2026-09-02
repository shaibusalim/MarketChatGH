"use client"

import { Button } from "@/components/ui/button"
import { Suspense, useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { AdminStatsCards } from "@/components/admin/admin-stats-cards"
import { AdminOnboardSellerForm } from "@/components/admin/admin-onboard-seller-form"
import { AdminProductsChart } from "@/components/admin/admin-products-chart"
import { AdminSellerSearch } from "@/components/admin/admin-seller-search"
import { AdminActivityLog } from "@/components/admin/admin-activity-log"
import { AdminSellersTable } from "@/components/admin/admin-sellers-table"
import { AdminPendingSellers } from "@/components/admin/admin-pending-sellers"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { useSession } from 'next-auth/react'

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
	name: string | null | undefined
	location: string
	active: boolean
	products: Product[]
}

function AdminDashboardContent() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { data: session, status } = useSession()
	const didRedirectRef = useRef(false)

	const [sellers, setSellers] = useState<Seller[]>([])
	const [chartSellers, setChartSellers] = useState<Seller[]>([])
	const [total, setTotal] = useState(0)
	const [searchQuery, setSearchQuery] = useState<string>(searchParams.get("q") ?? "")
	const [page, setPage] = useState(Number.parseInt(searchParams.get("page") ?? "1", 10) || 1)
	const [isSidebarOpen, setIsSidebarOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [isChartLoading, setIsChartLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [chartError, setChartError] = useState<string | null>(null)

	const pageSize = 10
	const baseUrl = undefined

	useEffect(() => {
		if (status === 'loading') return
		if (didRedirectRef.current) return
		const user = session?.user as any
		const isAdmin = Boolean(user?.isAdmin || user?.role === 'admin')
		if (!session || !isAdmin) {
			didRedirectRef.current = true
			// Don't reveal admin endpoint. 404 — there's nothing here.
			router.replace('/404')
		}
	}, [status, session, router])

	const fetchSellers = useCallback(async () => {
		setIsLoading(true)
		setError(null)
		try {
			const url = new URL("/api/sellers", typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
			url.searchParams.append("q", searchQuery)
			url.searchParams.append("page", page.toString())
			url.searchParams.append("pageSize", pageSize.toString())

			const response = await fetch(url.toString())

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || `Failed to fetch sellers (Status: ${response.status})`)
			}

			const data = await response.json()
			const validatedSellers = (data.sellers || []).map((seller: Seller) => ({
				...seller,
				name: seller.name || 'Unknown Seller',
				products: seller.products || [],
			}))
			setSellers(validatedSellers)
			setTotal(data.total || 0)
		} catch (err) {
			setError((err as Error).message)
			toast.error("Failed to load sellers: " + (err as Error).message, { duration: 5000 })
		} finally {
			setIsLoading(false)
		}
	}, [searchQuery, page, pageSize, baseUrl])

	useEffect(() => {
		if (status === 'authenticated' && session.user?.isAdmin) {
			fetchSellers()
		}
	}, [fetchSellers, status, session])

	useEffect(() => {
		const fetchAllSellersForChart = async () => {
			setIsChartLoading(true)
			setChartError(null)
			try {
				const url = new URL("/api/sellers", typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
				url.searchParams.append("all", "true")

				const response = await fetch(url.toString())
				if (!response.ok) {
					const errorData = await response.json()
					throw new Error(errorData.error || `Failed to fetch chart data (Status: ${response.status})`)
				}
				const data = await response.json()
				const validatedChartSellers = (data.sellers || []).map((seller: Seller) => ({
					...seller,
					name: seller.name || 'Unknown Seller',
					products: seller.products || [],
				}))
				setChartSellers(validatedChartSellers)
			} catch (err) {
				setChartError((err as Error).message)
				toast.error("Failed to load chart data: " + (err as Error).message)
			} finally {
				setIsChartLoading(false)
			}
		}
		if (status === 'authenticated' && session.user?.isAdmin) {
			fetchAllSellersForChart()
		}
	}, [status, session, baseUrl])

	if (status === 'loading') {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
			</div>
		)
	}
	if (!session || !session.user?.isAdmin) {
		return null
	}

	const totalProducts = sellers.reduce((sum, seller) => sum + (seller.products?.length || 0), 0)
	const activeSellers = sellers.filter((seller) => seller.active).length
	const totalPages = Math.ceil(total / pageSize)

	const handleSearch = (newQuery: string) => {
		setSearchQuery(newQuery || '')
		setPage(1)
		router.push(`/mcgh-admin-control?q=${encodeURIComponent(newQuery || '')}&page=1`)
	}

	const handlePageChange = (newPage: number) => {
		setPage(newPage)
		router.push(`/mcgh-admin-control?q=${encodeURIComponent(searchQuery || '')}&page=${newPage}`)
	}

	const handleDataRefresh = () => {
		fetchSellers()
	}

	return (
		<main className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
			<AdminSidebar isMobileMenuOpen={isSidebarOpen} setIsMobileMenuOpen={setIsSidebarOpen} />

			<div className="flex min-h-screen">
				<div className="flex-1 md:ml-64 pt-16 md:pt-0 px-6 sm:px-10 py-8 max-w-[1600px] mx-auto">
					{/* Professional Header */}
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
						<div>
							<h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
								Dashboard <span className="text-blue-600 dark:text-blue-400">Overview</span>
							</h1>
							<p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Manage your marketplace ecosystem and seller performance.</p>
						</div>
						<div className="flex items-center gap-3">
							<Button 
								variant="outline" 
								className="rounded-xl border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all font-bold text-xs px-5"
								onClick={handleDataRefresh}
							>
								Export Report
							</Button>
							<Button 
								className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all font-bold text-xs px-5"
								onClick={handleDataRefresh}
							>
								Sync Data
							</Button>
						</div>
					</div>

					<AdminPendingSellers onDataRefresh={handleDataRefresh} />

					<AdminStatsCards
						totalSellers={total}
						activeSellers={activeSellers}
						totalProducts={totalProducts}
					/>

					<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
						<div className="xl:col-span-2 space-y-8">
							{isChartLoading ? (
								<Card className="h-[400px] flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl border-none shadow-xl rounded-3xl">
									<Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
								</Card>
							) : (
								<AdminProductsChart sellers={chartSellers} />
							)}

							<AdminSellersTable
								sellers={sellers}
								total={total}
								page={page}
								totalPages={totalPages}
								onPageChange={handlePageChange}
								onDataRefresh={handleDataRefresh}
							/>
						</div>

						<div className="space-y-8">
							<Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 dark:border-gray-800/50 overflow-hidden">
								<CardContent className="p-0">
									<div className="p-6 border-b border-gray-100 dark:border-gray-800">
										<h3 className="font-black text-gray-900 dark:text-white tracking-tight">Quick Search</h3>
									</div>
									<div className="p-6">
										<AdminSellerSearch searchQuery={searchQuery} onSearch={handleSearch} />
									</div>
								</CardContent>
							</Card>

							<AdminOnboardSellerForm onSuccess={handleDataRefresh} />
							
							<AdminActivityLog />
						</div>
					</div>

					{isLoading && (
						<div className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
							<Loader2 className="h-4 w-4 animate-spin" />
							<span className="text-xs font-bold">Refreshing workspace...</span>
						</div>
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
