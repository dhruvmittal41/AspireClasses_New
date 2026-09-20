export const site = {
  name: "Aspire Classes",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  email: "aspireclasses51@gmail.com",
  description:
    "Prepare for AMU Class 9 and Class 11 entrance exams with focused practice tests, timed mock exams, and clear performance insights.",
};
export const starterExams = [
  {
    id: "amu-9",
    slug: "amu-class-9",
    name: "AMU Class 9",
    description:
      "Build a strong foundation for your next big step. Practise core concepts, improve your speed, and approach the entrance exam with confidence.",
    subjects: ["Mathematics", "Science", "Languages", "General knowledge"],
    status: "active" as const,
  },
  {
    id: "amu-11",
    slug: "amu-class-11",
    name: "AMU Class 11",
    description:
      "Turn your preparation into progress with focused practice for the AMU Class 11 entrance. Find your gaps and make every revision count.",
    subjects: ["Mathematics", "Science", "English", "General knowledge"],
    status: "active" as const,
  },
  {
    id: "jmi",
    slug: "jmi-entrance",
    name: "JMI Entrance",
    description:
      "A new destination for your ambitions. Dedicated practice for Jamia Millia Islamia entrance exams is on the way.",
    subjects: ["Coming soon"],
    status: "coming_soon" as const,
  },
  {
    id: "navodaya",
    slug: "navodaya-entrance",
    name: "Navodaya Entrance",
    description:
      "More opportunities, one place to prepare. Navodaya entrance practice is planned for our growing exam collection.",
    subjects: ["Coming soon"],
    status: "coming_soon" as const,
  },
];
export function safeNext(value: string | null) {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\u0000-\u0020]/.test(value)
  )
    return "/dashboard";
  try {
    const parsed = new URL(value, "https://aspire.invalid");
    return parsed.origin === "https://aspire.invalid"
      ? parsed.pathname + parsed.search + parsed.hash
      : "/dashboard";
  } catch {
    return "/dashboard";
  }
}
