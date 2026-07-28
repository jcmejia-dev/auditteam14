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
    { label: "About", href: "#about" },
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
  about: {
    eyebrow: "About Audit Team 14",
    title: "Public service grounded in accountability.",
    introduction:
      "Audit Team 14 serves under the Commission on Audit – BARMM, Audit Group C – Maguindanao. This portal provides public access to the team’s institutional information, activities, and approved updates.",
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
      description: "Acting with honesty and sound judgment.",
    },
    {
      title: "Professionalism",
      description: "Serving with competence and discipline.",
    },
    {
      title: "Accountability",
      description: "Taking responsibility for public trust.",
    },
    {
      title: "Teamwork",
      description: "Working together with shared purpose.",
    },
    {
      title: "Excellence",
      description: "Pursuing quality in every responsibility.",
    },
  ] as const,
  leadership: {
    name: "Bernard R. Sero, DHum, MBA",
    role: "Audit Team Leader",
    description:
      "Leading Audit Team 14 within Audit Group C – Maguindanao.",
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
    mapUrl:
      "https://maps.google.com/?q=COA+BARMM+Regional+Office+Cotabato+City",
  },
} as const;
