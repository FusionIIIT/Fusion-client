import React, { useState } from "react";
import { Table, Checkbox, Select, TextInput } from "@mantine/core";

const departments = [
  { label: "CSE", value: "CSE" },
  { label: "ECE", value: "ECE" },
  { label: "Mech", value: "Mech" },
  { label: "SM", value: "SM" },
  { label: "Design", value: "Design" },
  { label: "NS", value: "NS" },
  { label: "H1", value: "H1" },
  { label: "H3", value: "H3" },
  { label: "H4", value: "H4" },
  { label: "Panini", value: "Panini" },
  { label: "Nagarjuna", value: "Nagarjuna" },
  { label: "Maa Saraswati", value: "Maa Saraswati" },
  { label: "RSPC", value: "RSPC" },
  { label: "GymKhana", value: "GymKhana" },
  { label: "IWD", value: "IWD" },
  { label: "Mess", value: "Mess" },
  { label: "Academic", value: "Academic" },
  { label: "VH", value: "VH" },
];

const inventoryData = [
  {
    department: "CSE",
    product: "Computer",
    quantity: 50,
    missing: 0,
    lastUpdated: "29-03-2024",
  },
  {
    department: "CSE",
    product: "Peripherals",
    quantity: 50,
    missing: 0,
    lastUpdated: "29-03-2024",
  },
  {
    department: "ECE",
    product: "Oscilloscope",
    quantity: 20,
    missing: 1,
    lastUpdated: "28-03-2024",
  },
  {
    department: "ECE",
    product: "Microcontroller Kits",
    quantity: 30,
    missing: 2,
    lastUpdated: "27-03-2024",
  },
];

export default function Reports() {
  const [selectedDepartment, setSelectedDepartment] = useState("CSE");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = inventoryData.filter(
    (item) =>
      item.department === selectedDepartment &&
      item.product.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
        width: "100%",
        maxWidth: "1200px",
        margin: "auto",
      }}
    >
      <h3
        style={{ color: "#007BFF", marginBottom: "10px", fontSize: "1.2rem" }}
      >
        {selectedDepartment} Reports
      </h3>
      <Select
        data={departments}
        value={selectedDepartment}
        onChange={setSelectedDepartment}
        placeholder="Select Department"
        style={{ marginBottom: "20px", width: "80%" }}
      />
      <TextInput
        placeholder="Search products"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.currentTarget.value)}
        style={{ marginBottom: "20px", width: "80%" }}
      />
      <div style={{ width: "100%", overflowX: "auto" }}>
        <Table
          striped
          highlightOnHover
          style={{
            width: "100%",
            minWidth: "600px",
            border: "1px solid #ddd",
            borderCollapse: "collapse",
            backgroundColor: "white",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f0f0f0",
                borderBottom: "2px solid #ddd",
                textAlign: "center",
              }}
            >
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Select
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Products
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Quantity
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Missing
              </th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                    borderBottom: "1px solid #ddd",
                    textAlign: "center",
                  }}
                >
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    <Checkbox />
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {item.product}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {item.missing}
                  </td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {item.lastUpdated}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    border: "1px solid #ddd",
                  }}
                >
                  No data available for {selectedDepartment}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
