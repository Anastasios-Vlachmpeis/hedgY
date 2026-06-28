import { HeroLanding } from "@/components/hero/hero-landing";
import { ProductExplainer } from "@/components/landing/product-explainer";
import { Features } from "@/components/landing/features";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroLanding />
      <main>
        <ProductExplainer />
        <Features />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
