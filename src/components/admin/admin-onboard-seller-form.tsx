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
    <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Onboard New Seller</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid grid-cols-1 gap-4">
          <Input name="sellerId" required placeholder="Phone Number (e.g. +233501234567)" className="w-full" />
          <Input name="name" required placeholder="Seller Name" className="w-full" />
          <Input name="location" required placeholder="Location" className="w-full" />
          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
