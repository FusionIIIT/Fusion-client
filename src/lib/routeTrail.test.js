import { describe, expect, it } from "vitest";

import { trailFor } from "./routeTrail";

const base = "/programme_curriculum";

const pages = [
  {
    key: "studentProgrammes",
    slug: "view_all_programmes",
    title: "Programmes",
  },
  {
    key: "studentCurriculums",
    slug: "view_all_working_curriculums",
    title: "Curriculums",
  },
];

const trails = {
  "/curriculums/:id": { title: "Programme", parent: "Programmes" },
  "/stud_curriculum_view/:id": { title: "Curriculum", parent: "Curriculums" },
  "/orphan_page": { title: "Orphan", parent: "Nowhere" },
};

const options = { base, pages, trails };

describe("trailFor", () => {
  it("shows nothing on a page the sidebar already links to", () => {
    expect(trailFor(`${base}/view_all_programmes`, options)).toEqual([]);
    expect(trailFor(`${base}/view_all_working_curriculums`, options)).toEqual(
      [],
    );
  });

  it("links back to the parent sidebar page from a detail page", () => {
    expect(trailFor(`${base}/curriculums/1`, options)).toEqual([
      { label: "Programmes", to: `${base}/view_all_programmes` },
      { label: "Programme" },
    ]);
  });

  it("resolves the parent for each drill-down separately", () => {
    expect(trailFor(`${base}/stud_curriculum_view/35`, options)).toEqual([
      { label: "Curriculums", to: `${base}/view_all_working_curriculums` },
      { label: "Curriculum" },
    ]);
  });

  it("shows nothing for a route with no trail entry", () => {
    expect(trailFor(`${base}/some_unmapped_page`, options)).toEqual([]);
  });

  it("omits the link when the parent is not visible to the role", () => {
    expect(trailFor(`${base}/orphan_page`, options)).toEqual([
      { label: "Orphan" },
    ]);
  });

  it("does not treat a longer path as its sidebar prefix", () => {
    expect(trailFor(`${base}/view_all_programmes/extra`, options)).toEqual([]);
  });
});
