"use client"

import { Card, CardContent } from "@/components/ui/card"
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <motion.div initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.1 }}>
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 dark:border-gray-700">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Total Sellers</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalSellers}</p>
            </div>
            <User className="h-8 w-8 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 rounded-full p-2" />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.2 }}>
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 dark:border-gray-700">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Active Sellers</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">{activeSellers}</p>
            </div>
            <User className="h-8 w-8 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/50 rounded-full p-2" />
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={cardVariants} transition={{ delay: 0.3 }}>
        <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border border-gray-100 dark:border-gray-700">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Total Products</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 rounded-full p-2" />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
