'use client'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Video, Wand2, Smartphone, ChevronDown } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
export default function Header(){
    const [scrolled, setScrolled] = useState(false)
    
    useEffect(() => {
      const handleScroll = () => {
        setScrolled(window.scrollY > 50)
      }
      
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }, [])
  return (
    <>
     <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled 
          ? "bg-transparent shadow-sm py-3" 
          : "bg-black py-5"
      }`}>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Video className="h-6 w-6" />
              <span className={`font-bold text-xl  ${
        scrolled 
          ? "text-grey-500 " 
          : "text-white"
      }`}>
        <Link href="/">SportReels</Link>
        </span>
            </div>
           
            <div className="flex items-center space-x-3">
              <Link href="/admin">
                <Button variant="outline" className="hidden md:flex h-9">
                  Admin Dashboard
                </Button>
              </Link>
              <Link href="/reels">
                <Button className="h-9">
                  Watch Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}