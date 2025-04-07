"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Video, Wand2, Smartphone, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="flex flex-col min-h-screen antialiased bg-gray-50">
      {/* Navigation */}
     

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-44 bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('/reel.png')] bg-repeat"></div>
          <div className="container px-4 md:px-6 relative">
            <div className="grid gap-6 lg:grid-cols-2 items-center max-w-6xl mx-auto">
              <div className="flex flex-col space-y-6">
                <div className="space-y-4">
                  <div className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-sm font-medium">
                    AI-Powered Sports Content
                  </div>
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none">
                    Sports Celebrity 
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"> History Reels</span>
                  </h1>
                  <p className="max-w-[600px] text-gray-300 md:text-xl">
                    Discover the fascinating histories of your favorite sports celebrities through
                    AI-generated video reels. Engage with content that brings sports legends to life.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/reels">
                    <Button size="lg" className="bg-white text-black hover:bg-gray-200 h-12 px-6">
                      Watch Reels <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/admin">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-12 px-6">
                      Admin Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden lg:block relative rounded-lg overflow-hidden shadow-2xl transform rotate-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 mix-blend-overlay"></div>
                {/* <img 
                  src="/reel.png" 
                  alt="Sports video reel preview" 
                  className="w-full h-auto object-cover"
                /> */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white font-medium">Discover the untold stories of sports legends</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ChevronDown className="h-6 w-6 text-white/60" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 bg-black">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl" >
                How It Works
              </h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                Our platform combines cutting-edge AI with professional video production techniques 
                to create compelling content about your favorite sports personalities.
              </p>
            </div>
            
            <div className="grid gap-8 lg:grid-cols-3 items-center max-w-5xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="rounded-xl bg-white border shadow-sm p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-blue-50 text-blue-600 mb-6">
                  <Wand2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI-Generated Content</h3>
                <p className="text-gray-600">
                  Our system uses advanced AI to create engaging scripts about sports celebrities, 
                  researching their career highlights, achievements, and interesting facts.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="rounded-xl bg-white border shadow-sm p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-purple-50 text-purple-600 mb-6">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Dynamic Video Creation</h3>
                <p className="text-gray-600">
                  Automatically sources high-quality images and converts text to natural-sounding speech, 
                  seamlessly combining all elements for compelling videos.
                </p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="rounded-xl bg-white border shadow-sm p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <div className="flex items-center justify-center h-14 w-14 rounded-full bg-pink-50 text-pink-600 mb-6">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">TikTok-Style Experience</h3>
                <p className="text-gray-600">
                  Enjoy a smooth, vertical scrolling experience optimized for mobile devices, 
                  making it easy to discover and enjoy new content about your favorite athletes.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to discover amazing sports stories?
              </h2>
              <p className="mt-4 text-lg text-gray-500 mb-8">
                Start exploring our collection of AI-generated sports reels or create your own through our admin dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/reels">
                  <Button size="lg" className="px-8">
                    Watch Reels
                  </Button>
                </Link>
                <Link href="/admin">
                  <Button size="lg" variant="outline" className="px-8">
                    Create Reels
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 bg-gray-900 text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Video className="h-5 w-5" />
                <span className="font-bold">SportReels</span>
              </div>
              <p className="text-sm text-gray-400">
                Discover the fascinating histories of your favorite sports celebrities through AI-generated video reels.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/reels" className="hover:text-white transition-colors">Watch Reels</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>© 2025 Sports Celebrity Reels. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}