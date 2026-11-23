import { deflateSync } from "node:zlib";
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

// PNG chunk checksums; a CRC is bit arithmetic by nature.
/* eslint-disable no-bitwise */
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

const crc32 = (bytes) => {
  let c = 0xffffffff;
  bytes.forEach((b) => {
    c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  });
  return (c ^ 0xffffffff) >>> 0;
};
/* eslint-enable no-bitwise */

const pngChunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), body.length + 4);
  return out;
};

// An RGBA PNG the size of the logo the page draws (570x566), in flat
// colours with a transparent background, as the real mark is.
function logoSizedPng() {
  const width = 570;
  const height = 566;
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8; // bit depth
  header[9] = 6; // RGBA
  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const o = y * stride + 1 + x * 4;
      const inMark = (x - 285) ** 2 + (y - 283) ** 2 < 250 ** 2;
      raw[o] = x < width / 2 ? 0x2e : 0x1f;
      raw[o + 1] = x < width / 2 ? 0x8b : 0x4e;
      raw[o + 2] = x < width / 2 ? 0x57 : 0x9a;
      raw[o + 3] = inMark ? 255 : 0;
    }
  }
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", header),
    pngChunk("IDAT", deflateSync(raw)),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
  return `data:image/png;base64,${png.toString("base64")}`;
}

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
    // A loose continuation page still says which course and room it is.
    expect(texts(doc)).toContain("CS8004 · L201 · Page 1 of 2");
    expect(texts(doc)).toContain("CS8004 · L201 · Page 2 of 2");
    // The middle dot is in the standard fonts' encoding (one byte, 0xB7).
    expect(doc.output()).toContain("(CS8004 \xb7 L201 \xb7 Page 2 of 2)");

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

  it("stores the logo once, compressed, under a fixed alias", async () => {
    const doc = await renderAttendancePdf([sheet(2), sheet(3)], {
      sectioned: false,
      logo: LOGO,
    });
    doc.addImage.mock.calls.forEach((args) => {
      expect(args[0]).toBe(LOGO);
      expect(args[1]).toBe("PNG");
      expect(args.slice(6, 8)).toEqual(["logo", "FAST"]);
    });
  });

  it("keeps a six-sheet PDF with a logo-sized image small", async () => {
    const doc = await renderAttendancePdf(
      Array.from({ length: 6 }, () => sheet(30)),
      { sectioned: false, logo: logoSizedPng() },
    );
    expect(doc.output().length).toBeLessThan(400 * 1024);
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
