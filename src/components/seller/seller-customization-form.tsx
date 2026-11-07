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
  Check,
  MoveVertical,
  Type,
  Sliders
} from "lucide-react"

const THEME_COLORS = [
  { id: "emerald", name: "Emerald Green", class: "bg-emerald-600", border: "border-emerald-600", ring: "ring-emerald-500" },
  { id: "blue", name: "Royal Blue", class: "bg-blue-600", border: "border-blue-600", ring: "ring-blue-500" },
  { id: "purple", name: "Luxury Violet", class: "bg-purple-600", border: "border-purple-600", ring: "ring-purple-500" },
  { id: "rose", name: "Crimson Rose", class: "bg-rose-600", border: "border-rose-600", ring: "ring-rose-500" },
  { id: "amber", name: "Warm Amber", class: "bg-amber-600", border: "border-amber-600", ring: "ring-amber-500" },
  { id: "slate", name: "Midnight Black", class: "bg-gray-900", border: "border-gray-900", ring: "ring-gray-700" },
]

const STORE_NAME_COLORS = [
  { id: "auto", name: "Auto / Adaptive", desc: "Adaptive with glass card backdrop" },
  { id: "white", name: "Crisp White", desc: "Clean white text with drop glow" },
  { id: "dark", name: "Charcoal Dark", desc: "Deep dark text for bright banners" },
  { id: "theme", name: "Theme Accent", desc: "Highlights in your brand color" },
]

const customizationSchema = z.object({
  bannerUrl: z.string().optional(),
  bannerPosition: z.string().default("50%"),
  storeNameColor: z.string().default("auto"),
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
    bannerPosition?: string
    storeNameColor?: string
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
      bannerPosition: currentData.bannerPosition || "50%",
      storeNameColor: currentData.storeNameColor || "auto",
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
      bannerPosition: currentData.bannerPosition || "50%",
      storeNameColor: currentData.storeNameColor || "auto",
      tagline: currentData.tagline || "",
      bio: currentData.bio || "",
      announcement: currentData.announcement || "",
      themeColor: currentData.themeColor || "emerald",
      instagram: currentData.instagram || "",
      tiktok: currentData.tiktok || "",
    })
  }, [currentData, form])

  const watchedBannerUrl = form.watch("bannerUrl")
  const watchedPosition = form.watch("bannerPosition") || "50%"
  const watchedNameColor = form.watch("storeNameColor") || "auto"
  const watchedTheme = form.watch("themeColor") || "emerald"

  // Numeric vertical position (0 to 100)
  const numericPos = parseInt(watchedPosition.replace("%", ""), 10) || 50

  const onSubmit = async (values: CustomizationFormValues) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("sellerId", sellerId)
      formData.append("bannerUrl", values.bannerUrl || "")
      formData.append("bannerPosition", values.bannerPosition || "50%")
      formData.append("storeNameColor", values.storeNameColor || "auto")
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
            <div className="space-y-4">
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

              {/* Banner Focal Position & Realtime Preview */}
              {watchedBannerUrl ? (
                <div className="p-4 rounded-3xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
                        <MoveVertical className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                          Adjust Banner Image Position
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          Pan vertical alignment so important portions aren&apos;t cropped.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Focus: {watchedPosition}
                    </span>
                  </div>

                  {/* Preset Alignment Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Top Focus", value: "0%" },
                      { label: "Center (Default)", value: "50%" },
                      { label: "Bottom Focus", value: "100%" },
                    ].map((preset) => {
                      const isActive = watchedPosition === preset.value
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => form.setValue("bannerPosition", preset.value, { shouldDirty: true })}
                          className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                            isActive
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                          }`}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Fine-Tuning Slider */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <span>Show Top (0%)</span>
                      <span className="text-emerald-600">Drag to Pan Vertical Focus</span>
                      <span>Show Bottom (100%)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={numericPos}
                      onChange={(e) => form.setValue("bannerPosition", `${e.target.value}%`, { shouldDirty: true })}
                      className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                  </div>

                  {/* Live Banner View Window */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 dark:text-gray-300">
                      <span>Live Storefront Preview</span>
                      <span className="text-[10px] text-muted-foreground font-normal">Updates in real time</span>
                    </div>
                    <div className="relative w-full h-28 sm:h-36 rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={watchedBannerUrl}
                        alt="Storefront banner preview"
                        className="w-full h-full object-cover transition-[object-position] duration-75"
                        style={{ objectPosition: `center ${watchedPosition}` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none" />
                      
                      {/* Mock Profile Badge */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end gap-2.5 pointer-events-none">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-gray-900 p-0.5 shadow-lg border-2 border-white dark:border-gray-900 shrink-0 overflow-hidden flex items-center justify-center font-black text-sm text-gray-900 dark:text-white">
                          <span>S</span>
                        </div>
                        <div className="pb-0.5 drop-shadow-md">
                          <p className={`text-xs font-black tracking-tight leading-tight ${
                            watchedNameColor === "white"
                              ? "text-white"
                              : watchedNameColor === "dark"
                              ? "text-gray-900 bg-white/95 px-2 py-0.5 rounded-lg shadow-sm"
                              : watchedNameColor === "theme"
                              ? "text-emerald-400 font-extrabold"
                              : "text-white"
                          }`}>
                            Your Shop Name
                          </p>
                          <p className="text-[10px] text-white/80 font-medium leading-none mt-0.5">
                            Verified Merchant &bull; Live Preview
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Shop Name Color / Visibility Style */}
            <FormField
              control={form.control}
              name="storeNameColor"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-1.5">
                    <Type className="h-4 w-4 text-emerald-600" />
                    <FormLabel className="text-xs font-black uppercase tracking-wider text-gray-500">
                      Store Name Text Color on Storefront
                    </FormLabel>
                  </div>
                  <FormControl>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {STORE_NAME_COLORS.map((col) => {
                        const isSelected = field.value === col.id
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => field.onChange(col.id)}
                            className={`flex flex-col text-left p-3 rounded-2xl border transition-all ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 ring-1 ring-emerald-500 shadow-sm"
                                : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
                                {col.name}
                              </span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            </div>
                            <span className="text-[10px] text-muted-foreground leading-tight">
                              {col.desc}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Choose &apos;Crisp White&apos; if your banner is dark or photographic, or &apos;Auto / Adaptive&apos; for a protected glassmorphism card.
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

