import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import mapImg from '../../map.png'
import Header from '@/components/Common/Header'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-200">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-60" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100 via-transparent to-transparent opacity-40" />
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-32 lg:px-8 relative">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-2 backdrop-blur-sm">
                <Badge variant="secondary" className="bg-green-500 text-white border-0 shadow-sm">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    Live
                  </span>
                </Badge>
                <span className="text-xs font-medium text-slate-700">Real-time WebSocket Updates</span>
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-6xl leading-tight">
                  Real‑Time Campus
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Bus Tracking</span>
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                  Monitor university transit in real-time with precision GPS tracking. Secure driver authentication, instant updates, and seamless admin oversight — powering smarter campus mobility.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl shadow-blue-500/30 h-12 px-8 text-base font-semibold">
                  <Link to="/map">View Live Map</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-slate-300 hover:border-blue-600 hover:text-blue-600 h-12 px-8 text-base font-semibold">
                  <Link to="/driver">Driver Console</Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="hover:bg-slate-100 h-12 px-8 text-base font-semibold">
                  <Link to="/admin">Admin Panel</Link>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-4 md:max-w-lg">
                <Stat label="Update Rate" value="<3s" />
                <Stat label="Reliability" value="99.9%" />
                <Stat label="Fleet Size" value="12+" />
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-10 blur-3xl" />
              <Card className="overflow-hidden border-2 border-slate-200 shadow-2xl relative backdrop-blur">
                <CardHeader className="pb-3 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                  <CardTitle className="text-lg font-bold text-slate-900">Campus Live View</CardTitle>
                  <CardDescription className="text-slate-600">Real-time tracking interface preview</CardDescription>
                </CardHeader>
                <CardContent className="p-0 bg-slate-50">
                  <img src={mapImg} alt="Map preview" className="h-full w-full object-cover" />
                </CardContent>
              </Card>
              <div className="absolute -bottom-6 -left-6 hidden md:block">
                <Badge className="shadow-lg shadow-blue-500/40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 px-4 py-2 text-sm font-semibold">Socket.io Powered</Badge>
              </div>
              <div className="absolute -top-6 -right-6 hidden lg:block">
                <div className="rounded-2xl bg-white border-2 border-slate-200 shadow-xl px-5 py-3">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Now</div>
                  <div className="text-2xl font-bold text-blue-600 mt-1">8 Buses</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mb-16 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Enterprise-Grade Transit Intelligence</h2>
              <p className="mt-4 text-lg text-slate-600">Built on cutting-edge technology for reliability, security, and performance that students and staff can depend on.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <FeatureCard title="Precision GPS Tracking" description="Sub-second location updates with advanced GPS positioning algorithms ensure millimeter-accurate bus tracking across the entire campus network." />
              <FeatureCard title="Secure Authentication" description="Enterprise SSO integration with Google Workspace ensures only verified university drivers can broadcast location data, maintaining system integrity." />
              <FeatureCard title="WebSocket Infrastructure" description="Low-latency bidirectional communication via Socket.io delivers instantaneous updates to thousands of concurrent users without polling overhead." />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-y border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/30 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Seamless Integration in Three Steps</h2>
              <p className="mt-4 text-lg text-slate-600">From riders to administrators, everyone gets instant access to the tools they need.</p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <StepCard step="1" title="Access Live Map" description="Students and staff view real-time bus positions, estimated arrival times, and route information through our intuitive web interface." ctaLabel="Explore Map" to="/map" />
              <StepCard step="2" title="Driver Authentication" description="Authorized drivers sign in with university credentials and begin broadcasting GPS location automatically from the secure console." ctaLabel="Driver Access" to="/driver" />
              <StepCard step="3" title="Administrative Control" description="Transit administrators approve drivers, manage routes, monitor system health, and analyze usage patterns from the central dashboard." ctaLabel="Admin Dashboard" to="/admin" />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-white">
          <div className="mx-auto max-w-3xl px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-600 mb-10">Everything you need to know about our campus transit tracking system.</p>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="item-1" className="border-2 border-slate-200 rounded-xl px-6 bg-white hover:border-blue-300 transition-colors">
                <AccordionTrigger className="text-base font-semibold text-slate-900 hover:text-blue-600 py-5">How frequently does the map refresh with new data?</AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-5">The system updates every 2–3 seconds on average, with adaptive intervals based on network conditions and device battery optimization settings to ensure optimal performance.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-2 border-slate-200 rounded-xl px-6 bg-white hover:border-blue-300 transition-colors">
                <AccordionTrigger className="text-base font-semibold text-slate-900 hover:text-blue-600 py-5">Who has authorization to broadcast location data?</AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-5">Only university-approved drivers with verified credentials can share location. Administrators have granular control to grant, suspend, or revoke access instantly through the admin panel.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-2 border-slate-200 rounded-xl px-6 bg-white hover:border-blue-300 transition-colors">
                <AccordionTrigger className="text-base font-semibold text-slate-900 hover:text-blue-600 py-5">Is a mobile application required to use this service?</AccordionTrigger>
                <AccordionContent className="text-slate-600 pb-5">No installation necessary. The entire platform is web-based and fully responsive, accessible from any modern browser on desktop, tablet, or smartphone devices.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 grid place-items-center">
                <span className="text-white text-sm font-bold">UB</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">Uni Bus Tracker</span>
                <span className="text-xs text-slate-500">© {new Date().getFullYear()} All rights reserved</span>
              </div>
            </div>
            <div className="flex items-center gap-8 text-sm font-medium">
              <Link to="/map" className="text-slate-600 hover:text-blue-600 transition-colors">Live Map</Link>
              <Link to="/driver" className="text-slate-600 hover:text-blue-600 transition-colors">Driver Portal</Link>
              <Link to="/admin" className="text-slate-600 hover:text-blue-600 transition-colors">Administration</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 text-center shadow-lg hover:shadow-xl transition-shadow hover:border-blue-300">
      <div className="text-3xl font-bold leading-none tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{value}</div>
      <div className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</div>
    </div>
  )
}

function FeatureCard({ title, description }) {
  return (
    <Card className="border-2 border-slate-200 hover:border-blue-300 transition-all hover:shadow-2xl shadow-lg bg-white group">
      <CardHeader className="space-y-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 grid place-items-center group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 group-hover:from-white group-hover:to-white transition-all" />
        </div>
        <CardTitle className="text-xl font-bold text-slate-900">{title}</CardTitle>
        <CardDescription className="text-slate-600 leading-relaxed">{description}</CardDescription>
      </CardHeader>
    </Card>
  )
}

function StepCard({ step, title, description, ctaLabel, to }) {
  return (
    <Card className="relative border-2 border-slate-200 hover:border-blue-300 transition-all shadow-lg hover:shadow-2xl bg-white group">
      <div className="absolute -right-3 -top-3">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/40 grid place-items-center border-4 border-white">
          <span className="text-white text-xl font-bold">{step}</span>
        </div>
      </div>
      <CardHeader className="pt-10 space-y-3">
        <CardTitle className="text-xl font-bold text-slate-900">{title}</CardTitle>
        <CardDescription className="text-slate-600 leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="secondary" className="w-full bg-gradient-to-r from-slate-100 to-blue-50 hover:from-blue-600 hover:to-indigo-600 border-2 border-slate-200 hover:border-transparent hover:text-white transition-all font-semibold shadow-sm group-hover:shadow-lg">
          <Link to={to}>{ctaLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}