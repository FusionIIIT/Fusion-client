import logoUrl from "../../../assets/IIITJ_logo.webp";

// Everything in mm. Column widths and row heights are the exam cell's sample
// workbook (A4 portrait, 0.3 in margins) scaled to the printable width.
export const LAYOUT = {
  page: { width: 210, height: 297 },
  margin: 7.62,
  columns: { A: 27.2, B: 27.2, C: 71.1, D: 31.0, E: 38.1 },
  sectionWidth: 16,
  // Sample rows 1-15: 1-6 blank / invigilation, 7-12 institute block, 13-15 course grid.
  headerRows: [
    5.3, 5.3, 5.3, 5.3, 5.3, 5.3, 5.6, 5.6, 5.8, 11.9, 5.6, 6.8, 7.0, 7.0, 7.0,
  ],
  headingHeight: 10.85,
  rowHeight: 10.85,
  footerHeight: 6,
  padding: 1.5,
  font: { header: 12, body: 11, small: 9, room: 36, footer: 9 },
  grey: "#BFBFBF",
  thin: 0.2,
  thick: 0.5,
};

const LOGO_SOURCE = { width: 570, height: 566 };

const sum = (list) => list.reduce((a, b) => a + b, 0);
const usableHeight = () => LAYOUT.page.height - 2 * LAYOUT.margin;
const headerHeight = () => sum(LAYOUT.headerRows);

export function rowsPerPage({ first }) {
  const above = first
    ? headerHeight() + LAYOUT.headingHeight
    : LAYOUT.headingHeight;
  const room = usableHeight() - above - LAYOUT.footerHeight;
  return Math.max(1, Math.floor(room / LAYOUT.rowHeight + 1e-9));
}

function paginate(rows) {
  const first = rowsPerPage({ first: true });
  const later = rowsPerPage({ first: false });
  const pages = [rows.slice(0, first)];
  for (let i = first; i < rows.length; i += later) {
    pages.push(rows.slice(i, i + later));
  }
  return pages;
}

function columnX() {
  const { A, B, C, D, E } = LAYOUT.columns;
  const a = LAYOUT.margin;
  return {
    a,
    b: a + A,
    c: a + A + B,
    d: a + A + B + C,
    e: a + A + B + C + D,
    right: a + A + B + C + D + E,
  };
}

function tableColumns(sectioned) {
  const { A, B, C, D, E } = LAYOUT.columns;
  return [
    { label: "Sl. No", width: A, align: "center", value: (r) => r.slNo },
    { label: "Roll No", width: B, align: "left", value: (r) => r.roll_no },
    {
      label: "Name",
      width: sectioned ? C - LAYOUT.sectionWidth : C,
      align: "left",
      wrap: true,
      value: (r) => r.name,
    },
    {
      label: "Discipline",
      width: D,
      align: "center",
      value: (r) => r.discipline,
    },
    ...(sectioned
      ? [
          {
            label: "Section",
            width: LAYOUT.sectionWidth,
            align: "center",
            value: (r) => r.section,
          },
        ]
      : []),
    { label: "Signature", width: E, align: "center", value: () => "" },
  ];
}

function setFont(doc, bold, size) {
  doc.setFont("helvetica", bold ? "bold" : "normal");
  doc.setFontSize(size);
}

// Shrinks the font (not below `min`) until `text` fits `width`.
function fitSize(doc, text, width, size, min) {
  let s = size;
  doc.setFontSize(s);
  while (s > min && doc.getTextWidth(text) > width) {
    s -= 0.5;
    doc.setFontSize(s);
  }
  return s;
}

// One line of text in a box, vertically centred, shrunk to fit if needed.
function boxText(doc, value, x, y, w, h, opts = {}) {
  const text = String(value ?? "");
  if (!text) return;
  const { align = "left", bold = false, size = LAYOUT.font.body } = opts;
  const pad = LAYOUT.padding;
  setFont(doc, bold, size);
  fitSize(doc, text, w - 2 * pad, size, opts.min ?? LAYOUT.font.small);
  let tx = x + pad;
  if (align === "center") tx = x + w / 2;
  if (align === "right") tx = x + w - pad;
  doc.text(text, tx, y + h / 2, { align, baseline: "middle" });
}

