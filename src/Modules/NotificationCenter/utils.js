const ROLE_FOCUS_MODULES = {
  student: [
    "Complaint System",
    "Academic's Module",
    "Examination",
    "Scholarship Portal",
    "Leave Module",
  ],
  faculty: [
    "Complaint System",
    "Academic's Module",
    "Examination",
    "Office Module",
    "Research Procedures",
  ],
  staff: [
    "Complaint System",
    "File Tracking",
    "Office Module",
    "Leave Module",
    "Department Portal",
  ],
  caretaker: ["Complaint System", "File Tracking", "Office Module"],
  supervisor: ["Complaint System", "Office Module", "Department Portal"],
  convener: [
    "Complaint System",
    "Academic's Module",
    "Examination",
    "Office Module",
  ],
  admin: [
    "Complaint System",
    "Office Module",
    "File Tracking",
    "Leave Module",
    "Department Portal",
  ],
};

const MODULE_ROUTE_MAP = {
  "Complaint System": "/complaint",
  "Academic's Module": "/academics",
  "Academics Module": "/academics",
  Examination: "/examination",
  Profile: "/profile",
  Dashboard: "/dashboard",
  Home: "/dashboard",
  "Notification Centre": "/notifications",
};

export const parseNotificationData = (rawData) => {
  if (!rawData) {
    return {};
  }

  if (typeof rawData === "object") {
    return rawData;
  }

  if (typeof rawData !== "string") {
    return { raw: String(rawData) };
  }

  try {
    return JSON.parse(rawData);
  } catch (error) {
    try {
      return JSON.parse(rawData.replace(/'/g, '"'));
    } catch (parseError) {
      return { raw: rawData };
    }
  }
};

export const normalizeNotification = (item) => ({
  ...item,
  data: parseNotificationData(item?.data),
});

export const getRoleFeedLabel = (role = "") => {
  const normalizedRole = String(role).toLowerCase();
  if (normalizedRole.includes("caretaker")) return "Operations Feed";
  if (
    normalizedRole.includes("supervisor") ||
    normalizedRole.includes("convener") ||
    normalizedRole.includes("admin")
  )
    return "Review Feed";
  if (normalizedRole.includes("faculty")) return "Faculty Feed";
  if (normalizedRole.includes("staff")) return "Staff Feed";
  if (normalizedRole.includes("student")) return "Student Feed";
  return "Role Feed";
};

export const getRoleFocusModules = (role = "") => {
  const normalizedRole = String(role).toLowerCase();
  const roleKey = Object.keys(ROLE_FOCUS_MODULES).find((key) =>
    normalizedRole.includes(key),
  );
  return roleKey ? ROLE_FOCUS_MODULES[roleKey] : [];
};

export const getNotificationCategory = (notification, role = "") => {
  const moduleName =
    notification?.data?.module || notification?.data?.flag || "";
  if (String(notification?.data?.flag).toLowerCase() === "announcement") {
    return "announcements";
  }

  if (moduleName === "Complaint System") {
    return "complaints";
  }

  const roleModules = getRoleFocusModules(role);
  if (roleModules.includes(moduleName)) {
    return "role";
  }

  return "all";
};

export const resolveNotificationRoute = (notification) => {
  const moduleName = notification?.data?.module || "";
  return MODULE_ROUTE_MAP[moduleName] || null;
};

export const formatNotificationTimestamp = (timestamp) => {
  if (!timestamp) {
    return "Unknown time";
  }

  return new Date(timestamp).toLocaleString();
};
