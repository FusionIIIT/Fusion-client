// import React, { useState } from 'react';
// import {
//   TextInput,
//   Button,
//   Group,
//   Textarea,
//   Select,
//   Card,
//   DatePicker,
//   TimeInput,
//   Text,
// } from '@mantine/core';

// function AddPlacementEventForm() {
//   const [company, setCompany] = useState('');
//   const [date, setDate] = useState(null);
//   const [location, setLocation] = useState('');
//   const [ctc, setCtc] = useState('');
//   const [time, setTime] = useState('');
//   const [description, setDescription] = useState('');
//   const [roleOffered, setRoleOffered] = useState('');
//   const [placementType, setPlacementType] = useState('');

//   const handleSubmit = () => {
//     // Add logic to handle form submission
//     console.log({
//       company,
//       date,
//       location,
//       ctc,
//       time,
//       description,
//       roleOffered,
//       placementType,
//     });
//   };

//   return (
//     <Card shadow="sm" padding="lg" radius="md" style={{ marginTop: '20px' }}>
//       <Text weight={500} size="lg" style={{ marginBottom: '15px' }}>
//         Add a Placement Event
//       </Text>

//       <Group grow>
//         <TextInput
//           label="Company Name"
//           placeholder="Enter company name"
//           value={company}
//           onChange={(e) => setCompany(e.target.value)}
//         />
//         <DatePicker
//           label="Date (yyyy-mm-dd)"
//           value={date}
//           onChange={setDate}
//           placeholder="Select date"
//         />
//       </Group>

//       <Group grow>
//         <TextInput
//           label="Location"
//           placeholder="Enter location"
//           value={location}
//           onChange={(e) => setLocation(e.target.value)}
//         />
//         <TextInput
//           label="CTC In Lpa"
//           placeholder="Enter CTC"
//           value={ctc}
//           onChange={(e) => setCtc(e.target.value)}
//         />
//       </Group>

//       <Group grow>
//         <TimeInput
//           label="Time"
//           value={time}
//           onChange={setTime}
//           placeholder="HH:MM"
//         />
//         <Select
//           label="Placement Type"
//           placeholder="Select placement type"
//           data={['Placement', 'Internship']}
//           value={placementType}
//           onChange={setPlacementType}
//         />
//       </Group>

//       <Textarea
//         label="Description"
//         placeholder="Enter event description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         minRows={3}
//       />

//       <TextInput
//         label="Role Offered"
//         placeholder="Enter role offered"
//         value={roleOffered}
//         onChange={(e) => setRoleOffered(e.target.value)}
//       />

//       <Button onClick={handleSubmit} style={{ marginTop: '20px' }}>
//         Add Event
//       </Button>
//     </Card>
//   );
// }

// export default AddPlacementEventForm;
// import React, { useState } from "react";
// import { TextInput, Button, Group, Select, Textarea, Card, Title, Space } from "@mantine/core";
// import { DatePicker, TimeInput } from "@mantine/dates"; // Import from mantine dates

// function AddPlacementEventForm() {
//   const [company, setCompany] = useState("");
//   const [date, setDate] = useState(null);
//   const [location, setLocation] = useState("");
//   const [ctc, setCtc] = useState("");
//   const [time, setTime] = useState("");
//   const [placementType, setPlacementType] = useState("");
//   const [description, setDescription] = useState("");
//   const [role, setRole] = useState("");

//   const handleSubmit = () => {
//     // Add logic to handle form submission
//     console.log({
//       company,
//       date,
//       location,
//       ctc,
//       time,
//       placementType,
//       description,
//       role,
//     });
//   };

//   return (
//     <Card shadow="md" padding="lg" radius="md" withBorder style={{ maxWidth: '700px', margin: '0 auto' }}>
//       {/* Form title */}
//       <Title order={3} align="center" style={{ marginBottom: "20px" }}>
//         Add Placement Event
//       </Title>

//       {/* Company Name, Date, and Location in a row */}
//       <Group grow style={{ marginBottom: "20px" }}>
//         <TextInput
//           label="Company Name"
//           placeholder="Enter company name"
//           value={company}
//           onChange={(e) => setCompany(e.target.value)}
//         />
//         <DatePicker
//           label="Event Date"
//           placeholder="Pick event date"
//           value={date}
//           onChange={setDate}
//         />
//         <TextInput
//           label="Location"
//           placeholder="Enter location"
//           value={location}
//           onChange={(e) => setLocation(e.target.value)}
//         />
//       </Group>

