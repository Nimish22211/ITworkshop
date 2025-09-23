import { Button } from "../ui/button"
import { MapPin } from "lucide-react"

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Your Community, Officially Heard.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                Report, track, and resolve local issues with Urban Pulse. We provide the official channel to connect
                citizens with city officials for a better, more accountable neighborhood.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3">
                Report an Issue Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-muted px-8 py-3 bg-transparent"
              >
                See it in Action
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 relative overflow-hidden">
              {/* Abstract city map visualization */}
              <div className="relative h-80">
                {/* Grid lines */}
                <div className="absolute inset-0 opacity-20">
                  <div className="grid grid-cols-6 grid-rows-6 h-full w-full">
                    {Array.from({ length: 36 }).map((_, i) => (
                      <div key={i} className="border border-primary/20"></div>
                    ))}
                  </div>
                </div>

                {/* Glowing lines */}
                <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60"></div>
                <div className="absolute top-3/4 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-40"></div>
                <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent opacity-50"></div>
                <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-transparent via-primary to-transparent opacity-30"></div>

                {/* Issue pins */}
                <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
                </div>
                <div className="absolute top-2/3 left-2/3 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
                </div>

                {/* Floating UI cards */}
                <div className="absolute top-8 right-4 bg-card border border-border rounded-lg p-3 shadow-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">Status: In Progress</span>
                  </div>
                </div>

                <div className="absolute bottom-8 left-4 bg-card border border-border rounded-lg p-3 shadow-xl">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Issue: Pothole</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
