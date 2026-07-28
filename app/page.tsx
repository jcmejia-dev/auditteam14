import { AboutSection } from "@/components/public/about-section";
import { ContactSection } from "@/components/public/contact-section";
import { Hero } from "@/components/public/hero";
import { JurisdictionSection } from "@/components/public/jurisdiction-section";
import { LeadershipSection } from "@/components/public/leadership-section";
import { MediaSection } from "@/components/public/media-section";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { ValuesSection } from "@/components/public/values-section";
import { VisionMissionSection } from "@/components/public/vision-mission-section";

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only z-[100] rounded-sm bg-white px-4 py-3 font-semibold text-navy-900 shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <AboutSection />
        <VisionMissionSection />
        <JurisdictionSection />
        <ValuesSection />
        <LeadershipSection />
        <MediaSection />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
