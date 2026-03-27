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
import { updateProductStatus, toggleSellerActiveStatus, approveSeller } from "@/app/admin/actions" // Import Server Actions
import { Product, Seller } from "@/lib/types"

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

function ApproveSellerButton({
  sellerId,
  onSuccess,
}: {
  sellerId: string
  onSuccess: () => void
}) {
  const { pending } = useFormStatus()

  const handleSubmit = async (formData: FormData) => {
    formData.append("approved", "true")
    const result = await approveSeller(formData)
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
      <Button
        type="submit"
        className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg text-xs py-2"
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
        ) : (
          "Approve Seller"
        )}
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
    <Card className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 dark:border-gray-800/50 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-gray-800 p-6">
        <div>
          <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" /> Seller Directory
          </CardTitle>
          <p className="text-xs text-gray-500 font-medium">{total} total registered partners</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-none font-bold text-[10px]">
             {sellers.length} LOADED
           </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {sellers.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {sellers.map((seller) => (
              <div key={seller.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-all duration-300">
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-gray-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-gray-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase text-sm">
                        {seller.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge className={`${seller.active ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"} border-none text-[10px] font-bold`}>
                          {seller.active ? "ACTIVE" : "INACTIVE"}
                        </Badge>
                        <Badge className={`${seller.isApproved ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"} border-none text-[10px] font-bold`}>
                          {seller.isApproved ? "VERIFIED" : "PENDING"}
                        </Badge>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">{seller.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex -space-x-2 mr-4">
                       {seller.products.slice(0, 3).map((p, i) => (
                         <div key={p.id} className="h-8 w-8 rounded-xl border-2 border-white dark:border-gray-900 bg-gray-100 overflow-hidden shadow-sm">
                           <TwilioMediaDisplay mediaUrl={p.imageUrl} alt="" width={32} height={32} className="object-cover w-full h-full" />
                         </div>
                       ))}
                       {seller.products.length > 3 && (
                         <div className="h-8 w-8 rounded-xl border-2 border-white dark:border-gray-900 bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                           +{seller.products.length - 3}
                         </div>
                       )}
                    </div>
                    
                    <div className="flex gap-2">
                       {!seller.isApproved && (
                         <ApproveSellerButton sellerId={seller.id} onSuccess={onDataRefresh} />
                       )}
                       <ToggleSellerButton sellerId={seller.id} active={seller.active} onSuccess={onDataRefresh} />
                       <Button asChild variant="outline" className="rounded-xl border-gray-200 dark:border-gray-800 text-xs font-bold hover:bg-white transition-all shadow-sm">
                         <Link href={`/admin/sellers/${seller.id}`}>Manage</Link>
                       </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination */}
            <div className="p-6 bg-gray-50/30 dark:bg-gray-900/40 flex items-center justify-between">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page <= 1} 
                  onClick={() => onPageChange(page - 1)}
                  className="rounded-xl border-gray-200 dark:border-gray-800 text-[10px] font-bold uppercase tracking-widest"
                >
                  Prev
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page >= totalPages} 
                  onClick={() => onPageChange(page + 1)}
                  className="rounded-xl border-gray-200 dark:border-gray-800 text-[10px] font-bold uppercase tracking-widest"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-24">
             <div className="h-20 w-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-gray-300" />
             </div>
             <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight italic">Ecosystem Empty</h3>
             <p className="text-xs text-gray-500 font-medium mt-1">No sellers have joined the platform yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
