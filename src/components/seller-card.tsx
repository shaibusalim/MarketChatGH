"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, useAnimation, useInView } from "framer-motion"
import { useEffect, useRef } from "react"
import { ProductPreviewCard } from "./product-preview-card"

interface Product {
  id: string
  imageUrl: string
  price: string
  description: string
}

interface Seller {
  id: string
  name: string
  products: Product[]
}

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
        hidden: { opacity: 0, y: 50 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay: index * 0.1, ease: "easeOut" },
        },
      }}
      whileHover={{ scale: 1.02, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">{seller.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          {seller.products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {seller.products.map((product) => (
                <ProductPreviewCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-muted-foreground text-sm mb-4">
              No products available yet.
            </div>
          )}
          <div className="mt-auto flex flex-col gap-2">
            <Button asChild className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg">
              <Link href={`/${seller.id}`}>Shop from {seller.name}</Link>
            </Button>
           
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
