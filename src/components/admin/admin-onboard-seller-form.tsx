"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFormStatus } from "react-dom"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { onboardSeller } from "@/app/admin/actions"

interface AdminOnboardSellerFormProps {
  onSuccess: () => void
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg py-2 text-sm transition-all duration-200 shadow-md hover:shadow-lg"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Registering...
        </>
      ) : (
        "Register Seller"
      )}
    </Button>
  )
}

export function AdminOnboardSellerForm({ onSuccess }: AdminOnboardSellerFormProps) {
  const handleSubmit = async (formData: FormData) => {
    const result = await onboardSeller(formData)
    if (result.success) {
      toast.success(result.message, { duration: 3000 })
      onSuccess() // Trigger data refresh in parent
    } else {
      toast.error(result.message, { duration: 3000 })
    }
  }

  return (
    <Card className="overflow-hidden bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 dark:border-gray-800/50 group">
      <CardHeader className="p-6 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-xl font-black text-gray-900 dark:text-white tracking-tight italic">Partner Onboarding</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form action={handleSubmit} className="grid grid-cols-1 gap-5">
          <div className="space-y-4">
            <div className="relative group/field">
               <Input name="sellerId" required placeholder="Phone Number" className="rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 h-12 text-sm font-bold focus:ring-blue-500 transition-all" />
               <p className="text-[8px] text-gray-400 font-bold mt-1 uppercase tracking-widest ml-2">Unique identifier (e.g. +233...)</p>
            </div>
            <Input name="name" required placeholder="Business Name" className="rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 h-12 text-sm font-bold focus:ring-blue-500 transition-all" />
            <Input name="location" required placeholder="Physical Location" className="rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 h-12 text-sm font-bold focus:ring-blue-500 transition-all" />
          </div>
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
