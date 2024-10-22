import React from "react";
import { Tabs, Container } from "@mantine/core";
import NavCom from "../NavCom";
import AddMedicineForm from "./AddMedicine";
import AddStock from "./AddStock";
import EditThreshold from "./EditThreshold";
import ViewStock from "./ViewStock";
import ExpiredMedicine from "./ExpiredMedicine";
import RequiredMedicine from "./RequiredMedicine";

function ManageStock() {
  const tabsListStyle = {
    display: "flex",
    justifyContent: "center", // Keep the tabs centered
    borderBottom: "1px solid #6D28D9", // Maintain border color for the bottom
    maxWidth: "100%", // Adjust width of the Tabs list if necessary
    margin: "0 auto", // Center align the Tabs list
  };

  return (
    <Container size="xxl">
      <NavCom />
      <Tabs defaultValue="add-stock">
        <Tabs.List style={tabsListStyle}>
          <Tabs.Tab value="add-stock">Add Stock</Tabs.Tab>
          <Tabs.Tab value="add-medicine">Add Medicine</Tabs.Tab>
          <Tabs.Tab value="edit-threshold">Edit Threshold</Tabs.Tab>
          <Tabs.Tab value="expired-medicine">Expired Medicine</Tabs.Tab>
          <Tabs.Tab value="view-stock">View Stock</Tabs.Tab>
          <Tabs.Tab value="required-medicine">Required Medicine</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="add-stock">
          <AddStock />
        </Tabs.Panel>
        <Tabs.Panel value="add-medicine">
          <AddMedicineForm />
        </Tabs.Panel>
        <Tabs.Panel value="edit-threshold">
          <EditThreshold />
        </Tabs.Panel>
        <Tabs.Panel value="expired-medicine">
          <ExpiredMedicine />
        </Tabs.Panel>
        <Tabs.Panel value="view-stock">
          <ViewStock />
        </Tabs.Panel>
        <Tabs.Panel value="required-medicine">
          <RequiredMedicine />
        </Tabs.Panel>
      </Tabs>

      <style>{`
        .mantine-Tabs-tab[data-active] {
          border-bottom: 3px solid #6d28d9 !important; /* Purple underline for active tab */
        }
      `}</style>
    </Container>
  );
}

export default ManageStock;
