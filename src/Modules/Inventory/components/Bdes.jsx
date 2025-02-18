import React, { useState, useEffect } from "react";
import { Table, Container, Group, Paper, Button, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import AddProduct from "./AddProduct";
import TransferProduct from "./TransferProduct";
import RequestProduct from "./RequestProduct"; // Import RequestProduct
import "../styles/popupModal.css";
import { useSelector } from "react-redux";

export default function Inventory() {
  const role = useSelector((state) => state.user.role);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showTransferProductModal, setShowTransferProductModal] = useState(false);
  const [showRequestProductModal, setShowRequestProductModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const departments = [
    { label: "CSE", value: "CSE" },
    { label: "ECE", value: "ECE" },
    { label: "ME", value: "ME" },
    { label: "SM", value: "SM" },
    { label: "NS", value: "NS" },
    { label: "Design", value: "Design" },
  ];

  // Helper function to return the auto-assigned department based on role
  const getDepartmentLabel = () => {
    if (role === "deptadmin_cse") return "CSE";
    else if (role === "deptadmin_ece" || role === "Junior Technician") return "ECE";
    else if (role === "deptadmin_me") return "Mech";
    else if (role === "deptadmin_sm") return "SM";
    else if (role === "deptadmin_design") return "Design";
    else return "";
  };

  // Determine if the user has a default role (full UI) or not (auto‑assigned dept)
  const isDefaultRole = !(
    role === "deptadmin_cse" ||
    role === "deptadmin_ece" ||
    role === "Junior Technician" ||
    role === "deptadmin_me" ||
    role === "deptadmin_sm" ||
    role === "deptadmin_design"
  );

  // Auto-set the department for non-default roles if not already set
  useEffect(() => {
    if (!selectedDepartment && !isDefaultRole) {
      setSelectedDepartment(getDepartmentLabel());
    }
  }, [role, selectedDepartment, isDefaultRole]);

  const fetchDepartmentData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      alert("Please log in to add a product");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/inventory/api/departments/?department=${selectedDepartment}`,
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
      console.log("Department data:", data);
      setInventoryData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching department data:", error);
      setLoading(false);
    }
  };

  // Fetch data when selectedDepartment is set/changed
  useEffect(() => {
    if (selectedDepartment) {
      fetchDepartmentData();
    }
  }, [selectedDepartment]);

  // Modal open/close functions
  const openAddProductModal = () => setShowAddProductModal(true);
  const closeAddProductModal = () => setShowAddProductModal(false);

  const openTransferProductModal = () => setShowTransferProductModal(true);
  const closeTransferProductModal = () => setShowTransferProductModal(false);

  const openRequestProductModal = () => setShowRequestProductModal(true);
  const closeRequestProductModal = () => setShowRequestProductModal(false);

  const relevantColumns = ["Item", "Quantity"];

  return (
    <>
      {/* Breadcrumb */}
      <Text style={{ marginLeft: "70px", fontSize: "16px" }} color="dimmed">
        <span style={{ cursor: "pointer" }} onClick={() => setSelectedDepartment("")}>
          Departments
        </span>
        {" > "} <span>{selectedDepartment}</span>
      </Text>

      <Container
        style={{
          marginTop: "20px",
          maxWidth: "1000px",
          maxHeight: "1000px",
          padding: "20px",
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
          {selectedDepartment} Department Inventory
        </Text>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <Group spacing="md">
            {isDefaultRole ? (
              <>
                <Button
                  style={{ fontSize: "14px" }}
                  variant="filled"
                  color="blue"
                  onClick={openTransferProductModal}
                  size="md"
                >
                  Transfer Item
                </Button>
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
                <Button
                  style={{ fontSize: "14px" }}
                  variant="filled"
                  color="blue"
                  onClick={openAddProductModal}
                  size="md"
                >
                  Add Product
                </Button>
              </>
            ) : (
              <>
                {/* <Button
                  disabled
                  style={{
                    fontSize: "14px",
                    backgroundColor: "#228BE6",
                    color: "white",
                    border: "1px solid #1366D9",
                  }}
                  size="md"
                >
                  {getDepartmentLabel()} */}
                {/* </Button> */}
                <Button
                  style={{ fontSize: "14px" }}
                  variant="filled"
                  color="blue"
                  onClick={openRequestProductModal}
                  size="md"
                >
                  Request Product
                </Button>
              </>
            )}
          </Group>
        </div>

        <Paper
          shadow="xs"
          p="lg"
          style={{ borderRadius: "12px", marginLeft: "81px", width: "800px" }}
        >
          <div style={{ overflowX: "auto" }}>
            <Table striped highlightOnHover verticalSpacing="md">
              <thead>
                <tr>
                  {relevantColumns.map((col) => (
                    <th key={col} style={{ fontSize: "20px" }}>
                      {col.charAt(0).toUpperCase() + col.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={relevantColumns.length} style={{ textAlign: "center" }}>
                      Loading data...
                    </td>
                  </tr>
                ) : (
                  inventoryData.map((item, index) => (
                    <tr key={index}>
                      <td style={{ textAlign: "center" }}>{item.item_name}</td>
                      <td style={{ textAlign: "center" }}>{item.quantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Paper>

        {/* Add Product Modal */}
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
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && closeAddProductModal()}
              aria-label="Close Add Product Modal Background"
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
                  margin: "-80px 0 -65px 0",
                  height: "835px",
                  overflow: "hidden",
                }}
              >
                <AddProduct
                  onSuccess={closeAddProductModal}
                  selectedDepartment={selectedDepartment}
                  val="departments"
                  name="department_name"
                />
              </div>
            </div>
          </>
        )}

        {/* Transfer Product Modal */}
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
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && closeTransferProductModal()
              }
              aria-label="Close Transfer Product Modal Background"
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
                  margin: "-80px 0 -65px 0",
                  height: "835px",
                  overflow: "hidden",
                }}
              >
                <TransferProduct />
              </div>
            </div>
          </>
        )}

        {/* Request Product Modal (for non-default roles) */}
        {!isDefaultRole && showRequestProductModal && (
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
              onClick={closeRequestProductModal}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && closeRequestProductModal()
              }
              aria-label="Close Request Product Modal Background"
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
                onClick={closeRequestProductModal}
                aria-label="Close Modal"
              >
                X
              </button>

              <div style={{ margin: "20px" }}>
                <RequestProduct
                  closeModal={closeRequestProductModal}
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
