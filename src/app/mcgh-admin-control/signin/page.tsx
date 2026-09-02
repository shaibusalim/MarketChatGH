"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { AdminLogin } from "@/components/AdminLogin"

export default function AdminSignInPage() {
	const router = useRouter()
	const { status, data: session } = useSession()
	const didRedirectRef = useRef(false)

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

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
			<AdminLogin onClose={() => router.push('/')} />
		</div>
	)
}
