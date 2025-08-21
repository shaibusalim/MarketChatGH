import type { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth.config'
import { notFound } from 'next/navigation'

export const runtime = 'nodejs'

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
	const session = await getServerSession(authOptions)
	if (!session || !session.user || !(session.user as any).isAdmin) {
		notFound()
	}
	return <>{children}</>
} 