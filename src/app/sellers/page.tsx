import { adminFirestore } from "@/lib/firebase-admin" // Assuming this path is correct and setup
import { SellerCard } from "@/components/seller-card" // Import the new SellerCard component
import { generateSellerSummaryFlow } from "@/ai/flows/generate-seller-summary"
import { callAIWithRetry } from "@/ai/genkit"

export const revalidate = 0 // Ensure data is always fresh

// --- Types ---
interface Product {
  id: string
  imageUrl: string
  price: string
  description: string
}

interface Seller {
  id: string
  name: string
  products: Product[]
  summary: string
}

// --- Firestore query ---
async function getSellersWithProducts(): Promise<Seller[]> {
  try {
    const sellersSnapshot = await adminFirestore.collection("sellers").get()
    const sellers: Seller[] = []

    for (const sellerDoc of sellersSnapshot.docs) {
      const sellerData = sellerDoc.data()
      // Fetch up to 6 products for preview
      const productsSnapshot = await adminFirestore
        .collection("products")
        .where("sellerId", "==", sellerDoc.id)
        .limit(6) // Increased limit for more product previews
        .get()

      const products = productsSnapshot.docs.map((productDoc) => {
        const productData = productDoc.data()
        return {
          id: productDoc.id,
          imageUrl: productData.imageUrl ?? "/placeholder-product.png", // Use the generated placeholder
          price: productData.price ?? "N/A",
          description: productData.description ?? "No description",
        }
      })

      // Check if summary exists in cache (seller document)
      let summary = sellerData.summary || ""

      // If no cached summary, generate one and cache it
      if (!summary) {
        try {
          const result = await callAIWithRetry(
            () => generateSellerSummaryFlow({
              sellerName: sellerData.name ?? "Unnamed Seller",
              products,
            }),
            3, // max retries
            2000 // initial delay
          )
          summary = result.summary

          // Cache the summary in Firestore
          await adminFirestore.collection("sellers").doc(sellerDoc.id).update({
            summary,
            summaryLastGenerated: new Date(),
          })
        } catch (aiError) {
          console.error(`Failed to generate summary for seller ${sellerDoc.id} after retries:`, aiError)
          // Fallback to a generic summary if AI fails
          summary = `${sellerData.name ?? "This seller"} offers quality products in our marketplace.`
        }
      }

      sellers.push({
        id: sellerDoc.id,
        name: sellerData.name ?? "Unnamed Seller",
        products,
        summary,
      })
    }
    return sellers
  } catch (error) {
    console.error("Error fetching sellers with products:", error)
    // In a real app, you might want to log this error to an error tracking service
    throw new Error("Failed to fetch seller data. Please try again later.")
  }
}

// --- Sellers page component ---
export default async function SellersPage() {
  const sellers = await getSellersWithProducts()

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 transition-colors duration-300 py-16">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          Discover Our Amazing Sellers
        </h1>
        {sellers.length === 0 ? (
          <div className="text-center text-muted-foreground text-lg py-10">
            No sellers found at the moment. Please check back later!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sellers.map((seller, index) => (
              <SellerCard key={seller.id} seller={seller} index={index} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
