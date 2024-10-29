import React, { lazy } from "react";
import SpecialTable from "./SpecialTable";
import studentData from "./Data/Data";

const FacilitiesDescriptive = lazy(() => import("./FacilitiesDescriptive.jsx"));

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
  },
  {
    accessorKey: "location",
    header: "Location",
  },
];

function Facilities() {
  // Filter only CSE department labs
  const cseLabs = studentData.labs.filter((lab) => lab.department === "CSE");

  return (
    <div>
      <FacilitiesDescriptive />
      <SpecialTable
        title="Labs"
        columns={columns}
        data={cseLabs}
        rowOptions={["3", "4", "6"]}
      />
    </div>
  );
}

export default Facilities;
