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
  DialogDescription,
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
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/admin/image-upload"
import { updateSellerProfile } from "@/app/mcgh-admin-control/(protected)/actions"
import { toast } from "react-hot-toast"
import { Loader2, Store } from "lucide-react"

const settingsSchema = z.object({
  name: z.string().min(3, "Shop name must be at least 3 characters"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  profileImageUrl: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface SellerSettingsFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  sellerId: string
  currentData: {
    name: string
    location: string
    phone: string
    profileImageUrl?: string
  }
}

export function SellerSettingsForm({
  isOpen,
  onClose,
  onSuccess,
  sellerId,
  currentData,
}: SellerSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: currentData.name || "",
      location: currentData.location || "",
      phone: currentData.phone || "",
      profileImageUrl: currentData.profileImageUrl || "",
    },
  })

  // Sync form when currentData changes
  useEffect(() => {
    form.reset({
      name: currentData.name || "",
      location: currentData.location || "",
      phone: currentData.phone || "",
      profileImageUrl: currentData.profileImageUrl || "",
    })
  }, [currentData, form])

  const onSubmit = async (values: SettingsFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("sellerId", sellerId)
      formData.append("name", values.name)
      formData.append("location", values.location)
      formData.append("phone", values.phone)
      formData.append("profileImageUrl", values.profileImageUrl || "")

      const result = await updateSellerProfile(formData)

      if (result.success) {
        toast.success(result.message)
        onSuccess()
        onClose()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error updating settings:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[94vw] max-w-[500px] max-h-[90dvh] flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-0 overflow-hidden border border-gray-100 dark:border-gray-800">
        <DialogHeader className="p-5 sm:p-6 pb-3 border-b border-gray-100 dark:border-gray-800 shrink-0 text-left">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 sm:h-12 sm:w-12 bg-blue-50 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
              <Store className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Shop Profile & Logo
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Update your public business identity and contact details.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 overscroll-contain">
              {/* Logo / Shop Profile Photo */}
              <FormField
                control={form.control}
                name="profileImageUrl"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center justify-center">
                    <FormControl>
                      <ImageUpload
                        value={field.value || ""}
                        onChange={field.onChange}
                        label="Shop Profile Logo"
                        placeholder="Upload store logo or avatar"
                        aspectRatio="square"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                      Business Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Ama's Fresh Groceries" 
                        className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border-none h-11 font-bold text-xs sm:text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                      Business Location
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. Accra Central, Makola" 
                        className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border-none h-11 font-bold text-xs sm:text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                      Contact / WhatsApp Number
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 024XXXXXXX" 
                        className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border-none h-11 font-bold text-xs sm:text-sm"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sticky Action Footer */}
            <DialogFooter className="p-4 sm:p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-md shrink-0 flex flex-row items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial rounded-xl font-bold text-xs h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-500/20 h-11 px-6 text-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
