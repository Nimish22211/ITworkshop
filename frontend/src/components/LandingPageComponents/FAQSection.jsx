import { Button } from "../ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"
import {Link } from 'react-router-dom'


export function FAQSection() {
  const faqs = [
    {
      question: "Is Urban Pulse an official government service?",
      answer:
        "Urban Pulse partners with municipal governments to provide an official reporting channel. While we're an independent platform, all reports are directly submitted to the appropriate city departments and officials.",
    },
    {
      question: "What types of problems can I report?",
      answer:
        "You can report infrastructure issues like potholes, broken streetlights, damaged sidewalks, graffiti, illegal dumping, and other public safety concerns. We focus on issues that fall under municipal jurisdiction.",
    },
    {
      question: "How is my personal data handled?",
      answer:
        "We follow strict privacy protocols and only share necessary information with relevant city departments. Your personal details are never made public, and you can choose to report anonymously for most issue types.",
    },
    {
      question: "What happens if my report is ignored?",
      answer:
        "Our transparency system tracks response times and resolution rates by department. If issues remain unaddressed beyond reasonable timeframes, they're escalated and highlighted in our public accountability dashboards.",
    },
    {
      question: "Can I see other reports in my area?",
      answer:
        "Yes! Our public map shows all non-sensitive reports in your neighborhood, helping you stay informed about local issues and see what problems are being addressed by city officials.",
    },
  ]

  return (
    <section id="faq" className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">Frequently Asked Questions</h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-lg font-semibold text-foreground hover:text-primary">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-3">
            
            <Link to="/report">
            Report Now
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
