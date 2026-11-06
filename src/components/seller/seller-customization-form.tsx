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
  FormDescription,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/admin/image-upload"
import { updateSellerProfile } from "@/app/mcgh-admin-control/(protected)/actions"
import { toast } from "react-hot-toast"
import { 
  Palette, 
  Sparkles, 
  Loader2, 
  Instagram, 
  Video, 
  Megaphone, 
  Eye, 
  Store,
  Check
} from "lucide-react"

const THEME_COLORS = [
  { id: "emerald", name: "Emerald Green", class: "bg-emerald-600", border: "border-emerald-600", ring: "ring-emerald-500" },
  { id: "blue", name: "Royal Blue", class: "bg-blue-600", border: "border-blue-600", ring: "ring-blue-500" },
  { id: "purple", name: "Luxury Violet", class: "bg-purple-600", border: "border-purple-600", ring: "ring-purple-500" },
  { id: "rose", name: "Crimson Rose", class: "bg-rose-600", border: "border-rose-600", ring: "ring-rose-500" },
  { id: "amber", name: "Warm Amber", class: "bg-amber-600", border: "border-amber-600", ring: "ring-amber-500" },
  { id: "slate", name: "Midnight Black", class: "bg-gray-900", border: "border-gray-900", ring: "ring-gray-700" },
]

const customizationSchema = z.object({
  bannerUrl: z.string().optional(),
  tagline: z.string().max(80, "Tagline should be under 80 characters").optional(),
  bio: z.string().max(300, "Bio should be under 300 characters").optional(),
  announcement: z.string().max(120, "Announcement should be under 120 characters").optional(),
  themeColor: z.string().default("emerald"),
  instagram: z.string().optional(),
  tiktok: z.string().optional(),
})

type CustomizationFormValues = z.infer<typeof customizationSchema>

interface SellerCustomizationFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  sellerId: string
  currentData: {
    bannerUrl?: string
    tagline?: string
    bio?: string
    announcement?: string
    themeColor?: string
    instagram?: string
    tiktok?: string
  }
}

export function SellerCustomizationForm({
  isOpen,
  onClose,
  onSuccess,
  sellerId,
  currentData,
}: SellerCustomizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CustomizationFormValues>({
    resolver: zodResolver(customizationSchema),
    defaultValues: {
      bannerUrl: currentData.bannerUrl || "",
      tagline: currentData.tagline || "",
      bio: currentData.bio || "",
      announcement: currentData.announcement || "",
      themeColor: currentData.themeColor || "emerald",
      instagram: currentData.instagram || "",
      tiktok: currentData.tiktok || "",
    },
  })

  useEffect(() => {
    form.reset({
      bannerUrl: currentData.bannerUrl || "",
      tagline: currentData.tagline || "",
      bio: currentData.bio || "",
      announcement: currentData.announcement || "",
      themeColor: currentData.themeColor || "emerald",
      instagram: currentData.instagram || "",
      tiktok: currentData.tiktok || "",
    })
  }, [currentData, form])

  const onSubmit = async (values: CustomizationFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("sellerId", sellerId)
      formData.append("bannerUrl", values.bannerUrl || "")
      formData.append("tagline", values.tagline || "")
      formData.append("bio", values.bio || "")
      formData.append("announcement", values.announcement || "")
      formData.append("themeColor", values.themeColor || "emerald")
      formData.append("instagram", values.instagram || "")
      formData.append("tiktok", values.tiktok || "")

      const result = await updateSellerProfile(formData)

      if (result.success) {
        toast.success("Live shop branding updated!", { duration: 3500 })
        onSuccess()
        onClose()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("Error updating shop customization:", error)
      toast.error("Failed to update store branding")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[620px] max-h-[92vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8">
        <DialogHeader className="pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 shadow-sm">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                Customize Your Live Shop
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Personalize your banner, brand color, announcement ticker, and social links.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            
            {/* Store Cover Banner */}
            <FormField
              control={form.control}
              name="bannerUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      value={field.value || ""}
                      onChange={field.onChange}
                      label="Store Cover Banner"
                      placeholder="Upload custom cover photo or enter banner URL"
                      aspectRatio="banner"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Recommended size: 1200 × 400px. Appears at the top of your public storefront.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Brand Accent Color */}
            <FormField
              control={form.control}
              name="themeColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-wider text-gray-500">
                    Store Theme Accent Color
                  </FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
                      {THEME_COLORS.map((col) => {
                        const isSelected = field.value === col.id
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => field.onChange(col.id)}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all ${
                              isSelected
                                ? "border-gray-900 dark:border-white shadow-md bg-gray-50 dark:bg-gray-800 scale-105"
                                : "border-gray-100 dark:border-gray-800 hover:border-gray-300"
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full ${col.class} shadow-sm flex items-center justify-center text-white`}>
                              {isSelected && <Check className="w-4 h-4" />}
                            </div>
                            <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 leading-tight text-center">
                              {col.name.split(" ")[0]}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Store Tagline & Announcement */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="tagline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-wider text-gray-500">
                      Store Tagline / Slogan
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Authentic Streetwear & Sneakers in Accra"
                        className="rounded-xl h-11 text-xs sm:text-sm font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="announcement"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1.5">
                      <Megaphone className="h-3.5 w-3.5 text-amber-500" />
                      <FormLabel className="text-xs font-black uppercase tracking-wider text-gray-500">
                        Top Announcement Banner
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="e.g. 🚚 Free delivery across Accra for orders above GH₵250!"
                        className="rounded-xl h-11 text-xs sm:text-sm font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[11px]">
                      Displays at the very top of your storefront to grab buyer attention.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-wider text-gray-500">
                      About Your Shop / Bio
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell shoppers what makes your products special, your delivery terms, opening hours..."
                        className="rounded-xl min-h-[80px] resize-none text-xs sm:text-sm font-medium"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1.5">
                      <Instagram className="h-3.5 w-3.5 text-pink-600" />
                      <FormLabel className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        Instagram Username
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="e.g. @yourbrand"
                        className="rounded-xl h-10 text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tiktok"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-1.5">
                      <Video className="h-3.5 w-3.5 text-cyan-600" />
                      <FormLabel className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        TikTok Username
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="e.g. @yourbrand"
                        className="rounded-xl h-10 text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4 border-t border-gray-100 dark:border-gray-800 gap-2 sm:gap-0">
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-bold shadow-md shadow-emerald-600/20 px-6"
                disabled={isSubmitting}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Save & Update Live Shop
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

