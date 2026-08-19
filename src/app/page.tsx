import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Audience } from "@/components/audience";
import { Problem } from "@/components/problem";
import { AnalysisPillars } from "@/components/analysis-pillars";
import { BuyingPath } from "@/components/buying-path";
import { Ticket } from "@/components/ticket";
import { Method } from "@/components/method";
import { ProductsHomeSection } from "@/components/products-home-section";
import { Positioning } from "@/components/positioning";
import { Diagnostic } from "@/components/diagnostic";
import { Faq } from "@/components/faq";
import { CtaSection } from "@/components/cta-section";
import { SiteFooter } from "@/components/site-footer";

// ProductsHomeSection reads the catalog from Supabase on every request (via
// the cookie-aware server client), which already opts this route out of
// static rendering — declared explicitly so that isn't a surprise later.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Audience />
        <Problem />
        <AnalysisPillars />
        <BuyingPath />
        <Ticket />
        <Method />
        <ProductsHomeSection />
        <Positioning />
        <Diagnostic />
        <Faq />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
