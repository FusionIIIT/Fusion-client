/* eslint-disable react/prop-types */
import React from "react";
import SpecialTable from "./SpecialTable";

const columns = [
  {
    accessorKey: "Announcement Date",
    header: "Announcement Date",
  },
  {
    accessorKey: "Announcement By",
    header: "Announcement By",
  },
  {
    accessorKey: "Programme",
    header: "Programme",
  },
  {
    accessorKey: "Batch",
    header: "Batch",
  },
  {
    accessorKey: "Message",
    header: "Message",
  },
  {
    accessorKey: "File",
    header: "File",
  },
];

export default function BrowAnnoStaticDisplay({ department }) {
  return (
    <SpecialTable
      title={`${department} Announcements`}
      columns={columns}
      data={{}}
      rowOptions={["3", "4", "6"]}
    />
  );
}
