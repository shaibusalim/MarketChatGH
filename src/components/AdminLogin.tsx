"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, User, Loader2 } from "lucide-react"
import { AnimatePresence } from "framer-motion" // Import AnimatePresence
import { signIn } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function AdminLogin({ onClose }: { onClose: () => void }) {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [isSigningIn, setIsSigningIn] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSigningIn(true)

    const result = await signIn("credentials", {
      email: credentials.email,
      password: credentials.password,
      redirect: false,
    })

    setIsSigningIn(false)

    if (result?.error) {
      setError(result.error)
    } else {
      router.push("/admin")
      onClose() // Close the dialog on successful login
    }
  }

  return (
    <AnimatePresence>
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Admin Login</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter your credentials to access the admin panel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="pl-10 w-full"
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="pl-10 w-full"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-md"
              disabled={isSigningIn}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  )
}
