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

// The course a slot will actually register, which for a retake is the source
// itself and so is not in the slot's own list.
export function registeredCourse(slot) {
  const source = sourceOf(slot);
  if (source && !source.replaceable) return source;
  const chosen = (slot?.courses ?? []).find(
    (c) => String(c.id) === String(slot?.selectedCourse),
  );
  if (chosen) return chosen;
  if (source && String(source.id) === String(slot?.selectedCourse))
    return source;
  return null;
}

// What a BL registration is doing to the course it clears.
export function sourceNote(courseCode, sourceCode, registrationType) {
  if (!sourceCode) return "";
  const what =
    String(courseCode) === String(sourceCode)
      ? "Retake"
      : `Replaces ${sourceCode}`;
  return registrationType ? `${what} \u00b7 ${registrationType}` : what;
}

export function takenCourseIds(slots) {
  const taken = new Set();
  (slots ?? []).forEach((slot) => {
    if (slot?.selectedSource) taken.add(String(slot.selectedSource));
    if (slot?.selectedCourse) taken.add(String(slot.selectedCourse));
  });
  return taken;
}

// picked anywhere means gone everywhere, except the values this field may keep
export function offerableCourses(courses, taken, keepValues) {
  const keep = new Set(
    (Array.isArray(keepValues) ? keepValues : [keepValues])
      .filter(Boolean)
      .map(String),
  );
  return (courses ?? []).filter((course) => {
    const id = String(course.id);
    return keep.has(id) || !taken.has(id);
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
