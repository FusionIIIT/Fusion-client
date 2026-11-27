const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function toRoman(n) {
  if (!n || n <= 0 || !Number.isFinite(n)) return String(n ?? "");
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = [
    "M",
    "CM",
    "D",
    "CD",
    "C",
    "XC",
    "L",
    "XL",
    "X",
    "IX",
    "V",
    "IV",
    "I",
  ];
  let r = "";
  let num = n;
  for (let i = 0; i < vals.length; i += 1) {
    while (num >= vals[i]) {
      r += syms[i];
      num -= vals[i];
    }
  }
  return r;
}

function semesterLabel(sem) {
  if (sem.is_summer) {
    const summerNo = Math.floor((sem.semester_no || 0) / 2);
    return summerNo > 0 ? `Summer ${toRoman(summerNo)}` : "Summer";
  }
  return toRoman(sem.semester_no);
}

function specialSymbolFor(remark) {
  if (remark === "Substitute") return "S";
  if (remark === "Backlog" || remark === "Improvement") return "R";
  return "";
}

const GRADE_SHEET_CSS = `
  :root { --fs: 9pt; --fs-sm: 8.5pt; --fs-xs: 8pt; }
  @page { size: A4; margin-top: 7.5cm; margin-left: 2.3cm; margin-right: 2.3cm; margin-bottom: 2.5cm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: "Arial MT", "ArialMT", Arial, Helvetica, sans-serif; font-size: var(--fs); color: #000; line-height: 1.0; }
  .lbl, th, b, strong { font-family: Arial, "Arial MT", Helvetica, sans-serif; }
  table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  td, th { border: 1pt solid #000; padding: 0.6pt 3pt; font-size: var(--fs); vertical-align: middle; word-wrap: break-word; overflow-wrap: break-word; }
  th { font-weight: bold; text-align: center; }
  .lbl { font-weight: bold; }

  #info-table col.i1 { width: 2.7cm; } #info-table col.i2 { width: 4.3cm; }
  #info-table col.i3 { width: 2.9cm; } #info-table col.i4 { width: 6.5cm; }
  #info-table td { vertical-align: top; padding: 1.3pt 5pt; line-height: 1.1; font-size: var(--fs); text-transform: uppercase; }
  #info-table .lbl { white-space: nowrap; }
  #info-table .ir1 td { border-bottom: hidden; }
  #info-table .ir2 td { border-top: hidden; border-bottom: hidden; }

  #course-table col.k1 { width: 13%; } #course-table col.k2 { width: 56%; }
  #course-table col.k3 { width: 12%; } #course-table col.k4 { width: 9%; } #course-table col.k5 { width: 10%; }
  #course-table tr:first-child th { border-top: none; }
  #course-table td { padding: 1.5pt 3pt; }

  #spi-table td { font-size: var(--fs-sm); padding: 1pt 4pt; white-space: nowrap; text-align: center; }

  #gp-table col.gp1 { width: 15%; } #gp-table col.gp2 { width: 85%; }
  #gp-table td { font-size: var(--fs-xs); line-height: 1.2; padding: 1.5pt 5pt; vertical-align: top; }
  #gp-table .lbl { font-size: var(--fs-xs); vertical-align: middle; }

  #abbr-table col.ab1 { width: 15%; } #abbr-table col.ab2 { width: 85%; }
  #abbr-table td { font-size: var(--fs-xs); line-height: 1.2; padding: 1.5pt 5pt; vertical-align: top; }
  #abbr-table .lbl { font-size: var(--fs-xs); vertical-align: middle; }

  #ss-table col.ss1 { width: 15%; } #ss-table col.ss2 { width: 85%; }
  #ss-table td { font-size: var(--fs-xs); line-height: 1.2; padding: 1.5pt 5pt; vertical-align: top; }
  #ss-table .lbl { font-size: var(--fs-xs); vertical-align: middle; }

  #legend-table tr:first-child td { border-top: none; }
  #legend-table td { font-size: var(--fs-xs); line-height: 1.2; padding: 1.5pt 5pt; vertical-align: top; }

  .gs-page { break-after: page; page-break-after: always; padding-top: 0; }
  .gs-page:last-child { break-after: auto; page-break-after: auto; }

  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

export function buildFullGradeSheetHTML(studentInfo, semesters) {
  const isBachelor =
    (studentInfo.programme || "").toLowerCase().includes("bachelor") ||
    /^b\.(tech|des)/i.test(studentInfo.programme || "");
  const minCpi = isBachelor ? "5.0" : "6.5";
  const creditThreshold = isBachelor ? 148 : 48;

  const pages = [semesters];

  const lastSem = semesters[semesters.length - 1];
  const graduated =
    !!lastSem && (lastSem.total_credits || 0) >= creditThreshold;
  const completionText = `Student has ${graduated ? "" : "not "}successfully completed the programme.`;

  const courseRowsFor = (courses) =>
    courses
      .map((c, idx) => {
        const topHide = idx > 0 ? "border-top:hidden;" : "";
        const symbol = specialSymbolFor(c.remark);
        return `
    <tr>
      <td style="text-align:center;vertical-align:middle;border-right:hidden;${topHide}">${esc(c.code || "")}</td>
      <td style="vertical-align:middle;border-left:hidden;border-right:hidden;${topHide}">${esc(c.name)}</td>
      <td style="text-align:center;vertical-align:middle;border-left:hidden;border-right:hidden;${topHide}">${esc(c.credits)}</td>
      <td style="text-align:center;vertical-align:middle;border-left:hidden;border-right:hidden;${topHide}">${esc(c.grade)}</td>
      <td style="text-align:center;vertical-align:middle;border-left:hidden;${topHide}">${esc(symbol)}</td>
    </tr>`;
      })
      .join("");

  const semesterBlockHTML = (sem) => {
    const label = semesterLabel(sem);
    const isSpecialCourse = (c) => {
      const g = String(c.grade ?? "").trim();
      return g !== "" && !Number.isNaN(Number(g));
    };
    const hasSpecialCourses = sem.courses.some(isSpecialCourse);
    const specialCourseCodes = sem.courses
      .filter(isSpecialCourse)
      .map((c) => c.code)
      .join(", ");
    return `
