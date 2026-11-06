export interface Product {
  id: string
  title?: string
  name?: string
  imageUrl: string
  images?: string[]
  price: string
  compareAtPrice?: string
  description: string
  category?: string
  sellerId: string
  createdAt: string
  status: string
  stockStatus: string
  isAvailable: boolean
  views?: number
  isFeatured?: boolean
}

export interface Seller {
  id: string
  name: string | null | undefined
  phone: string
  slug?: string
  location: string
  active: boolean
  isApproved?: boolean
  products: Product[]
  bio?: string
  bannerUrl?: string
  tagline?: string
  announcement?: string
  themeColor?: string
  instagram?: string
  tiktok?: string
  profileImageUrl?: string
  rating?: number
  reviewCount?: number
}
