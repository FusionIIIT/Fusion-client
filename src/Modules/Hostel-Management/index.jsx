import React from "react";
import { useMantineTheme } from "@mantine/core";
import SideNotifications from "./components/all-actors/SideNotifications";
import SectionNavigationStudent from "./components/SectionNavigationStudent";
import SectionNavigationAdmin from "./components/SectionNavigationAdmin";
import SectionNavigationWarden from "./components/SectionNavigationWarden";

function HostelPage() {
  const theme = useMantineTheme();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "90vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 7.5,
          marginRight: theme.spacing.md,
          height: "100%",
          overflow: "hidden",
        }}
      >
        <SectionNavigationWarden />
      </div>
      <div style={{ flex: 2.5, height: "100%", overflow: "hidden" }}>
        <SideNotifications />
      </div>
    </div>
  );
}

export default HostelPage;
