"use client"

import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ShieldAlert } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"
import { Store, Mail, Lock, Loader2 } from "lucide-react"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

export default function SellerSignInPage() {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [formError, setFormError] = useState<string>("")
  const searchParams = useSearchParams()
  const router = useRouter()
  const { status, data: session } = useSession()
  const didRedirectRef = useRef(false)

  // Surface NextAuth ?error= in the URL the same way admin login does it
  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      const friendly = {
        'CredentialsSignin': 'Incorrect email or password. Please try again.',
        'AccessDenied': 'This seller account is awaiting approval. Contact MarketChat support.',
        'SessionRequired': 'Your session has expired. Please sign in again.',
      }[urlError] || `Sign-in failed: ${urlError}`
      setFormError(friendly)
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  // Already logged in → route to the correct dashboard immediately
  useEffect(() => {
    if (status === 'loading') return
    if (didRedirectRef.current) return
    if (session?.user) {
      const user = session.user as any
      const isAdminUser = Boolean(user.isAdmin || user.role === 'admin')
      didRedirectRef.current = true
      if (isAdminUser) {
        router.replace('/mcgh-admin-control')
      } else if (user.id) {
        router.replace(`/seller/dashboard/${String(user.id)}`)
      }
    }
  }, [status, session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigningIn(true)
    setFormError("")

    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (!result || result.error) {
        const err =
          result?.error === 'CredentialsSignin' ? 'Incorrect email or password.' :
          result?.error === 'AccessDenied' ? 'This seller account is awaiting admin approval.' :
          result?.error ? `Sign-in failed: ${result.error}` :
          'Unable to sign in. Please try again.'
        setFormError(err)
        toast.error(err, { duration: 5000 })
        setIsSigningIn(false)
        return
      }

      const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' }).catch(() => null) as any
      const freshSession = sessionRes?.ok ? await sessionRes.json() : null
      const user = freshSession?.user || (session?.user as any) || null
      const isAdminUser = Boolean(user?.isAdmin || user?.role === 'admin')
      didRedirectRef.current = true
      if (isAdminUser) {
        router.replace('/mcgh-admin-control')
      } else if (user?.id) {
        router.replace(`/seller/dashboard/${String(user.id)}`)
      } else {
        setFormError('Sign-in succeeded but your session could not be verified. Please refresh.')
        setIsSigningIn(false)
      }
    } catch {
      const msg = "Failed to sign in. Please check your connection and try again."
      setFormError(msg)
      toast.error(msg, { duration: 5000 })
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
              {formError && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/40 text-red-700 dark:text-red-300"
                >
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div className="text-sm font-medium leading-relaxed">{formError}</div>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="seller-login-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="seller-login-email"
                    type="email"
                    placeholder="business@example.com"
                    required
                    autoComplete="email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="pl-10 h-12 rounded-xl"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seller-login-password">Password</Label>
                  <Link href="#" className="text-xs text-green-600 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="seller-login-password"
                    type="password"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-6 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-lg shadow-lg shadow-green-500/30 transition-all mt-2"
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

           

              <div className="text-center text-sm text-gray-500 mt-2 space-y-2 pt-2">
                <p>
                  Don&apos;t have a shop yet?{" "}
                  <Link href="/seller/signup" className="text-green-600 font-bold hover:underline">
                    Sign Up Now
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
