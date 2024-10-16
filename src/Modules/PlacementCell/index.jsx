import React from "react";
import { Text, Tabs, Container } from "@mantine/core";
import AddPlacementRecordForm from "./components/AddPlacementRecordForm";
import PlacementRecordsTable from "./components/PlacementRecordsTable";
import { useSelector } from "react-redux";
import PlacementCalendar from "./components/PlacementCalendar";
import PlacementSchedule from "./components/PlacementSchedule";

const studentTabs = [
  { value: "schedule", label: "Placement Schedule", component: <PlacementSchedule /> },
  { value: "stats", label: "Placement Stats", component: <PlacementRecordsTable /> },
  { value: "download-cv", label: "Download CV", component: <Text>Download your CV here.</Text> },
  { value: "placement-calendar", label: "Placement Calendar", component: <PlacementCalendar /> },
];

const chairmanTabs = [
  { value: "schedule", label: "Placement Schedule", component: <PlacementSchedule /> },
  { value: "stats", label: "Placement Stats", component: <PlacementRecordsTable /> },
  { value: "placement-calendar", label: "Placement Calendar", component: <PlacementCalendar /> },
];

const tpoTabs = [
  { value: "schedule", label: "Placement Schedule", component: <PlacementSchedule /> },
  { value: "send-notifications", label: "Send Notifications", component: <Text>Send Notifications Here.</Text> },
  { value: "stats", label: "Placement Stats", component: <PlacementRecordsTable /> },
  { value: "add-record", label: "Add Placement Record", component: <AddPlacementRecordForm /> },
  { value: "placement-calendar", label: "Placement Calendar", component: <PlacementCalendar /> },
];

function PlacementCellPage() {
  const role = useSelector((state) => state.user.role);

  const tabs = role === "student" ? studentTabs
    : role === "placement chairman" ? chairmanTabs
      : role === "placement officer" ? tpoTabs
        : [];

  return (
    <div style={{ padding: "20px" }}>
      <Tabs defaultValue="tab1" variant="outline">
             <Tabs.List>
          {tabs.map((tab) => (
            <Tabs.Tab key={tab.value} value={tab.value}>
              {tab.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {tabs.map((tab) => (

          <Tabs.Panel key={tab.value} value={tab.value} >

            {tab.component || <Text>No content available.</Text>}

          </Tabs.Panel>
        ))}


      </Tabs>

    </div>

  );
}

export default PlacementCellPage;
