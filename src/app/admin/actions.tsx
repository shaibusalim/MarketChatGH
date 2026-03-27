"use server"

import { adminFirestore } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"
import { generateSlug } from "@/lib/utils"

// Helper to simulate delay for network requests
const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function onboardSeller(formData: FormData) {
  await simulateDelay(500) // Simulate network delay

  const sellerId = formData.get("sellerId") as string
  const name = formData.get("name") as string
  const location = formData.get("location") as string
  const phone = sellerId // For onboarding, sellerId is the phone number

  if (!sellerId || !name || !location) {
    return { success: false, message: "All fields are required." }
  }

  const slug = generateSlug(name)

  try {
    // Check if sellerId already exists
    const sellerDoc = await adminFirestore.collection("sellers").doc(sellerId).get()
    if (sellerDoc.exists) {
      return { success: false, message: "Seller with this ID (Phone Number) already exists." }
    }

    await adminFirestore.collection("sellers").doc(sellerId).set({
      name,
      location,
      phone,
      slug,
      active: true, // Default to active
      isApproved: true, // Auto-approve if onboarded by admin
      createdAt: new Date().toISOString(),
    })

    revalidatePath("/admin") // Revalidate the admin page to show new seller
    return { success: true, message: "Seller onboarded successfully!" }
  } catch (error) {
    console.error("Error onboarding seller:", error)
    return { success: false, message: `Failed to onboard seller: ${(error as Error).message}` }
  }
}

export async function updateProductStatus(formData: FormData) {
  await simulateDelay(300) // Simulate network delay

  const productId = formData.get("productId") as string
  const action = formData.get("action") as "markAvailable" | "markOutOfStock" | "delete" | "update"

  if (!productId || !action) {
    return { success: false, message: "Product ID and action are required." }
  }

  try {
    const productRef = adminFirestore.collection("products").doc(productId)

    if (action === "markAvailable") {
      await productRef.update({ isAvailable: true, stockStatus: "available" })
      const productDoc = await productRef.get()
      const sellerId = productDoc.data()?.sellerId
      if (sellerId) {
        revalidatePath(`/${sellerId}`)
        revalidatePath(`/seller/dashboard/${sellerId}`)
      }
      revalidatePath("/admin")
      return { success: true, message: "Product is now In Stock." }
    } else if (action === "markOutOfStock") {
      await productRef.update({ isAvailable: false, stockStatus: "out_of_stock" })
      const productDoc = await productRef.get()
      const sellerId = productDoc.data()?.sellerId
      if (sellerId) {
        revalidatePath(`/${sellerId}`)
        revalidatePath(`/seller/dashboard/${sellerId}`)
      }
      revalidatePath("/admin")
      return { success: true, message: "Product is now Out of Stock." }
    } else if (action === "delete") {
      const productDoc = await productRef.get()
      const sellerId = productDoc.data()?.sellerId
      await productRef.delete()
      if (sellerId) {
        revalidatePath(`/${sellerId}`)
        revalidatePath(`/seller/dashboard/${sellerId}`)
      }
      revalidatePath("/admin")
      return { success: true, message: "Product deleted successfully." }
    } else if (action === "update") {
      const price = formData.get("price") as string
      const description = formData.get("description") as string
      const imageUrl = formData.get("imageUrl") as string
      const isAvailable = formData.get("isAvailable") === "true"
      
      const updates: any = {}
      if (price) updates.price = price
      if (description) updates.description = description
      if (imageUrl) updates.imageUrl = imageUrl
      updates.isAvailable = isAvailable
      updates.stockStatus = isAvailable ? "available" : "out_of_stock"
      
      await productRef.update(updates)
      
      const productDoc = await productRef.get()
      const productData = productDoc.data()
      if (productData?.sellerId) {
        revalidatePath(`/${productData.sellerId}`)
        revalidatePath(`/seller/dashboard/${productData.sellerId}`)
      }
      
      revalidatePath("/admin")
      return { success: true, message: "Product updated successfully." }
    } else {
      return { success: false, message: "Invalid action." }
    }
  } catch (error) {
    console.error(`Error performing product action (${action}):`, error)
    return { success: false, message: `Failed to perform action: ${(error as Error).message}` }
  }
}

