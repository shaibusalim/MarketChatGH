export interface Product {
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

export interface Seller {
  id: string
  name: string | null | undefined
  phone: string
  slug?: string
  location: string
  active: boolean
  isApproved?: boolean
  products: Product[]
}
