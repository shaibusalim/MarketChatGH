import type { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Intentionally empty.
  // Server-level auth guard is applied in (protected)/layout.tsx so the
  // /signin route isn't accidentally caught in a redirect loop.
  return <>{children}</>
}
