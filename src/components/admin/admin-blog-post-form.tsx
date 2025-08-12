"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useFormStatus } from "react-dom"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import { createBlogPost, updateBlogPost } from "@/app/admin/blog/actions"
import { useState, useEffect } from "react"
import { ImageUpload } from "./image-upload"

interface BlogPost {
  id?: string
  title: string
  excerpt: string
  content: string
  imageUrl: string
  date: string
}

interface AdminBlogPostFormProps {
  initialData?: BlogPost // For editing existing posts
  onSuccess: () => void
  onCancel: () => void
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button
      type="submit"
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg py-2 text-sm transition-all duration-200 shadow-md hover:shadow-lg"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isEditing ? "Saving..." : "Creating..."}
        </>
      ) : isEditing ? (
        "Update Post"
      ) : (
        "Create Post"
      )}
    </Button>
  )
}

export function AdminBlogPostForm({ initialData, onSuccess, onCancel }: AdminBlogPostFormProps) {
  const isEditing = !!initialData?.id
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || "")

  useEffect(() => {
    if (initialData?.imageUrl) {
      setImageUrl(initialData.imageUrl)
    }
  }, [initialData])

  const handleSubmit = async (formData: FormData) => {
    formData.append("imageUrl", imageUrl) // Add image URL from state

    let result
    if (isEditing) {
      formData.append("id", initialData.id!) // Add ID for update action
      result = await updateBlogPost(formData)
    } else {
      result = await createBlogPost(formData)
    }

    if (result.success) {
      toast.success(result.message, { duration: 3000 })
      onSuccess() // Trigger data refresh and close form
    } else {
      toast.error(result.message, { duration: 3000 })
    }
  }

  return (
    <Card className="mb-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md rounded-xl border border-gray-100 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditing ? "Edit Blog Post" : "Create New Blog Post"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="grid grid-cols-1 gap-4">
          <Input
            name="title"
            required
            placeholder="Blog Post Title"
            defaultValue={initialData?.title || ""}
            className="w-full"
          />
          <Input
            name="excerpt"
            required
            placeholder="Short Excerpt"
            defaultValue={initialData?.excerpt || ""}
            className="w-full"
          />
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            label="Blog Post Image"
            placeholder="Enter image URL or upload an image file"
          />
          <Textarea
            name="content"
            required
            placeholder="Full Blog Content"
            defaultValue={initialData?.content || ""}
            rows={8}
            className="w-full"
          />
          <div className="flex gap-2">
            <SubmitButton isEditing={isEditing} />
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
