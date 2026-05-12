import React from "react";
import { MantineProvider, Box } from "@mantine/core";
import InventoryTable from "../components/tables/InventoryTable";
import InventoryForm from "../components/forms/InventoryForm";

/**
 * InventoryManagementPage
 * Route-level component for inventory management (VhIncharge only)
 */

function InventoryManagementPage() {
  const [refreshKey, setRefreshKey] = React.useState(0);

  const handleInventoryAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        globalStyles: () => ({
          "@media (max-width: 768px)": {
            ".mantine-Table-root": {
              fontSize: "14px",
            },
          },
        }),
      }}
    >
      <Box
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "16px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <InventoryForm onInventoryAdded={handleInventoryAdded} />
        <Box mt="xl">
          <InventoryTable key={refreshKey} />
        </Box>
      </Box>
    </MantineProvider>
  );
}

export default InventoryManagementPage;
