export type FacultyAdvisorData = {
  name: string;
  title: string;
  designation: string;
  department: string;
  office: string;
  email: string;
  image: string;
  quote: string;
  message: string[];
  milestones?: { year: string; label: string; text: string }[];
  pastAdvisors?: { name: string; role: string; dept: string }[];
};

export const defaultFacultyAdvisor: FacultyAdvisorData = {
  name: "Dr. Rizwan Khair",
  title: "Faculty Advisor",
  designation: "Associate Professor & Senior Academic Fellow",
  department: "Department of Political Science & Sociology, North South University",
  office: "SAC942, South Academic Building, NSU",
  email: "faculty.advisor@nsu.edu",
  image: "/faculty-advisor.jpg",
  quote:
    "Diplomacy is not merely debating across committee rooms; it is the art of listening deeply, recognizing shared humanity, and crafting durable solutions for an interdependent world.",
  message: [
    "Welcome to the North South University Model United Nations Club (NSUMUNC). Since its founding in 2012, this club has stood as an intellectual crucible where students step beyond textbooks to grapple with the most pressing crises confronting our global community.",
    "In an era marked by rapid geopolitical realignments, climate disruptions, and multilateral challenges, the capacity to negotiate respectfully, think critically, and articulate evidence-based solutions is an indispensable virtue. At NSUMUNC, our students cultivate not only sharp oratorical acumen but also deep empathetic leadership.",
    "Whether you are preparing for your first committee session or representing North South University at an international delegation, remember that true diplomacy seeks consensus over conquest. I warmly invite every curious student to join this transformative journey.",
  ],
  milestones: [
    { year: "2012", label: "Club Inception", text: "Approved by NSU Student Affairs, establishing the first collegiate MUN body at NSU." },
    { year: "2014", label: "Inaugural NSUIMUN", text: "Launched the flagship Bangladesh International Model UN Conference." },
    { year: "2018", label: "Global Delegations", text: "Secured Best Delegation awards across Singapore, India, and Malaysia." },
    { year: "2026", label: "Eastern MUN Triumph", text: "Won Best Delegation and multiple individual awards at Eastern Model UN 2026." },
  ],
  pastAdvisors: [
    {
      name: "Dr. Sk. Tawfique M. Haque",
      role: "Faculty Advisor (2018–2023)",
      dept: "Professor & Director, South Asian Institute of Policy and Governance (SIPG)",
    },
    {
      name: "Dr. Abdur Rob Khan",
      role: "Founding Advisor (2012–2018)",
      dept: "Former Dean, School of Humanities & Social Sciences, NSU",
    },
  ],
};
