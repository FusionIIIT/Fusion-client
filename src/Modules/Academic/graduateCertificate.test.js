import { describe, expect, it } from "vitest";

import {
  certificateFileName,
  certificateText,
  fitFontSize,
  titleCase,
  wrapText,
} from "./graduateCertificate";

// A monospace stand-in for measureText: every character is 10px at size 20.
const mono = (text, size = 20) => text.length * (size / 2);

describe("certificateText", () => {
  it("joins what is known about the degree", () => {
    expect(
      certificateText({
        name: "VIKRANT KUMAR",
        programme: "B.Tech CSE",
        batch: 2023,
        rollNo: "23BCS265",
      }),
    ).toMatchObject({
      name: "Vikrant Kumar",
      details: "B.Tech CSE, batch of 2023, roll number 23BCS265",
    });
  });

  it("leaves out what is not known", () => {
    expect(
      certificateText({ name: "A B", programme: "", batch: null, rollNo: "X1" })
        .details,
    ).toBe("roll number X1");
  });
});

describe("titleCase", () => {
  it("handles hyphens and apostrophes", () => {
    expect(titleCase("MARY-ANN D'SOUZA")).toBe("Mary-Ann D'Souza");
  });
});

describe("fitFontSize", () => {
  it("keeps the starting size when the text fits", () => {
    expect(fitFontSize(mono, "short", 1000, 100)).toBe(100);
  });

  it("shrinks a long name until it fits", () => {
    const size = fitFontSize(mono, "x".repeat(40), 1000, 100);
    expect(mono("x".repeat(40), size)).toBeLessThanOrEqual(1000);
    expect(size).toBe(50);
  });

  it("stops at the minimum size", () => {
    expect(fitFontSize(mono, "x".repeat(400), 100, 100, 30)).toBe(30);
  });
});

describe("wrapText", () => {
  it("breaks on words within the width", () => {
    expect(wrapText(mono, "aaa bbb ccc ddd", 70)).toEqual([
      "aaa bbb",
      "ccc ddd",
    ]);
  });

  it("keeps a single long word on its own line", () => {
    expect(wrapText(mono, "a verylongword b", 50)).toEqual([
      "a",
      "verylongword",
      "b",
    ]);
  });
});

describe("certificateFileName", () => {
  it("names the file after the roll number", () => {
    expect(certificateFileName("23BCS265", "pdf")).toBe(
      "Graduation-certificate-23BCS265.pdf",
    );
  });

  it("falls back when the roll number is missing", () => {
    expect(certificateFileName("", "png")).toBe(
      "Graduation-certificate-graduate.png",
    );
  });
});
