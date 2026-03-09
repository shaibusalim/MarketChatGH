"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, useAnimation, useInView } from "framer-motion"
import { useEffect, useRef } from "react"
import { ProductPreviewCard } from "./product-preview-card"
import { Seller } from "@/lib/product-actions"
import { MapPin, ArrowRight } from "lucide-react"

interface SellerCardProps {
  seller: Seller
  index: number
}

export function SellerCard({ seller, index }: SellerCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay: index * 0.1, ease: "easeOut" },
        },
      }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full bg-white dark:bg-gray-800/50 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden group">
        <CardHeader className="pb-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">
                {seller.name}
              </CardTitle>
              <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm mt-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>{seller.location}</span>
              </div>
            </div>
            {seller.active && (
              <div className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Verified
              </div>
            )}
          </div>
          <CardDescription className="mt-3 line-clamp-2 text-sm leading-relaxed">
            {seller.summary}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col px-6 pb-6">
          {seller.products && seller.products.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 mb-6">
              {seller.products.map((product) => (
                <ProductPreviewCard key={product.id} product={product} sellerId={seller.id} />
              ))}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-muted-foreground text-xs mb-6 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 min-h-[100px]">
              No products available yet.
            </div>
          )}
          <div className="mt-auto">
            <Button asChild className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-green-600 dark:hover:bg-green-500 dark:hover:text-white text-white font-bold py-6 rounded-2xl transition-all duration-300 group/btn shadow-md">
              <Link href={`/${seller.slug || seller.id}`} className="flex items-center justify-center gap-2">
                Visit Shop
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
