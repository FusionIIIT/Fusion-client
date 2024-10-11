import React from "react";
import { Text, Tabs } from "@mantine/core";
import AddPlacementRecordForm from "./components/AddPlacementRecordForm";
import PlacementRecordsTable from "./components/PlacementRecordsTable";
import AddPlacementEventForm from "./components/AddPlacementEventForm";
import { useSelector } from "react-redux";
import { Calendar } from "@mantine/dates";
import PlacementCalendar from "./components/PlacementCalendar";

const studentTabs = [
  { value: "schedule", label: "Placement Schedule" },
  { value: "stats", label: "Placement Stats" },
  { value: "download-cv", label: "Download CV" },
  { value: "placement-calendar", label: "Placement Calendar" },
];

const chairmanTabs = [
  { value: "schedule", label: "Placement Schedule" },
  { value: "stats", label: "Placement Stats" },
  { value: "placement-calendar", label: "Placement Calendar" },
];

const tpoTabs = [
  { value: "schedule", label: "Placement Schedule" },
  { value: "send-notifications", label: "Send Notifications" },
  { value: "stats", label: "Placement Stats" },
  { value: "add-record", label: "Add Placement Record" },
  { value: "placement-calendar", label: "Placement Calendar" },
];

const tabComponents = {
  student: {
    "schedule": <Text>Placement Schedule</Text>,
    stats: <PlacementRecordsTable />,
    "download-cv": <Text>Download your CV here.</Text>,
    "placement-calendar": <PlacementCalendar />, // Corrected spelling
  },
  chairman: {
    "schedule": <Text>Placement Schedule</Text>,
    stats: <PlacementRecordsTable />,
    "placement-calendar": <PlacementCalendar />, // Corrected spelling
  },
  tpo: {
    "schedule": <Text>Placement Schedule</Text>,
    "send-notifications": <Text>Send Notifications Here.</Text>,
    stats: <PlacementRecordsTable />,
    "add-record": <AddPlacementRecordForm />,
    "placement-calendar": <PlacementCalendar />, // Corrected spelling
  },
};

function PlacementCellPage() {
  const role = useSelector((state) => state.user.role);

  const tabs = role === "student" ? studentTabs
              : role === "placement chairman" ? chairmanTabs
              : role === "placement officer" ? tpoTabs
              : [];

  return (
    <div style={{ padding: "20px" }}>
      <Tabs variant="outline">
        <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {tabs.map((tab) => (
          <Tabs.Panel key={tab.value} value={tab.value} pt="xs">
            {tabComponents[role]?.[tab.value] || <Text>No content available.</Text>}
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}

export default PlacementCellPage;
