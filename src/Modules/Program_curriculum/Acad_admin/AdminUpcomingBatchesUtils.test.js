import { describe, expect, it } from "vitest";

import {
  categoryLabel,
  getStudentFieldValue,
} from "./AdminUpcomingBatchesUtils";
import {
  STUDENT_FIELDS_CONFIG,
  STUDENT_TABLE_COLUMNS,
} from "./AdminUpcomingBatchesConstants";

const categoryColumn = STUDENT_TABLE_COLUMNS.find((c) => c.key === "category");

describe("category vocabulary", () => {
  it("offers exactly the codes the database stores", () => {
    expect(STUDENT_FIELDS_CONFIG.category.options.map((o) => o.value)).toEqual([
      "GEN",
      "OBC",
      "SC",
      "ST",
      "EWS",
    ]);
  });

  it("shows a reader the words, not the code", () => {
    expect(categoryLabel("GEN")).toBe("General");
    expect(categoryLabel("EWS")).toBe("Economically Weaker Section");
    expect(categoryLabel("SC")).toBe("Scheduled Caste");
  });

  it("passes through anything it does not recognise rather than blanking it", () => {
    expect(categoryLabel("OBC-NCL")).toBe("OBC-NCL");
    expect(categoryLabel("")).toBe("");
  });
});

describe("getStudentFieldValue", () => {
  it("renders the category cell as the label", () => {
    expect(getStudentFieldValue({ category: "GEN" }, categoryColumn)).toBe(
      "General",
    );
    expect(getStudentFieldValue({ category: "EWS" }, categoryColumn)).toBe(
      "Economically Weaker Section",
    );
  });

  it("still shows a dash when the student has no category", () => {
    expect(getStudentFieldValue({}, categoryColumn)).toBe("-");
  });
});

describe("upload preview cells", () => {
  // one row exactly as process_excel_upload returns it for the UG template:
  // the spreadsheet's own headings, not camelCase
  const ROW = {
    jee_app_no: "260310655186",
    "Institute Roll Number": "26BCS001",
    Name: "A SRIKANTH",
    Discipline: "Computer Science and Engineering",
    Category: "SC",
    "Institute Email ID": "26BCS001@iiitdmj.ac.in",
    "Father's Name": "A KRISHNAIAH",
    "Mother's Name": "A MANGAMMA",
    "Full Address": "UDITHYAL, BALANAGAR, MAHBUBNAGAR, TELANGANA, 509202",
  };

  const columnFor = (key) =>
    STUDENT_TABLE_COLUMNS.find((column) => column.key === key);

  it.each([
    ["rollNumber", "26BCS001"],
    ["name", "A SRIKANTH"],
    ["fname", "A KRISHNAIAH"],
    ["mname", "A MANGAMMA"],
    ["jeeAppNo", "260310655186"],
    ["instituteEmail", "26BCS001@iiitdmj.ac.in"],
    ["category", "Scheduled Caste"],
  ])("reads %s from the spreadsheet heading", (key, expected) => {
    expect(getStudentFieldValue(ROW, columnFor(key))).toBe(expected);
  });

  it("reads the address and the discipline", () => {
    expect(getStudentFieldValue(ROW, columnFor("address"))).toContain(
      "MAHBUBNAGAR",
    );
    expect(getStudentFieldValue(ROW, columnFor("branch"))).toContain(
      "Computer Science",
    );
  });
});
