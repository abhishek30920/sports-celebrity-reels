'use client'
import { ReelContainer } from "@/components/reels/reel-container"

export default function ReelsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-black">
      <style jsx global>{`
        /* Hide scrollbar for Chrome, Safari and Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
      <div className="w-full h-screen max-w-2xl mx-auto relative overflow-hidden">
        <ReelContainer />
      </div>
    </main>
  )
}