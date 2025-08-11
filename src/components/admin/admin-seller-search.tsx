"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

interface AdminSellerSearchProps {
  searchQuery: string
  onSearch: (query: string) => void
}

function SearchButton() {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Searching...
        </>
      ) : (
        "Search"
      )}
    </Button>
  )
}

export function AdminSellerSearch({ searchQuery, onSearch }: AdminSellerSearchProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const newQuery = formData.get("q") as string
    onSearch(newQuery)
  }

  return (
    <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Search Sellers</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <Input name="q" placeholder="Search by name or ID..." defaultValue={searchQuery} className="flex-1" />
          <input type="hidden" name="page" value="1" />
          <SearchButton />
        </form>
      </CardContent>
    </Card>
  )
}
