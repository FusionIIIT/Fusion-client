import React from "react";
import { MantineProvider, Box } from "@mantine/core";
import PendingRequestsTable from "../components/tables/PendingRequestsTable";

/**
 * PendingBookingsPage
 * Route-level component for pending bookings management
 * 
 * Responsibilities:
 * - Assemble page-level components
 * - Handle page state
 * - Delegate to sub-components
 */

function PendingBookingsPage({ listMode = "queue" }) {
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
        <PendingRequestsTable listMode={listMode} />
      </Box>
    </MantineProvider>
  );
}

export default PendingBookingsPage;
