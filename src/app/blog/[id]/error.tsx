"use client" // Error components must be Client Components

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 dark:bg-red-950 p-4 text-center">
      <AlertCircle className="h-16 w-16 text-red-600 dark:text-red-400 mb-6" />
      <h2 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-3">Something went wrong!</h2>
      <p className="text-red-700 dark:text-red-300 mb-6">We couldn't load this blog post. Please try again.</p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg"
      >
        Try again
      </Button>
    </div>
  )
}
