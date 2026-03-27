import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Seller } from "@/lib/types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface AdminProductsChartProps {
  sellers: Seller[]
}

export function AdminProductsChart({ sellers }: AdminProductsChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(chartRef, { once: true })

  const data = sellers.map((seller) => ({
    name: seller.name || "Unknown",
    products: seller.products.length,
    active: seller.active,
  }))

  return (
    <motion.div
      ref={chartRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mb-8"
    >
      <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 dark:border-gray-800/50 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <div>
            <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Product Distribution</CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Inventory overview across sellers</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full mt-4">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#888", fontSize: 10 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#888", fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.8)", 
                      backdropFilter: "blur(8px)",
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                    }}
                    cursor={{ fill: "#88888810" }}
                  />
                  <Bar dataKey="products" radius={[8, 8, 0, 0]} barSize={35}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.active ? "#3b82f6" : "#ef4444"} fillOpacity={entry.active ? 0.8 : 0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                No data available for chart.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
