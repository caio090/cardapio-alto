import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { ServicesMenu } from "@/components/services-menu";
import { Method } from "@/components/method";
import { Positioning } from "@/components/positioning";
import { CtaSection } from "@/components/cta-section";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <ServicesMenu />
        <Method />
        <Positioning />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  );
}
