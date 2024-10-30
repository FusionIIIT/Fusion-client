import React, { lazy } from "react";
import { useSelector } from "react-redux";
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
  // Access user role from Redux
  const role = useSelector((state) => state.user.role);

  // Filter only CSE department labs
  const cseLabs = studentData.labs.filter((lab) => lab.department === "CSE");

  return (
    <div>
      <FacilitiesDescriptive />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: "10px",
          marginTop: "10px",
        }}
      >
        {/* Conditionally render the Edit button for 'dept_admin' and 'HOD (CSE)' roles */}
        {(role === "dept_admin" || role === "HOD (CSE)") && (
          <button
            style={{
              padding: "5px 20px",
              backgroundColor: "indigo",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        )}
      </div>
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
