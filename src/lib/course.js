export function courseLabel(course) {
  return [course?.code, course?.name].filter(Boolean).join(" — ");
}
