"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface ProductPreviewCardProps {
  product: {
    id: string
    imageUrl: string
    price: string
    description: string
  }
}

export function ProductPreviewCard({ product }: ProductPreviewCardProps) {
  return (
    <motion.div
      className="relative aspect-square rounded-lg overflow-hidden group"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Image
        src={product.imageUrl || "/placeholder.svg"}
        alt={product.description}
        layout="fill"
        objectFit="cover"
        className="transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
        <p className="text-white text-xs font-semibold truncate">{product.description}</p>
        <p className="text-white text-sm font-bold">{product.price}</p>
      </div>
    </motion.div>
  )
}
