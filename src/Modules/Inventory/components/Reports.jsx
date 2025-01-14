import React, { useState } from "react";
import {
  Table,
  Checkbox,
  Container,
  Group,
  Badge,
  Paper,
  Button,
  Text
} from "@mantine/core";

const data = [
  {
    product: "Computer",
    quantity: 50,
    missing: 0,
    department: "CSE",
    lastUpdated: "29-03-2024",
  },
  {
    product: "Peripherals",
    quantity: 50,
    missing: 0,
    department: "CSE",
    lastUpdated: "29-03-2024",
  },
  // ... rest of your data
];

export default function Reports() {
  const [selectedDepartment, setSelectedDepartment] = useState("CSE");
  const [checkedItems, setCheckedItems] = useState({});

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

  const filteredData = data.filter(item => item.department === selectedDepartment);

  const handleCheckboxChange = (product) => {
    setCheckedItems((prev) => ({
      ...prev,
      [product]: !prev[product],
    }));
  };

  return (
    <>
      {/* Breadcrumb */}
      <Text style={{ marginLeft: "70px", fontSize: "16px" }} color="dimmed">
        <span style={{ cursor: "pointer" }} onClick={() => setSelectedDepartment("")}>
          Reports
        </span>
        {" > "} <span>{selectedDepartment}</span>
      </Text>

      <Container style={{ marginTop: "20px", maxWidth: "1000px", padding: "20px" }}>
        <Text
          align="center"
          style={{
            fontSize: "26px",
            marginBottom: "20px",
            fontWeight: 600,
            color: "#228BE6",
          }}
        >
          {selectedDepartment} Reports
        </Text>

        {/* Stats Paper */}
        {/* <Paper
          shadow="xs"
          p="lg"
          style={{
            borderRadius: "12px",
            marginBottom: "20px",
            backgroundColor: "white",
          }}
        > */}
          {/* <Group position="apart" spacing="xl">
            <div>
              <Text style={{ fontSize: "20px", marginBottom: "8px" }}>
                Total Categories
              </Text>
              <Badge size="xl" color="blue">26</Badge>
            </div>
            <div>
              <Text style={{ fontSize: "20px", marginBottom: "8px" }}>
                Total Products
              </Text>
              <Badge size="xl" color="blue">1000</Badge>
            </div>
          </Group> */}
        {/* </Paper> */}

        {/* Department Buttons */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px", marginLeft:"70px" }}>
          <Group spacing="md">
            {departments.map((dept, index) => (
              <Button
                key={index}
                style={{
                  fontSize: "14px",
                  backgroundColor:
                    selectedDepartment === dept.value ? "#228BE6" : "white",
                  color: selectedDepartment === dept.value ? "white" : "black",
                  border: "1px solid #1366D9",
                }}
                onClick={() => setSelectedDepartment(dept.value)}
                size="md"
              >
                {dept.label}
              </Button>
            ))}
          </Group>
        </div>

        {/* Table Paper */}
        <Paper
          shadow="xs"
          p="lg"
          style={{ borderRadius: "12px", marginLeft: "81px", width: "800px" }}
        >
          <div style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover verticalSpacing="md">
              <thead>
                <tr>
                  <th style={{ fontSize: "20px", textAlign: "center" }}>Select</th>
                  <th style={{ fontSize: "20px", textAlign: "center" }}>Products</th>
                  <th style={{ fontSize: "20px", textAlign: "center" }}>Quantity</th>
                  <th style={{ fontSize: "20px", textAlign: "center" }}>Missing</th>
                  <th style={{ fontSize: "20px", textAlign: "center" }}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: "center" }}>
                      <Checkbox
                        checked={!!checkedItems[item.product]}
                        onChange={() => handleCheckboxChange(item.product)}
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>{item.product}</td>
                    <td style={{ textAlign: "center" }}>{item.quantity}</td>
                    <td style={{ textAlign: "center" }}>{item.missing}</td>
                    <td style={{ textAlign: "center" }}>{item.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Paper>
      </Container>
    </>
  );
}