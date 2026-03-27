"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Package } from "lucide-react"
import { motion } from "framer-motion"

interface AdminStatsCardsProps {
  totalSellers: number
  activeSellers: number
  totalProducts: number
}

export function AdminStatsCards({ totalSellers, activeSellers, totalProducts }: AdminStatsCardsProps) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 mt-2">
      <motion.div initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.1 }}>
        <Card className="overflow-hidden bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-2xl transition-all duration-500 rounded-3xl border border-white/50 dark:border-gray-800/50 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-600/10 dark:bg-blue-500/10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge className="bg-blue-50/50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-none font-bold text-[10px] items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
                +12% THIS MONTH
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1 uppercase tracking-tight">Total Sellers</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{totalSellers}</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.2 }}>
        <Card className="overflow-hidden bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-2xl transition-all duration-500 rounded-3xl border border-white/50 dark:border-gray-800/50 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-600/10 dark:bg-emerald-500/10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <User className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <Badge className="bg-emerald-50/50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none font-bold text-[10px] items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                {Math.round((activeSellers / totalSellers) * 100 || 0)}% ACTIVE
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1 uppercase tracking-tight">Active Sellers</p>
              <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">{activeSellers}</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.3 }}>
        <Card className="overflow-hidden bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-2xl transition-all duration-500 rounded-3xl border border-white/50 dark:border-gray-800/50 group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-600/10 dark:bg-purple-500/10 p-3 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge className="bg-purple-50/50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-none font-bold text-[10px] items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600 animate-pulse" />
                LIVE
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-semibold mb-1 uppercase tracking-tight">Total Products</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{totalProducts}</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
