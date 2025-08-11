"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, useAnimation, useInView } from "framer-motion"
import { useEffect, useRef } from "react"

interface Product {
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

interface Seller {
  id: string
  name: string
  location: string
  active: boolean
  products: Product[]
}

interface AdminProductsChartProps {
  sellers: Seller[]
}

export function AdminProductsChart({ sellers }: AdminProductsChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  // Removed the .slice(0, 10) here. The chart will now display all sellers passed to it.
  // The pagination logic should be handled by the API and the parent component.
  const chartData = sellers
  const maxProducts = Math.max(...chartData.map((s) => s.products.length), 1)
  const chartWidth = chartData.length * 60 + 40 // Adjusted for better spacing

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.4 } },
      }}
    >
      <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Products per Seller</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 overflow-x-auto">
            {chartData.length > 0 ? (
              <svg className="min-w-full h-full" viewBox={`0 0 ${chartWidth} 200`} preserveAspectRatio="xMinYMid meet">
                {chartData.map((seller, index) => {
                  const barWidth = 40
                  const spacing = 20
                  const x = index * (barWidth + spacing) + 30
                  const maxHeight = 150
                  const productCount = seller.products.length
                  const barHeight = productCount > 0 ? (productCount / maxProducts) * maxHeight : 0

                  // Define variants inside the map to capture the correct barHeight for each instance
                  const barVariants: any = {
                    hidden: { height: 0, y: 200 },
                    visible: {
                      height: barHeight,
                      y: 200 - barHeight,
                      transition: {
                        duration: 0.5,
                        ease: [0.6, 0.05, -0.01, 0.9],
                        delay: index * 0.05, // Stagger animation
                      },
                    },
                  }

                  return (
                    <g key={seller.id}>
                      <motion.rect
                        x={x}
                        width={barWidth}
                        fill={seller.active ? "#10b981" : "#ef4444"}
                        className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                        variants={barVariants}
                        initial="hidden"
                        animate={controls}
                      />
                      <motion.text
                        x={x + barWidth / 2}
                        textAnchor="middle"
                        fill="#1f2937"
                        className="text-xs font-semibold dark:fill-white pointer-events-none"
                        initial={{ opacity: 0, y: 200 }}
                        animate={{
                          opacity: 1,
                          y: 195 - barHeight,
                          transition: { delay: index * 0.05 + 0.3 },
                        }}
                      >
                        {productCount}
                      </motion.text>
                      <text
                        x={x + barWidth / 2}
                        y={198}
                        textAnchor="middle"
                        fill="#6b7280"
                        className="text-[10px] dark:fill-gray-300 pointer-events-none"
                        transform={`rotate(-45, ${x + barWidth / 2}, 198)`}
                      >
                        {seller.name.length > 10 ? `${seller.name.slice(0, 7)}...` : seller.name}
                      </text>
                    </g>
                  )
                })}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No data to display chart.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
