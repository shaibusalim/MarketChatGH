"use client"

import { motion } from "framer-motion"
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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[AdminPendingSellers] Fetch failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        })
        throw new Error(errorData.error || "Failed to fetch pending sellers")
      }
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

  if (isLoading || pendingSellers.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-10"
    >
      <Card className="overflow-hidden bg-orange-50/50 dark:bg-orange-900/10 backdrop-blur-xl border-orange-200/50 dark:border-orange-800/30 rounded-3xl shadow-xl shadow-orange-500/5">
        <div className="bg-orange-500 h-1.5 w-full" />
        <CardHeader className="p-6 pb-2">
          <CardTitle className="text-xl font-black text-orange-800 dark:text-orange-400 tracking-tight flex items-center gap-3">
             <div className="h-8 w-8 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                <Clock className="h-5 w-5" />
             </div>
             Pending Approval Queue ({pendingSellers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingSellers.map((seller) => (
              <div 
                key={seller.id} 
                className="bg-white/80 dark:bg-gray-900/80 p-5 rounded-2xl border border-orange-100 dark:border-orange-900/40 shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <div className="mb-4">
                  <h4 className="font-black text-gray-900 dark:text-white uppercase text-xs tracking-widest">{seller.name}</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 mb-2">{seller.email}</p>
                  <p className="text-[10px] text-orange-600 dark:text-orange-400 font-black flex items-center gap-1 uppercase">
                    <Clock className="h-3 w-3" /> Waiting for review
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleAction(seller.id, true)}
                    className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] py-1.5 h-8 uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Approve
                  </Button>
                  <Button 
                    onClick={() => handleAction(seller.id, false)}
                    variant="outline"
                    className="flex-1 rounded-xl border-red-100 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-900/20 font-bold text-[10px] py-1.5 h-8 uppercase tracking-widest transition-all"
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
