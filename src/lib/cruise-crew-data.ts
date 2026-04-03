export interface CrewMember {
  name: string;
  slug: string;
  photos: string[];
}

export const CREW: CrewMember[] = [
  { name: "Adam",    slug: "adam",    photos: ["/crew/adam.png"] },
  { name: "Alex",    slug: "alex",    photos: ["/crew/alex.png"] },
  { name: "Ansel",   slug: "ansel",   photos: ["/crew/ansel.png"] },
  { name: "Ben",     slug: "ben",     photos: ["/crew/ben.png"] },
  { name: "Clinton", slug: "clinton", photos: ["/crew/clinton.png"] },
  { name: "Elliot",  slug: "elliot",  photos: ["/crew/elliot.png"] },
  { name: "Eric",    slug: "eric",    photos: ["/crew/eric.png"] },
  { name: "Jeff",    slug: "jeff",    photos: ["/crew/jeff.png"] },
  { name: "Sam",     slug: "sam",     photos: ["/crew/sam.png"] },
  { name: "Will",    slug: "will",    photos: ["/crew/will.png"] },
];
