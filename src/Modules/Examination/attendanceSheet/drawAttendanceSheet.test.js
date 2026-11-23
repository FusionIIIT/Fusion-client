import { describe, expect, it, vi } from "vitest";
import {
  LAYOUT,
  renderAttendancePdf,
  rowsPerPage,
} from "./drawAttendanceSheet";

// Spy on every jsPDF instance the renderer creates, before it draws.
vi.mock("jspdf", async (importOriginal) => {
  const real = await importOriginal();
  function SpiedPdf(...args) {
    const { jsPDF: RealPdf } = real;
    const doc = new RealPdf(...args);
    const realText = doc.text;
    // Font size in effect at each text call, aligned with text.mock.calls.
    doc.textSizes = [];
    doc.text = vi.fn((...a) => {
      doc.textSizes.push(doc.getFontSize());
      return realText.apply(doc, a);
    });
    vi.spyOn(doc, "addImage");
    return doc;
  }
  return { ...real, jsPDF: SpiedPdf, default: SpiedPdf };
});

const LOGO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const sheet = (n, over = {}) => ({
  room: "L201",
  dateText: "DATE: 22.09.2026",
  timeText: "Time : 03:00 PM To 05:00 PM",
  examLine: "MID SEM EXAM (Odd Sem), 2026-27",
  code: "CS8004",
  title: "Deep Learning and Applications",
  instructorText: "PROF. APARAJITA OJHA",
  total: n,
  rows: Array.from({ length: n }, (_, i) => ({
    slNo: i + 1,
    roll_no: `23BCS${String(i + 1).padStart(3, "0")}`,
    name: `Student ${i + 1}`,
    discipline: "CSE",
    section: i % 2 ? "B" : "A",
  })),
  ...over,
});

const texts = (doc) =>
  doc.text.mock.calls.flatMap(([t]) => (Array.isArray(t) ? t : [t]));

const pagesFor = (n) => {
  const first = rowsPerPage({ first: true });
  const later = rowsPerPage({ first: false });
  return n <= first ? 1 : 1 + Math.ceil((n - first) / later);
};

describe("renderAttendancePdf", () => {
  it("draws the header text of the sample", async () => {
    const doc = await renderAttendancePdf([sheet(20)], {
      sectioned: false,
      logo: LOGO,
    });
    const seen = texts(doc);
    [
      "1st Invigilation",
      "2nd Invigilation",
      "PDPM",
      "INDIAN INSTITUTE OF INFORMATION TECHNOLOGY,",
      "DESIGN AND MANUFACTURING JABALPUR",
      "DATE: 22.09.2026",
      "Time : 03:00 PM To 05:00 PM",
      "MID SEM EXAM (Odd Sem), 2026-27",
      "L201",
      "Course No:",
      "Course Title:",
      "Instructor(s):",
      "CS8004",
      "Deep Learning and Applications",
      "PROF. APARAJITA OJHA",
      "Total Students",
      "Present",
      "Absent",
      "20",
      "Sl. No",
      "Roll No",
      "Name",
      "Discipline",
      "Signature",
    ].forEach((t) => expect(seen).toContain(t));
  });

  it("adds a Section column only when sectioned", async () => {
    const plain = await renderAttendancePdf([sheet(4)], {
      sectioned: false,
      logo: LOGO,
    });
    expect(texts(plain)).not.toContain("Section");

    const split = await renderAttendancePdf([sheet(4)], {
      sectioned: true,
      logo: LOGO,
    });
    expect(texts(split)).toContain("Section");
  });

  it("starts every sheet on a new page", async () => {
    const sizes = [6, 38, 2];
    const doc = await renderAttendancePdf(
      sizes.map((n) => sheet(n)),
      { sectioned: false, logo: LOGO },
    );
    const expected = sizes.reduce(
      (sum, n) => sum + Math.max(1, pagesFor(n)),
      0,
    );
    expect(doc.getNumberOfPages()).toBe(expected);
  });

  it("labels continuation pages", async () => {
    const long = rowsPerPage({ first: true }) + 1;
    const doc = await renderAttendancePdf([sheet(long)], {
      sectioned: false,
      logo: LOGO,
    });
    expect(doc.getNumberOfPages()).toBe(2);
    expect(texts(doc)).toContain("Page 1 of 2");
    expect(texts(doc)).toContain("Page 2 of 2");

    const short = await renderAttendancePdf([sheet(3)], {
      sectioned: false,
      logo: LOGO,
    });
    expect(texts(short).some((t) => /Page/.test(t))).toBe(false);
  });

  it("wraps a long name inside the Name column", async () => {
    const longName =
      "Venkata Satya Narayana Lakshmi Prasanna Kumari Subrahmanya Raghavendra";
    expect(longName.length).toBe(70);
    const s = sheet(1);
    s.rows[0].name = longName;
    const doc = await renderAttendancePdf([s], {
      sectioned: false,
      logo: LOGO,
    });

    const nameCalls = doc.text.mock.calls
      .map(([t], i) => ({
        lines: Array.isArray(t) ? t : [t],
        size: doc.textSizes[i],
      }))
      .filter(({ lines }) => lines.join(" ").startsWith("Venkata"));
    expect(nameCalls.length).toBeGreaterThan(0);

    const nameColumnWidth = LAYOUT.columns.C;
    doc.setFont("helvetica", "normal");
    nameCalls.forEach(({ lines, size }) => {
      expect(size).toBeGreaterThanOrEqual(LAYOUT.font.small);
      doc.setFontSize(size);
      lines.forEach((line) => {
        expect(doc.getTextWidth(line)).toBeLessThanOrEqual(nameColumnWidth);
      });
    });
    expect(nameCalls.flatMap(({ lines }) => lines).join(" ")).toBe(longName);
  });

  it("fills every table heading cell grey", async () => {
    const greyFills = (doc) =>
      doc
        .output()
        .split("\n")
        .filter((l) => l === "0.75 g").length;
    const plain = await renderAttendancePdf([sheet(3)], {
      sectioned: false,
      logo: LOGO,
    });
    expect(greyFills(plain)).toBe(5);
    const split = await renderAttendancePdf([sheet(3)], {
      sectioned: true,
      logo: LOGO,
    });
    expect(greyFills(split)).toBe(6);
  });

  it("adds the logo once per sheet", async () => {
    const doc = await renderAttendancePdf([sheet(2), sheet(40), sheet(1)], {
      sectioned: false,
      logo: LOGO,
    });
    expect(doc.addImage).toHaveBeenCalledTimes(3);
  });
});

describe("rowsPerPage", () => {
  it("fits more rows on a continuation page than under the full header", () => {
    expect(rowsPerPage({ first: true })).toBeGreaterThan(0);
    expect(rowsPerPage({ first: false })).toBeGreaterThan(
      rowsPerPage({ first: true }),
    );
  });
});
