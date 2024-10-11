import React from "react";
import SpecialTable from "./SpecialTable";
import studentData from "./data";

const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "department",
    header: "Department",
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
