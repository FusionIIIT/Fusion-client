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

  // Determine if the edit button should be shown based on branch and role
  const isEditButtonVisible = () => {
    const allowedRoles = ["HOD", "admin"];
    const rolePrefix = role.split(" ")[0]; // Get the prefix of the role, e.g., "HOD" or "admin"

    // Check if the role is allowed for the specific branch
    switch (branch) {
      case "CSE":
        return allowedRoles.includes(rolePrefix) && role.includes("(CSE)");
      case "ECE":
        return allowedRoles.includes(rolePrefix) && role.includes("(ECE)");
      case "SM":
        return allowedRoles.includes(rolePrefix) && role.includes("(SM)");
      case "ME":
        return allowedRoles.includes(rolePrefix) && role.includes("(ME)");
      default:
        return false;
    }
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
            {isEditButtonVisible() && ( // Check if the edit button should be visible
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
