import type { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/auth.config'
import { notFound } from 'next/navigation'

export const runtime = 'nodejs'

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  const user = session?.user as any
  const isAdmin = Boolean(session?.user && (user?.isAdmin || user?.role === 'admin'))

  if (!session || !session.user || !isAdmin) {
    // Security by obscurity: pretend there is nothing at this URL.
    // Do NOT redirect to a signin page (which would reveal an admin panel exists).
    notFound()
  }

  return <>{children}</>
}
