/**
 * InventoryManagement
 * UC-VH-011: Main inventory management component with tabs
 * Combines InventoryTable and ReplenishmentRequestsTable
 */

import React, { useState } from "react";
import { Tabs, Box, Badge, Alert } from "@mantine/core";
import { useSelector } from "react-redux";
import InventoryTable from "./tables/InventoryTable";
import ReplenishmentRequestsTable from "./tables/ReplenishmentRequestsTable";

function InventoryManagement() {
  const [activeTab, setActiveTab] = useState("inventory");
  const role = useSelector((state) => state.user?.role);
  const isIncharge = role === "VhIncharge";
  const isStaff = role === "VhIncharge" || role === "VhCaretaker";

  if (!isStaff) {
    return (
      <Box p="md">
        <Alert color="orange">
          Access denied. Only VhIncharge and VhCaretaker can access inventory management.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p="md">
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="inventory">
            📦 Inventory Items
          </Tabs.Tab>
          {isIncharge && (
            <Tabs.Tab value="requests">
              🛒 Replenishment Requests
              <Badge size="xs" color="red" ml="xs">BR-VH-016</Badge>
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="inventory" pt="md">
          <InventoryTable />
        </Tabs.Panel>

        {isIncharge && (
          <Tabs.Panel value="requests" pt="md">
            <ReplenishmentRequestsTable />
          </Tabs.Panel>
        )}
      </Tabs>
    </Box>
  );
}

export default InventoryManagement;