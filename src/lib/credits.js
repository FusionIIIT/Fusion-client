const NON_EARNING_GRADES = ["F", "I", "X", "AU", "CD", "—"];

const isSwayamCode = (code) =>
  String(code || "")
    .toUpperCase()
    .startsWith("SW");

export const isEarningGrade = (grade) =>
  Boolean(grade) && !NON_EARNING_GRADES.includes(grade);

export const fmtCredits = (n) => (n % 1 === 0 ? String(n) : n.toFixed(1));

const bucketFor = (course) => {
  if (isSwayamCode(course.code)) return "swayam";
  const remark = course.remark || "Regular";
  return remark === "Backlog" || remark === "Improvement"
    ? "backlogImp"
    : "regular";
};

// Same order the backend grades on, so a retaken course credits the degree at
// the attempt it was best graded in.
const GRADE_POINTS = {
  O: 1.0,
  "A+": 1.0,
  A: 0.9,
  "B+": 0.8,
  B: 0.7,
  "C+": 0.6,
  C: 0.5,
  "D+": 0.4,
  D: 0.3,
  F: 0.2,
  S: 0.0,
};

const gradePoints = (grade) => {
  const key = String(grade || "").trim();
  if (key in GRADE_POINTS) return GRADE_POINTS[key];
  const numeric = Number(key);
  return Number.isFinite(numeric) ? numeric / 10 : -1;
};

export function computeCreditSummary(semesters = []) {
  const graded = semesters.filter((s) => !s.is_registered_only);

  const totals = { earned: 0, regular: 0, backlogImp: 0, swayam: 0 };
  // code -> the best-graded attempt's credits, so a retake counts once at the
  // credit it carried when it was cleared.
  const credited = new Map();

  const rows = graded.map((sem) => {
    const row = { earned: 0, regular: 0, backlogImp: 0, swayam: 0 };

    (sem.courses || []).forEach((c) => {
      if (!isEarningGrade(c.grade)) return;

      const credits = Number(c.credits) || 0;
      const bucket = bucketFor(c);

      // Each semester stands on its own: a course graded in it counts there,
      // so an improvement shows up under Backlog / Improvement.
      row.earned += credits;
      row[bucket] += credits;

      // Regular / Backlog / Swayam total down their own column, attempt by attempt.
      totals[bucket] += credits;

      // Credits Earned is the degree figure: a course once, at its best-graded
      // attempt, and a replaced one never.
      const key = String(c.code || "").toUpperCase();
      if (c.superseded) return;
      const kept = credited.get(key);
      if (!kept || gradePoints(c.grade) > gradePoints(kept.grade)) {
        credited.set(key, { grade: c.grade, credits });
      }
    });

    return { label: sem.label, ...row };
  });

  totals.earned = [...credited.values()].reduce((sum, c) => sum + c.credits, 0);

  return { rows, totals };
}

export const SWAYAM_CREDIT_CAP = 6;
export const DEGREE_CREDIT_REQUIREMENT = 148;

// Swayam credits beyond the cap do not count towards the degree; up to the cap
// they count like any other credit.
export const swayamAboveCap = (totals) =>
  Math.max(0, totals.swayam - SWAYAM_CREDIT_CAP);

export const creditsTowardsDegree = (totals) =>
  totals.earned - swayamAboveCap(totals);

export function remainingCreditRequirement(totals) {
  return DEGREE_CREDIT_REQUIREMENT - creditsTowardsDegree(totals);
}
