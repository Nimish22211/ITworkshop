import { Eye, BarChart3, ShieldCheck } from "lucide-react"

export function TransparencySection() {
  const features = [
    {
      icon: Eye,
      title: "Public Accountability",
      description:
        "Every non-sensitive report is visible on a public map, fostering community awareness and driving collective action.",
    },
    {
      icon: BarChart3,
      title: "Data-Driven Insights",
      description: "We provide public dashboards with resolution times and performance metrics for city departments.",
    },
    {
      icon: ShieldCheck,
      title: "Verified by Officials",
      description: "Resolutions are marked complete only by verified officials, ensuring the job is actually done.",
    },
  ]

  return (
    <section id="transparency" className="py-20 px-6 bg-card/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl overflow-hidden">
              <img
                src="/clean-well-maintained-city-street-with-modern-infr.jpg"
                alt="Clean, well-maintained city area"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
                Unprecedented Transparency. Verifiable Results.
              </h2>
            </div>

            <div className="space-y-6">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div key={feature.title} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
