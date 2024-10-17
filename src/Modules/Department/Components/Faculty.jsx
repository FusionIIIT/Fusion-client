import React from "react";
import SpecialTable from "./SpecialTable";
import studentData from "./Data/Data";

const columns = [
  {
    accessorKey: "id",
    header: "Faculty ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "dob",
    header: "DOB",
  },
  {
    accessorKey: "phno",
    header: "Phone Number",
  },
];

function Faculty() {
  return (
    <SpecialTable
      title="Faculties"
      columns={columns}
      data={studentData.Faculty}
      rowOptions={["3", "4", "6"]}
    />
  );
}

export default Faculty;
