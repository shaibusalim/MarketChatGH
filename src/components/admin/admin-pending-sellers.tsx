"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserCheck, UserX, Loader2, Clock } from "lucide-react"
import { toast } from "react-hot-toast"
import { approveSeller } from "@/app/admin/actions"

interface Seller {
  id: string
  name: string
  email: string
  location: string
  phone: string
  isApproved: boolean
}

export function AdminPendingSellers({ onDataRefresh }: { onDataRefresh: () => void }) {
  const [pendingSellers, setPendingSellers] = useState<Seller[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPendingSellers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/sellers?status=pending")
      if (!response.ok) throw new Error("Failed to fetch pending sellers")
      const data = await response.json()
      setPendingSellers(data.sellers || [])
    } catch (error) {
      console.error(error)
      toast.error("Could not load pending sellers")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPendingSellers()
  }, [fetchPendingSellers])

  const handleAction = async (sellerId: string, approved: boolean) => {
    const formData = new FormData()
    formData.append("sellerId", sellerId)
    formData.append("approved", String(approved))

    const result = await approveSeller(formData)
    if (result.success) {
      toast.success(result.message)
      fetchPendingSellers()
      onDataRefresh()
    } else {
      toast.error(result.message)
    }
  }

  if (isLoading) return null // Hide if loading or handle loading state

  if (pendingSellers.length === 0) return null

  return (
    <Card className="mb-8 border-yellow-200 bg-yellow-50/30 dark:bg-yellow-900/10 dark:border-yellow-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
          <Clock className="h-5 w-5" /> Pending Approvals ({pendingSellers.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingSellers.map((seller) => (
            <div 
              key={seller.id} 
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-yellow-100 dark:border-yellow-900/30 shadow-sm gap-4"
            >
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white">{seller.name}</h4>
                <p className="text-sm text-gray-500">{seller.email} • {seller.phone}</p>
                <p className="text-xs text-gray-400">{seller.location}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => handleAction(seller.id, true)}
                  className="flex-1 sm:flex-none bg-green-500 hover:bg-green-600 text-white text-xs py-1 h-8"
                >
                  <UserCheck className="h-3 w-3 mr-1" /> Approve
                </Button>
                <Button 
                  onClick={() => handleAction(seller.id, false)}
                  variant="outline"
                  className="flex-1 sm:flex-none border-red-200 text-red-600 hover:bg-red-50 text-xs py-1 h-8"
                >
                  <UserX className="h-3 w-3 mr-1" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
