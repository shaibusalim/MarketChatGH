"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const sellerIdFromUrl = params.sellerId as string

  useEffect(() => {
    if (status === "loading") return
    
    if (!session) {
      router.push("/admin/signin")
      return
    }

    const user = session.user as any
    const isAdmin = user.role === "admin"
    const isMatchingSeller = user.role === "seller" && user.id === sellerIdFromUrl

    if (!isAdmin && !isMatchingSeller) {
      // If not admin and not the matching seller, redirect
      if (user.role === "seller") {
        router.push(`/seller/dashboard/${user.id}`)
      } else {
        router.push("/admin/signin")
      }
    }
  }, [session, status, router, sellerIdFromUrl])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  const user = session?.user as any
  if (!session || (!user.isAdmin && user.role !== "seller")) {
    return null
  }

  return <>{children}</>
}
