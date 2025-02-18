import React, { useState, useEffect } from "react";
import { Table, Button, ScrollArea, Select, Group } from "@mantine/core";
import { useSelector } from "react-redux";
import AddProduct from "./AddProduct";
import TransferProduct from "./TransferProduct";

export default function HostelInventory() {
  const role = useSelector((state) => state.user.role);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showTransferProductModal, setShowTransferProductModal] =
    useState(false);

  // Initial department list (this may change based on role)
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

  // Customize departments and department label based on the user's role
  const renderDepartmentLabel = () => {
    switch (role) {
      case "hall1caretaker":
        departments = [{ label: "H1", value: "H1" }];
        return "H1";
      case "hall3caretaker":
        departments = [{ label: "H3", value: "H3" }];
        return "H3";
      case "hall4caretaker":
        departments = [{ label: "H4", value: "H4" }];
        return "H4";
      case "phcaretaker":
        departments = [{ label: "Panini", value: "Panini" }];
        return "Panini";
      case "nhcaretaker":
        departments = [{ label: "Nagarjuna", value: "Nagarjuna" }];
        return "Nagarjuna";
      case "mshcaretaker":
        departments = [{ label: "Maa Saraswati", value: "Maa Saraswati" }];
        return "Maa Saraswati";
      case "rspc_admin":
        departments = [{ label: "RSPC", value: "RSPC" }];
        return "RSPC";
      case "SectionHead_IWD":
        departments = [{ label: "IWD", value: "IWD" }];
        return "IWD";
      case "mess_manager":
        departments = [{ label: "Mess", value: "Mess" }];
        return "Academic";
      case "acadadmin":
        departments = [{ label: "Academic", value: "Academic" }];
        return "Academic";
      case "VhCaretaker":
        departments = [{ label: "VH", value: "VH" }];
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
        return "H1";
    }
  };

  // Fetch data based on the selected department
  const fetchDepartmentData = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please log in to view inventory");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/inventory/api/sections/?section=${selectedDepartment}`,
        {
          method: "GET",
          headers: {
            Authorization: `Token ${token}`,
          },
        },
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
    fetchDepartmentData();
  }, [selectedDepartment]);

  const openAddProductModal = () => setShowAddProductModal(true);
  const closeAddProductModal = () => setShowAddProductModal(false);
  const openTransferProductModal = () => setShowTransferProductModal(true);
  const closeTransferProductModal = () => setShowTransferProductModal(false);

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
        {renderDepartmentLabel()} Inventory
      </h2>

      {/* Department dropdown for selection */}
      <Select
        placeholder="Select Department"
        data={departments.map((dept) => ({
          value: dept.value,
          label: dept.label,
        }))}
        value={selectedDepartment}
        onChange={setSelectedDepartment}
        style={{ marginBottom: "20px", width: "80%" }}
      />

      {/* Action Buttons */}
      <Group
        position="center"
        style={{
          marginBottom: "20px",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Button
          variant="filled"
          color="blue"
          onClick={openTransferProductModal}
        >
          Transfer Item
        </Button>
        <Button variant="filled" color="blue" onClick={openAddProductModal}>
          Add Product
        </Button>
      </Group>

      {/* Responsive Table */}
      <ScrollArea style={{ width: "80%" }}>
        <Table
          style={{
            width: "100%",
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
              <th style={{ padding: "15px", border: "1px solid #ddd" }}>
                Item
              </th>
              <th style={{ padding: "15px", border: "1px solid #ddd" }}>
                Quantity
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={2}
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    fontSize: "16px",
                    color: "#666",
                  }}
                >
                  Loading data...
                </td>
              </tr>
            ) : (
              inventoryData.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid #ddd",
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                  }}
                >
                  <td
                    style={{
                      padding: "15px",
                      border: "1px solid #ddd",
                      textAlign: "center",
                    }}
                  >
                    {item.item_name}
                  </td>
                  <td
                    style={{
                      padding: "15px",
                      border: "1px solid #ddd",
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
      </ScrollArea>

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
            }}
            role="button"
            tabIndex={0}
            onClick={closeAddProductModal}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") closeAddProductModal();
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
            <div style={{ margin: "20px" }}>
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
            }}
            role="button"
            tabIndex={0}
            onClick={closeTransferProductModal}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                closeTransferProductModal();
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
            <div style={{ margin: "20px" }}>
              <TransferProduct
                closeModal={closeTransferProductModal}
                selectedDepartment={selectedDepartment}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
