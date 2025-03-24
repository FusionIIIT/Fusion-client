import React, { useState, useEffect } from "react";
import { Button, Group, Table, Badge, Select } from "@mantine/core";

function InventoryRequests() {
  const [filter, setFilter] = useState("all");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [requests, setRequests] = useState([]);
  // const token = localStorage.getItem("token");

  const token = localStorage.getItem("authToken");

  // Listen for screen size changes
  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial state

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch inventory requests from backend API
  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/inventory/api/requests/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
          },
        );
        if (!response.ok) {
          throw new Error("Failed to fetch requests");
        }
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching inventory requests:", error);
      }
    }
    fetchRequests();
  }, [token]);

  // Filter requests based on approval status
  const filteredRequests = requests.filter((request) => {
    if (filter === "approved") return request.approval_status === "APPROVED";
    if (filter === "unapproved")
      return request.approval_status === "NOT_APPROVED";
    return true;
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <h2
        style={{ color: "#007BFF", textAlign: "center", marginBottom: "20px" }}
      >
        Inventory Requests
      </h2>

      {isSmallScreen ? (
        <Select
          placeholder="Filter Requests"
          data={[
            { value: "all", label: "All Requests" },
            { value: "approved", label: "Approved" },
            { value: "unapproved", label: "Unapproved" },
          ]}
          value={filter}
          onChange={setFilter}
          style={{ marginBottom: "20px", width: "80%" }}
        />
      ) : (
        <Group position="center" style={{ marginBottom: "20px" }}>
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "filled" : "outline"}
            style={{ margin: "0 10px" }}
          >
            All Requests
          </Button>
          <Button
            onClick={() => setFilter("approved")}
            variant={filter === "approved" ? "filled" : "outline"}
            style={{ margin: "0 10px" }}
          >
            Approved
          </Button>
          <Button
            onClick={() => setFilter("unapproved")}
            variant={filter === "unapproved" ? "filled" : "outline"}
            style={{ margin: "0 10px" }}
          >
            Unapproved
          </Button>
        </Group>
      )}

      <Table
        style={{
          width: "80%",
          border: "1px solid #ddd",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#f0f0f0",
              borderBottom: "2px solid #ddd",
            }}
          >
            <th style={{ padding: "15px", border: "1px solid #ddd" }}>Date</th>
            <th style={{ padding: "15px", border: "1px solid #ddd" }}>Item</th>
            <th style={{ padding: "15px", border: "1px solid #ddd" }}>
              Department
            </th>

            <th style={{ padding: "15px", border: "1px solid #ddd" }}>
              Purpose
            </th>
            <th style={{ padding: "15px", border: "1px solid #ddd" }}>
              Specifications
            </th>

            <th style={{ padding: "15px", border: "1px solid #ddd" }}>
              Approval
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map((request, index) => (
            <tr
              key={index}
              style={{
                backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                borderBottom: "1px solid #ddd",
              }}
            >
              <td style={{ padding: "15px", border: "1px solid #ddd" }}>
                {request.date}
              </td>
              <td style={{ padding: "15px", border: "1px solid #ddd" }}>
                {request.item_name}
              </td>
              <td style={{ padding: "15px", border: "1px solid #ddd" }}>
                {request.department_name}
              </td>

              <td style={{ padding: "15px", border: "1px solid #ddd" }}>
                {request.purpose}
              </td>
              <td style={{ padding: "15px", border: "1px solid #ddd" }}>
                {request.specifications}
              </td>

              <td
                style={{
                  padding: "15px",
                  border: "1px solid #ddd",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                {request.approval_status === "APPROVED" ? (
                  <Badge color="green">Approved</Badge>
                ) : (
                  <Badge color="red" variant="light">
                    Not Approved
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default InventoryRequests;
