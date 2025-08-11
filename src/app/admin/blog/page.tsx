"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, PlusCircle, Edit, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminBlogPostForm } from "@/components/admin/admin-blog-post-form"
import { deleteBlogPost } from "@/app/admin/blog/actions"
import Image from "next/image"
import Link from "next/link"

interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  date: string // ISO string
}

function AdminBlogContent() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>(undefined)

  const fetchBlogPosts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/blog-posts")
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to fetch blog posts (Status: ${response.status})`)
      }
      const data = await response.json()
      setBlogPosts(data.blogPosts || [])
    } catch (err) {
      console.error("[Client] Error fetching blog posts:", err)
      setError((err as Error).message)
      toast.error("Failed to load blog posts: " + (err as Error).message, { duration: 5000 })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlogPosts()
  }, [fetchBlogPosts])

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      const formData = new FormData()
      formData.append("id", id)
      const result = await deleteBlogPost(formData)
      if (result.success) {
        toast.success(result.message, { duration: 3000 })
        fetchBlogPosts() // Refresh data
      } else {
        toast.error(result.message, { duration: 3000 })
      }
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingPost(undefined)
    fetchBlogPosts() // Refresh data
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingPost(undefined)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-900 transition-colors duration-300">
      <AdminSidebar isMobileMenuOpen={isSidebarOpen} setIsMobileMenuOpen={setIsSidebarOpen} />

      <div className="flex min-h-screen">
        <div className="flex-1 md:ml-64 pt-16 md:pt-0 px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Blog Post Management</h1>

          {showForm && (
            <AdminBlogPostForm initialData={editingPost} onSuccess={handleFormSuccess} onCancel={handleFormCancel} />
          )}

          {!showForm && (
            <Button
              onClick={() => {
                setEditingPost(undefined) // Clear any previous editing state
                setShowForm(true)
              }}
              className="mb-6 bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Blog Post
            </Button>
          )}

          {isLoading && (
            <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700">
              <CardContent className="text-center py-8">
                <div className="animate-pulse">
                  <Loader2 className="h-8 w-8 mx-auto text-blue-600 dark:text-blue-400 animate-spin mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">Loading blog posts...</p>
                </div>
              </CardContent>
            </Card>
          )}
          {error && (
            <Card className="mb-6 bg-red-50/90 dark:bg-red-900/50 shadow-md rounded-xl border border-red-200 dark:border-red-600">
              <CardContent className="text-center py-8">
                <p className="text-sm text-red-700 dark:text-red-400">Error: {error}</p>
                <Button
                  variant="outline"
                  onClick={fetchBlogPosts}
                  className="mt-4 text-sm border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-800/50 bg-transparent"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && blogPosts.length > 0 && (
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Existing Blog Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-gray-700/50">
                        <TableHead className="w-20 text-xs">Image</TableHead>
                        <TableHead className="text-xs">Title</TableHead>
                        <TableHead className="text-xs">Excerpt</TableHead>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blogPosts.map((post) => (
                        <TableRow
                          key={post.id}
                          className="hover:bg-blue-50/30 dark:hover:bg-blue-900/30 transition-all duration-200"
                        >
                          <TableCell>
                            <Image
                              src={post.imageUrl || "/placeholder.svg"}
                              alt={post.title}
                              width={60}
                              height={40}
                              className="rounded-md object-cover"
                            />
                          </TableCell>
                          <TableCell className="font-medium text-sm max-w-[150px] truncate">
                            <Link
                              href={`/blog/${post.id}`}
                              className="hover:underline text-blue-600 dark:text-blue-400"
                            >
                              {post.title}
                            </Link>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                            {post.excerpt}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(post.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && blogPosts.length === 0 && !showForm && (
            <div className="text-center py-8 bg-gray-50/50 dark:bg-gray-700/50 rounded-lg">
              <PlusCircle className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-3" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">No Blog Posts Yet</h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
                Start by adding your first blog post using the button above.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default function AdminBlogPage() {
  return (
    <Suspense fallback={<div>Loading Blog Management...</div>}>
      <AdminBlogContent />
    </Suspense>
  )
}
