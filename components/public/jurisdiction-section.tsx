import { JurisdictionExplorer } from "@/components/public/jurisdiction-explorer";
import { SectionHeading } from "@/components/public/section-heading";
import { jurisdictionLocations } from "@/data/jurisdictions";
import { getPublicJurisdictionSource } from "@/lib/jurisdictions/data";

export async function JurisdictionSection() {
  const publicSource = await getPublicJurisdictionSource();
  const locations = publicSource.useFallback
    ? jurisdictionLocations
    : publicSource.locations;

  return (
    <section
      id="jurisdiction"
      className="jurisdiction-field bg-cream py-16 sm:py-20 lg:py-24"
    >
      <div className="page-shell relative z-10">
        <SectionHeading
          eyebrow="Audit jurisdiction"
          title="Interactive jurisdiction explorer"
          description="Search and explore published jurisdiction locations by institution, category, or general location."
        />
        <JurisdictionExplorer locations={locations} />
      </div>
    </section>
  );
}
