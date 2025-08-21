"use client"

import { useRouter } from "next/navigation"
import { AdminLogin } from "@/components/AdminLogin"

export default function AdminSignInPage() {
	const router = useRouter()
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
			<AdminLogin onClose={() => router.push('/')} />
		</div>
	)
} 