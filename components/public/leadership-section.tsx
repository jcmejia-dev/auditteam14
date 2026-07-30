import Image from "next/image";

import { siteContent } from "@/data/site-content";
import { getPublishedTeamMembers } from "@/lib/team/data";
import { getTeamMemberInitials } from "@/lib/team/types";

import { SectionHeading } from "./section-heading";

function LeadershipFallback() {
  return (
    <section id="leadership" className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="page-shell grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div
          aria-hidden="true"
          className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden bg-navy-900"
        >
          <Image
            src="/logo2.png"
            alt="Bernard R. Sero, Audit Team Leader"
            fill
            sizes="(min-width: 1024px) 384px, (min-width: 640px) 384px, calc(100vw - 3rem)"
            className="object-cover object-[center_42%]"
          />
          <div className="absolute inset-5 border border-gold-500/55" />
          <div className="absolute inset-x-0 bottom-0 bg-navy-950/80 px-6 py-5 text-center text-xs font-bold uppercase tracking-[0.2em] text-gold-200">
            Audit Team 14
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="Leadership"
            title="Service with clear responsibility"
          />
          <div className="mt-10 border-t border-navy-900/15 pt-8">
            <p className="font-display text-3xl font-bold text-navy-900 sm:text-4xl">
              {siteContent.leadership.name}
            </p>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
              {siteContent.leadership.role}
            </p>
            <p className="mt-6 max-w-xl text-lg leading-8 text-ink">
              {siteContent.leadership.description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export async function LeadershipSection() {
  const teamMembers = await getPublishedTeamMembers();

  if (teamMembers.length === 0) {
    return <LeadershipFallback />;
  }

  return (
    <section id="leadership" className="bg-cream py-16 sm:py-20 lg:py-24">
      <div className="page-shell">
        <div className="max-w-3xl">
          <SectionHeading
            eyebrow="Leadership and team"
            title="Meet the people serving Audit Team 14"
          />
          <p className="mt-5 text-lg leading-8 text-ink">
            Approved public information about the team’s leadership and
            personnel.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <article
              key={member.slug}
              className="overflow-hidden border border-navy-900/10 bg-white shadow-[0_14px_35px_rgba(16,42,67,0.07)]"
            >
              <div className="relative grid aspect-[4/3] place-items-center overflow-hidden bg-navy-900">
                {member.photoPath ? (
                  <Image
                    src={member.photoPath}
                    alt={`${member.name}, ${member.positionTitle}`}
                    fill
                    sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, calc(100vw - 3rem)"
                    className="object-cover object-[center_42%]"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="font-display text-6xl font-bold tracking-wide text-gold-200"
                  >
                    {getTeamMemberInitials(member.name)}
                  </span>
                )}
                <div
                  aria-hidden="true"
                  className="absolute inset-5 border border-gold-500/45"
                />
              </div>
              <div className="p-6 sm:p-7">
                <h3 className="font-display text-2xl font-bold leading-tight text-navy-900">
                  {member.name}
                </h3>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
                  {member.positionTitle}
                </p>
                {member.biography ? (
                  <p className="mt-5 whitespace-pre-wrap leading-7 text-ink">
                    {member.biography}
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