<table id="info-table">
<colgroup><col class="i1"><col class="i2"><col class="i3"><col class="i4"></colgroup>
<tr class="ir1">
  <td class="lbl" style="border-right:none">Roll No.</td>
  <td style="border-left:none;border-right:none">${esc(studentInfo.roll_no)}</td>
  <td class="lbl" style="border-left:none;border-right:none">Programme</td>
  <td style="border-left:none">${esc(studentInfo.programme)}</td>
</tr>
<tr class="ir2">
  <td class="lbl" style="border-right:none">Student Name</td>
  <td style="border-left:none;border-right:none">${esc(studentInfo.name)}</td>
  <td class="lbl" style="border-left:none;border-right:none">Discipline</td>
  <td style="border-left:none">${esc(studentInfo.discipline)}</td>
</tr>
<tr class="ir3">
  <td class="lbl" style="border-right:none">Semester</td>
  <td style="border-left:none;border-right:none">${esc(label)}</td>
  <td class="lbl" style="border-left:none;border-right:none;font-weight:bold">Academic Year</td>
  <td style="border-left:none;font-weight:bold">${esc(sem.academic_year)}</td>
</tr>
</table>

<table id="course-table">
<colgroup><col class="k1"><col class="k2"><col class="k3"><col class="k4"><col class="k5"></colgroup>
<tr>
  <th style="border-right:hidden">Course No.</th>
  <th style="text-align:left;border-left:hidden;border-right:hidden">Course Title</th>
  <th style="border-left:hidden;border-right:hidden">Unit</th>
  <th style="border-left:hidden;border-right:hidden">Grade</th>
  <th style="border-left:hidden">Special<br>Symbols</th>
</tr>
${courseRowsFor(sem.courses)}
</table>

<table id="spi-table">
<colgroup><col style="width:20%"><col style="width:40%"><col style="width:40%"></colgroup>
<tr>
  <td class="lbl" style="text-align:center;border-right:hidden">Result</td>
  <td style="text-align:center;font-size:var(--fs-sm);border-left:hidden;border-right:hidden">SPI &nbsp;&nbsp; ${Number(sem.spi || 0).toFixed(1)}</td>
  <td style="text-align:center;font-size:var(--fs-sm);border-left:hidden">CPI &nbsp;&nbsp; ${Number(sem.cpi || 0).toFixed(1)}</td>
</tr>
</table>
${hasSpecialCourses ? `<div style="font-size:8pt;margin-top:3pt">*In ${esc(specialCourseCodes)} student is awarded SPI based on performance in various evaluation in place of grade.</div>` : ""}
`;
  };

  const legendBlockHTML = () => `
