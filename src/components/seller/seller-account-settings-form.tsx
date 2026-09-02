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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-hot-toast"
import { Loader2, KeyRound, Mail, UserCog } from "lucide-react"
import { changeSellerPassword, changeAccountEmail } from "@/app/mcgh-admin-control/(protected)/actions"

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/,
        "Include uppercase, lowercase, a number, and a special character",
      ),
    confirmPassword: z.string().min(1, "Please confirm the new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const emailSchema = z.object({
  newEmail: z.string().email("Please enter a valid email address"),
  currentPassword: z.string().min(1, "Current password is required to verify your identity"),
})

type PasswordFormValues = z.infer<typeof passwordSchema>
type EmailFormValues = z.infer<typeof emailSchema>

interface SellerAccountSettingsFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  sellerId: string
  currentEmail?: string
}

export function SellerAccountSettingsForm({
  isOpen,
  onClose,
  onSuccess,
  sellerId,
  currentEmail = "",
}: SellerAccountSettingsFormProps) {
  const [activeTab, setActiveTab] = useState("password")
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false)

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      newEmail: currentEmail || "",
      currentPassword: "",
    },
  })

  const onSubmitPassword = async (values: PasswordFormValues) => {
    setIsSubmittingPassword(true)
    try {
      const formData = new FormData()
      formData.append("sellerId", sellerId)
      formData.append("currentPassword", values.currentPassword)
      formData.append("newPassword", values.newPassword)
      formData.append("confirmPassword", values.confirmPassword)

      const result = await changeSellerPassword(formData)
      if (result.success) {
        toast.success(result.message)
        passwordForm.reset()
        onSuccess?.()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("[SellerAccountSettingsForm] Password change error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  const onSubmitEmail = async (values: EmailFormValues) => {
    setIsSubmittingEmail(true)
    try {
      const formData = new FormData()
      formData.append("userId", sellerId)
      formData.append("userRole", "seller")
      formData.append("newEmail", values.newEmail)
      formData.append("currentPassword", values.currentPassword)

      const result = await changeAccountEmail(formData)
      if (result.success) {
        toast.success(result.message)
        emailForm.reset({ ...values, currentPassword: "" })
        onSuccess?.()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error("[SellerAccountSettingsForm] Email change error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmittingEmail(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      passwordForm.reset()
      emailForm.reset({ newEmail: currentEmail || "", currentPassword: "" })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-white/20 dark:border-gray-800/20 rounded-3xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserCog className="h-7 w-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
                Account Settings
              </DialogTitle>
              <DialogDescription className="text-gray-500 font-medium">
                Manage your account security and login credentials.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-gray-100/70 dark:bg-gray-800/60 p-1 rounded-2xl mb-6">
            <TabsTrigger
              value="password"
              className="w-1/2 rounded-xl font-bold tracking-tight data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-indigo-400"
            >
              <KeyRound className="h-4 w-4 mr-2" /> Change Password
            </TabsTrigger>
            <TabsTrigger
              value="email"
              className="w-1/2 rounded-xl font-bold tracking-tight data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md dark:data-[state=active]:bg-gray-900 dark:data-[state=active]:text-indigo-400"
            >
              <Mail className="h-4 w-4 mr-2" /> Change Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
                className="space-y-5"
              >
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          className="rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-12 focus:ring-2 focus:ring-indigo-500 font-bold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Min 8 chars + uppercase + number + symbol"
                          className="rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-12 focus:ring-2 focus:ring-indigo-500 font-bold"
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
                        <Input
                          type="password"
                          placeholder="Re-enter the new password"
                          className="rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-12 focus:ring-2 focus:ring-indigo-500 font-bold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={isSubmittingPassword}
                    className="rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 grow h-12"
                  >
                    {isSubmittingPassword ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <KeyRound className="h-5 w-5 mr-2" />
                    )}
                    Update Password
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="email">
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit(onSubmitEmail)}
                className="space-y-5"
              >
                {currentEmail && (
                  <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30">
                    <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 tracking-wide">
                      Current Login Email
                    </p>
                    <p className="text-sm font-black text-gray-900 dark:text-white mt-1">
                      {currentEmail}
                    </p>
                  </div>
                )}
                <FormField
                  control={emailForm.control}
                  name="newEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                        New Email Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="e.g. new.address@example.com"
                          className="rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-12 focus:ring-2 focus:ring-indigo-500 font-bold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={emailForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-black uppercase tracking-widest text-gray-400">
                        Verify with Current Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password to confirm"
                          className="rounded-xl bg-gray-50 dark:bg-gray-800 border-none h-12 focus:ring-2 focus:ring-indigo-500 font-bold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    disabled={isSubmittingEmail}
                    className="rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmittingEmail}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 grow h-12"
                  >
                    {isSubmittingEmail ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <Mail className="h-5 w-5 mr-2" />
                    )}
                    Update Email
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
