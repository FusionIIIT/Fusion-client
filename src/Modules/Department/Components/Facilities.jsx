import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios"; // Import axios
import SpecialTable from "./SpecialTable";
import FacilitiesDescriptive from "./FacilitiesDescriptive.jsx";
import EditFacilities from "./EditFacilities.jsx";

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

const deleteLabs = async (labIds) => {
  const token = localStorage.getItem("authToken"); // Get the token from local storage
  try {
    const response = await axios.delete(
      "http://127.0.0.1:8000/dep/api/labs/delete/",
      {
        headers: {
          Authorization: `Token ${token}`, // Include the token in the headers
        },
        data: { lab_ids: labIds }, // Pass lab IDs in the request body
      },
    );
    console.log(response.data);
    // Optionally, refresh the lab list or update state after deletion
  } catch (error) {
    console.error("There was an error deleting the labs:", error.response.data);
  }
};

function Facilities({ branch }) {
  const [isEditing, setIsEditing] = useState(false); // State to manage editing
  const role = useSelector((state) => state.user.role);
  const [labs, setLabs] = useState([]); // State to store labs data
  const [selectedLabs, setSelectedLabs] = useState([]); // State to store selected labs

  useEffect(() => {
    // Fetch the lab data from the API
    const fetchLabs = async () => {
      const token = localStorage.getItem("authToken"); // Get the token from local storage

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/dep/api/labs/",
          {
            headers: {
              Authorization: `Token ${token}`, // Include the token in the headers
            },
          },
        );
        setLabs(response.data); // Set labs data from the response
      } catch (error) {
        console.error("Error fetching labs:", error);
      }
    };

    fetchLabs(); // Call the function to fetch labs
  }, []); // Empty dependency array to run once on mount

  // Filter labs based on branch
  const filteredLabs = labs.filter((lab) => lab.department === branch);

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

  // Handle deletion of selected labs
  const handleDeleteSelected = async () => {
    if (window.confirm(`Are you sure you want to delete these labs?`)) {
      await deleteLabs(selectedLabs);
      // Fetch labs again after deletion
      const token = localStorage.getItem("authToken"); // Get the token from local storage
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/dep/api/labs/",
          {
            headers: {
              Authorization: `Token ${token}`, // Include the token in the headers
            },
          },
        );
        setLabs(response.data); // Update labs data after deletion
        setSelectedLabs([]); // Clear selected labs
      } catch (error) {
        console.error("Error fetching labs after deletion:", error);
      }
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
            data={filteredLabs} // Feed the filtered labs based on the branch
            rowOptions={["3", "4", "6"]}
            onRowSelectionChange={setSelectedLabs} // Assuming the SpecialTable accepts this prop
          />
          {isEditButtonVisible() && ( // Check if the delete button should be visible
            <div style={{ marginTop: "10px", textAlign: "right" }}>
              <button
                onClick={handleDeleteSelected} // Call handleDeleteSelected on button click
                style={{
                  padding: "5px 20px",
                  backgroundColor: "red",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete Selected
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Facilities;
