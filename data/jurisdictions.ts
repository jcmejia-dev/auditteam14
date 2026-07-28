export type JurisdictionCategory = "hospital" | "office";

export type JurisdictionLocation = {
  id: string;
  name: string;
  abbreviation: string;
  latitude: number;
  longitude: number;
  location: string;
  category: JurisdictionCategory;
};

export const jurisdictionLocations: readonly JurisdictionLocation[] = [
  {
    id: "bdh",
    name: "Buluan District Hospital",
    abbreviation: "BDH",
    latitude: 6.7167,
    longitude: 124.8,
    location: "Buluan Municipality, Maguindanao del Sur",
    category: "hospital",
  },
  {
    id: "dbtsdh",
    name: "Datu Blah T. Sinsuat District Hospital",
    abbreviation: "DBTSDH",
    latitude: 7.0333,
    longitude: 124.1667,
    location: "Nuro, Upi Municipality, Maguindanao del Norte",
    category: "hospital",
  },
  {
    id: "dosdh",
    name: "Datu Odin Sinsuat District Hospital",
    abbreviation: "DOSDH",
    latitude: 7.05,
    longitude: 124.3,
    location: "Datu Odin Municipality, Maguindanao del Norte",
    category: "hospital",
  },
  {
    id: "sumh",
    name: "South Upi Municipal Hospital",
    abbreviation: "SUMH",
    latitude: 6.8333,
    longitude: 124.1333,
    location: "South Upi Municipality, Maguindanao del Sur",
    category: "hospital",
  },
  {
    id: "ipho-maguindanao",
    name: "IPHO – Maguindanao",
    abbreviation: "IPHO",
    latitude: 7.2167,
    longitude: 124.2472,
    location: "Cotabato City",
    category: "office",
  },
  {
    id: "brhmc",
    name: "Bangsamoro Regional Hospital and Medical Center",
    abbreviation: "BRHMC",
    latitude: 7.2,
    longitude: 124.25,
    location: "Datu Hoffer Municipality, Maguindanao del Sur",
    category: "hospital",
  },
] as const;

export function getDirectionsUrl(location: JurisdictionLocation) {
  const destination = `${location.latitude},${location.longitude}`;

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
