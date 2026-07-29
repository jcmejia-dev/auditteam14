import { AboutSection } from "@/components/public/about-section";
import { ContactSection } from "@/components/public/contact-section";
import { Hero } from "@/components/public/hero";
import { JurisdictionSection } from "@/components/public/jurisdiction-section";
import { LeadershipSection } from "@/components/public/leadership-section";
import { LatestAnnouncementsSection } from "@/components/public/latest-announcements-section";
import { MediaSection } from "@/components/public/media-section";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { ValuesSection } from "@/components/public/values-section";
import { VisionMissionSection } from "@/components/public/vision-mission-section";

export const revalidate = 300;

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content">
        <Hero />
        <LatestAnnouncementsSection />
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
