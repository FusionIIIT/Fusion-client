import React, { useEffect, useState, lazy } from "react";
import PropTypes from "prop-types";

const SpecialTable = lazy(() => import("./SpecialTable.jsx"));

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

function Faculty({ branch, faculty }) {
  const [facultyData, setFacultyData] = useState([]);

  // Fetch faculty data from API with Auth Token
  useEffect(() => {
    // Ensure the token is correctly fetched from local storage
    const authToken = localStorage.getItem("authToken");

    fetch("http://127.0.0.1:8000/dep/api/dep-main/", {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Combine all faculty lists from different departments into one array
        const combinedFacultyList = [...data.fac_list[faculty]];

        // Update the state with the fetched faculty data
        setFacultyData(combinedFacultyList);
      })
      .catch((error) => {
        console.error("Error fetching faculty data:", error);
      });
  }, [faculty]); // Added department as a dependency

  return (
    <SpecialTable
      title={`Faculties in ${branch} Department`} // Updated title to show current department
      columns={columns}
      data={facultyData} // Use dynamic faculty data from API
      rowOptions={["10", "20", "30"]}
    />
  );
}

Faculty.propTypes = {
  faculty: PropTypes.string.isRequired,
  branch: PropTypes.string.isRequired,
};

export default Faculty;
