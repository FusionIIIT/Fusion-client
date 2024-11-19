import React, { useState } from "react";
import { Paper, Table, Title } from "@mantine/core";
import NavCom from "../NavCom";
import ManageStock from "./ManageStocksNav";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";

function ViewStock() {
  const [searchTerm, setSearchTerm] = useState("");

  const data = [
    {
      medicine: "Dolo 650 Tablet",
      supplier: "MedPlus",
      expiryDate: "Oct. 23, 2024",
      quantity: 30,
    },
    {
      medicine: "Aspirin 300mg Tablet",
      supplier: "CarePlus",
      expiryDate: "Oct. 31, 2024",
      quantity: 500,
    },
    {
      medicine: "Paracetamol",
      supplier: "HealthPharma",
      expiryDate: "Nov. 03, 2024",
      quantity: 50,
    },
    {
      medicine: "Amoxicillin 500mg Capsule",
      supplier: "MedPlus",
      expiryDate: "Dec. 15, 2024",
      quantity: 200,
    },
    {
      medicine: "Ciprofloxacin 250mg Tablet",
      supplier: "Apollo",
      expiryDate: "Jan. 20, 2025",
      quantity: 150,
    },
    {
      medicine: "Ibuprofen 400mg Tablet",
      supplier: "HealthPharma",
      expiryDate: "Feb. 5, 2025",
      quantity: 350,
    },
    {
      medicine: "Metformin 500mg Tablet",
      supplier: "WellnessStore",
      expiryDate: "Mar. 30, 2025",
      quantity: 500,
    },
    {
      medicine: "Omeprazole 20mg Capsule",
      supplier: "CarePlus",
      expiryDate: "Apr. 12, 2025",
      quantity: 300,
    },

    // Add more entries as needed
  ];

  const rows = data
    .filter((item) =>
      item.medicine.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .map((item, index) => (
      <tr key={index}>
        <td style={{ textAlign: "center" }}>{item.medicine}</td>
        <td style={{ textAlign: "center" }}>{item.supplier}</td>
        <td style={{ textAlign: "center" }}>{item.expiryDate}</td>
        <td style={{ textAlign: "center" }}>{item.quantity}</td>
      </tr>
    ));

  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <ManageStock />
      <br />
      <Paper shadow="xl" p="xl" withBorder>
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
              backgroundColor: "#15ABFF",
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

        {/* Styled Table */}
        <Paper shadow="xl" p="xl" withBorder>
          <Title
            order={5}
            style={{
              textAlign: "center",
              margin: "0 auto",
              color: "#15abff",
            }}
          >
            Stocks
          </Title>
          <br />
          <Table
            withTableBorder
            withColumnBorders
            highlightOnHover
            striped
            horizontalSpacing="md"
            verticalSpacing="sm"
            style={{ overflowX: "auto" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#E0F2FE", textAlign: "center" }}>
                <th>Medicine</th>
                <th>Supplier</th>
                <th>Expiry Date</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </Paper>
      </Paper>
    </>
  );
}

export default ViewStock;
