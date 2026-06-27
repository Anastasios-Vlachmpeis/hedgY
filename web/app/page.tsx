import { PillNav } from "@/components/ui/pill-nav";
import { Hero } from "@/components/landing/hero";
import { Showcase } from "@/components/landing/showcase";
import { TrustBar } from "@/components/landing/trust-bar";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <PillNav />
      <main>
        <Hero />
        <Showcase />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
