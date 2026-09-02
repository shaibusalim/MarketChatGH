"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, AlertCircle, Trash2, Edit, UserCog, KeyRound, User, Store, Mail, Phone, MapPin } from "lucide-react"
import { TwilioMediaDisplay } from "@/components/TwilioMediaDisplay"
import { ImageUpload } from "@/components/admin/image-upload"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"
import { adminUpdateSeller, adminResetSellerPassword } from "@/app/mcgh-admin-control/(protected)/actions"

interface Product {
  id: string
  imageUrl: string
  price: string
  description: string
  sellerId: string
  status: string
  stockStatus: string
  isAvailable: boolean
}

interface SellerInfo {
  id: string
  name: string
  email?: string
  location: string
  phone?: string
  active: boolean
  isApproved?: boolean
  profileImageUrl?: string
}

interface SellerData {
  seller: SellerInfo | null
  products: Product[]
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address").min(1, "Email is required"),
  phone: z.string().min(6, "Phone must be at least 6 characters").optional().or(z.literal("")),
  location: z.string().min(2, "Location must be at least 2 characters"),
  active: z.boolean(),
  isApproved: z.boolean(),
  profileImageUrl: z.string().optional(),
})

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/,
        "Must include uppercase, lowercase, a number, and a special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm the new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function AdminSellerDetailsPage() {
  const { sellerId } = useParams() as { sellerId: string }
  const router = useRouter()
  const { data: session, status } = useSession()
  const didRedirectRef = useRef(false)
  const [seller, setSeller] = useState<SellerInfo | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const baseUrl = undefined

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      location: "",
      active: true,
      isApproved: false,
      profileImageUrl: "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (status === 'loading') return
    if (didRedirectRef.current) return
    const user = session?.user as any
    const isAdminUser = Boolean(user?.isAdmin || user?.role === 'admin')
    if (!session || !isAdminUser) {
      didRedirectRef.current = true
      // Don't reveal admin panel. Show 404 — nothing here to see.
      router.replace('/404')
    }
  }, [status, session, router])

  const fetchSellerData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const url = new URL(`/api/sellers/${sellerId}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
      console.log(`[AdminSellerDetails] Fetching from ${url.toString()}`)
      const response = await fetch(url.toString())
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || `Failed to fetch seller data (Status: ${response.status})`)
      }
      const data: SellerData = await response.json()
      setSeller(data.seller)
      setProducts(data.products)

      if (data.seller) {
        // Hydrate forms with fetched data
        profileForm.reset({
          name: data.seller.name || "",
          email: (data.seller as any).email || "",
          phone: data.seller.phone || "",
          location: data.seller.location || "",
          active: data.seller.active ?? true,
          isApproved: data.seller.isApproved ?? false,
          profileImageUrl: (data.seller as any).profileImageUrl || "",
        })
      }
    } catch (err) {
      console.error(`[AdminSellerDetails] Error fetching seller data for ${sellerId}:`, err)
      setError((err as Error).message)
      toast.error("Failed to load seller data: " + (err as Error).message, { duration: 5000 })
    } finally {
      setIsLoading(false)
    }
  }, [sellerId, baseUrl, profileForm])

  useEffect(() => {
    if (status === 'loading') return
    if (didRedirectRef.current) return
    const user = session?.user as any
    const isAdminUser = Boolean(user?.isAdmin || user?.role === 'admin')
    if (isAdminUser) {
      fetchSellerData()
    }
  }, [status, session, fetchSellerData])

  // If this seller doesn't exist (e.g. admin ID was accidentally used as seller ID
  // because of a bad redirect elsewhere), auto-send admin back to the dashboard
  // instead of leaving them on the dead-end "Seller Not Found" error screen.
  useEffect(() => {
    if (status === 'loading') return
    if (isLoading) return
    if (didRedirectRef.current) return
    if (!seller && !error) {
      didRedirectRef.current = true
      router.replace('/mcgh-admin-control')
    }
  }, [status, isLoading, seller, error, router])

  const handleDeleteSeller = async () => {
    if (!confirm(`Are you sure you want to delete seller ${seller?.name || sellerId}? This action cannot be undone.`)) {
      return
    }
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/mcgh-admin-control/delete-seller`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete seller')
      }
      toast.success('Seller deleted successfully')
      router.push('/mcgh-admin-control')
    } catch (err) {
      console.error('[AdminSellerDetails] Error deleting seller:', err)
      toast.error('Failed to delete seller: ' + (err as Error).message, { duration: 5000 })
    } finally {
      setIsDeleting(false)
    }
  }

  const onSubmitProfile = async (values: ProfileFormValues) => {
    setIsSubmittingProfile(true)
    try {
      const formData = new FormData()
      formData.append("sellerId", sellerId)
      formData.append("name", values.name)
      formData.append("email", values.email)
      if (values.phone) formData.append("phone", values.phone)
      formData.append("location", values.location)
      formData.append("active", String(values.active))
      formData.append("isApproved", String(values.isApproved))
      if (values.profileImageUrl) {
        formData.append("profileImageUrl", values.profileImageUrl)
      }

      const result = await adminUpdateSeller(formData)
      if (result.success) {
        toast.success(result.message)
        fetchSellerData()
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      console.error("[AdminSellerDetails] Profile update error:", err)
      toast.error("Failed to update profile: " + (err as Error).message)
    } finally {
      setIsSubmittingProfile(false)
    }
  }

  const onSubmitPassword = async (values: PasswordFormValues) => {
    setIsSubmittingPassword(true)
    try {
      const formData = new FormData()
      formData.append("sellerId", sellerId)
      formData.append("newPassword", values.newPassword)

      const result = await adminResetSellerPassword(formData)
      if (result.success) {
        toast.success(result.message)
        passwordForm.reset({ newPassword: "", confirmPassword: "" })
      } else {
        toast.error(result.message)
      }
    } catch (err) {
      console.error("[AdminSellerDetails] Password reset error:", err)
      toast.error("Failed to reset password: " + (err as Error).message)
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="sr-only">Loading seller details...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
        <Button
          onClick={fetchSellerData}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (!seller) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Seller Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">The seller does not exist or has been removed.</p>
        <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md">
          <a href="/mcgh-admin-control">Back to Dashboard</a>
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8"
    >
      <div className="container mx-auto px-4">
        <Button
          asChild
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          <a href="/mcgh-admin-control">Back to Dashboard</a>
        </Button>

        {/* Header & overview */}
        <Card className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-inner">
                  {seller.profileImageUrl ? (
                    <TwilioMediaDisplay
                      mediaUrl={seller.profileImageUrl}
                      alt={seller.name}
                      width={64}
                      height={64}
                      className="rounded-2xl object-cover w-full h-full"
                    />
                  ) : (
                    <User className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-3xl font-black tracking-tight text-white">
                    {seller.name}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className={`${seller.active ? "bg-emerald-400/20 text-emerald-100" : "bg-red-400/20 text-red-100"} border-none`}>
                      {seller.active ? "ACTIVE" : "INACTIVE"}
                    </Badge>
                    <Badge className={`${seller.isApproved ? "bg-blue-400/20 text-blue-100" : "bg-orange-400/20 text-orange-100"} border-none`}>
                      {seller.isApproved ? "VERIFIED" : "PENDING"}
                    </Badge>
                    <span className="text-xs font-bold text-white/80 font-mono">#{seller.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleDeleteSeller}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow-lg"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Seller
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white break-all">
                  {(seller as any).email || "— not set —"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <Phone className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Phone</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{seller.phone || "— not set —"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30">
              <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Location</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{seller.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <Store className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Products</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{products.length} listed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs: Profile / Password */}
        <Card className="bg-white dark:bg-gray-800 shadow-md rounded-xl mb-6 overflow-hidden">
          <Tabs defaultValue="profile" className="w-full">
            <div className="border-b border-gray-100 dark:border-gray-700 px-6 pt-4">
              <TabsList className="bg-gray-100/60 dark:bg-gray-700/40 p-1 rounded-xl mb-0">
                <TabsTrigger
                  value="profile"
                  className="rounded-xl font-bold tracking-tight data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-indigo-400"
                >
                  <UserCog className="h-4 w-4 mr-2" /> Profile Details
                </TabsTrigger>
                <TabsTrigger
                  value="password"
                  className="rounded-xl font-bold tracking-tight data-[state=active]:bg-white data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-indigo-400"
                >
                  <KeyRound className="h-4 w-4 mr-2" /> Reset Password
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile">
              <CardContent className="p-6 md:p-8">
                <Form {...profileForm}>
                  <form
                    onSubmit={profileForm.handleSubmit(onSubmitProfile)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    <FormField
                      control={profileForm.control}
                      name="profileImageUrl"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2 flex flex-col items-center justify-center mb-2">
                          <FormControl>
                            <ImageUpload
                              value={field.value || ""}
                              onChange={field.onChange}
                              label="Seller Profile Photo"
                              placeholder="Upload seller avatar"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                            Seller / Business Name
                          </FormLabel>
                          <FormControl>
                            <input
                              type="text"
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 dark:text-white outline-none"
                              placeholder="e.g. Ama's Fresh Groceries"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                            Login Email
                          </FormLabel>
                          <FormControl>
                            <input
                              type="email"
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 dark:text-white outline-none"
                              placeholder="seller@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                            WhatsApp / Phone Number
                          </FormLabel>
                          <FormControl>
                            <input
                              type="tel"
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 dark:text-white outline-none"
                              placeholder="e.g. 024XXXXXXX"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                            Business Location
                          </FormLabel>
                          <FormControl>
                            <input
                              type="text"
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 dark:text-white outline-none"
                              placeholder="e.g. Accra Central, Makola"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-col justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <FormLabel className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">
                                Account Active
                              </FormLabel>
                              <p className="text-xs text-gray-500 font-medium mt-1">
                                Inactive sellers cannot sign in or transact.
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-emerald-500 scale-110"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="isApproved"
                      render={({ field }) => (
                        <FormItem className="flex flex-col justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <FormLabel className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-200">
                                Admin Approved (Verified)
                              </FormLabel>
                              <p className="text-xs text-gray-500 font-medium mt-1">
                                Unapproved sellers are blocked from signing in.
                              </p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-blue-500 scale-110"
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="md:col-span-2 flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmittingProfile}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold shadow-lg shadow-indigo-500/30 rounded-xl px-8 h-12"
                      >
                        {isSubmittingProfile ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Edit className="h-5 w-5 mr-2" />
                            Save Profile Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>

            <TabsContent value="password">
              <CardContent className="p-6 md:p-8 max-w-2xl">
                <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 mb-6 flex gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-black text-amber-800 dark:text-amber-200 uppercase tracking-wide">
                      Admin Password Reset
                    </h4>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-300 mt-1 leading-relaxed">
                      Setting a new password here will overwrite the seller's current password immediately.
                      Share the new password with the seller through a secure channel (WhatsApp / SMS / phone call).
                    </p>
                  </div>
                </div>

                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-5">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                            New Password
                          </FormLabel>
                          <FormControl>
                            <input
                              type="password"
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 dark:text-white outline-none"
                              placeholder="Min 8 chars + uppercase + lowercase + number + symbol"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                            Confirm New Password
                          </FormLabel>
                          <FormControl>
                            <input
                              type="password"
                              className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-900 dark:text-white outline-none"
                              placeholder="Re-enter the new password to confirm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={isSubmittingPassword}
                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold shadow-lg shadow-red-500/30 rounded-xl px-8 h-12"
                      >
                        {isSubmittingPassword ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Resetting Password...
                          </>
                        ) : (
                          <>
                            <KeyRound className="h-5 w-5 mr-2" />
                            Reset Seller Password
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Products table */}
        <Card className="bg-white dark:bg-gray-800 shadow-md rounded-xl overflow-hidden">
          <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Store className="h-5 w-5 text-indigo-600" />
              Product Catalog
              <Badge className="ml-2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border-none">
                {products.length} ITEMS
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {products.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/70 dark:bg-gray-700/40">
                    <TableRow>
                      <TableHead className="w-[100px]">Image</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Availability</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product, index) => (
                      <TableRow
                        key={product.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 30}ms`, animationFillMode: "both" }}
                      >
                        <TableCell>
                          <TwilioMediaDisplay
                            mediaUrl={product.imageUrl}
                            alt={product.description}
                            width={48}
                            height={48}
                            className="rounded-lg object-cover"
                          />
                        </TableCell>
                        <TableCell className="text-gray-900 dark:text-white font-medium">
                          {product.description}
                        </TableCell>
                        <TableCell className="text-green-600 dark:text-green-400 font-black">
                          ₵{product.price}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              product.isAvailable
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-none"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-none"
                            }
                          >
                            {product.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <Store className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No products found for this seller.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
