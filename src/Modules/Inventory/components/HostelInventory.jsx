import React, { useState, useEffect } from "react";
import { Table, Container, Group, Paper, Button, Text } from "@mantine/core";
import { useSelector } from 'react-redux';  // Make sure to import useSelector from redux
import AddProduct from "./AddProduct";
import TransferProduct from "./TransferProduct";

export default function HostelInventory() {
  const role = useSelector((state) => state.user.role);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showTransferProductModal, setShowTransferProductModal] = useState(false);

  let departments = [
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

  // Function to fetch department data based on the selected department
  const fetchDepartmentData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Please log in to view inventory");
      return;
    }

    setLoading(true); // Start loading when the request is sent

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/inventory/api/sections/?section=${selectedDepartment}`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch department data");
      }

      const data = await response.json();
      setInventoryData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching department data: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentData(); // Fetch data whenever the selected department changes
  }, [selectedDepartment]);

  const openAddProductModal = () => setShowAddProductModal(true);
  const closeAddProductModal = () => setShowAddProductModal(false);

  const openTransferProductModal = () => setShowTransferProductModal(true);
  const closeTransferProductModal = () => setShowTransferProductModal(false);

  // Render department label based on role
  const renderDepartmentLabel = () => {
    switch (role) {
      case "hall1caretaker":
        departments = [{ label: "H1", value: "H1" }]
        return "H1";
      case "hall3caretaker":
        departments = [{ label: "H3", value: "H3" }]
        return "H3";
      case "hall4caretaker":
        departments = [{ label: "H4", value: "H4" }]
        return "H4";
      case "phcaretaker":
        departments = [{ label: "Panini", value: "Panini" }]
        return "Panini";
      case "nhcaretaker":
        departments = [{ label: "Nagarjuna", value: "Nagarjuna" }]
        return "Nagarjuna";
      case "mshcaretaker":
        departments = [{ label: "Maa Saraswati", value: "Maa Saraswati" }]
        return "Maa Saraswati";
      case "rspc_admin":
        departments = [{ label: "RSPC", value: "RSPC" }]
        return "RSPC";
      case "SectionHead_IWD":
        departments = [{ label: "IWD", value: "IWD" }]
        return "IWD";
        case "mess_manager":
        departments = [{ label: "Mess", value: "Mess" }]
        return "Academic";
      case "acadadmin":
        departments = [{ label: "Academic", value: "Academic" }]
        return "Academic";
      case "VhCaretaker":
        departments = [{ label: "VH", value: "VH" }]
        return "VH";
      default:
        departments = [
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
        return "H1"; // Default fallback
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <Text style={{marginLeft:"70px", fontSize:"16px"}} color="dimmed">
        <span style={{ cursor: "pointer" }} onClick={() => setSelectedDepartment('')}>
          Sections
        </span>
        {" > "} <span>{renderDepartmentLabel()}</span>
      </Text>
      <Container
        style={{
          marginTop: "20px",
          maxWidth: "1400px",
          maxHeight: "1000px",
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <Text
          align="center"
          style={{
            fontSize: "26px",
            marginBottom: "20px",
            fontWeight: 600,
            color: "#228BE6",
          }}
        >
          {renderDepartmentLabel()} Inventory
        </Text>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
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

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
            gap: "10px",
          }}
        >
          <Button
            style={{ fontSize: "14px" }}
            variant="filled"
            color="blue"
            onClick={openTransferProductModal}
            size="md"
          >
            Transfer Item
          </Button>

          <Button
            style={{ fontSize: "14px" }}
            variant="filled"
            color="blue"
            size="md"
            onClick={openAddProductModal}
          >
            Add Product
          </Button>
        </div>

        <Paper
          shadow={false}
          p="lg"
          style={{
            borderRadius: "12px",
            marginLeft: "190px",
            backgroundColor: "transparent",
            boxShadow: "none",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover verticalSpacing="md">
              <thead>
                <tr>
                  <th style={{ fontSize: "24px", padding: "16px" }}>Item</th>
                  <th style={{ fontSize: "24px", padding: "16px" }}>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center" }}>
                      Loading data...
                    </td>
                  </tr>
                ) : (
                  inventoryData.map((item, index) => (
                    <tr key={index}>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          textAlign: "center",
                        }}
                      >
                        {item.item_name}
                      </td>
                      <td
                        style={{
                          padding: "16px",
                          fontSize: "14px",
                          textAlign: "center",
                        }}
                      >
                        {item.quantity}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Paper>

        {showAddProductModal && (
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
                overflow: "hidden",
              }}
              role="button"
              tabIndex={0}
              onClick={closeAddProductModal}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  closeAddProductModal();
                }
              }}
              aria-label="Close Add Item Modal Background"
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                maxWidth: "600px",
                backgroundColor: "#fff",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                zIndex: 1001,
                overflow: "hidden",
              }}
            >
              <button
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={closeAddProductModal}
                aria-label="Close Modal"
              >
                X
              </button>
              <div
                style={{
                  margin: "-80px 20px 20px 20px",
                  backgroundColor: "transparent",
                }}
              >
                <AddProduct
                  closeModal={closeAddProductModal}
                  selectedDepartment={selectedDepartment}
                  val="sections"
                  name="section_name"
                />
              </div>
            </div>
          </>
        )}

        {showTransferProductModal && (
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
                overflow: "hidden",
              }}
              role="button"
              tabIndex={0}
              onClick={closeTransferProductModal}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  closeTransferProductModal();
                }
              }}
              aria-label="Close Transfer Item Modal Background"
            />
            <div
              style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "80%",
                maxWidth: "600px",
                backgroundColor: "#fff",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                zIndex: 1001,
                overflow: "hidden",
              }}
            >
              <button
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: "transparent",
                  border: "none",
                  fontSize: "16px",
                  cursor: "pointer",
                }}
                onClick={closeTransferProductModal}
                aria-label="Close Modal"
              >
                X
              </button>
              <div
                style={{
                  margin: "-80px 20px 20px 20px",
                  backgroundColor: "transparent",
                }}
              >
                <TransferProduct
                  closeModal={closeTransferProductModal}
                  selectedDepartment={selectedDepartment}
                />
              </div>
            </div>
          </>
        )}
      </Container>
    </>
  );
}
