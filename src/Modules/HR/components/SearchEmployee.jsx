import React, { useState } from "react";
import { Select } from "@mantine/core";
import { search_employees } from "../../../routes/hr/index";

const SearchEmployee = ({ onEmployeeSelect }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");

  const fetchEmployees = async (searchText) => {
    // Trigger search only if at least 3 characters are entered
    if (searchText.length < 3) {
      setSearchResults([]); // Clear previous results
      return;
    }

    if (!token) {
      setError("Authentication token is missing.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${search_employees}?search_text=${searchText}`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.statusText}`);
      }
      const data = await response.json();

      // Group employees by their ID to ensure uniqueness
      const uniqueEmployees = data.employees.reduce((acc, employee) => {
        if (!acc[employee.id]) {
          acc[employee.id] = {
            value: `${employee.id}-${employee.username}`, // Unique identifier
            label: `${employee.username}`, // Display only the username
            details: employee,
          };
        }
        return acc;
      }, {});

      // Convert the grouped object back to an array
      const formattedResults = Object.values(uniqueEmployees);

      console.log(formattedResults);
      setSearchResults(formattedResults);
    } catch (err) {
      setError("Unable to fetch employees.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelection = (selectedValue) => {
    const employee = searchResults.find(
      (result) => result.value === selectedValue,
    );
    setSelectedEmployee(employee?.details || null);

    // Pass selected employee to the parent via the callback
    if (onEmployeeSelect && employee?.details) {
      onEmployeeSelect(employee.details);
    }
  };

  return (
    <div style={{ maxWidth: "400px", marginBottom: "20px" }}>
      <Select
        label="Search Employee"
        placeholder="Type to search"
        searchable
        nothingFound={error || "No employees found"}
        data={searchResults}
        onSearchChange={fetchEmployees}
        onChange={handleEmployeeSelection}
        disabled={loading}
      />
    </div>
  );
};

export default SearchEmployee;
