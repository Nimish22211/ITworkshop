import { Button } from "../ui/button"
// import { MapPin } from "lucide-react"
import { MapPin, ArrowRight, Shield, Users, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import {Link} from 'react-router-dom'


export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsVisible(true)
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const floatingElements = [
    { icon: Shield, delay: "0s", position: "top-20 left-20" },
    { icon: Users, delay: "0.5s", position: "top-32 right-32" },
    { icon: Zap, delay: "1s", position: "bottom-40 left-16" },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f9ff_1px,transparent_1px),linear-gradient(to_bottom,#f0f9ff_1px,transparent_1px)] bg-[size:6rem_4rem] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] opacity-30" />
      
      {/* Floating Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-emerald-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-700" />
      
      {/* Floating Icons */}
      {floatingElements.map((element, index) => (
        <div 
          key={index}
          className={`absolute ${element.position} opacity-20 dark:opacity-10`}
          style={{
            animationDelay: element.delay,
            animation: `float 6s ease-in-out infinite`,
          }}
        >
          <element.icon size={24} className="text-blue-500" />
        </div>
      ))}

      {/* Mouse Follower Effect */}
      <div 
        className="fixed pointer-events-none w-96 h-96 rounded-full opacity-10 bg-gradient-to-r from-blue-500 to-purple-500 blur-3xl transition-all duration-700 ease-out z-0"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Section */}
          <div className={`space-y-8 transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-medium backdrop-blur-sm">
              <MapPin size={16} />
              <span>Trusted by 500+ Cities</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-blue-900 dark:from-white dark:via-slate-200 dark:to-blue-200 leading-[0.9] tracking-tight">
                Your Community,
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Officially Heard.
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
                Report, track, and resolve local issues with Urban Pulse. The official channel connecting 
                citizens with city officials for a <span className="text-blue-600 dark:text-blue-400 font-semibold">more accountable neighborhood</span>.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link to="/report">
                Report an Issue Now
                </Link>
                <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-8 py-4 text-lg font-semibold backdrop-blur-sm bg-white/50 dark:bg-slate-900/50 hover:shadow-lg transition-all duration-300"
              >
                <Link to="/map">
                See it in Action
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">50K+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Issues Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">24h</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 dark:text-white">98%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Visual Section */}
          <div className={`relative transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            {/* Main Card */}
            <div className="relative bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full -ml-12 -mb-12" />
              
              {/* Mock Interface */}
              <div className="relative space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Urban Pulse Dashboard</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                </div>

                {/* Map Container */}
                <div className="relative h-80 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl overflow-hidden">
                  <img
                    src="/map.png"
                    alt="Interactive City Map"
                    className="w-full h-full object-cover opacity-90"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                  {/* Fallback */}
                  <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-slate-600 dark:to-slate-700">
                    <div className="text-center space-y-4">
                      <MapPin size={48} className="mx-auto text-blue-500" />
                      <div className="text-slate-600 dark:text-slate-300 font-medium">Interactive City Map</div>
                    </div>
                  </div>
                  
                  {/* Overlay Elements */}
                  <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Live Status
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                    <MapPin size={20} />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                    <div className="text-green-700 dark:text-green-400 font-semibold text-lg">142</div>
                    <div className="text-green-600 dark:text-green-500 text-sm">Resolved Today</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="text-blue-700 dark:text-blue-400 font-semibold text-lg">23</div>
                    <div className="text-blue-600 dark:text-blue-500 text-sm">In Progress</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 animate-float">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-blue-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Verified Reports</span>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700 animate-float delay-1000">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-green-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Community Driven</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </section>
  )
}