"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFormStatus } from "react-dom"
import { Loader2, Search } from "lucide-react"

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
    <div className="relative group">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input 
            name="q" 
            placeholder="Search partners..." 
            defaultValue={searchQuery} 
            className="rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 h-11 text-xs font-bold focus:ring-blue-500 transition-all pl-10" 
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
             <Search className="h-4 w-4" />
          </div>
        </div>
        <input type="hidden" name="page" value="1" />
        <SearchButton />
      </form>
    </div>
  )
}
