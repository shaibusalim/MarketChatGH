"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"

interface ProductPreviewCardProps {
  product: {
    id: string
    imageUrl: string
    price: string
    description: string
  }
  sellerId: string
}

export function ProductPreviewCard({ product, sellerId }: ProductPreviewCardProps) {
  return (
    <Link href={`/${sellerId}/product/${product.id}`}>
      <motion.div
        className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-sm border border-gray-100 dark:border-gray-800"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <Image
          src={product.imageUrl || "/img1.jpg"}
          alt={product.description}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <p className="text-white text-[10px] font-medium line-clamp-1">{product.description}</p>
          <p className="text-white text-xs font-bold">{product.price}</p>
        </div>
      </motion.div>
    </Link>
  )
}
