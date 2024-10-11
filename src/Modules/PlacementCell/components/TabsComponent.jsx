import React from "react";
import { Tabs, Text } from "@mantine/core";
import AddPlacementRecordForm from "./AddPlacementRecordForm";
import PlacementRecordsTable from "./PlacementRecordsTable";

const TabsComponent = ({ actor }) => {
  const renderContent = (tabValue) => {
    switch (tabValue) {
      case "add-record":
        return <AddPlacementRecordForm />;
      case "stats":
        return <PlacementRecordsTable />;
      case "download-cv":
        return <Text>Download your CV here.</Text>;
      default:
        return null;
    }
  };

  const getTabs = () => {
    switch (actor) {
      case "TPO":
        return [
          { value: "schedule", label: "Placement Schedule" },
          { value: "send-notifications", label: "Send Notifications" },
          { value: "stats", label: "Placement Stats" },
          { value: "add-record", label: "Add Placement Record" },
        ];
      case "Chairman":
        return [
          { value: "schedule", label: "Placement Schedule" },
          { value: "stats", label: "Placement Stats" },
        ];
      case "student":
        return [
          { value: "schedule", label: "Placement Schedule" },
          { value: "stats", label: "Placement Stats" },
          { value: "download-cv", label: "Download CV" },
        ];
      default:
        return [];
    }
  };
  

  return (
    <Tabs defaultValue="schedule" variant="pills" >
      <Tabs.List>
        {getTabs().map((tab) => (
          <Tabs.Tab key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {getTabs().map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value} pt="xs">
          {renderContent(tab.value)}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
};

export default TabsComponent;
