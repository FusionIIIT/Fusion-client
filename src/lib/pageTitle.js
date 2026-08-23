export const APP_NAME = "Fusion";
export const INSTITUTE = "PDPM IIITDM Jabalpur";

export function pageTitle(title) {
  const name = typeof title === "string" ? title.trim() : "";
  return name ? `${name} · ${APP_NAME}` : `${APP_NAME} · ${INSTITUTE}`;
}