// Lines stacked and centred on the box's middle; spacing tightens as lines
// are added so wrapped text stays inside the cell.
function stackedText(doc, lines, x, y, h, size) {
  const factor = lines.length > 1 ? 1.05 : 1.15;
  const lh = (size * factor) / doc.internal.scaleFactor;
  const top = y + h / 2 - ((lines.length - 1) * lh) / 2;
  doc.text(lines, x, top, { baseline: "middle", lineHeightFactor: factor });
}

function nameCell(doc, value, x, y, w, h) {
  const text = String(value ?? "");
  if (!text) return;
  const width = w - 2 * LAYOUT.padding;
  let size = LAYOUT.font.body;
  setFont(doc, false, size);
  let lines = doc.splitTextToSize(text, width);
  if (lines.length > 2) {
    size = LAYOUT.font.small;
    doc.setFontSize(size);
    lines = doc.splitTextToSize(text, width);
  }
  stackedText(doc, lines, x + LAYOUT.padding, y, h, size);
}

// A value that may be long (course title, instructors): shrink, then wrap.
function valueText(doc, value, x, y, w, h) {
  const text = String(value ?? "");
  if (!text) return;
  const width = w - 2 * LAYOUT.padding;
  setFont(doc, false, LAYOUT.font.body);
  const size = fitSize(doc, text, width, LAYOUT.font.body, 8);
  const lines =
    doc.getTextWidth(text) > width ? doc.splitTextToSize(text, width) : [text];
  stackedText(doc, lines, x + LAYOUT.padding, y, h, size);
}

function drawHeader(doc, sheet, logo) {
  const { A, B, C, D, E } = LAYOUT.columns;
  const x = columnX();
  const rows = LAYOUT.headerRows;
  const top = (n) => LAYOUT.margin + sum(rows.slice(0, n - 1));
  const h = (n) => rows[n - 1];
  const { header } = LAYOUT.font;

  doc.setDrawColor(0);
  doc.setLineWidth(LAYOUT.thick);
  doc.rect(x.a, top(4), A + B, h(4));
  doc.rect(x.d, top(4), D + E, h(4));
  boxText(doc, "1st Invigilation", x.a, top(4), A + B, h(4), {
    align: "center",
    bold: true,
    size: header,
  });
  boxText(doc, "2nd Invigilation", x.d, top(4), D + E, h(4), {
    align: "center",
    bold: true,
    size: header,
  });

  if (logo) {
    const size = h(7) + h(8) + h(9) + h(10);
    const width = (size * LOGO_SOURCE.width) / LOGO_SOURCE.height;
    // One alias: the image is stored (deflated) once, not re-hashed per sheet.
    doc.addImage(
      logo,
      "PNG",
      x.a + (A + B - width) / 2,
      top(7),
      width,
      size,
      "logo",
      "FAST",
    );
  }

  const right = { align: "right", bold: true, size: header };
  boxText(doc, "PDPM", x.e, top(7), E, h(7), right);
  boxText(
    doc,
    "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY,",
    x.c,
    top(8),
    C + D + E,
    h(8),
    right,
  );
  boxText(
    doc,
    "DESIGN AND MANUFACTURING JABALPUR",
    x.c,
    top(9),
    C + D + E,
    h(9),
    right,
  );

  doc.rect(x.d, top(10), D + E, h(10));
  const centred = { align: "center", bold: true, size: header };
  boxText(doc, sheet.dateText, x.d, top(10), D + E, h(10) / 2, centred);
  boxText(
    doc,
    sheet.timeText,
    x.d,
    top(10) + h(10) / 2,
    D + E,
    h(10) / 2,
    centred,
  );

  boxText(doc, sheet.examLine, x.c, top(11), C, h(11), centred);

  const room = String(sheet.room ?? "");
  if (room) {
    setFont(doc, true, LAYOUT.font.room);
    fitSize(doc, room, D + E - 2 * LAYOUT.padding, LAYOUT.font.room, 16);
    doc.text(room, x.right - LAYOUT.padding, top(12) + h(12) - 1.2, {
      align: "right",
    });
  }

  doc.setLineWidth(LAYOUT.thin);
  [
    ["Course No:", sheet.code, "Total Students", sheet.total],
    ["Course Title:", sheet.title, "Present", ""],
    ["Instructor(s):", sheet.instructorText, "Absent", ""],
  ].forEach(([label, value, countLabel, count], i) => {
    const y = top(13 + i);
    const rh = h(13 + i);
    boxText(doc, label, x.a, y, A, rh, { bold: true, min: 8 });
    valueText(doc, value, x.b, y, B + C, rh);
    doc.rect(x.d, y, D, rh);
    doc.rect(x.e, y, E, rh);
    boxText(doc, countLabel, x.d, y, D, rh, { bold: true });
    boxText(doc, count, x.e, y, E, rh, { align: "center" });
  });

  return LAYOUT.margin + headerHeight();
}

