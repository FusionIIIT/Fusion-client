import { describe, expect, it } from "vitest";

import reducer, {
  setAccessibleModules,
  setCurrentAccessibleModules,
  setPluggedNavigation,
  setRole,
} from "./userslice";

const placement = [
  { section: "Placement", items: [{ code: "placement_cell", links: [] }] },
];
const leave = [{ section: "Leave", items: [{ code: "leave", links: [] }] }];

const stateFor = (role) =>
  [
    setAccessibleModules({
      student: { placement_cell: true },
      acadadmin: { leave: true },
    }),
    setPluggedNavigation({ student: placement, acadadmin: leave }),
    setRole(role),
    setCurrentAccessibleModules(),
  ].reduce(reducer, undefined);

describe("the acting role's own sidebar", () => {
  it("gives a role only the menus granted to it", () => {
    expect(stateFor("student").currentPluggedNavigation).toEqual(placement);
    expect(stateFor("acadadmin").currentPluggedNavigation).toEqual(leave);
  });

  it("draws nothing for a role that was granted nothing", () => {
    expect(stateFor("faculty").currentPluggedNavigation).toEqual([]);
    expect(stateFor("faculty").currentAccessibleModules).toEqual({});
  });
});
