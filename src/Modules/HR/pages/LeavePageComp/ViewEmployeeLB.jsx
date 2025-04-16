import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Card,
  Text,
  Divider,
  Loader,
  Table,
  TextInput,
  Select,
  Flex,
} from "@mantine/core";
import HrBreadcrumbs from "../../components/HrBreadcrumbs";
import { admin_get_all_leave_balances } from "../../../../routes/hr";

const ViewEmployeeLB = () => {
  const [allEmployees, setAllEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Updated leave types with explicit keys to match API response:
  // - The "allottedKey" maps to LeavePerYear (e.g., "casual_leave_allotted")
  // - The "takenKey" maps to LeaveBalance (e.g., "casual_leave_taken")
  const leaveTypes = [
    {
      key: "casual_leave",
      allottedKey: "casual_leave_allotted",
      takenKey: "casual_leave_taken",
      abbrev: "CL",
      fullName: "Casual Leave",
    },
    {
      key: "special_casual_leave",
      allottedKey: "special_casual_leave_allotted",
      takenKey: "special_casual_leave_taken",
      abbrev: "SCL",
      fullName: "Special Casual Leave",
    },
    {
      key: "earned_leave",
      allottedKey: "earned_leave_allotted",
      takenKey: "earned_leave_taken",
      abbrev: "EL",
      fullName: "Earned Leave",
    },
    {
      key: "half_pay_leave",
      allottedKey: "half_pay_leave_allotted",
      takenKey: "half_pay_leave_taken",
      abbrev: "HPL",
      fullName: "Half Pay Leave",
    },
    {
      key: "maternity_leave",
      allottedKey: "maternity_leave_allotted",
      takenKey: "maternity_leave_taken",
      abbrev: "ML",
      fullName: "Maternity Leave",
    },
    {
      key: "child_care_leave",
      allottedKey: "child_care_leave_allotted",
      takenKey: "child_care_leave_taken",
      abbrev: "CCL",
      fullName: "Child Care Leave",
    },
    {
      key: "paternity_leave",
      allottedKey: "paternity_leave_allotted",
      takenKey: "paternity_leave_taken",
      abbrev: "PL",
      fullName: "Paternity Leave",
    },
    {
      key: "leave_encashment",
      allottedKey: "leave_encashment_allotted",
      takenKey: "leave_encashment_taken",
      abbrev: "LE",
      fullName: "Leave Encashment",
    },
    {
      key: "restricted_holiday",
      allottedKey: "restricted_holiday_allotted",
      takenKey: "restricted_holiday_taken",
      abbrev: "RH",
      fullName: "Restricted Holiday",
    },
  ];

  // Fetch employee/leave details from the API.
  useEffect(() => {
    const fetchEmployeesAndLeaveData = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token is missing.");
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(admin_get_all_leave_balances, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch leave details");
        }
        const data = await response.json();
        // Transform the received employee leave data
        const mergedData = data.leave_balances.map((emp) => {
          const { employee_id, employee_username, employee_fullname, ...rest } =
            emp;
          return {
            id: employee_id,
            username: employee_username,
            name: employee_fullname,
            ...rest,
          };
        });
        setAllEmployees(mergedData);
        setFilteredEmployees(mergedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeesAndLeaveData();
  }, []);

  // Compute unique department options if available.
  const departmentOptions = Array.from(
    new Set(
      allEmployees
        .map((emp) => emp.department)
        .filter((dept) => dept && dept.trim() !== ""),
    ),
  ).sort();

  // Handle search and department filter changes.
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDepartmentChange = (value) => {
    setDepartmentFilter(value);
  };

  // Apply filtering based on search query and selected department.
  useEffect(() => {
    let filtered = allEmployees;
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (emp) =>
          emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          emp.username.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    if (departmentFilter !== "All") {
      filtered = filtered.filter((emp) => emp.department === departmentFilter);
    }
    setFilteredEmployees(filtered);
  }, [searchQuery, departmentFilter, allEmployees]);

  // Standard table cell styling.
  const headerCellStyle = {
    padding: "8px",
    border: "1px solid #ccc",
    textAlign: "left",
    backgroundColor: "#e9ecef",
    fontWeight: "bold",
  };

  const cellStyle = {
    padding: "8px",
    border: "1px solid #ccc",
    textAlign: "left",
  };

  // Breadcrumbs for navigation.
  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "Admin Leave Management", path: "/hr/admin_leave" },
    {
      title: "Review Employee's Leave Balances",
      path: "/hr/admin_leave/view_employees_leave_balance",
    },
  ];

  // Abbreviation table styles for smaller text.
  const abbrHeaderCellStyle = {
    padding: "4px 8px",
    border: "1px solid #ccc",
    textAlign: "left",
    backgroundColor: "#e9ecef",
    fontWeight: "bold",
    fontSize: "0.75rem",
  };

  const abbrCellStyle = {
    padding: "4px 8px",
    border: "1px solid #ccc",
    textAlign: "left",
    fontSize: "0.75rem",
  };

  return (
    <>
      <HrBreadcrumbs items={exampleItems} />
      <Container size="xl" py="xl">
        <Title order={2} mb="lg">
          Employees List with Leave Details
        </Title>

        {/* Top Section: Search/Filter Panel & Abbreviation Chart */}
        <Flex
          gap="md"
          wrap="nowrap"
          mb="xl"
          style={{
            alignItems: "stretch",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          {/* Search/Filter Panel */}
          <Card withBorder shadow="sm" p="lg" style={{ flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
              <TextInput
                placeholder="Search by name or username"
                label="Search Employees"
                value={searchQuery}
                onChange={handleSearchChange}
                mb="md"
              />
              <Select
                label="Filter by Department"
                placeholder="Select Department"
                data={["All", ...departmentOptions]}
                value={departmentFilter}
                onChange={handleDepartmentChange}
              />
            </div>
          </Card>

          {/* Abbreviation Table */}
          <Card withBorder shadow="sm" p="lg" style={{ flex: 1 }}>
            <Title order={5} mb="sm" style={{ fontSize: "1rem" }}>
              Leave Type Abbreviations
            </Title>
            <Table fontSize="xs">
              <thead>
                <tr>
                  <th style={abbrHeaderCellStyle}>Leave Type</th>
                  <th style={abbrHeaderCellStyle}>Allotted</th>
                  <th style={abbrHeaderCellStyle}>Taken</th>
                </tr>
              </thead>
              <tbody>
                {leaveTypes.map((leave) => (
                  <tr key={leave.key}>
                    <td style={abbrCellStyle}>{leave.fullName}</td>
                    <td style={abbrCellStyle}>{`${leave.abbrev} A`}</td>
                    <td style={abbrCellStyle}>{`${leave.abbrev} T`}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Flex>

        <Divider mb="xl" />

        {/* Main Employee List Table */}
        {loading ? (
          <Loader />
        ) : error ? (
          <Text color="red">{error}</Text>
        ) : filteredEmployees.length ? (
          <div
            className="striped-table-container"
            style={{ overflowX: "auto" }}
          >
            <style>{`
              .striped-table-container table tbody tr:nth-child(odd) {
                background-color: #e8e8e8 !important;
              }
              .striped-table-container table tbody tr:nth-child(even) {
                background-color: #ffffff !important;
              }
              .striped-table-container table tbody tr:hover {
                background-color: #f1f3f5 !important;
              }
            `}</style>
            <Text style={{ fontWeight: "bold", marginBottom: "25px" }}>
              Total Matched Employees: {filteredEmployees.length}
            </Text>
            <Table
              striped
              highlightOnHover
              horizontalSpacing="md"
              verticalSpacing="md"
            >
              <thead>
                <tr>
                  <th style={headerCellStyle}>#</th>
                  <th style={headerCellStyle}>ID</th>
                  <th style={headerCellStyle}>Name</th>
                  <th style={headerCellStyle}>Username</th>
                  <th style={headerCellStyle}>Department</th>
                  {leaveTypes.map((leave) => (
                    <React.Fragment key={leave.key}>
                      <th style={headerCellStyle}>{leave.abbrev} A</th>
                      <th style={headerCellStyle}>{leave.abbrev} T</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp, index) => (
                  <tr key={emp.id}>
                    <td style={cellStyle}>{index + 1}</td>
                    <td style={cellStyle}>{emp.id}</td>
                    <td style={cellStyle}>{emp.name}</td>
                    <td style={cellStyle}>{emp.username}</td>
                    <td style={cellStyle}>{emp.department || "N/A"}</td>
                    {leaveTypes.map((leave) => (
                      <React.Fragment key={leave.key}>
                        <td style={cellStyle}>
                          {emp[leave.allottedKey] !== undefined
                            ? emp[leave.allottedKey]
                            : "-"}
                        </td>
                        <td style={cellStyle}>
                          {emp[leave.takenKey] !== undefined
                            ? emp[leave.takenKey]
                            : "-"}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <Text>No employees found.</Text>
        )}
      </Container>
    </>
  );
};

export default ViewEmployeeLB;
