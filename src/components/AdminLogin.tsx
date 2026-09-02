"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Lock, User, Loader2, AlertCircle } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { signIn, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function AdminLogin({ onClose }: { onClose: () => void }) {
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [formError, setFormError] = useState<string>("")
  const [isSigningIn, setIsSigningIn] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: sessionStatus } = useSession()
  const didRedirectRef = useRef(false)

  // If there's already a NextAuth ?error= in the URL (from previous redirect:true failures)
  // surface it in the form so the user sees it (instead of "just refreshes with no error").
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
      // Clear the error from the URL so it doesn't keep showing after a retry.
      const url = new URL(window.location.href)
      url.searchParams.delete('error')
      window.history.replaceState({}, '', url.toString())
    }
    const cbError = searchParams.get('callbackUrl')
    void cbError
  }, [searchParams])

  // If the user opens the dialog while ALREADY logged in as an admin,
  // close the dialog + jump to the dashboard immediately (no double-login needed).
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
      // Use redirect:false so signIn() PROMISE resolves with actual result object.
      // On failure we display the error INLINE — no blank refresh, no mystery reload.
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

      // Credentials accepted. Now re-read the SERVER session endpoint for the
      // role + id claims. Use that to route the user to the correct dashboard.
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
        // Not admin → probably a seller who accidentally typed into admin dialog.
        // Send them to their seller dashboard.
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
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Admin Panel
                </DialogTitle>
                <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Secure Access Only
                </p>
              </div>
            </div>
            <DialogDescription className="text-muted-foreground pt-2">
              Authorized administrators only. Your activity is logged.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
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
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="pl-9 w-full h-11 rounded-xl"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
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
                className="font-semibold text-green-600 dark:text-green-500 hover:underline"
              >
                Go to Seller Login
              </a>
            </p>
          </form>
        </DialogContent>
      </Dialog>
    </AnimatePresence>
  )
}
