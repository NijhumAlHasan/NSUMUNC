export type NavSubItem = {
  id?: string;
  label: string;
  href: string;
  is_active?: boolean;
};

export type NavItem = {
  id: string;
  label: string;
  href?: string;
  is_active?: boolean;
  children?: NavSubItem[];
};

export const defaultNavItems: NavItem[] = [
  { id: "home", label: "Home", href: "/", is_active: true },
  { id: "about", label: "About", href: "/about", is_active: true },
  {
    id: "events",
    label: "Events",
    href: "/events",
    is_active: true,
    children: [
      { label: "All Events & Conferences", href: "/events", is_active: true },
      { label: "Member Development (MDPs)", href: "/mdps", is_active: true },
      { label: "Delegate Registration", href: "/registration", is_active: true },
      { label: "NSUIMUN 2022", href: "/events#nsuimun", is_active: true },
      { label: "Eastern MUN 2026", href: "/events#emun", is_active: true },
    ],
  },
  { id: "faculty-advisor", label: "Faculty Advisor", href: "/faculty-advisor", is_active: true },
  {
    id: "team",
    label: "Team",
    href: "/team",
    is_active: true,
    children: [
      { label: "Secretariat & Team", href: "/team", is_active: true },
      { label: "Executive Body", href: "/executive-body", is_active: true },
      { label: "Sub-Executive Body", href: "/sub-executive-body", is_active: true },
      { label: "Legacy (Past Panels)", href: "/legacy", is_active: true },
    ],
  },
  { id: "gallery", label: "Gallery", href: "/gallery", is_active: true },
  { id: "contact", label: "Contact", href: "/contact", is_active: true },
];
