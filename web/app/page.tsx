import { HeroLanding } from "@/components/hero/hero-landing";
import { ProductExplainer } from "@/components/landing/product-explainer";
import { Showcase } from "@/components/landing/showcase";
import { TrustBar } from "@/components/landing/trust-bar";
import { Features } from "@/components/landing/features";
import { Testimonials } from "@/components/landing/testimonials";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroLanding />
      <main>
        <ProductExplainer />
        <Showcase />
        <TrustBar />
        <Features />
        <Testimonials />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
