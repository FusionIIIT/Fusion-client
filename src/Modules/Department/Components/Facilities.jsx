import React from "react";
import SpecialTable from "./SpecialTable";
import studentData from "./Data/Data";
import FacilitiesDescriptive from "./FacilitiesDescriptive";

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
  // Filter only Chemistry labs
  const chemistryLabs = studentData.labs.filter(
    (lab) => lab.department === "CSE",
  );

  return (
    <div>
      <FacilitiesDescriptive />
      <SpecialTable
        title="Labs"
        columns={columns}
        data={chemistryLabs}
        rowOptions={["3", "4", "6"]}
      />
    </div>
  );
}

export default Facilities;
