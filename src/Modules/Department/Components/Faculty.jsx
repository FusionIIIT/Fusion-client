import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import SpecialTable from "./SpecialTable";

const columns = [
  {
    accessorKey: "id",
    header: "Faculty ID",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "sex",
    header: "Gender",
  },
  {
    accessorKey: "date_of_birth",
    header: "DOB",
  },
  {
    accessorKey: "phone_no",
    header: "Phone Number",
  },
];

function Faculty({ department }) {
  const [facultyData, setFacultyData] = useState([]);
  const authToken = ""; // Replace this with your actual auth token

  // Fetch faculty data from API with Auth Token
  useEffect(() => {
    fetch("http://127.0.0.1:8000/dep/api/dep-main/", {
      method: "GET",
      headers: {
        Authorization: `Token ${localStorage.getItem("authToken")}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Combine all faculty lists from different departments into one array
        const combinedFacultyList = [...data.fac_list[department]];

        combinedFacultyList.map((facultyMember) => ({
          ...facultyMember,
        }));
        setFacultyData(combinedFacultyList);
      })
      .catch((error) => {
        console.error("Error fetching faculty data:", error);
      });
  }, [authToken]);

  // Helper function to get department name based on ID (you can adjust based on your department schema)

  return (
    <SpecialTable
      title="Faculties"
      columns={columns}
      data={facultyData} // Use dynamic faculty data from API
      rowOptions={["10", "20", "30"]}
    />
  );
}

Faculty.propTypes = {
  department: PropTypes.string.isRequired,
};

export default Faculty;
