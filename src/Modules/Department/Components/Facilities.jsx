import React, { useState, lazy } from "react";
import { useSelector } from "react-redux";
import SpecialTable from "./SpecialTable";
import studentData from "./Data/Data";

const FacilitiesDescriptive = lazy(() => import("./FacilitiesDescriptive.jsx"));
const EditFacilities = lazy(() => import("./EditFacilities.jsx"));

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

function Facilities({ branch }) {
  const [isEditing, setIsEditing] = useState(false); // State to manage editing
  const role = useSelector((state) => state.user.role);
  const cseLabs = studentData.labs.filter((lab) => lab.department === "CSE");

  const handleEditClick = () => {
    setIsEditing(true); // Set editing mode to true when edit button is clicked
  };

  return (
    <div>
      {isEditing ? ( // Conditionally render the EditFacilities component
        <EditFacilities branch={branch} setIsEditing={setIsEditing} />
      ) : (
        <>
          <FacilitiesDescriptive branch={branch} />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              marginBottom: "10px",
              marginTop: "10px",
            }}
          >
            {(role === "dept_admin" || role === "HOD (CSE)") && (
              <button
                onClick={handleEditClick} // Call handleEditClick on button click
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
        </>
      )}
    </div>
  );
}

export default Facilities;
