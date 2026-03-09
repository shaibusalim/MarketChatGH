import { adminFirestore } from "@/lib/firebase-admin"
import { SellerCard } from "@/components/seller-card"
import { Header } from "@/components/header"
import { Search, MapPin, Store, ShieldCheck, Star, ArrowRight, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export const revalidate = 0

interface Product {
  id: string
  imageUrl: string
  price: string
  description: string
}

interface Seller {
  id: string
  name: string
  location: string
  active: boolean
  products: Product[]
  summary: string
}

async function getSellersWithProducts(): Promise<Seller[]> {
  try {
    const sellersSnapshot = await adminFirestore.collection("sellers").get()
    const sellers: Seller[] = []

    for (const sellerDoc of sellersSnapshot.docs) {
      const sellerData = sellerDoc.data()
      const productsSnapshot = await adminFirestore
        .collection("products")
        .where("sellerId", "==", sellerDoc.id)
        .limit(6)
        .get()

      const products = productsSnapshot.docs.map((productDoc) => {
        const productData = productDoc.data()
        return {
          id: productDoc.id,
          imageUrl: productData.imageUrl ?? "/img1.jpg",
          price: productData.price ?? "N/A",
          description: productData.description ?? "No description",
        }
      })

      let summary = sellerData.summary || ""
      if (!summary) {
        const productCount = products.length
        const productTypes = products
          .slice(0, 2)
          .map((p) => p.description.split(" ").slice(0, 2).join(" "))
          .join(", ")
        
        summary = productCount > 0
          ? `Sells ${productTypes}${productCount > 2 ? " and more" : ""}. Quality seller in MarketChat GH.`
          : `${sellerData.name ?? "This seller"} offers quality products in our marketplace.`
      }

      sellers.push({
        id: sellerDoc.id,
        name: sellerData.name ?? "Unnamed Seller",
        location: sellerData.location ?? "Ghana",
        active: sellerData.active ?? true,
        products,
        summary,
      })
    }
    return sellers
  } catch (error) {
    console.error("Error fetching sellers with products:", error)
    throw new Error("Failed to fetch seller data.")
  }
}

export default async function SellersPage() {
  const sellers = await getSellersWithProducts()

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* Hero Section */}
      <section className="w-full pt-32 pb-16 px-4 sm:px-6 md:px-8 bg-gradient-to-b from-green-50 to-white dark:from-green-950/20 dark:to-gray-950 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-green-500/10 blur-3xl" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-bold mb-6">
            <Store className="h-4 w-4" />
            <span>MarketChat Business Directory</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-headline mb-6 text-gray-900 dark:text-white">
            Discover Our <span className="text-green-600">Verified Shops</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
            Connect directly with verified local businesses across Ghana. High-quality products, direct communication, and secure transactions.
          </p>
          
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input 
                placeholder="Search shops by name, category, or location..." 
                className="pl-12 h-14 bg-white dark:bg-gray-900 border-none shadow-lg rounded-2xl text-lg focus-visible:ring-2 focus-visible:ring-green-500"
              />
            </div>
            <Button className="h-14 px-8 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-500/30 text-lg">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="w-full py-6 border-y border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center md:justify-between gap-8 md:gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/40 p-2 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{sellers.length}+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Verified Sellers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">12+</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Regions Covered</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/40 p-2 rounded-lg">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">4.8/5</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Average Rating</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-lg">
              <Zap className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">24/7</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">AI Assistant</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="w-full py-16 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        {/* Category Tabs Placeholder */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {["All Shops", "Electronics", "Fashion", "Home & Kitchen", "Beauty", "Automotive"].map((cat) => (
            <button 
              key={cat} 
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${cat === "All Shops" ? "bg-green-500 text-white shadow-md" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-800"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {sellers.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No sellers found at the moment.</p>
            <Button variant="link" className="mt-2 text-green-600 font-bold">Refresh Directory</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sellers.map((seller, index) => (
              <SellerCard key={seller.id} seller={seller as any} index={index} />
            ))}
          </div>
        )}
      </section>

      {/* Join as Seller CTA */}
      <section className="w-full py-16 px-4 sm:px-6 md:px-8 mb-16">
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl border border-gray-800">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-green-500/10 blur-3xl" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">Want to sell on MarketChat?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto relative z-10">
            Transform your WhatsApp into a powerful e-commerce platform. Join our verified directory and reach thousands of customers across Ghana.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link href="/for-sellers">
              <Button className="bg-green-500 hover:bg-green-600 text-white font-bold px-10 py-6 rounded-xl text-xl shadow-lg shadow-green-500/30">
                Get Started as a Seller
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-gray-700 hover:bg-gray-800 text-white font-bold px-10 py-6 rounded-xl text-xl">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="w-full py-8 border-t border-gray-100 dark:border-gray-800 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} MarketChat. All rights reserved.</p>
      </footer>
    </main>
  )
}
