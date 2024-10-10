import React from "react";
import SpecialTable from "./SpecialTable";
import { data } from "./data";

const columns = [
  {
    accessorKey: "name.firstName",
    header: "Special Name",
  },
  {
    accessorKey: "name.lastName",
    header: "Last Name",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "state",
    header: "State",
  },
];

function Alumni() {
  return (
    <SpecialTable
      title="Alumni"
      columns={columns}
      data={data}
      rowOptions={["3", "4", "6"]}
    />
  );
}

export default Alumni;