//       {/* CTC, Time, and Placement Type in a row */}
//       <Group grow style={{ marginBottom: "20px" }}>
//         <TextInput
//           label="CTC (LPA)"
//           placeholder="Enter CTC"
//           value={ctc}
//           onChange={(e) => setCtc(e.target.value)}
//         />
//         <TimeInput
//           label="Event Time"
//           placeholder="Select event time"
//           value={time}
//           onChange={setTime}
//         />
//         <Select
//           label="Placement Type"
//           placeholder="Select type"
//           data={["Placement", "Internship"]}
//           value={placementType}
//           onChange={setPlacementType}
//         />
//       </Group>

//       {/* Role and Description */}
//       <TextInput
//         label="Role Offered"
//         placeholder="Enter the role offered"
//         value={role}
//         onChange={(e) => setRole(e.target.value)}
//         style={{ marginBottom: "20px" }}
//       />

//       <Textarea
//         label="Event Description"
//         placeholder="Enter event description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         style={{ marginBottom: "20px" }}
//         minRows={4}
//       />

//       {/* Submit button */}
//       <Group position="right" style={{ marginTop: "20px" }}>
//         <Button onClick={handleSubmit}>Add Event</Button>
//       </Group>
//     </Card>
//   );
// }

// export default AddPlacementEventForm;
// import React, { useState } from "react";
// import { TextInput, Button, Group, Select, Textarea, Card, Title, Grid, ActionIcon } from "@mantine/core";
// import { DatePicker, TimeInput } from "@mantine/dates";
// import { IconCalendar } from "@tabler/icons-react"; // Import the calendar icon

// function AddPlacementEventForm() {
//   const [company, setCompany] = useState("");
//   const [date, setDate] = useState(null);
//   const [location, setLocation] = useState("");
//   const [ctc, setCtc] = useState("");
//   const [time, setTime] = useState("");
//   const [placementType, setPlacementType] = useState("");
//   const [description, setDescription] = useState("");
//   const [role, setRole] = useState("");

//   const handleSubmit = () => {
//     // Add logic to handle form submission
//     console.log({
//       company,
//       date,
//       location,
//       ctc,
//       time,
//       placementType,
//       description,
//       role,
//     });
//   };

//   return (
//     <Card shadow="md" padding="lg" radius="md" withBorder style={{ maxWidth: '800px', margin: '0 auto' }}>
//       <Title order={3} align="center" style={{ marginBottom: "20px" }}>
//         Add Placement Event
//       </Title>

//       <Grid gutter="lg">
//         {/* First row: Company Name, Date, Location */}
//         <Grid.Col span={4}>
//           <TextInput
//             label="Company Name"
//             placeholder="Enter company name"
//             value={company}
//             onChange={(e) => setCompany(e.target.value)}
//           />
//         </Grid.Col>
//         <Grid.Col span={4} style={{ position: "relative" }}>
//           <TextInput
//             label="Date (yyyy-mm-dd)"
//             placeholder="Pick date"
//             value={date ? date.toLocaleDateString() : ""}
//             onFocus={() => setDate(new Date())} // Focus to show date
//             readOnly // Make the input read-only
//             rightSection={
//               <ActionIcon
//                 onClick={() => setDate(new Date())} // Open date picker on icon click
//               >
//                 <IconCalendar size={16} />
//               </ActionIcon>
//             }
//           />
//           <DatePicker
//             value={date}
//             onChange={setDate}
//             hidden // Hide the DatePicker input field
//           />
//         </Grid.Col>
//         <Grid.Col span={4}>
//           <TextInput
//             label="Location"
//             placeholder="Enter location"
//             value={location}
//             onChange={(e) => setLocation(e.target.value)}
//           />
//         </Grid.Col>

//         {/* Second row: CTC, Time, Placement Type */}
//         <Grid.Col span={4}>
//           <TextInput
//             label="CTC In Lpa"
//             placeholder="Enter CTC"
//             value={ctc}
//             onChange={(e) => setCtc(e.target.value)}
//           />
//         </Grid.Col>
//         <Grid.Col span={4}>
//           <TimeInput
//             label="Time"
//             placeholder="Select time"
//             value={time}
//             onChange={setTime}
//           />
//         </Grid.Col>
//         <Grid.Col span={4}>
//           <Select
//             label="Placement Type"
//             placeholder="Select placement type"
//             data={["Placement", "Internship"]}
//             value={placementType}
//             onChange={setPlacementType}
//           />
//         </Grid.Col>

