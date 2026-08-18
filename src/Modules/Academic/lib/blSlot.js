export const isBlSlot = (slot) => Array.isArray(slot?.sourceCourses);

export function sourceOf(slot) {
  if (!isBlSlot(slot)) return null;
  return (
    slot.sourceCourses.find(
      (c) => String(c.id) === String(slot.selectedSource),
    ) || null
  );
}

export function blSlotReady(slot) {
  const source = sourceOf(slot);
  if (!source) return false;
  return source.replaceable ? !!slot.selectedCourse : true;
}

export function slotReady(slot) {
  return isBlSlot(slot) ? blSlotReady(slot) : !!slot?.selectedCourse;
}

// A replaceable source is cleared by the chosen stand-in; anything else is
// cleared by retaking the course itself.
export function courseRequestBody(slot) {
  const source = sourceOf(slot);
  if (!source) {
    return { slot_id: slot.id, course_id: Number(slot.selectedCourse) };
  }
  return {
    slot_id: slot.id,
    source_course_id: source.id,
    course_id: source.replaceable ? Number(slot.selectedCourse) : source.id,
  };
}

export function takenCourseIds(slots) {
  const taken = new Set();
  (slots ?? []).forEach((slot) => {
    if (slot?.selectedSource) taken.add(String(slot.selectedSource));
    if (slot?.selectedCourse) taken.add(String(slot.selectedCourse));
  });
  return taken;
}

// picked anywhere means gone everywhere, except the field already holding it
export function offerableCourses(courses, taken, currentValue) {
  const keep = String(currentValue ?? "");
  return (courses ?? []).filter((course) => {
    const id = String(course.id);
    return id === keep || !taken.has(id);
  });
}

const slotOrderKey = (name) => {
  const match = String(name ?? "").match(/^(\D*)(\d*)/);
  return [(match?.[1] ?? "").trim().toUpperCase(), Number(match?.[2] || 0)];
};

export function compareSlots(a, b) {
  const [aPrefix, aNumber] = slotOrderKey(a?.name);
  const [bPrefix, bNumber] = slotOrderKey(b?.name);
  if (aPrefix !== bPrefix) return aPrefix < bPrefix ? -1 : 1;
  if (aNumber !== bNumber) return aNumber - bNumber;
  return String(a?.name ?? "").localeCompare(String(b?.name ?? ""));
}

export function sortSlots(slots) {
  return [...(slots ?? [])].sort(compareSlots);
}
