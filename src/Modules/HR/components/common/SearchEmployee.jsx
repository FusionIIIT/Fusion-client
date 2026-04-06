import React, { useState, useEffect, useRef } from "react";
import { Select } from "@mantine/core";
import PropTypes from "prop-types";
import { searchEmployees } from "../../services/api";

function SearchEmployee({ onEmployeeSelect, initialSearch }) {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const hasAutoSearched = useRef(false);

  const fetchEmployees = async (text) => {
    if (text.length < 3) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await searchEmployees(text);
      const uniqueEmployees = results.reduce((acc, employee) => {
        if (!acc[employee.id]) {
          acc[employee.id] = {
            value: `${employee.id}-${employee.username}`,
            label: `${employee.username}`,
            details: employee,
          };
        }
        return acc;
      }, {});
      setSearchResults(Object.values(uniqueEmployees));
    } catch (err) {
      setError("Unable to fetch employees.");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelection = (selectedValue) => {
    const employee = searchResults.find(
      (result) => result.value === selectedValue,
    );
    if (onEmployeeSelect && employee?.details) {
      onEmployeeSelect(employee.details);
    }
  };

  useEffect(() => {
    const autoSearch = async () => {
      if (initialSearch && !hasAutoSearched.current) {
        hasAutoSearched.current = true;
        await fetchEmployees(initialSearch);
      }
    };
    autoSearch();
  }, [initialSearch, onEmployeeSelect]);

  return (
    <div style={{ maxWidth: "400px", marginBottom: "20px" }}>
      <Select
        label="Search Employee"
        placeholder="Type to search"
        searchable
        nothingFound={error || "No employees found"}
        data={searchResults}
        onSearchChange={(val) => {
          fetchEmployees(val);
        }}
        onChange={handleEmployeeSelection}
        disabled={loading}
      />
    </div>
  );
}

SearchEmployee.propTypes = {
  onEmployeeSelect: PropTypes.func,
  initialSearch: PropTypes.string,
};

export default SearchEmployee;
