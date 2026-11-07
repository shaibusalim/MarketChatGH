"use server"

import { adminFirestore } from "@/lib/firebase-admin"
import { revalidatePath } from "next/cache"
import { generateSlug } from "@/lib/utils"
import bcrypt from "bcrypt"

// Helper to simulate delay for network requests
const simulateDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/

// ——— SELLER PASSWORD / ACCOUNT HELPERS ———

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

async function getSellerDoc(sellerId: string) {
  const doc = await adminFirestore.collection("sellers").doc(sellerId).get()
  if (!doc.exists) return null
  return { id: doc.id, ...doc.data() } as any
}

// ——— EXISTING (kept) ———

export async function onboardSeller(formData: FormData) {
  await simulateDelay(500) // Simulate network delay

  const sellerId = formData.get("sellerId") as string
  const name = formData.get("name") as string
  const location = formData.get("location") as string
  const email = formData.get("email") as string | undefined
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

    const payload: any = {
      name,
      location,
      phone,
      slug,
      active: true, // Default to active
      isApproved: true, // Auto-approve if onboarded by admin
      createdAt: new Date().toISOString(),
    }
    if (email) payload.email = email.toLowerCase().trim()

    await adminFirestore.collection("sellers").doc(sellerId).set(payload)

    revalidatePath("/mcgh-admin-control") // Revalidate the admin page to show new seller
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
      revalidatePath("/mcgh-admin-control")
      return { success: true, message: "Product is now In Stock." }
    } else if (action === "markOutOfStock") {
      await productRef.update({ isAvailable: false, stockStatus: "out_of_stock" })
      const productDoc = await productRef.get()
      const sellerId = productDoc.data()?.sellerId
      if (sellerId) {
        revalidatePath(`/${sellerId}`)
        revalidatePath(`/seller/dashboard/${sellerId}`)
      }
      revalidatePath("/mcgh-admin-control")
      return { success: true, message: "Product is now Out of Stock." }
    } else if (action === "delete") {
      const productDoc = await productRef.get()
      const sellerId = productDoc.data()?.sellerId
      await productRef.delete()
      if (sellerId) {
        revalidatePath(`/${sellerId}`)
        revalidatePath(`/seller/dashboard/${sellerId}`)
      }
      revalidatePath("/mcgh-admin-control")
      return { success: true, message: "Product deleted successfully." }
    } else if (action === "update") {
      const title = (formData.get("title") || formData.get("name")) as string | null
      const price = formData.get("price") as string
      const compareAtPrice = formData.get("compareAtPrice") as string | null
      const category = formData.get("category") as string | null
      const description = formData.get("description") as string
      const imageUrl = formData.get("imageUrl") as string
      const isAvailable = formData.get("isAvailable") === "true"
      
      const updates: any = {}
      if (title !== null && title !== undefined && title.trim()) updates.title = title.trim()
      if (price) updates.price = price
      if (compareAtPrice !== null && compareAtPrice !== undefined) updates.compareAtPrice = compareAtPrice.trim() || null
      if (category !== null && category !== undefined) updates.category = category.trim() || "General"
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
      
      revalidatePath("/mcgh-admin-control")
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
  const title = (formData.get("title") || formData.get("name")) as string | null
  const price = formData.get("price") as string
  const compareAtPrice = formData.get("compareAtPrice") as string | null
  const category = (formData.get("category") as string) || "General"
  const description = formData.get("description") as string
  const imageUrl = formData.get("imageUrl") as string

  if (!sellerId || !price || !description || !imageUrl) {
    return { success: false, message: "All required fields must be filled." }
  }

  try {
    await adminFirestore.collection("products").add({
      sellerId,
      title: title ? title.trim() : (description ? description.split("\n")[0].substring(0, 80) : "Product"),
      price,
      compareAtPrice: compareAtPrice ? compareAtPrice.trim() : null,
      category: category ? category.trim() : "General",
      description,
      imageUrl,
      isAvailable: true,
      stockStatus: "In Stock",
      status: "available",
      createdAt: new Date().toISOString(),
    })

    revalidatePath(`/${sellerId}`)
    revalidatePath(`/seller/dashboard/${sellerId}`)
    revalidatePath("/mcgh-admin-control")
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
      updatedAt: new Date().toISOString(),
    })

    revalidatePath("/mcgh-admin-control")
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
      updatedAt: new Date().toISOString(),
    })

    revalidatePath("/mcgh-admin-control")
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
    
    const profileImageUrl = formData.get("profileImageUrl") as string | null
    if (profileImageUrl !== null && profileImageUrl !== undefined) updates.profileImageUrl = profileImageUrl

    const bannerUrl = formData.get("bannerUrl") as string | null
    if (bannerUrl !== null && bannerUrl !== undefined) updates.bannerUrl = bannerUrl

    const bannerPosition = formData.get("bannerPosition") as string | null
    if (bannerPosition !== null && bannerPosition !== undefined) updates.bannerPosition = bannerPosition

    const storeNameColor = formData.get("storeNameColor") as string | null
    if (storeNameColor !== null && storeNameColor !== undefined) updates.storeNameColor = storeNameColor

    const tagline = formData.get("tagline") as string | null
    if (tagline !== null && tagline !== undefined) updates.tagline = tagline

    const bio = formData.get("bio") as string | null
    if (bio !== null && bio !== undefined) updates.bio = bio

    const announcement = formData.get("announcement") as string | null
    if (announcement !== null && announcement !== undefined) updates.announcement = announcement

    const themeColor = formData.get("themeColor") as string | null
    if (themeColor !== null && themeColor !== undefined) updates.themeColor = themeColor

    const instagram = formData.get("instagram") as string | null
    if (instagram !== null && instagram !== undefined) updates.instagram = instagram

    const tiktok = formData.get("tiktok") as string | null
    if (tiktok !== null && tiktok !== undefined) updates.tiktok = tiktok

    updates.updatedAt = new Date().toISOString()

    await adminFirestore.collection("sellers").doc(sellerId).update(updates)

    revalidatePath("/mcgh-admin-control")
    revalidatePath(`/seller/dashboard/${sellerId}`)
    revalidatePath(`/${sellerId}`) // Also revalidate the public store page
    return { success: true, message: "Shop profile updated successfully!" }
  } catch (error) {
    console.error(`Error updating seller profile for ${sellerId}:`, error)
    return { success: false, message: `Failed to update profile: ${(error as Error).message}` }
  }
}