export async function addProduct(formData: FormData) {
  await simulateDelay(500)

  const sellerId = formData.get("sellerId") as string
  const price = formData.get("price") as string
  const description = formData.get("description") as string
  const imageUrl = formData.get("imageUrl") as string

  if (!sellerId || !price || !description || !imageUrl) {
    return { success: false, message: "All fields are required." }
  }

  try {
    await adminFirestore.collection("products").add({
      sellerId,
      price,
      description,
      imageUrl,
      isAvailable: true,
      stockStatus: "In Stock",
      status: "available",
      createdAt: new Date().toISOString(),
    })

    revalidatePath(`/${sellerId}`)
    revalidatePath(`/seller/dashboard/${sellerId}`)
    revalidatePath("/admin")
    return { success: true, message: "Product added successfully!" }
  } catch (error) {
    console.error("Error adding product:", error)
    return { success: false, message: `Failed to add product: ${(error as Error).message}` }
  }
}

export async function approveSeller(formData: FormData) {
  await simulateDelay(300)

  const sellerId = formData.get("sellerId") as string
  const approved = formData.get("approved") === "true"

  if (!sellerId) {
    return { success: false, message: "Seller ID is required." }
  }

  try {
    await adminFirestore.collection("sellers").doc(sellerId).update({
      isApproved: approved,
    })

    revalidatePath("/admin")
    return { success: true, message: `Seller ${approved ? "approved" : "rejected"} successfully!` }
  } catch (error) {
    console.error(`Error approving seller ${sellerId}:`, error)
    return { success: false, message: `Failed to update seller approval status: ${(error as Error).message}` }
  }
}

export async function toggleSellerActiveStatus(formData: FormData) {
  await simulateDelay(300)

  const sellerId = formData.get("sellerId") as string
  const activeString = formData.get("active") as string
  const newActiveStatus = activeString === "true"

  if (!sellerId) {
    return { success: false, message: "Seller ID is required." }
  }

  try {
    await adminFirestore.collection("sellers").doc(sellerId).update({
      active: newActiveStatus,
    })

    revalidatePath("/admin")
    return { success: true, message: `Seller ${newActiveStatus ? "activated" : "deactivated"} successfully!` }
  } catch (error) {
    console.error(`Error toggling seller status for ${sellerId}:`, error)
    return { success: false, message: `Failed to update seller status: ${(error as Error).message}` }
  }
}

export async function updateSellerProfile(formData: FormData) {
  await simulateDelay(500)

  const sellerId = formData.get("sellerId") as string
  const name = formData.get("name") as string
  const location = formData.get("location") as string
  const phone = formData.get("phone") as string

  if (!sellerId) {
    return { success: false, message: "Seller ID is required." }
  }

  try {
    const updates: any = {}
    if (name) {
      updates.name = name
      updates.slug = generateSlug(name)
    }
    if (location) updates.location = location
    if (phone) updates.phone = phone
    
    const profileImageUrl = formData.get("profileImageUrl") as string
    if (profileImageUrl) updates.profileImageUrl = profileImageUrl

    await adminFirestore.collection("sellers").doc(sellerId).update(updates)

    revalidatePath("/admin")
    revalidatePath(`/seller/dashboard/${sellerId}`)
    revalidatePath(`/${sellerId}`) // Also revalidate the public store page
    return { success: true, message: "Shop profile updated successfully!" }
  } catch (error) {
    console.error(`Error updating seller profile for ${sellerId}:`, error)
    return { success: false, message: `Failed to update profile: ${(error as Error).message}` }
  }
}
