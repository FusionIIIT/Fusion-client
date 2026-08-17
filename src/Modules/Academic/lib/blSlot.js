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
