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
    title: "Audit Team 14 at a glance",
    introduction:
      "Audit Team 14 serves under the Commission on Audit – BARMM, Audit Group C – Maguindanao. This portal provides public access to the team’s institutional information, activities, and approved updates.",
    organization: [
      {
        label: "Commission",
        value: "Commission on Audit – BARMM",
      },
      {
        label: "Audit group",
        value: "Audit Group C – Maguindanao",
      },
      {
        label: "Audit team",
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
        value: "Public-sector auditing and accountability",
      },
    ],
  },
  vision: {
    title: "Vision",
    text: "A trustworthy, respected and independent audit institution that is an enabling partner of government in ensuring a better life for every Filipino.",
  },
  mission: {
    title: "Mission",
    text: "To ensure accountability for public resources, promote transparency, and help improve government operations, in partnership with stakeholders, for the benefit of the Filipino people.",
  },
  values: [
    {
      title: "God Centeredness",
    },
    {
      title: "Patriotism",
    },
    {
      title: "Excellence",
    },
    {
      title: "Integrity",
    },
    {
      title: "Professionalism",
    },
    {
      title: "Courtesy, Modesty and Humility",
    },
    {
      title: "Reverence for Truth and the Rule of Law",
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
