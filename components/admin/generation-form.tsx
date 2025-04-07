"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"

export function GenerationForm() {
  const [celebrityName, setCelebrityName] = useState("")
  const [sport, setSport] = useState("")
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedScript, setGeneratedScript] = useState("")
  const { toast } = useToast()
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!celebrityName || !sport) {
      toast({
        title: "Missing information",
        description: "Please provide both celebrity name and sport.",
        variant: "destructive",
      })
      return
    }
    
    setLoading(true)
    setGeneratedScript("")
    
    // Show the "generating" toast when process starts
    const loadingToast = toast({
      title: "Generating video...",
      description: "Your video is being created. This might take a minute.",
      duration: Infinity, // Will be dismissed manually
    })
    
    try {
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          celebrityName,
          sport,
          additionalInfo,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate video")
      }
      
      // Dismiss the loading toast
      toast({
        id: loadingToast,
        title: "Success!",
        description: `Your video for ${celebrityName} is being processed.`,
        variant: "default",
        duration: 5000,
      })
      
      // Display the generated script preview if available
      if (data.script) {
        setGeneratedScript(data.script)
      }
      
    } catch (error) {
      console.error("Error generating video:", error)
      
      // Dismiss the loading toast and show error
      toast({
        id: loadingToast,
        title: "Error",
        description: "Failed to generate script. Please try again later.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card className="overflow-hidden border-gray-200">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="celebrity-name" className="text-gray-700">Celebrity Name</Label>
            <Input
              id="celebrity-name"
              value={celebrityName}
              onChange={(e) => setCelebrityName(e.target.value)}
              placeholder="e.g., Michael Jordan"
              required
              className="border-gray-300 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sport" className="text-gray-700">Sport</Label>
            <Input
              id="sport"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
              placeholder="e.g., Basketball"
              required
              className="border-gray-300 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additional-info" className="text-gray-700">Additional Information (Optional)</Label>
            <Textarea
              id="additional-info"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any specific aspects of their career you want to highlight..."
              rows={4}
              className="border-gray-300 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Generate Video
              </>
            )}
          </Button>
          
          {generatedScript && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-md">
              <h4 className="font-medium mb-2 text-blue-800">Generated Script Preview:</h4>
              <p className="text-sm text-gray-700 whitespace-pre-line">{generatedScript}</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}