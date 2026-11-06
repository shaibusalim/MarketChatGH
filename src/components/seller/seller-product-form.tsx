"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/admin/image-upload"
import { Switch } from "@/components/ui/switch"
import { addProduct, updateProductStatus } from "@/app/mcgh-admin-control/(protected)/actions"
import { toast } from "react-hot-toast"
import { Loader2, Sparkles, Tag } from "lucide-react"

const DEFAULT_CATEGORIES = [
  "General",
  "Fashion & Clothing",
  "Shoes & Footwear",
  "Bags & Accessories",
  "Electronics & Gadgets",
  "Beauty & Cosmetics",
  "Groceries & Food",
  "Home & Living",
  "Health & Wellness",
  "Jewelry & Watches",
]

const productSchema = z.object({
  title: z.string().min(2, "Product name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.string().min(1, "Price is required"),
  compareAtPrice: z.string().optional(),
  description: z.string().min(3, "Description must be at least 3 characters"),
  imageUrl: z.string().min(1, "Image is required"),
  isAvailable: z.boolean().default(true),
})

type ProductFormValues = z.infer<typeof productSchema>

interface SellerProductFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  sellerId: string
  product?: {
    id: string
    title?: string
    name?: string
    category?: string
    description: string
    price: string
    compareAtPrice?: string | null
    imageUrl: string
    isAvailable: boolean
  }
}

export function SellerProductForm({
  isOpen,
  onClose,
  onSuccess,
  sellerId,
  product,
}: SellerProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customCategory, setCustomCategory] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      category: "General",
      description: "",
      price: "",
      compareAtPrice: "",
      imageUrl: "",
      isAvailable: true,
    },
  })

  // Reset form when product prop changes for editing
  useEffect(() => {
    if (product) {
      const rawPrice = product.price || ""
      const sanitizedPrice = rawPrice.replace(/[^\d.]/g, '') || rawPrice

      const rawComparePrice = product.compareAtPrice || ""
      const sanitizedComparePrice = rawComparePrice.replace(/[^\d.]/g, '') || rawComparePrice

      const productTitle = product.title || product.name || (product.description ? product.description.split("\n")[0] : "")
      const productCategory = product.category || "General"

      form.reset({
        title: productTitle,
        category: productCategory,
        description: product.description || "",
        price: sanitizedPrice,
        compareAtPrice: sanitizedComparePrice,
        imageUrl: product.imageUrl || "",
        isAvailable: product.isAvailable ?? true,
      })
    } else {
      form.reset({
        title: "",
        category: "General",
        description: "",
        price: "",
        compareAtPrice: "",
        imageUrl: "",
        isAvailable: true,
      })
    }
  }, [product, form])

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("sellerId", sellerId)
      formData.append("title", values.title)
      formData.append("name", values.title)
      formData.append("category", values.category)
      formData.append("description", values.description)
      formData.append("price", values.price)
      if (values.compareAtPrice) {
        formData.append("compareAtPrice", values.compareAtPrice)
      }
      formData.append("imageUrl", values.imageUrl)
      formData.append("isAvailable", String(values.isAvailable))

      let result
      if (product) {
        formData.append("productId", product.id)
        formData.append("action", "update")
        result = await updateProductStatus(formData)
      } else {
        result = await addProduct(formData)
      }

      if (result.success) {
        toast.success(result.message)
        onSuccess()
        onClose()
        form.reset()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error saving product:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl text-emerald-600">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">
                {product ? "Edit Product Details" : "Add New Product"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {product ? "Update your product info, pricing, category and stock" : "Create a clean listing with photos, category, and pricing"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-3">
            {/* Image Upload */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Product Image *
                  </FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      label="Product Photo"
                      placeholder="Enter image URL or upload photo"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product Title / Name */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Product Name / Title *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Nike Air Force 1 White or Silk Floral Dress"
                      className="rounded-xl h-11"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category Selection */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel className="font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Category *
                    </FormLabel>
                    <button
                      type="button"
                      onClick={() => setCustomCategory(!customCategory)}
                      className="text-xs text-emerald-600 hover:underline font-medium"
                    >
                      {customCategory ? "Pick from list" : "+ Custom category"}
                    </button>
                  </div>
                  <FormControl>
                    {customCategory ? (
                      <Input
                        placeholder="e.g. Handmade Crafts, Perfumes..."
                        className="rounded-xl h-11"
                        {...field}
                      />
                    ) : (
                      <div className="space-y-2">
                        <Input
                          placeholder="Select or type category..."
                          list="category-suggestions"
                          className="rounded-xl h-11"
                          {...field}
                        />
                        <datalist id="category-suggestions">
                          {DEFAULT_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat} />
                          ))}
                        </datalist>
                        {/* Quick select pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {DEFAULT_CATEGORIES.slice(0, 5).map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => field.onChange(cat)}
                              className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                                field.value === cat
                                  ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                                  : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-400"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pricing: Price and Compare-At / Original Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                      Selling Price (GH₵) *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">GH₵</span>
                        <Input
                          type="text"
                          placeholder="150"
                          className="rounded-xl h-11 pl-12"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="compareAtPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-xs uppercase tracking-wider text-gray-500">
                      Original Price (Optional)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">GH₵</span>
                        <Input
                          type="text"
                          placeholder="200 (Strikethrough)"
                          className="rounded-xl h-11 pl-12"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                    Product Description *
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe features, size, colors, or materials..."
                      className="min-h-[90px] rounded-xl resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Stock Availability Toggle */}
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-800 p-3.5 bg-gray-50/50 dark:bg-gray-900/50">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-bold">In Stock & Available</FormLabel>
                    <div className="text-[11px] text-muted-foreground">
                      {field.value ? "Buyers can view and order this item on WhatsApp" : "Marked as Sold Out (hidden from active listings)"}
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 px-6 shadow-md shadow-emerald-600/20"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {product ? "Save Changes" : "Publish Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
