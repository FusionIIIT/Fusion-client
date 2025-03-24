import React, { useState, useEffect } from "react";
import { Button, Group, Table, Badge, Select } from "@mantine/core";

function InventoryRequests() {
  const [filter, setFilter] = useState("all");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [requests, setRequests] = useState([]);
  const token = localStorage.getItem("authToken");

  // Screen size detection
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch requests from API
  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/inventory/api/requests/",
          { headers: { Authorization: `Token ${token}` } },
        );
        const data = await response.json();
        setRequests(data);
      } catch (error) {
        console.error("Error fetching inventory requests:", error);
      }
    }
    fetchRequests();
  }, [token]);

  // Filter requests based on selected filter
  const filteredRequests = requests.filter((request) => {
    const status = request.approval_status.toUpperCase();
    switch (filter) {
      case "approved":
        return status === "APPROVED";
      case "pending":
        return status === "PENDING";
      case "unapproved":
        return status !== "APPROVED" && status !== "PENDING";
      default:
        return true;
    }
  });

  // Get badge properties based on status
  const getStatusBadge = (status) => {
    switch (status.toUpperCase()) {
      case "APPROVED":
        return { color: "green", label: "Approved" };
      case "PENDING":
        return { color: "yellow", label: "Pending" };
      default:
        return { color: "red", label: "Not Approved" };
    }
  };

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
        style={{
          color: "#007BFF",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Inventory Requests
      </h2>

      {/* Filter Controls */}
      {isSmallScreen ? (
        <Select
          placeholder="Filter Requests"
          data={[
            { value: "all", label: "All Requests" },
            { value: "approved", label: "Approved" },
            { value: "pending", label: "Pending" },
            { value: "unapproved", label: "Unapproved" },
          ]}
          value={filter}
          onChange={setFilter}
          style={{ marginBottom: "20px", width: "80%" }}
        />
      ) : (
        <Group position="center" style={{ marginBottom: "20px" }}>
          {["all", "approved", "pending", "unapproved"].map((f) => (
            <Button
              key={f}
              onClick={() => setFilter(f)}
              variant={filter === f ? "filled" : "outline"}
              style={{ margin: "0 5px" }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </Group>
      )}

      {/* Requests Table */}
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
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredRequests.map((request, index) => {
            const status = getStatusBadge(request.approval_status);
            return (
              <tr
                key={index}
                style={{
                  backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <td style={{ padding: "15px", border: "1px solid #ddd" }}>
                  {new Date(request.date).toLocaleDateString()}
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
                  }}
                >
                  <Badge color={status.color}>{status.label}</Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}

export default InventoryRequests;