<div class="legend-block">
<table id="gp-table">
<colgroup><col class="gp1"><col class="gp2"></colgroup>
<tr>
  <td class="lbl" style="vertical-align:middle">Grading<br>Points</td>
  <td>
    <table style="width:100%;border-collapse:collapse;table-layout:fixed">
      <colgroup><col style="width:20%"><col style="width:20%"><col style="width:20%"><col style="width:20%"><col style="width:20%"></colgroup>
      <tr>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">O=10 (Distinguished)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">A+=10 (Outstanding)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">A=9 (Excellent)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">B+=8 (Very Good)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">B=7 (Good)</td>
      </tr>
      <tr>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">C+=6 (Average)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">C=5 (Below Average)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">D+=4 (Marginal)</td>
        <td style="border:none;padding:0 0 1pt 0;font-size:var(--fs-xs)">D=3 (Poor)</td>
        <td style="border:none;padding:0;font-size:var(--fs-xs)">F=2 (Very Poor)</td>
      </tr>
      <tr>
        <td style="border:none;padding:0;font-size:var(--fs-xs)">I=0 (Incomplete)</td>
        <td style="border:none;padding:0;font-size:var(--fs-xs)">S=0 (Satisfactory)</td>
        <td style="border:none;padding:0;font-size:var(--fs-xs)">X=0 (Unsatisfactory)</td>
        <td style="border:none;padding:0;font-size:var(--fs-xs)"></td>
        <td style="border:none;padding:0;font-size:var(--fs-xs)"></td>
      </tr>
    </table>
  </td>
</tr>
</table>

<table id="abbr-table">
<colgroup><col class="ab1"><col class="ab2"></colgroup>
<tr>
  <td class="lbl" style="vertical-align:middle">Abbreviations</td>
  <td style="padding:3pt 5pt">
    <b>SPI</b>: Semester Performance Index<br>
    <b>CPI</b>: Cumulative Performance Index<br>
    <b>AU</b>: Indicates that the course has been Audited<br>
    <b>CD</b>: Indicates that the course has been Dropped due to a shortage of attendance
  </td>
</tr>
</table>

<table id="ss-table">
<colgroup><col class="ss1"><col class="ss2"></colgroup>
<tr>
  <td class="lbl" style="vertical-align:middle">Special<br>Symbols</td>
  <td style="padding:3pt 5pt">
    <b>&#8216;R&#8217;</b> after letter grade indicates that the course has been Repeated<br>
    <b>&#8216;S&#8217;</b> after letter grade indicates that the course has been Substituted
  </td>
</tr>
</table>

<table id="legend-table" style="table-layout:auto;width:100%">
<tr>
  <td style="font-size:8pt;padding:3pt 5pt;white-space:nowrap;width:auto;text-align:center;border-right:hidden">&#8226;&nbsp;Medium of instruction is English</td>
  <td style="font-size:8pt;padding:3pt 5pt;white-space:nowrap;width:auto;text-align:center;border-left:hidden">&#8226;&nbsp;Conversion from CPI to Percentage using (CPI&#215;10) % formula</td>
</tr>
<tr>
  <td style="font-size:8pt;text-align:center;font-weight:bold;border-right:hidden">Minimum Graduating CPI: ${minCpi}</td>
  <td style="font-size:8pt;text-align:center;font-weight:bold;border-left:hidden">Maximum Graduating CPI: 10.0</td>
</tr>
<tr class="completion-row">
  <td colspan="2" style="font-size:9pt;text-align:center;font-weight:bold;padding:4pt 5pt">${esc(completionText)}</td>
</tr>
</table>
</div>`;

  const footerBlockHTML = (pageIdx, pageCount) => `
<div class="footer-block">
<table style="width:100%;border-collapse:collapse;table-layout:fixed;margin-top:50pt">
<tr>
  <td style="border:none;font-size:9pt;text-align:left;width:33%">Academic Office</td>
  <td style="border:none;font-size:9pt;text-align:center;width:34%">Issued on ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</td>
  <td style="border:none;font-size:9pt;text-align:right;width:33%">Assistant/Deputy Registrar</td>
</tr>
</table>
<div class="page-number" style="text-align:center;font-size:9pt;margin-top:calc(1.5cm - 12px)">Page ${pageIdx + 1} of ${pageCount}</div>
</div>`;

  const semesterGapHTML = `
<table class="sem-gap" style="width:100%;border-collapse:collapse;table-layout:fixed">
<tr><td style="border-left:1pt solid #000;border-right:1pt solid #000;border-top:none;border-bottom:none;height:12pt;padding:0">&nbsp;</td></tr>
</table>`;

  const pageHTML = (page, pageIdx) => {
    const isLastPage = pageIdx === pages.length - 1;
    const blocks = page
      .map((sem) => `<div class="sem-block">${semesterBlockHTML(sem)}</div>`)
      .join(semesterGapHTML);
    return `<div class="gs-page">
${blocks}
${isLastPage ? legendBlockHTML() : ""}
${footerBlockHTML(pageIdx, pages.length)}
</div>`;
  };

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Grade Sheet - ${esc(studentInfo.roll_no)}</title>
<style>
${GRADE_SHEET_CSS}
</style>
</head><body>
${pages.map(pageHTML).join("\n")}
</body></html>`;
}