// ——— NEW: ADMIN -> Update seller FULL profile (name, email, phone, location, active, isApproved) ———

export async function adminUpdateSeller(formData: FormData) {
  await simulateDelay(400)

  const sellerId = formData.get("sellerId") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string | undefined
  const phone = formData.get("phone") as string | undefined
  const location = formData.get("location") as string | undefined
  const activeRaw = formData.get("active") as string | undefined
  const isApprovedRaw = formData.get("isApproved") as string | undefined

  if (!sellerId) {
    return { success: false, message: "Seller ID is required." }
  }

  try {
    const seller = await getSellerDoc(sellerId)
    if (!seller) return { success: false, message: "Seller not found." }

    const updates: any = {}
    if (name !== undefined && name.length > 0) {
      updates.name = name
      updates.slug = generateSlug(name)
    }
    if (email !== undefined) {
      const cleanEmail = email.trim().toLowerCase()
      if (cleanEmail === "") {
        return { success: false, message: "Email cannot be blank." }
      }
      // Make sure no other seller uses this email
      if (cleanEmail !== (seller.email || "")) {
        const existing = await adminFirestore
          .collection("sellers")
          .where("email", "==", cleanEmail)
          .limit(1)
          .get()
        if (!existing.empty && existing.docs[0].id !== sellerId) {
          return { success: false, message: "This email is already used by another account." }
        }
      }
      updates.email = cleanEmail
    }
    if (phone !== undefined && phone.length > 0) updates.phone = phone
    if (location !== undefined && location.length > 0) updates.location = location
    if (activeRaw !== undefined) {
      updates.active = activeRaw === "true"
    }
    if (isApprovedRaw !== undefined) {
      updates.isApproved = isApprovedRaw === "true"
    }

    const profileImageUrl = formData.get("profileImageUrl") as string | undefined
    if (profileImageUrl) updates.profileImageUrl = profileImageUrl

    if (Object.keys(updates).length === 0) {
      return { success: true, message: "No changes to apply." }
    }

    updates.updatedAt = new Date().toISOString()
    await adminFirestore.collection("sellers").doc(sellerId).update(updates)

    revalidatePath("/mcgh-admin-control")
    revalidatePath(`/mcgh-admin-control/sellers/${sellerId}`)
    revalidatePath(`/seller/dashboard/${sellerId}`)
    revalidatePath(`/${sellerId}`)
    return { success: true, message: "Seller profile updated successfully!" }
  } catch (error) {
    console.error(`[adminUpdateSeller] Error for ${sellerId}:`, error)
    return { success: false, message: `Failed to update seller: ${(error as Error).message}` }
  }
}

// ——— NEW: ADMIN -> Reset seller password (no current password needed) ———

