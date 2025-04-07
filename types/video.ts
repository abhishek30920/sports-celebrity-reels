export interface Video {
  id: string
  title: string
  description: string
  url: string
  status: "processing" | "completed" | "failed"
  createdAt: string
  likes: number
  shares: number
  progress: number
}

