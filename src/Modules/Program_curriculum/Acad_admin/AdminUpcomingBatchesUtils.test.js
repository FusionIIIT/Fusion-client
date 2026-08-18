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
