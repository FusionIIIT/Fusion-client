// import { Text } from "@mantine/core";
// import SampleComponent from "./components/SampleCompoenet";

// function PlacementCellPage() {
//   return (
//     <>
//       <Text>Placement Cell Page</Text>
//       <SampleComponent />

//     </>
//   );
// }

// export default PlacementCellPage;
// import React from "react";
// import { Text, Tabs } from "@mantine/core";
// import AddPlacementRecordForm from "./components/AddPlacementRecordForm";
// import PlacementRecordsTable from "./components/PlacementRecordsTable";
// import AddPlacementEventForm from "./components/AddPlacementEventForm";

// function PlacementCellPage() {
//   return (
//     <div style={{ padding: "20px" }}>
//       <Text weight={700} size="xl">Placement Cell</Text>

//       <Tabs defaultValue="add-record" variant="outline">
//         <Tabs.List>
//           <Tabs.Tab value="schedule">Add Placement Schedule</Tabs.Tab>
//           <Tabs.Tab value="notifications">Send Notifications</Tabs.Tab>
//           <Tabs.Tab value="stats">Placement Stats</Tabs.Tab>
//           <Tabs.Tab value="add-record">Add Placement Record</Tabs.Tab>
//         </Tabs.List>

//         <Tabs.Panel value="add-record" pt="xs">
//           <AddPlacementRecordForm />
//         </Tabs.Panel>

//         <Tabs.Panel value="stats" pt="xs">
//           <PlacementRecordsTable />
//         </Tabs.Panel>

//         <Tabs.Panel value="schedule" pt="xs">
//           <h1>hi</h1>
//           <AddPlacementEventForm />
//         </Tabs.Panel>
//       </Tabs>
//     </div>
//   );
// }

// export default PlacementCellPage;
import React from "react";
import { Text, Tabs } from "@mantine/core";
import AddPlacementRecordForm from "./components/AddPlacementRecordForm";
import PlacementRecordsTable from "./components/PlacementRecordsTable";
import AddPlacementEventForm from "./components/AddPlacementEventForm";

function PlacementCellPage() {
  return (
    <div style={{ padding: "20px" }}>
      <Text weight={700} size="xl">Placement Cell</Text>

      <Tabs defaultValue="add-record" variant="outline">
        <Tabs.List>
          <Tabs.Tab value="schedule">Add Placement Schedule</Tabs.Tab>
          <Tabs.Tab value="notifications">Send Notifications</Tabs.Tab>
          <Tabs.Tab value="stats">Placement Stats</Tabs.Tab>
          <Tabs.Tab value="add-record">Add Placement Record</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="schedule" pt="xs">
          <AddPlacementEventForm />
        </Tabs.Panel>

        <Tabs.Panel value="notifications" pt="xs">
          <h1>Send Notifications Section</h1>
          {/* Implement your Send Notifications functionality here */}
        </Tabs.Panel>

        <Tabs.Panel value="stats" pt="xs">
          <PlacementRecordsTable />
        </Tabs.Panel>

        <Tabs.Panel value="add-record" pt="xs">
          <AddPlacementRecordForm />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}

export default PlacementCellPage;

// import React from "react";
// import { Text } from "@mantine/core";
// import Timeline from "./components/Timeline"; // Import your Timeline component
// import NextRoundInfo from "./components/NextRoundInfo"; // Import the NextRoundInfo component

// function PlacementCellPage() {
//   return (
//     <div style={{ padding: "20px" }}>
//       {/* Placement Cell Title */}
//       <Text weight={700} size="xl" style={{ marginBottom: "20px" }}>
//         Placement Cell
//       </Text>

//       {/* Flex container to place Timeline and NextRoundInfo side by side */}
//       <div style={{ display: 'flex' }}>
        
//         {/* Timeline Component (left side) */}
//         <div style={{ flex: 1, marginRight: '20px' }}>
//           <Timeline />
//         </div>

//         {/* Next Round Information Component (right side) */}
//         <div style={{ flex: 2 }}>
//           <NextRoundInfo />
//         </div>
        
//       </div>
//     </div>
//   );
// }

// export default PlacementCellPage;



