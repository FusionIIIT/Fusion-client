import React from "react";
import { MantineProvider, Box } from "@mantine/core";
import ActiveBookingsTable from "../components/tables/ActiveBookingsTable";

/**
 * ActiveBookingsPage
 * Route-level component for active/confirmed bookings management
 */

function ActiveBookingsPage() {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      theme={{
        globalStyles: () => ({
          ".mantine-Table-root": {
            overflowX: "auto",
          },
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
        <ActiveBookingsTable />
      </Box>
    </MantineProvider>
  );
}

export default ActiveBookingsPage;
