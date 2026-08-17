export const FPS_BASE = "/facultyprofessionalprofile";

const FPS_ROLES = ["Professor", "Assistant Professor"];

// Of the 65 eis endpoints these pages call, only /eis/api/profile/ exists, so
// every form saves nowhere and every table loads empty. The pages and their
// components are kept intact; flip this to true once the API is there and the
// whole module returns to the sidebar and routing.
export const FPS_BACKEND_READY = false;

const FPS_ALL_PAGES = [
  {
    key: "publications",
    slug: "publications",
    title: "Publications",
    icon: "Newspaper",
    group: "Research Output",
    roles: FPS_ROLES,
  },
  {
    key: "projects",
    slug: "projects",
    title: "Projects",
    icon: "Graph",
    group: "Research Output",
    roles: FPS_ROLES,
  },
  {
    key: "thesisSupervision",
    slug: "thesis-supervision",
    title: "Thesis Supervision",
    icon: "UserFocus",
    group: "Research Output",
    roles: FPS_ROLES,
  },
  {
    key: "conference",
    slug: "conference",
    title: "Conference / Symposium",
    icon: "Microscope",
    group: "Research Output",
    roles: FPS_ROLES,
  },
  {
    key: "others",
    slug: "others",
    title: "Others",
    icon: "DotsThree",
    group: "Research Output",
    roles: FPS_ROLES,
  },

  {
    key: "events",
    slug: "events",
    title: "Events Organised",
    icon: "Megaphone",
    group: "Activities",
    roles: FPS_ROLES,
  },
  {
    key: "visits",
    slug: "visits",
    title: "Visits",
    icon: "AirplaneTakeoff",
    group: "Activities",
    roles: FPS_ROLES,
  },

  {
    key: "myProfile",
    slug: "my-profile",
    title: "My Profile",
    icon: "IdentificationBadge",
    group: "Personal",
    roles: FPS_ROLES,
  },
  {
    key: "aboutMe",
    slug: "about-me",
    title: "About Me",
    icon: "UserCircle",
    group: "Personal",
    roles: FPS_ROLES,
  },
  {
    key: "qualifications",
    slug: "qualifications",
    title: "Qualifications",
    icon: "GraduationCap",
    group: "Personal",
    roles: FPS_ROLES,
  },
  {
    key: "honors",
    slug: "honors",
    title: "Honors",
    icon: "Medal",
    group: "Personal",
    roles: FPS_ROLES,
  },
  {
    key: "professionalExperience",
    slug: "professional-experience",
    title: "Professional Experience",
    icon: "Briefcase",
    group: "Personal",
    roles: FPS_ROLES,
  },
  {
    key: "administrativePosition",
    slug: "administrative-position",
    title: "Administrative Position",
    icon: "Gavel",
    group: "Personal",
    roles: FPS_ROLES,
  },
];

export const FPS_PAGES = FPS_BACKEND_READY ? FPS_ALL_PAGES : [];
