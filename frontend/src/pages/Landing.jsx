import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import mapImg from '../../map.png'
import { useAuth } from '@/context/AuthContext'

export default function Landing() {
  const { isAuthenticated, logout, user } = useAuth()
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary/10 grid place-items-center">
              <span className="text-primary text-sm font-bold">UB</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">Uni Bus Tracker</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link to="/map" className="text-muted-foreground hover:text-foreground">Live Map</Link>
            <Link to="/driver" className="text-muted-foreground hover:text-foreground">Driver</Link>
            <Link to="/admin" className="text-muted-foreground hover:text-foreground">Admin</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to="/map">Open Map</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/driver">Go Driver</Link>
            </Button>
            {isAuthenticated ? (
              <>
                <span className="hidden text-xs text-muted-foreground md:inline">{user?.name || user?.email}</span>
                <Button size="sm" variant="ghost" onClick={logout}>Logout</Button>
              </>
            ) : (
              <Button asChild size="sm">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <Badge variant="secondary">Live</Badge>
                <span className="text-xs text-muted-foreground">WebSocket powered updates</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
                Real‑time University Bus Tracking
              </h1>
              <p className="mt-4 max-w-prose text-muted-foreground">
                See buses move across campus in real time, get ETA hints, and keep riders informed. Drivers share location securely; admins approve access with one click.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to="/map">View Live Map</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/driver">Driver Console</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link to="/admin">Admin Panel</Link>
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 text-center md:max-w-md">
                <Stat label="Avg Update" value="2s" />
                <Stat label="Uptime" value="99.9%" />
                <Stat label="Buses" value="12" />
              </div>
            </div>
            <div className="relative">
              <Card className="overflow-hidden">
                <CardHeader className="pb-0">
                  <CardTitle className="text-base">Campus Snapshot</CardTitle>
                  <CardDescription>Preview of the live tracking view</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <img src={mapImg} alt="Map preview" className="h-full w-full object-cover" />
                </CardContent>
              </Card>
              <div className="absolute -bottom-4 -left-4 hidden rotate-2 md:block">
                <Badge className="shadow" variant="default">Socket.io</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Why it works</h2>
                <p className="mt-2 text-sm text-muted-foreground">Built for reliability, clarity, and speed.</p>
              </div>
              <div className="hidden md:block">
                <Button asChild variant="outline" size="sm"><Link to="/map">Try the Map</Link></Button>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <FeatureCard title="Live Locations" description="GPS positions update every few seconds for accurate tracking across campus." />
              <FeatureCard title="Driver Approved" description="Admins approve drivers via Google Sign‑In to prevent misuse and ensure safety." />
              <FeatureCard title="Realtime Updates" description="WebSocket powered stream using Socket.io keeps everyone in sync instantly." />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y bg-muted/30 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="text-2xl font-semibold">Get started in minutes</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <StepCard step="1" title="Open the Map" description="Riders visit the public map to see live bus positions and ETAs." ctaLabel="View Map" to="/map" />
              <StepCard step="2" title="Driver Sign‑In" description="Drivers sign in and share location automatically from the console." ctaLabel="Driver Console" to="/driver" />
              <StepCard step="3" title="Admin Approve" description="Admins approve drivers and manage routes securely from the panel." ctaLabel="Admin Panel" to="/admin" />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="text-2xl font-semibold">FAQ</h2>
            <Accordion type="single" collapsible className="mt-6">
              <AccordionItem value="item-1">
                <AccordionTrigger>How often does the map update?</AccordionTrigger>
                <AccordionContent>Every 2–5 seconds depending on connection quality and battery settings.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Who can broadcast location?</AccordionTrigger>
                <AccordionContent>Only approved drivers. Admins grant and revoke access at any time.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Do I need an app?</AccordionTrigger>
                <AccordionContent>No. Everything runs in the browser on desktop and mobile.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground md:flex-row">
          <div>© {new Date().getFullYear()} Uni Bus Tracker</div>
          <div className="flex items-center gap-4">
            <Link to="/map" className="hover:text-foreground">Live Map</Link>
            <Link to="/driver" className="hover:text-foreground">Driver</Link>
            <Link to="/admin" className="hover:text-foreground">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-md border bg-card p-3 text-center shadow-sm">
      <div className="text-2xl font-semibold leading-none tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function FeatureCard({ title, description }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function StepCard({ step, title, description, ctaLabel, to }) {
  return (
    <Card className="relative">
      <div className="absolute right-4 top-4">
        <Badge variant="outline">Step {step}</Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="secondary"><Link to={to}>{ctaLabel}</Link></Button>
      </CardContent>
    </Card>
  )
}
