"use client"

import { GenerationForm } from "@/components/admin/generation-form"
import { VideoList } from "@/components/admin/video-list" 
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        {/* <div className="container px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-blue-600">Video Generator</h1>
          <Button variant="outline" size="sm" asChild>
            <a href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </a>
          </Button>
        </div> */}
      </header>
      
      <main className="flex-1 container px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-medium mb-4 text-gray-800">Generate New Video</h2>
            <GenerationForm />
          </div>
          <div>
            <h2 className="text-xl font-medium mb-4 text-gray-800">Generated Videos</h2>
            <VideoList />
          </div>
        </div>
      </main>
      
      <footer className="border-t bg-white py-4">
        <div className="container px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Video Generator. All rights reserved.
        </div>
      </footer>
    </div>
  )
}