export interface EditorialStep {
  slug: string;
  title: string;
  role: string;
  connection: string;
  source: string;
}
// Explicit editorial relationships, separate from automatic article associations.
export const afrobeatThread: EditorialStep[] = [
  {
    slug: "Fela_Kuti",
    title: "Fela Kuti",
    role: "The musician",
    connection:
      "Musician, bandleader and political activist. A starting point for this thread.",
    source: "https://en.wikipedia.org/wiki/Fela_Kuti",
  },
  {
    slug: "Tony_Allen_(musician)",
    title: "Tony Allen",
    role: "The collaborator",
    connection:
      "Allen was the drummer and musical director in Fela’s Africa ’70.",
    source: "https://en.wikipedia.org/wiki/Tony_Allen_(musician)",
  },
  {
    slug: "Afrobeat",
    title: "Afrobeat",
    role: "The genre",
    connection:
      "Kuti and Allen helped develop Afrobeat, connecting the two musicians through their sound.",
    source: "https://en.wikipedia.org/wiki/Afrobeat",
  },
];
export const leadSubject = {
  slug: "Fela_Kuti",
  title: "Fela Kuti",
  introduction:
    "Musician, bandleader, activist. Start with Fela Kuti, then follow the people and sounds connected to his story.",
  source: "https://en.wikipedia.org/wiki/Fela_Kuti",
};
export function isInAfrobeatThread(slug: string) {
  const normalized = slug.replace(/\s+/g, "_").toLowerCase();
  return afrobeatThread.some((step) => step.slug.toLowerCase() === normalized);
}
