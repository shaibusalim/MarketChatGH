"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Lock, User, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function AdminLogin({ onClose }: { onClose: () => void }) {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string>("")
  const [isSigningIn, setIsSigningIn] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: sessionStatus } = useSession()
  const didRedirectRef = useRef(false)

  useEffect(() => {
    const urlError = searchParams.get('error')
    if (urlError) {
      const friendly = {
        'CredentialsSignin': 'Incorrect email or password. Please try again.',
        'SessionRequired': 'Your session has expired. Please sign in again.',
        'AccessDenied': 'You do not have permission to access the admin panel.',
        'Configuration': 'There is a server configuration issue. Please contact support.',
      }[urlError] || `Sign-in failed: ${urlError}`
      setFormError(friendly)
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
  }, [searchParams])

  useEffect(() => {
    if (sessionStatus === 'loading') return
    if (didRedirectRef.current) return
    if (session?.user) {
      const u = session.user as any
      const isAdminUser = Boolean(u.isAdmin || u.role === 'admin')
      if (isAdminUser) {
        didRedirectRef.current = true
        onClose()
        router.replace('/mcgh-admin-control')
      }
    }
  }, [sessionStatus, session, router, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setIsSigningIn(true)

    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      })

      if (!result || result.error) {
        const err =
          result?.error === 'CredentialsSignin' ? 'Incorrect email or password. Please try again.' :
          result?.error === 'AccessDenied' ? 'You do not have permission to access the admin panel.' :
          result?.error ? `Sign-in failed: ${result.error}` :
          'Unable to sign in. Please try again.'
        setFormError(err)
        setIsSigningIn(false)
        return
      }

      const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' })
        .catch(() => ({ ok: false, json: async () => null } as any))
      const freshSession = sessionRes.ok ? await (sessionRes as any).json() : null
      const user = freshSession?.user || (session?.user as any) || null
      const isAdminUser = Boolean(user?.isAdmin || user?.role === 'admin')

      if (isAdminUser) {
        didRedirectRef.current = true
        onClose()
        router.replace('/mcgh-admin-control')
      } else if (user?.id) {
        didRedirectRef.current = true
        onClose()
        router.replace(`/seller/dashboard/${String(user.id)}`)
      } else {
        setFormError('Sign-in succeeded but your session could not be verified. Please refresh and try again.')
        setIsSigningIn(false)
      }
    } catch (err) {
      setFormError('Failed to sign in. Please check your connection and try again.')
      setIsSigningIn(false)
    }
  }

  return (
    <AnimatePresence>
      <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
        <DialogContent
          className="sm:max-w-[425px] bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800"
          onInteractOutside={(e) => { e.preventDefault() }}
        >
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight">Admin Portal</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Sign in with your master administrator credentials to access system controls.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{formError}</div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="admin-login-email">Admin Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="admin-login-email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  className="pl-9 w-full h-11 rounded-xl"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="admin-login-password">Password</Label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  id="admin-login-password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="pl-9 pr-10 w-full h-11 rounded-xl"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors focus:outline-none p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:via-violet-500 hover:to-purple-500 text-white font-semibold shadow-lg shadow-indigo-500/20"
              disabled={isSigningIn || sessionStatus === 'loading'}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying credentials…
                </>
              ) : (
                "Sign in to Admin Panel"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground pt-1">
              Not an admin?{" "}
              <a
                href="/seller/signin"
                className="text-primary font-medium hover:underline"
              >
                Go to Seller Sign In
              </a>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  )
}
