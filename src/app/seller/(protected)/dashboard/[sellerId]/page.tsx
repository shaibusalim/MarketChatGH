"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Filter,
  Menu,
  Eye,
  MousePointerClick,
  Users,
  Calendar,
  History,
  ExternalLink,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MessageCircle,
  Store,
  UserCog
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { signOut } from "next-auth/react"
import { toast } from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { updateProductStatus } from "@/app/mcgh-admin-control/(protected)/actions"
import { SellerProductForm } from "@/components/seller/seller-product-form"
import { SellerSettingsForm } from "@/components/seller/seller-settings-form"
import { SellerAccountSettingsForm } from "@/components/seller/seller-account-settings-form"
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay"
import { motion, AnimatePresence } from "framer-motion"

interface Product {
  id: string
  title?: string
  name?: string
  category?: string
  compareAtPrice?: string | null
  imageUrl: string
  price: string
  description: string
  status: string
  stockStatus: string
  isAvailable: boolean
  views?: number
  displayDescription?: string
}

interface Lead {
  id: string
  productId: string
  productDescription: string
  productPrice: string
  createdAt: string
  type: string
}

interface SellerData {
  id: string
  name: string
  location: string
  phone: string
  active: boolean
  isApproved: boolean
  profileImageUrl?: string
}

import { useParams, useRouter } from "next/navigation"

