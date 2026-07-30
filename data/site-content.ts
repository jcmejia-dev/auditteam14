export type NavigationItem = {
  label: string;
  href: `#${string}`;
};

export type InformationItem = {
  title: string;
  description: string;
};

export type MediaCategory = {
  title: "Activities" | "Photos" | "Videos";
  description: string;
};

export const siteContent = {
  identity: {
    organization: "Commission on Audit – BARMM",
    group: "Audit Group C – Maguindanao",
    team: "Audit Team 14",
    tagline:
      "Upholding public accountability with integrity, competence, and organizational excellence.",
  },
  navigation: [
    { label: "Home", href: "#home" },
    { label: "Institutional", href: "#institutional-information" },
    { label: "Mandate", href: "#mandate" },
    { label: "Jurisdiction", href: "#jurisdiction" },
    { label: "Leadership", href: "#leadership" },
    { label: "Media", href: "#media" },
    { label: "Contact", href: "#contact" },
  ] satisfies NavigationItem[],
  quickInformation: [
    {
      title: "Public accountability",
      description: "Supporting trust in public service.",
    },
    {
      title: "Professional service",
      description: "Guided by competence and responsibility.",
    },
    {
      title: "Integrity and excellence",
      description: "Standards that shape our work.",
    },
  ] satisfies InformationItem[],
  institutional: {
    eyebrow: "Institutional information",
    title: "Information",
    introduction:
      "Organizational details, regional coverage, and the core values guiding Audit Team 14’s public service.",
    organization: [
      {
        label: "Region",
        value: "COA – BARMM",
      },
      {
        label: "Regional Director",
        value: "RD Atty. Omar S. Roque",
      },
      {
        label: "Assistant Regional Director",
        value: "ARD Wilson Ibrahim L. Panawidan, CPA",
      },
      {
        label: "Audit Group",
        value: "Audit Group C – Maguindanao",
      },
      {
        label: "Supervising Auditor",
        value: "Atty. Rosario D. Santos, CPA",
      },
      {
        label: "Team",
        value: "Audit Team 14",
      },
      {
        label: "Team Leader",
        value: "Bernard R. Sero, DHum, MBA",
      },
    ],
    coverage: [
      {
        label: "Region",
        value:
          "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)",
      },
      {
        label: "Primary location",
        value: "Cotabato City",
      },
      {
        label: "Focus",
        value: "Public sector auditing and accountability",
      },
      {
        label: "Scope",
        value: "Comprehensive audit services",
      },
      {
        label: "Standards",
        value: "International audit standards",
      },
      {
        label: "Commitment",
        value: "Transparency and accountability",
      },
    ],
  },
  vision: {
    title: "Vision",
    text: "A credible, trustworthy and independent Supreme Audit Institution; a vibrant partner in nation-building; a bulwark of integrity and competence; an organization of professionals with a culture of excellence; a respected member of international organizations of Supreme Audit Institutions.",
  },
  mission: {
    title: "Mission",
    text: "To carry out our constitutional mandate with the highest degree of professionalism, competence, integrity, teamwork and organizational efficiency, and promote the people's trust in government by upholding public accountability.",
  },
  values: [
    {
      title: "Integrity",
      description: "Upholding the highest ethical standards in all audit activities.",
    },
    {
      title: "Professionalism",
      description: "Excellence in audit practices and continuous improvement.",
    },
    {
      title: "Accountability",
      description: "Ensuring public trust through transparent governance.",
    },
    {
      title: "Teamwork",
      description: "A collaborative approach to achieving audit objectives.",
    },
    {
      title: "Innovation",
      description: "Embracing modern audit methodologies and technologies.",
    },
    {
      title: "Excellence",
      description: "Commitment to quality service and best practices.",
    },
  ] as const,
  leadership: {
    name: "Bernard R. Sero, DHum, MBA",
    role: "Audit Team Leader",
    facebookUrl: "https://www.facebook.com/brsero13",
    biography: [
      "Bernard R. Sero brings extensive experience in public sector auditing and financial management to his role as Audit Team Leader for Team 14. With dual qualifications in Humanities and Business Administration, he combines analytical rigor with a deep understanding of organizational dynamics in the BARMM context.",
      "Under his leadership, Audit Team 14 has consistently delivered comprehensive audit reports that promote transparency and accountability in Maguindanao’s public institutions, ensuring that government resources are utilized efficiently for the benefit of the Bangsamoro people.",
      "His expertise encompasses financial auditing, compliance reviews, and performance evaluation of government agencies within the BARMM region. With a commitment to professional development and capacity building, Bernard ensures that Team 14 remains at the forefront of audit innovation and best practices.",
    ],
  },
  media: [
    {
      title: "Activities",
      description: "Official updates and public-facing team activities.",
    },
    {
      title: "Photos",
      description: "Reviewed photographs from approved public activities.",
    },
    {
      title: "Videos",
      description: "Approved video materials and institutional features.",
    },
  ] satisfies MediaCategory[],
  contact: {
    title: "Contact and office information",
    organization: "COA–BARMM Regional Office",
    group: "Audit Group C – Maguindanao",
    city: "Cotabato City",
    address: "RC Cotabato City – South, District 3870",
    clubFacebookUrl:
      "https://www.facebook.com/people/Rotary-Club-of-Cotabato-City-South/100064269356393/?rdid=GAM2mLRsHsrrhtN7&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1G8V6wDVEs%2F",
    mapUrl:
      "https://maps.google.com/?q=COA+BARMM+Regional+Office+Cotabato+City",
  },
  footer: {
    description:
      "Commission on Audit – Bangsamoro Autonomous Region in Muslim Mindanao. Audit Group C – Maguindanao, Team 14 is dedicated to ensuring fiscal responsibility and transparency in public sector operations through professional audit services.",
    copyright:
      "© 2026 Commission on Audit – BARMM. Audit Team 14. All rights reserved.",
  },
} as const;
