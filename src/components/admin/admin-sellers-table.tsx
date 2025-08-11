"use client"

import type React from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay"
import { useFormStatus } from "react-dom"
import { toast } from "react-hot-toast"
import { updateProductStatus, toggleSellerActiveStatus } from "@/app/admin/actions" // Import Server Actions

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

interface AdminSellersTableProps {
  sellers: Seller[]
  total: number
  page: number
  totalPages: number
  onPageChange: (newPage: number) => void
  onDataRefresh: () => void // Callback to refresh data
}

function ProductActionButton({
  productId,
  action,
  children,
  onSuccess,
}: {
  productId: string
  action: "markAvailable" | "markOutOfStock" | "delete"
  children: React.ReactNode
  onSuccess: () => void
}) {
  const { pending } = useFormStatus()

  const handleSubmit = async (formData: FormData) => {
    const result = await updateProductStatus(formData)
    if (result.success) {
      toast.success(result.message, { duration: 3000 })
      onSuccess()
    } else {
      toast.error(result.message, { duration: 3000 })
    }
  }

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="productId" value={productId} />
      <Button
        type="submit"
        name="action"
        value={action}
        size="sm"
        className={`text-xs py-1 ${
          action === "markAvailable"
            ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white shadow-md hover:shadow-lg"
            : action === "markOutOfStock"
              ? "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              : "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white shadow-md hover:shadow-lg"
        }`}
        disabled={pending}
      >
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : children}
      </Button>
    </form>
  )
}

function ToggleSellerButton({
  sellerId,
  active,
  onSuccess,
}: {
  sellerId: string
  active: boolean
  onSuccess: () => void
}) {
  const { pending } = useFormStatus()

  const handleSubmit = async (formData: FormData) => {
    const result = await toggleSellerActiveStatus(formData)
    if (result.success) {
      toast.success(result.message, { duration: 3000 })
      onSuccess()
    } else {
      toast.error(result.message, { duration: 3000 })
    }
  }

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="sellerId" value={sellerId} />
      <input type="hidden" name="active" value={String(!active)} />
      <Button
        type="submit"
        variant={active ? "destructive" : "default"}
        className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg text-xs py-2"
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
        ) : active ? (
          "Deactivate Seller"
        ) : (
          "Reactivate Seller"
        )}
      </Button>
    </form>
  )
}

export function AdminSellersTable({
  sellers,
  total,
  page,
  totalPages,
  onPageChange,
  onDataRefresh,
}: AdminSellersTableProps) {
  return (
    <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-blue-600 dark:text-blue-400">
          <User className="h-5 w-5" /> Sellers ({sellers.length} of {total})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sellers.length > 0 ? (
          <>
            <Accordion type="single" collapsible className="w-full">
              {sellers.map((seller) => (
                <AccordionItem
                  value={seller.id}
                  key={seller.id}
                  className="border-b border-gray-200 dark:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <AccordionTrigger className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-3 text-sm">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <strong className="text-sm">{seller.name}</strong>
                        <Badge
                          variant="outline"
                          className={`${
                            seller.active
                              ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-600"
                              : "bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-600"
                          } text-xs`}
                        >
                          {seller.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">
                        ID: {seller.id} • {seller.location} • {seller.products.length} products
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                      <ToggleSellerButton sellerId={seller.id} active={seller.active} onSuccess={onDataRefresh} />
                      <Link
                        href={`/admin/sellers/${seller.id}`}
                        className="text-blue-600 dark:text-blue-400 text-xs hover:underline"
                      >
                        View Details
                      </Link>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                            <TableHead className="w-16 text-xs">Image</TableHead>
                            <TableHead className="text-xs">Description</TableHead>
                            <TableHead className="text-xs">Price</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                            <TableHead className="text-xs">Stock</TableHead>
                            <TableHead className="text-xs">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {seller.products.map((product) => (
                            <TableRow
                              key={product.id}
                              className="hover:bg-blue-50/30 dark:hover:bg-blue-900/30 transition-all duration-200"
                            >
                              <TableCell>
                                <div className="relative w-12 h-12 rounded-md overflow-hidden group">
                                  <TwilioMediaDisplay
                                    mediaUrl={product.imageUrl}
                                    alt={product.description}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="text-xs max-w-[120px] truncate">{product.description}</TableCell>
                              <TableCell className="text-xs text-green-600 dark:text-green-400 font-medium">
                                ₵{product.price}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-600"
                                >
                                  {product.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    product.isAvailable
                                      ? "bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-400 border-green-200 dark:border-green-600"
                                      : "bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-400 border-red-200 dark:border-red-600"
                                  }`}
                                >
                                  {product.stockStatus}
                                </Badge>
                              </TableCell>
                              <TableCell className="space-y-2">
                                <ProductActionButton
                                  productId={product.id}
                                  action="markAvailable"
                                  onSuccess={onDataRefresh}
                                >
                                  In Stock
                                </ProductActionButton>
                                <ProductActionButton
                                  productId={product.id}
                                  action="markOutOfStock"
                                  onSuccess={onDataRefresh}
                                >
                                  Out of Stock
                                </ProductActionButton>
                                <ProductActionButton productId={product.id} action="delete" onSuccess={onDataRefresh}>
                                  Delete
                                </ProductActionButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-3">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="text-xs py-2 px-4 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Previous
              </Button>
              <span className="text-xs text-gray-600 dark:text-gray-300">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                className="text-xs py-2 px-4 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Next
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
            <Package className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">No Sellers Found</h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
              Once sellers start adding products, they will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
