import { Header } from "../components/LandingPageComponents/Header"
import { HeroSection } from "../components/LandingPageComponents/HeroSection"
import { HowItWorks } from "../components/LandingPageComponents/HowItWorks"
import { TransparencySection } from "../components/LandingPageComponents/TransparencySection"
import { FAQSection } from "../components/LandingPageComponents/FAQSection"
import { Footer } from "../components/LandingPageComponents/Footer"

export default function Home() {
  return (
    <div id="home" className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <section id="how-it-works">
          <HowItWorks />
        </section>
        <section id="transparency">
          <TransparencySection />
        </section>
        <section id="faq">
          <FAQSection />
        </section>
      </main>
      <Footer />
    </div>
  )
}
