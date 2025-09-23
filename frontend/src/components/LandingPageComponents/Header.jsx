import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"
// import { ThemeT  oggle } from "@/components/theme-toggle"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "max-w-5xl mx-auto mt-4 rounded-full border border-border bg-card/80 backdrop-blur-lg"
          : "w-full bg-card/50 backdrop-blur-lg border-b border-border"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">UP</span>
          </div>
          <span className="text-xl font-bold text-foreground">Urban Pulse</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </a>
          <a href="#transparency" className="text-muted-foreground hover:text-foreground transition-colors">
            Transparency
          </a>
          <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          {/* <ThemeToggle /> */}
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/register">Register</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/report">Report</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
