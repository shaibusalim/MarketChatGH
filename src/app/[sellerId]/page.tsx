import { firestore } from "@/lib/firebase";
import { adminFirestore } from "@/lib/firebase-admin"; 
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay";
import { MapPin, Phone, Package, Star, ShoppingBag, Store, Eye, MessageCircle } from "lucide-react";
import { AnimatedStyles } from "@/components/AnimatedStyle";
import { getDoc, doc, collection, query, where, orderBy, getDocs } from "firebase/firestore";

interface Product {
  id: string;
  imageUrl: string;
  price: string;
  description: string;
  status: string;
  stockStatus: string;
  isAvailable: boolean;
  sellerId: string;
  createdAt: Date;
}

async function getSellerProducts(sellerId: string): Promise<Product[]> {
  try {
    const productsRef = adminFirestore.collection("products");
    const productsSnapshot = await productsRef
      .where("sellerId", "==", sellerId)
      .orderBy("createdAt", "desc")
      .get();

    if (productsSnapshot.empty) {
      return [];
    }

    return productsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        imageUrl: data.imageUrl ?? "",
        price: data.price ?? "",
        description: data.description ?? "",
        status: data.status ?? "",
        stockStatus: data.stockStatus ?? "",
        isAvailable: data.isAvailable ?? false,
        sellerId: data.sellerId ?? "",
        createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)) : new Date(),
      };
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function isSellerActive(sellerId: string): Promise<boolean> {
  try {
    const sellerDoc = await adminFirestore.collection("sellers").doc(sellerId).get();
    return sellerDoc.exists ? sellerDoc.data()?.active ?? true : true;
  } catch (error) {
    console.error("Error checking seller status:", error);
    return true; // Default to active if error occurs
  }
}
async function getSellerInfo(sellerId: string): Promise<{ name: string; location: string } | null> {
  const doc = await firestore.collection("sellers").doc(sellerId).get();
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    name: data?.name ?? sellerId,
    location: data?.location ?? "Unknown",
  };
}

export async function generateMetadata({ params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await params; // Await params first
  const sellerInfo = await getSellerInfo(sellerId);

  return {
    title: `${sellerInfo?.name || sellerId}'s Shop`,
    description: `Browse products from ${sellerInfo?.name || sellerId} in ${sellerInfo?.location || "Unknown"} on MarketChat GH.`,
  };
}

export default async function SellerPage({ params }: { params: Promise<{ sellerId: string }> }) {
  // Await the params to get the sellerId
  const { sellerId } = await params;

  const active = await isSellerActive(sellerId);
  if (!active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Store Temporarily Closed</h2>
          <p className="text-gray-600 leading-relaxed">
            This store has been temporarily deactivated. Please contact our support team for more information.
          </p>
          <div className="mt-8">
            <button className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  const products = await getSellerProducts(sellerId);
  const sellerInfo = await getSellerInfo(sellerId);

  // Rest of your component remains the same, but use `sellerId` instead of `params.sellerId`
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AnimatedStyles />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Store className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              {sellerInfo?.name ?? sellerId}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-white/90 mb-8">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{sellerInfo?.location ?? "Unknown Location"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span className="text-lg">{products.length} Products</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-4 py-2 text-base">
                <Star className="w-4 h-4 mr-2 fill-current" />
                Verified Seller
              </Badge>
              <Badge variant="secondary" className="bg-green-500/20 text-green-100 border-green-400/30 px-4 py-2 text-base">
                Active Now
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Available Items</p>
                <p className="text-3xl font-bold text-green-600">
                  {products.filter(p => p.isAvailable).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Seller ID</p>
                <p className="text-lg font-mono text-gray-900 truncate">{sellerId}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Store className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        {products.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
                <p className="text-gray-600">Discover amazing products from this seller</p>
              </div>
              <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full border">
                {products.length} items found
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className={`group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ${
                    index < 4 ? 'animate-fade-in-up' : ''
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
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
                    
                    {/* Overlay badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {!product.isAvailable && (
                        <Badge className="bg-red-500 text-white">Out of Stock</Badge>
                      )}
                      {product.status === 'new' && (
                        <Badge className="bg-green-500 text-white">New</Badge>
                      )}
                    </div>

                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-white/90 text-gray-700">
                        {product.stockStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Product Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {product.description}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-2xl font-bold text-green-600">{product.price}</p>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-gray-600">4.8</span>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge 
                        variant="outline" 
                        className={`${product.isAvailable 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {product.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <Link
                        href={`/${sellerId}/product/${product.id}`}
                        className="flex-1 bg-gray-100 text-gray-700 text-center px-4 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                      
                      <a
                        href={`https://wa.me/${sellerId}?text=I'm%20interested%20in%20buying%20your%20product:%20"${encodeURIComponent(
                          product.description
                        )}"%20for%20${encodeURIComponent(product.price)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-500 text-white text-center px-4 py-3 rounded-xl hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Chat
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <Package className="w-16 h-16 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Products Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              This seller hasn't added any products to their store yet. Check back later for amazing deals!
            </p>
            <div className="flex justify-center gap-4">
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Notify Me
              </button>
              <Link 
                href="/" 
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Browse Other Sellers
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Store className="w-6 h-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">MarketChat GH</span>
            </div>
            <p className="text-gray-600 mb-6">
              Connecting buyers and sellers across Ghana
            </p>
            <div className="flex items-center justify-center gap-6">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <Phone className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}