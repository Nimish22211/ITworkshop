import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { MapPin, FileCheck, ShieldCheck } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Pinpoint & Report",
      icon: MapPin,
      description:
        "Use our interactive map to precisely locate an issue. Upload photos and provide key details through a simple, guided form.",
    },
    {
      number: "2",
      title: "Official Acknowledgment",
      icon: FileCheck,
      description:
        "Your report is instantly submitted to the correct municipal department, assigned a tracking number, and its status is made transparent.",
    },
    {
      number: "3",
      title: "Track to Resolution",
      icon: ShieldCheck,
      description:
        "Monitor real-time progress from 'Submitted' to 'Resolved.' Receive notifications at every stage and hold officials accountable.",
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
            A Direct Line to a Better Community.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <Card key={step.number} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground">
                        {step.number}. {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="text-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-3">
            Report Now
          </Button>
        </div>
      </div>
    </section>
  )
}