export default function SellerDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const sellerId = params.sellerId as string
  const didRedirectRef = useRef(false)

  useEffect(() => {
    if (status === 'loading') return
    if (didRedirectRef.current) return
    if (!session || !session.user) {
      didRedirectRef.current = true
      router.replace('/seller/signin')
      return
    }
    const user = session.user as any
    const isAdminUser = Boolean(user.isAdmin || user.role === 'admin')
    if (isAdminUser) {
      didRedirectRef.current = true
      router.replace('/mcgh-admin-control')
    }
  }, [status, session, router])

  const [products, setProducts] = useState<Product[]>([])
  const [sellerInfo, setSellerInfo] = useState<SellerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined)
  const [activityDateFilter, setActivityDateFilter] = useState("7")
  const [searchQuery, setSearchQuery] = useState("")
  const [dashboardCategoryFilter, setDashboardCategoryFilter] = useState("all")
  const [leads, setLeads] = useState<Lead[]>([])
  const [activeTab, setActiveTab] = useState("catalog")
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    outOfStock: 0
  })

  const fetchLeads = useCallback(async (uid?: string) => {
    const targetUid = uid || sellerInfo?.id || sellerId;
    if (!targetUid) return;
    
    try {
      const response = await fetch(`/api/leads?sellerId=${targetUid}&days=${activityDateFilter}&t=${Date.now()}`)
      if (response.ok) {
        const data = await response.json()
        const fetchedLeads = data.leads || []
        // Client-side sort to guarantee correct order even if backend ordering is missing/stale
        fetchedLeads.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setLeads(fetchedLeads)
      }
    } catch (error) {
      console.error("[Leads] Fetch error:", error)
    }
  }, [sellerId, sellerInfo?.id, activityDateFilter])

  const fetchSellerData = useCallback(async (isInitial = false) => {
    if (!sellerId) return
    if (isInitial) setIsLoading(true)
    
    try {
      const response = await fetch(`/api/sellers/${sellerId}?t=${Date.now()}`)
      if (!response.ok) throw new Error("Failed to fetch shop data")
      const data = await response.json()
      setProducts(data.products || [])
      setSellerInfo(data.seller)
      
      // Also fetch leads with the confirmed UID
      if (data.seller?.id) {
        fetchLeads(data.seller.id);
      }
      
      const active = data.products.filter((p: Product) => p.isAvailable).length
      setStats({
        total: data.products.length,
        active: active,
        outOfStock: data.products.length - active
      })
    } catch (error) {
      console.error(error)
      if (isInitial) toast.error("Could not load your shop data")
    } finally {
      if (isInitial) setIsLoading(false)
    }
  }, [sellerId, fetchLeads])

  useEffect(() => {
    // Initial fetch with loader
    fetchSellerData(true)

    // Poll for updates every 10 seconds for real-time feel (without loader)
    const pollInterval = setInterval(() => {
      fetchSellerData(false)
    }, 10000)

    return () => clearInterval(pollInterval)
  }, [fetchSellerData])

  // Re-fetch leads immediately whenever the date filter changes
  useEffect(() => {
    // Skip on first render (initial fetch covers it)
    const targetUid = sellerInfo?.id || sellerId;
    if (targetUid) {
      fetchLeads(targetUid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityDateFilter])

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

  const handleAddProduct = () => {
    setEditingProduct(undefined)
    setIsFormOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const dashboardCategories = [
    "all",
    ...Array.from(new Set(products.map(p => p.category?.trim()).filter(Boolean) as string[]))
  ];

  const filteredProducts = products.map(p => {
    let cleanDescription = p.description
    if (p.description.includes("PRICE:")) {
      cleanDescription = p.description.split("PRICE:")[0].trim()
      cleanDescription = cleanDescription.replace(/[*¶]$/, "").trim()
    }
    return { ...p, displayDescription: cleanDescription || p.description }
  }).filter(p => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || 
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q))
    
    const matchesCategory = dashboardCategoryFilter === "all" || 
      (p.category && p.category.toLowerCase() === dashboardCategoryFilter.toLowerCase())

    return matchesSearch && matchesCategory
  })

  const isAdmin = Boolean((session?.user as any)?.role === "admin" || (session?.user as any)?.isAdmin === true)

  const sidebarItems = (
    <>
      <div className="p-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/marketchat_logo.svg"
            alt="MarketChat Logo"
            width={240}
            height={72}
            className="h-16 w-auto object-contain scale-[1.4] origin-left"
            priority
          />
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4">
        <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black tracking-tight">
          <LayoutDashboard className="h-5 w-5" /> Dashboard
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-2xl text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold tracking-tight">
          <Package className="h-5 w-5" /> My Catalog
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => setIsSettingsOpen(true)}
          className="w-full justify-start gap-3 h-12 rounded-2xl text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold tracking-tight"
        >
          <Settings className="h-5 w-5" /> Shop Profile
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => setIsAccountSettingsOpen(true)}
          className="w-full justify-start gap-3 h-12 rounded-2xl text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold tracking-tight"
        >
          <UserCog className="h-5 w-5" /> User Settings
        </Button>
      </nav>

      <div className="p-6 border-t border-gray-50 dark:border-white/5">
        <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-3xl flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center text-blue-600 font-black">
            {sellerInfo?.name?.[0] || 'S'}
          </div>
          <div className="truncate">
            <p className="text-xs font-black truncate">{sellerInfo?.name || 'Shop'}</p>
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Certified Partner</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 h-12 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-black tracking-tight"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-5 w-5" /> Logout
        </Button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] text-gray-900 dark:text-gray-100 transition-colors duration-500">
      {/* Mobile Header */}
      <header className="lg:hidden h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 fixed top-0 left-0 right-0 z-40 px-6 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center">
          <Image
            src="/marketchat_logo.svg"
            alt="MarketChat Logo"
            width={180}
            height={54}
            className="h-10 w-auto object-contain scale-[1.6] origin-left"
            priority
          />
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl h-12 w-12 bg-gray-50 dark:bg-gray-800 border-none">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 bg-white dark:bg-gray-900 border-r-none border-white/5">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col h-full">
              {sidebarItems}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-white/5 fixed h-full z-30 shadow-2xl transition-all duration-500">
        {sidebarItems}
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 p-6 md:p-12 pt-32 lg:pt-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter italic">
              {isAdmin ? "Partner Management" : "Shop Hub"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold flex items-center gap-2 mt-2">
              <span className="bg-blue-600/10 text-blue-600 px-3 py-1 rounded-full text-[10px] tracking-widest uppercase">v2.0 PRO</span>
              • {sellerInfo?.location || 'Global Shop'} 
            </p>
          </motion.div>
          
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" className="h-12 rounded-2xl border-white/50 dark:border-white/10 shadow-xl bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl font-black italic tracking-tighter">
              <Link href={`/${sellerId}`} target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" /> Live Shop
              </Link>
            </Button>
            <Button 
              onClick={handleAddProduct}
              className="h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black italic tracking-tighter px-6 shadow-xl shadow-blue-600/20"
            >
              <Plus className="h-5 w-5 mr-2" /> New Entry
            </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          {[
            { label: "Total Catalog", val: stats.total, icon: Package, color: "blue" },
            { label: "Active Stock", val: stats.active, icon: CheckCircle2, color: "emerald" },
            { label: "Paused/Out", val: stats.outOfStock, icon: XCircle, color: "red" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border-white/40 dark:border-white/5 rounded-[2rem] shadow-2xl overflow-hidden group">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-4 rounded-2xl bg-${stat.color}-600/10 text-${stat.color}-600 group-hover:scale-110 transition-transform duration-500`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                    {i === 0 && (
                      <Badge className="bg-blue-50/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none font-bold text-[10px] flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" /> +LIVE
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
                  <h3 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">{stat.val}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="catalog" className="w-full" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 sm:pb-0">
             <TabsList className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-1 rounded-2xl border border-white/50 dark:border-white/5 h-14">
               <TabsTrigger value="catalog" className="rounded-xl px-6 data-[state=active]:bg-blue-600 data-[state=active]:text-white font-black tracking-tighter italic">
                 <Package className="h-4 w-4 mr-2" /> Catalog
               </TabsTrigger>
               <TabsTrigger value="leads" className="rounded-xl px-6 data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-black tracking-tighter italic">
                 <MousePointerClick className="h-4 w-4 mr-2" /> Activity Log
               </TabsTrigger>
               <TabsTrigger value="analytics" className="rounded-xl px-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white font-black tracking-tighter italic">
                 <TrendingUp className="h-4 w-4 mr-2" /> Insights
               </TabsTrigger>
             </TabsList>
          </div>

          <TabsContent value="catalog">
            <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-3xl border-white/50 dark:border-white/5 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden">
              <CardHeader className="p-8 md:p-10 border-b border-gray-50 dark:border-white/5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <CardTitle className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white italic">Merchant Catalog</CardTitle>
                    <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mt-1">Managing {filteredProducts.length} items</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative group flex-1 md:w-64">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                      <input 
                        type="text" 
                        placeholder="Search items..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-3.5 bg-gray-50 dark:bg-gray-800/50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500/50 outline-none transition-all shadow-inner"
                      />
                    </div>
                    {dashboardCategories.length > 2 && (
                      <Select value={dashboardCategoryFilter} onValueChange={setDashboardCategoryFilter}>
                        <SelectTrigger className="w-40 h-[46px] rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-none text-xs font-bold">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {dashboardCategories.filter(c => c !== "all").map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Catalog...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-40">
                      <div className="h-24 w-24 bg-gray-50 dark:bg-gray-800/40 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <Package className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter italic">No Items Found</h3>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50 dark:divide-white/5">
                      {filteredProducts.map((product, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.05 }}
                          key={product.id} 
                          className="group p-4 sm:p-6 md:p-8 hover:bg-white/50 dark:hover:bg-blue-600/5 transition-all duration-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                        >
                          <div className="flex items-start gap-4 sm:gap-6 flex-1 min-w-0 w-full group-hover:scale-[1.01] transition-transform duration-500">
                            <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl relative flex-shrink-0 bg-gray-100 flex items-center justify-center border border-gray-100 dark:border-gray-800">
                              <TwilioMediaDisplay 
                                mediaUrl={product.imageUrl} 
                                alt={product.description} 
                                width={112}
                                height={112}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                              />
                            </div>
                            
                            <div className="flex-1 min-w-0 overflow-hidden pt-1">
                              <div className="space-y-2">
                                <h4 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white tracking-tighter uppercase italic leading-tight whitespace-normal break-words underline decoration-blue-500/30">
                                  {product.title || product.name || product.displayDescription || product.description}
                                </h4>
                                
                                <div className="flex flex-wrap items-center gap-4">
                                  <div className="bg-blue-600 dark:bg-blue-500 px-4 py-1 rounded-xl shadow-lg shadow-blue-500/20 transform -skew-x-12">
                                     <span className="text-lg sm:text-2xl font-black text-white tracking-tighter italic block skew-x-12">
                                       ₵{product.price}
                                     </span>
                                  </div>
                                  
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={`border-none text-[8px] font-black tracking-widest px-3 py-1.5 shadow-sm transform hover:scale-105 transition-transform ${product.isAvailable ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
                                      {product.isAvailable ? "IN STOCK" : "OUT OF STOCK"}
                                    </Badge>
                                    {product.category && (
                                      <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-none text-[8px] font-black tracking-widest px-2.5 py-1">
                                        {product.category}
                                      </Badge>
                                    )}
                                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-inner border border-gray-200 dark:border-white/5">
                                      <Eye className="h-3 w-3 text-gray-400" />
                                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">{product.views || 0} views</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 w-full lg:w-auto shrink-0 bg-white/50 dark:bg-gray-800/40 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-gray-200/50 dark:border-white/5 shadow-lg backdrop-blur-xl relative z-10 self-stretch sm:self-auto justify-between sm:justify-start">
                            <div className="flex items-center gap-4 pr-4 sm:pr-6 border-r border-gray-100 dark:border-gray-700">
                               <div className="flex flex-col">
                                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Stock</span>
                                 <span className={`text-[12px] font-black uppercase tracking-tighter italic ${product.isAvailable ? "text-emerald-500" : "text-red-500"}`}>
                                   {product.isAvailable ? "Live" : "Ended"}
                                 </span>
                               </div>
                               <Switch 
                                 checked={product.isAvailable}
                                 onCheckedChange={() => handleToggleStatus(product.id, product.isAvailable)}
                                 className="data-[state=checked]:bg-emerald-500 shadow-lg scale-110"
                               />
                            </div>
                            
                            <div className="flex gap-2 sm:gap-3">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 shadow-md hover:bg-blue-600 hover:text-white hover:scale-110 transition-all duration-300 group/btn"
                                onClick={() => handleEditProduct(product)}
                                title="Edit Product"
                              >
                                <Settings className="h-5 w-5 group-hover/btn:rotate-90 transition-transform duration-500" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl border-gray-200 dark:border-gray-700 text-red-500 shadow-md hover:bg-red-600 hover:text-white hover:scale-110 transition-all duration-300 group/btn"
                                onClick={() => handleDeleteProduct(product.id)}
                                title="Delete Product"
                              >
                                <Trash2 className="h-5 w-5 group-hover/btn:animate-bounce" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads">
            <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-3xl border-white/50 dark:border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <CardHeader className="p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white italic">Customer Interactions</CardTitle>
                      <p className="text-xs text-gray-500 font-bold tracking-widest uppercase mt-1">Activity logs for your shop</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filter:</span>
                      <Select value={activityDateFilter} onValueChange={setActivityDateFilter}>
                        <SelectTrigger className="w-[160px] bg-white dark:bg-gray-800 border-gray-100 dark:border-white/10 rounded-xl font-bold text-xs">
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-white/10 shadow-2xl">
                          <SelectItem value="1" className="text-xs font-bold">Today</SelectItem>
                          <SelectItem value="7" className="text-xs font-bold">Last 7 Days</SelectItem>
                          <SelectItem value="30" className="text-xs font-bold">Last 30 Days</SelectItem>
                          <SelectItem value="all" className="text-xs font-bold">All Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
               <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    {leads.length === 0 ? (
                      <div className="text-center py-40">
                        <div className="h-20 w-20 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                           <History className="h-8 w-8 text-emerald-300" />
                        </div>
                        <p className="text-sm font-bold text-gray-400">No recent activity found.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50 dark:divide-white/5">
                        {leads.map((lead, idx) => {
                          const isLead = lead.type === "chat_to_buy";
                          const isView = lead.type === "product_view";
                          const isVisit = lead.type === "store_visit";
                          
                          let Icon = MousePointerClick;
                          let iconColor = "text-emerald-600";
                          let bgColor = "bg-emerald-100 dark:bg-emerald-900/40";
                          let label = "Customer Interaction";
                          let detail = lead.productDescription ? `Product: ${lead.productDescription}` : "General interaction";

                          if (isLead) {
                            Icon = MessageCircle;
                            iconColor = "text-green-600";
                            bgColor = "bg-green-100 dark:bg-green-900/40";
                            label = "WhatsApp Lead: Clicked 'Chat to Buy'";
                          } else if (isView) {
                            Icon = Eye;
                            iconColor = "text-blue-600";
                            bgColor = "bg-blue-100 dark:bg-blue-900/40";
                            label = "Product Viewed";
                          } else if (isVisit) {
                            Icon = Store;
                            iconColor = "text-purple-600";
                            bgColor = "bg-purple-100 dark:bg-purple-900/40";
                            label = "Store Visited";
                            detail = "A customer visited your shop front";
                          }

                          return (
                            <div key={lead.id} className="p-8 flex items-center justify-between group hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-all border-b border-gray-50 dark:border-white/5 last:border-0">
                               <div className="flex items-center gap-6">
                                  <div className={`h-12 w-12 rounded-xl ${bgColor} flex items-center justify-center ${iconColor} shadow-sm group-hover:scale-110 transition-transform`}>
                                     <Icon className="h-6 w-6" />
                                  </div>
                                  <div>
                                     <p className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">{label}</p>
                                     <p className="text-xs text-gray-500 font-bold mt-1">
                                       {detail} {lead.productPrice && `• ${lead.productPrice}`}
                                     </p>
                                  </div>
                               </div>
                               <div className="text-right">
                                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(lead.createdAt).toLocaleDateString()}</p>
                                  <p className={`text-[10px] font-black ${iconColor} uppercase tracking-widest mt-1`}>{new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                               </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </ScrollArea>
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-3xl border-white/50 dark:border-white/5 rounded-[2.5rem] p-8">
                  <h4 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-2">
                     <Users className="h-5 w-5 text-purple-600" /> Traffic Overview
                  </h4>
                  <div className="space-y-6">
                     {filteredProducts.slice(0, 5).sort((a, b) => (b.views || 0) - (a.views || 0)).map((p, i) => (
                        <div key={p.id} className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-gray-300">#{i+1}</span>
                              <p className="text-xs font-bold truncate w-40">{p.description}</p>
                           </div>
                           <div className="flex items-center gap-2">
                              <div className="h-1 w-20 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                 <div className="h-full bg-purple-600 rounded-full" style={{ width: `${Math.min((p.views || 0) * 10, 100)}%` }} />
                              </div>
                              <span className="text-[10px] font-black">{p.views || 0}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </Card>
               <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-3xl border-white/50 dark:border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-20 bg-purple-100 dark:bg-purple-900/40 rounded-3xl flex items-center justify-center text-purple-600 mb-6">
                     <TrendingUp className="h-10 w-10" />
                  </div>
                  <h4 className="text-2xl font-black italic tracking-tighter">Conversion Ready</h4>
                  <p className="text-xs font-bold text-gray-500 mt-2 max-w-[200px]">You have {leads.length} new interactions today. Keep your catalog fresh to drive more sales!</p>
               </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Floating Action Hint */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-50 border border-white/10 backdrop-blur-xl"
      >
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp Sync Enabled</span>
      </motion.div>

      <SellerProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={fetchSellerData}
        sellerId={sellerId}
        product={editingProduct}
      />

      {sellerInfo && (
        <SellerSettingsForm
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSuccess={fetchSellerData}
          sellerId={sellerId}
          currentData={{
            name: sellerInfo.name,
            location: sellerInfo.location,
            phone: sellerInfo.phone,
            profileImageUrl: sellerInfo.profileImageUrl,
          }}
        />
      )}

      {sellerInfo && (
        <SellerAccountSettingsForm
          isOpen={isAccountSettingsOpen}
          onClose={() => setIsAccountSettingsOpen(false)}
          onSuccess={() => {
            toast.success("Account settings updated.")
          }}
          sellerId={sellerInfo.id || sellerId}
          currentEmail={(session?.user as any)?.email || ""}
        />
      )}
    </div>
  )
}