//         {/* Third row: Description */}
//         <Grid.Col span={12}>
//           <Textarea
//             label="Description"
//             placeholder="Enter a description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             minRows={3}
//           />
//         </Grid.Col>

//         {/* Fourth row: Role Offered */}
//         <Grid.Col span={12}>
//           <TextInput
//             label="Role Offered"
//             placeholder="Enter the role offered"
//             value={role}
//             onChange={(e) => setRole(e.target.value)}
//           />
//         </Grid.Col>
//       </Grid>

//       {/* Submit button */}
//       <Group position="right" style={{ marginTop: "20px" }}>
//         <Button onClick={handleSubmit}>Add Event</Button>
//       </Group>
//     </Card>
//   );
// }

// export default AddPlacementEventForm;
import React, { useState } from "react";
import { TextInput, Button, Group, Select, Textarea, Card, Title, Grid, ActionIcon } from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { IconCalendar } from "@tabler/icons-react"; // Import the calendar icon

function AddPlacementEventForm() {
  const [company, setCompany] = useState("");
  const [date, setDate] = useState(null);
  const [location, setLocation] = useState("");
  const [ctc, setCtc] = useState("");
  const [time, setTime] = useState("");
  const [placementType, setPlacementType] = useState("");
  const [description, setDescription] = useState("");
  const [role, setRole] = useState("");
  const [datePickerOpened, setDatePickerOpened] = useState(false); // State to manage date picker visibility

  const handleSubmit = () => {
    console.log({
      company,
      date,
      location,
      ctc,
      time,
      placementType,
      description,
      role,
    });
  };

  return (
    <Card shadow="md" padding="lg" radius="md" withBorder style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Title order={3} align="center" style={{ marginBottom: "20px" }}>
        Add Placement Event
      </Title>

      <Grid gutter="lg">
        {/* First row: Company Name, Date, Location */}
        <Grid.Col span={4}>
          <TextInput
            label="Company Name"
            placeholder="Enter company name"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={4} style={{ position: "relative" }}>
          <TextInput
            label="Date (yyyy-mm-dd)"
            placeholder="Pick date"
            value={date ? date.toLocaleDateString() : ""}
            readOnly // Make the input read-only
            rightSection={
              <ActionIcon
                onClick={() => setDatePickerOpened((prev) => !prev)} // Toggle date picker visibility
              >
                <IconCalendar size={16} />
              </ActionIcon>
            }
          />
          {datePickerOpened && ( // Show date picker when state is true
            <DatePicker
              value={date}
              onChange={(selectedDate) => {
                setDate(selectedDate); // Set selected date
                setDatePickerOpened(false); // Close date picker
              }}
              onBlur={() => setDatePickerOpened(false)} // Close date picker on blur
              style={{ position: "absolute", zIndex: 1 }} // Adjust position
            />
          )}
        </Grid.Col>
        <Grid.Col span={4}>
          <TextInput
            label="Location"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Grid.Col>

        {/* Second row: CTC, Time, Placement Type */}
        <Grid.Col span={4}>
          <TextInput
            label="CTC In Lpa"
            placeholder="Enter CTC"
            value={ctc}
            onChange={(e) => setCtc(e.target.value)}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <TimeInput
            label="Time"
            placeholder="Select time"
            value={time}
            onChange={setTime}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          <Select
            label="Placement Type"
            placeholder="Select placement type"
            data={["Placement", "Internship"]}
            value={placementType}
            onChange={setPlacementType}
          />
        </Grid.Col>

        {/* Third row: Description */}
        <Grid.Col span={12}>
          <Textarea
            label="Description"
            placeholder="Enter a description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minRows={3}
          />
        </Grid.Col>

        {/* Fourth row: Role Offered */}
        <Grid.Col span={12}>
          <TextInput
            label="Role Offered"
            placeholder="Enter the role offered"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          />
        </Grid.Col>
      </Grid>

      {/* Submit button */}
      <Group position="right" style={{ marginTop: "20px" }}>
        <Button onClick={handleSubmit}>Add Event</Button>
      </Group>
    </Card>
  );
}

export default AddPlacementEventForm;
