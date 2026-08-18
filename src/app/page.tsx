import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Audience } from "@/components/audience";
import { Problem } from "@/components/problem";
import { AnalysisPillars } from "@/components/analysis-pillars";
import { BuyingPath } from "@/components/buying-path";
import { Ticket } from "@/components/ticket";
import { Method } from "@/components/method";
import { Positioning } from "@/components/positioning";
import { Diagnostic } from "@/components/diagnostic";
import { Faq } from "@/components/faq";
import { CtaSection } from "@/components/cta-section";
import { SiteFooter } from "@/components/site-footer";

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
        <Positioning />
        <Diagnostic />
        <Faq />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
