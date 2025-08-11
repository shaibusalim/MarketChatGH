import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
      <span className="sr-only">Loading admin dashboard...</span>
    </div>
  )
}