function drawTableHeading(doc, columns, y) {
  let x = LAYOUT.margin;
  doc.setLineWidth(LAYOUT.thin);
  doc.setDrawColor(0);
  columns.forEach((col) => {
    // Text drawing resets the fill colour, so set it for every cell.
    doc.setFillColor(LAYOUT.grey);
    doc.rect(x, y, col.width, LAYOUT.headingHeight, "FD");
    boxText(doc, col.label, x, y, col.width, LAYOUT.headingHeight, {
      align: "center",
      bold: true,
      size: LAYOUT.font.header,
    });
    x += col.width;
  });
  return y + LAYOUT.headingHeight;
}

function drawRow(doc, columns, row, y) {
  let x = LAYOUT.margin;
  const h = LAYOUT.rowHeight;
  columns.forEach((col) => {
    doc.rect(x, y, col.width, h);
    if (col.wrap) nameCell(doc, col.value(row), x, y, col.width, h);
    else boxText(doc, col.value(row), x, y, col.width, h, { align: col.align });
    x += col.width;
  });
  return y + h;
}

// "CS8004 · L201 · Page 2 of 2": a loose page still names its course and room.
function drawPageLabel(doc, sheet, n, m) {
  setFont(doc, false, LAYOUT.font.footer);
  doc.text(
    `${sheet.code} · ${sheet.room} · Page ${n} of ${m}`,
    LAYOUT.page.width / 2,
    LAYOUT.page.height - LAYOUT.margin - LAYOUT.footerHeight / 2,
    { align: "center", baseline: "middle" },
  );
}

export async function renderAttendancePdf(sheets, { sectioned, logo } = {}) {
  const { jsPDF: JsPdf } = await import("jspdf");
  const doc = new JsPdf({ orientation: "portrait", unit: "mm", format: "a4" });
  const columns = tableColumns(sectioned);
  let fresh = true;

  sheets.forEach((sheet) => {
    const pages = paginate(sheet.rows || []);
    pages.forEach((pageRows, i) => {
      if (!fresh) doc.addPage();
      fresh = false;
      let y = i === 0 ? drawHeader(doc, sheet, logo) : LAYOUT.margin;
      y = drawTableHeading(doc, columns, y);
      pageRows.forEach((row) => {
        y = drawRow(doc, columns, row, y);
      });
      if (pages.length > 1) drawPageLabel(doc, sheet, i + 1, pages.length);
    });
  });

  return doc;
}

// The left square (the mark) of the wide IIITDM logo, as a PNG data URL.
export async function loadLogo() {
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = logoUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = LOGO_SOURCE.width;
  canvas.height = LOGO_SOURCE.height;
  const { width, height } = LOGO_SOURCE;
  canvas
    .getContext("2d")
    .drawImage(img, 0, 0, width, height, 0, 0, width, height);
  return canvas.toDataURL("image/png");
}