export async function adminResetSellerPassword(formData: FormData) {
  await simulateDelay(400)

  const sellerId = formData.get("sellerId") as string
  const newPassword = formData.get("newPassword") as string

  if (!sellerId || !newPassword) {
    return { success: false, message: "Seller ID and new password are required." }
  }
  if (!PASSWORD_REGEX.test(newPassword)) {
    return {
      success: false,
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.",
    }
  }

  try {
    const seller = await getSellerDoc(sellerId)
    if (!seller) return { success: false, message: "Seller not found." }

    const hashed = await hashPassword(newPassword)
    await adminFirestore.collection("sellers").doc(sellerId).update({
      password: hashed,
      updatedAt: new Date().toISOString(),
    })

    revalidatePath(`/mcgh-admin-control/sellers/${sellerId}`)
    return { success: true, message: "Seller password has been reset." }
  } catch (error) {
    console.error(`[adminResetSellerPassword] Error for ${sellerId}:`, error)
    return { success: false, message: `Failed to reset password: ${(error as Error).message}` }
  }
}

// ——— NEW: SELLER -> Change own password (requires current password) ———

export async function changeSellerPassword(formData: FormData) {
  await simulateDelay(400)

  const sellerId = formData.get("sellerId") as string
  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!sellerId || !currentPassword || !newPassword || !confirmPassword) {
    return { success: false, message: "All fields are required." }
  }
  if (newPassword !== confirmPassword) {
    return { success: false, message: "New passwords do not match." }
  }
  if (!PASSWORD_REGEX.test(newPassword)) {
    return {
      success: false,
      message:
        "New password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.",
    }
  }

  try {
    const seller = await getSellerDoc(sellerId)
    if (!seller) return { success: false, message: "Account not found." }
    if (!seller.password) {
      // Admin-onboarded sellers might have no password until claim
      return { success: false, message: "No password set on this account. Please sign up to claim it." }
    }

    const matches = await bcrypt.compare(currentPassword, seller.password)
    if (!matches) {
      return { success: false, message: "Current password is incorrect." }
    }

    const hashed = await hashPassword(newPassword)
    await adminFirestore.collection("sellers").doc(sellerId).update({
      password: hashed,
      updatedAt: new Date().toISOString(),
    })

    return { success: true, message: "Password updated successfully." }
  } catch (error) {
    console.error(`[changeSellerPassword] Error for ${sellerId}:`, error)
    return { success: false, message: `Failed to update password: ${(error as Error).message}` }
  }
}

// ——— NEW: SELLER/ADMIN -> Update own account email (requires current password) ———

export async function changeAccountEmail(formData: FormData) {
  await simulateDelay(400)

  const userId = formData.get("userId") as string
  const userRole = formData.get("userRole") as string // 'seller' | 'admin'
  const newEmail = formData.get("newEmail") as string
  const currentPassword = formData.get("currentPassword") as string

  if (!userId || !userRole || !newEmail || !currentPassword) {
    return { success: false, message: "All fields are required." }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(newEmail)) {
    return { success: false, message: "Please enter a valid email address." }
  }

  const cleanEmail = newEmail.trim().toLowerCase()
  const collection = userRole === "admin" ? "admins" : "sellers"

  try {
    const userDoc = await adminFirestore.collection(collection).doc(userId).get()
    if (!userDoc.exists) return { success: false, message: "Account not found." }
    const userData = userDoc.data() as any

    if (!userData?.password) {
      return { success: false, message: "Password not set on this account." }
    }

    const matches = await bcrypt.compare(currentPassword, userData.password)
    if (!matches) {
      return { success: false, message: "Current password is incorrect." }
    }

    // Email uniqueness check
    const sameEmail = await adminFirestore
      .collection(collection)
      .where("email", "==", cleanEmail)
      .limit(1)
      .get()
    if (!sameEmail.empty && sameEmail.docs[0].id !== userId) {
      return { success: false, message: "This email is already registered." }
    }

    await adminFirestore.collection(collection).doc(userId).update({
      email: cleanEmail,
      updatedAt: new Date().toISOString(),
    })

    if (userRole === "seller") {
      revalidatePath(`/seller/dashboard/${userId}`)
    }
    return { success: true, message: "Email updated successfully." }
  } catch (error) {
    console.error(`[changeAccountEmail] Error for ${collection}/${userId}:`, error)
    return { success: false, message: `Failed to update email: ${(error as Error).message}` }
  }
}


export async function quickToggleProductStock(productId: string, isAvailable: boolean) {
  try {
    const productRef = adminFirestore.collection("products").doc(productId);
    await productRef.update({
      isAvailable,
      stockStatus: isAvailable ? "available" : "out_of_stock",
    });
    const productDoc = await productRef.get();
    const sellerId = productDoc.data()?.sellerId;
    if (sellerId) {
      revalidatePath(`/${sellerId}`);
      revalidatePath(`/seller/dashboard/${sellerId}`);
    }
    return { success: true };
  } catch (err) {
    console.error("Error toggling product stock:", err);
    return { success: false, message: (err as Error).message };
  }
}
