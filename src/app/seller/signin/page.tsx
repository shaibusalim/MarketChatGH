"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { Store, Mail, Lock, Loader2 } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"

export default function SellerSignInPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [isSigningIn, setIsSigningIn] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any
      if (user.role === 'seller') {
        router.push(`/seller/dashboard/${user.id}`)
      } else if (user.role === 'admin') {
        router.push('/admin')
      }
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigningIn(true)

    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error, { duration: 5000 })
      } else {
        toast.success("Welcome back!")
        // Session update will trigger redirect via useEffect
      }
    } catch (err) {
      toast.error("Failed to sign in", { duration: 5000 })
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <div className="pt-32 pb-20 px-4 flex justify-center">
        <Card className="w-full max-w-md shadow-xl border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden">
          <CardHeader className="bg-green-600 text-white p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Seller Login</CardTitle>
            <CardDescription className="text-green-50">Manage your store and products</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="business@example.com"
                    required
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-green-600 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
              </div>

              {searchParams.get('error') && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                  Invalid email or password.
                </div>
              )}

              <Button
                type="submit"
                className="w-full py-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-green-500/30 transition-all mt-4"
                disabled={isSigningIn || status === 'loading'}
              >
                {isSigningIn || status === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login to Shop"
                )}
              </Button>

              <div className="text-center text-sm text-gray-500 mt-6 space-y-2">
                <p>
                  Don't have a shop yet?{" "}
                  <Link href="/seller/signup" className="text-green-600 font-bold hover:underline">
                    Sign Up Now
                  </Link>
                </p>
                <p className="text-xs">
                  Are you an admin?{" "}
                  <Link href="/admin/signin" className="text-gray-400 hover:text-gray-600 hover:underline">
                    Admin Login
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
