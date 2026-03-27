"use client"

import { useState } from "react"
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
import { addProduct, updateProductStatus } from "@/app/admin/actions"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"

const productSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  price: z.string().min(1, "Price is required"),
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
    description: string
    price: string
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

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      description: product?.description || "",
      price: product?.price || "",
      imageUrl: product?.imageUrl || "",
      isAvailable: product?.isAvailable ?? true,
    },
  })

  const onSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("sellerId", sellerId)
      formData.append("description", values.description)
      formData.append("price", values.price)
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      label="Product Photo"
                      placeholder="Enter image URL or upload"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What are you selling?"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-sm font-bold">Stock Status</FormLabel>
                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                      {field.value ? "Item is in stock and visible" : "Item is out of stock"}
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

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-500 hover:bg-green-600 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {product ? "Update Product" : "Add Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
