// Club names and categories
export const CLUB_NAMES = [
  "BitByte",
  "AFC",
  "Jazbaat",
  "Aavartan",
  "Badminton Club",
  "Volleyball Club",
];

export const CLUB_CATEGORIES = {
  TECHNICAL: "Technical",
  SPORTS: "Sports",
  CULTURAL: "Cultural",
};

// Venues
export const VENUES = {
  CLASSROOMS: [
    "CR101",
    "CR102",
    "CR103",
    "CR104",
    "CR107",
    "CR108",
    "CR109",
    "CR201",
    "CR202",
    "CR208",
  ],
  LECTURE_HALLS: [
    "L101",
    "L102",
    "L103",
    "L104",
    "L105",
    "L106",
    "L107",
    "L108",
    "L201",
    "L202",
    "L206",
    "L207",
  ],
  GROUNDS: [
    "Football Ground",
    "Cricket Ground",
    "Basketball Ground",
    "Volleyball Ground",
    "Athletics Ground",
  ],
  COURTS: [
    "Tennis Court",
    "Badminton Court",
    "Table Tennis Court",
    "Chess Room",
    "Carrom Room",
  ],
  OTHER: ["Gym", "CC First Floor", "CC Second Floor", "CC Third Floor", "OAT"],
};

// Status choices
export const STATUS = {
  OPEN: "open",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
  ACCEPT: "accept",
  COORDINATOR: "coordinator",
  FIC: "fic",
  COUNSELLOR: "counsellor",
  DEAN: "dean",
  REREVIEW: "rereview",
};

// User roles
export const USER_ROLES = {
  COORDINATOR: "co-ordinator",
  FIC: "FIC",
  DEAN: "Dean_s",
  TECH_COUNSELLOR: "Tech_Counsellor",
  SPORTS_COUNSELLOR: "Sports_Counsellor",
  CULTURAL_COUNSELLOR: "Cultural_Counsellor",
  STUDENT: "student",
};

// Counsellor club mapping
export const COUNSELLOR_CLUB_MAP = {
  Tech_Counsellor: ["BitByte", "AFC"],
  Cultural_Counsellor: ["Jazbaat", "Aavartan"],
  Sports_Counsellor: ["Badminton Club", "Volleyball Club"],
};
