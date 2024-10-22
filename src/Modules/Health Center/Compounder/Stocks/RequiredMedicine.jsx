import React, { useState } from "react";

function RequiredMedicine() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activePage, setActivePage] = useState(1);

  const data = [
    {
      medicine: "Dolo 650 Tablet",
      supplier: "City",
      expiryDate: "Oct. 23, 2024",
      quantity: 30,
    },
    {
      medicine: "Aspirin 300mg Tablet",
      supplier: "City",
      expiryDate: "Oct. 31, 2024",
      quantity: 500,
    },
    {
      medicine: "Paracetamol",
      supplier: "Abc",
      expiryDate: "Nov. 03, 2024",
      quantity: 50,
    },
    // Add more entries as needed
  ];

  const rows = data
    .filter((item) =>
      item.medicine.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .map((item, index) => (
      <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
        <td style={{ padding: "12px" }}>{item.medicine}</td>
        <td style={{ padding: "12px" }}>{item.supplier}</td>
        <td style={{ padding: "12px" }}>{item.expiryDate}</td>
        <td style={{ padding: "12px" }}>{item.quantity}</td>
      </tr>
    ));

  return (
    <div style={{ margin: "20px auto", maxWidth: "800px" }}>
      {/* Top section with search input and download button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "50%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "5px",
            fontSize: "16px",
          }}
        />
        <button
          style={{
            padding: "10px 20px",
            backgroundColor: "#6D28D9", // Apply custom color
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Download
        </button>
      </div>

      {/* Stock Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                padding: "12px",
                borderBottom: "2px solid #f8f9fa",
                backgroundColor: "#f8f9fa",
                textAlign: "left",
                fontWeight: "bold",
              }}
            >
              Medicine
            </th>
            <th
              style={{
                padding: "12px",
                borderBottom: "2px solid #f8f9fa",
                backgroundColor: "#f8f9fa",
                textAlign: "left",
                fontWeight: "bold",
              }}
            >
              Supplier
            </th>
            <th
              style={{
                padding: "12px",
                borderBottom: "2px solid #f8f9fa",
                backgroundColor: "#f8f9fa",
                textAlign: "left",
                fontWeight: "bold",
              }}
            >
              Expiry Date
            </th>
            <th
              style={{
                padding: "12px",
                borderBottom: "2px solid #f8f9fa",
                backgroundColor: "#f8f9fa",
                textAlign: "left",
                fontWeight: "bold",
              }}
            >
              Quantity
            </th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>

      {/* Pagination */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <button
          style={{
            padding: "8px 16px",
            border: "1px solid #6D28D9", // Apply custom border color
            backgroundColor: activePage === 1 ? "#ddd" : "#6D28D9", // Apply custom background color
            color: activePage === 1 ? "#999" : "#fff",
            borderRadius: "5px",
            cursor: activePage === 1 ? "not-allowed" : "pointer",
            marginRight: "10px",
          }}
          disabled={activePage === 1}
          onClick={() => setActivePage((prev) => Math.max(prev - 1, 1))}
        >
          Previous
        </button>

        <span style={{ fontSize: "16px", margin: "0 10px" }}>
          Page {activePage} of 3
        </span>

        <button
          style={{
            padding: "8px 16px",
            border: "1px solid #6D28D9", // Apply custom border color
            backgroundColor: activePage === 3 ? "#ddd" : "#6D28D9", // Apply custom background color
            color: activePage === 3 ? "#999" : "#fff",
            borderRadius: "5px",
            cursor: activePage === 3 ? "not-allowed" : "pointer",
            marginLeft: "10px",
          }}
          disabled={activePage === 3}
          onClick={() => setActivePage((prev) => Math.min(prev + 1, 3))}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default RequiredMedicine;
