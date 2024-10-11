// import React from "react";
// import { Table } from "@mantine/core";

// function PlacementRecordsTable() {
//   const records = [
//     { studentName: "Jane Cooper", company: "Microsoft", batch: "2022", branch: "CSE", ctc: "48 LPA" },
//     { studentName: "Floyd Miles", company: "Yahoo", batch: "2022", branch: "ECE", ctc: "56 LPA" },
//     { studentName: "Ronald Richards", company: "Adobe", batch: "2022", branch: "CSE", ctc: "42 LPA" },
//     { studentName: "Marvin McKinney", company: "Tesla", batch: "2022", branch: "CSE", ctc: "44 LPA" },
//     { studentName: "Jerome Bell", company: "Google", batch: "2021", branch: "CSE", ctc: "32 LPA" },
//     { studentName: "Kathryn Murphy", company: "Microsoft", batch: "2021", branch: "ME", ctc: "12 LPA" },
//   ];

//   const rows = records.map((record) => (
//     <tr key={record.rollNo}>
//       <td>{record.studentName}</td>
//       <td>{record.company}</td>
//       <td>{record.batch}</td>
//       <td>{record.branch}</td>
//       <td>{record.ctc}</td>
//     </tr>
//   ));

//   return (
//     <Table highlightOnHover>
//       <thead>
//         <tr>
//           <th>Student Name</th>
//           <th>Company</th>
//           <th>Batch</th>
//           <th>Branch</th>
//           <th>CTC</th>
//         </tr>
//       </thead>
//       <tbody>{rows}</tbody>
//     </Table>
//   );
// }

// export default PlacementRecordsTable;
// import React, { useState } from "react";
// import { Table, Pagination, TextInput, Select, Card, Title } from "@mantine/core";

// function PlacementRecordsTable() {
//   // Sample data for the table
//   const records = [
//     { studentName: "Jane Cooper", company: "Microsoft", batch: "2022", branch: "CSE", ctc: "48 LPA" },
//     { studentName: "Floyd Miles", company: "Yahoo", batch: "2022", branch: "ECE", ctc: "56 LPA" },
//     { studentName: "Ronald Richards", company: "Adobe", batch: "2022", branch: "CSE", ctc: "42 LPA" },
//     { studentName: "Marvin McKinney", company: "Tesla", batch: "2022", branch: "CSE", ctc: "44 LPA" },
//     { studentName: "Jerome Bell", company: "Google", batch: "2021", branch: "CSE", ctc: "32 LPA" },
//     { studentName: "Kathryn Murphy", company: "Microsoft", batch: "2021", branch: "ME", ctc: "12 LPA" },
//     { studentName: "Jacob Jones", company: "Yahoo", batch: "2019", branch: "SM", ctc: "52 LPA" },
//     { studentName: "Kristin Watson", company: "Facebook", batch: "2019", branch: "ME", ctc: "32 LPA" },
//     // Add more records as needed
//   ];

//   const [activePage, setActivePage] = useState(1);
//   const recordsPerPage = 5; // Set the number of rows per page

//   // Pagination logic to display rows based on the current page
//   const paginatedRecords = records.slice(
//     (activePage - 1) * recordsPerPage,
//     activePage * recordsPerPage
//   );

//   const rows = paginatedRecords.map((record, index) => (
//     <tr key={index}>
//       <td style={{ padding: '4px', whiteSpace: 'nowrap' }}>{record.studentName}</td>
//       <td style={{ padding: '4px', whiteSpace: 'nowrap' }}>{record.company}</td>
//       <td style={{ padding: '4px', whiteSpace: 'nowrap' }}>{record.batch}</td>
//       <td style={{ padding: '4px', whiteSpace: 'nowrap' }}>{record.branch}</td>
//       <td style={{ padding: '4px', whiteSpace: 'nowrap' }}>{record.ctc}</td>
//     </tr>
//   ));

//   return (
//     <Card shadow="sm" padding="lg" radius="md" withBorder>
//       {/* Title */}
//       <Title order={2} style={{ marginBottom: '16px' }}>All Students</Title>

//       {/* Table Search and Sorting Options */}
//       <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '10px' }}>
//         <TextInput 
//           placeholder="Search" 
//           icon="🔍" 
//           style={{ width: '200px' }} 
//         />
//         <Select
//           placeholder="Sort by"
//           data={[
//             { value: 'newest', label: 'Newest' },
//             { value: 'highest_ctc', label: 'Highest CTC' },
//             { value: 'lowest_ctc', label: 'Lowest CTC' },
//           ]}
//           style={{ width: '200px' }} 
//         />
//       </div>

//       {/* Placement Records Table */}
//       <Table
//         highlightOnHover
//         style={{
//           tableLayout: 'fixed',
//           width: '50%',
//           borderSpacing: '0px 0px', // Controls space between rows and columns
//         }}
//       >
//         <thead>
//           <tr>
//             <th style={{ width: '18%' }}>Student Name</th>
//             <th style={{ width: '18%' }}>Company</th>
//             <th style={{ width: '12%' }}>Batch</th>
//             <th style={{ width: '12%' }}>Branch</th>
//             <th style={{ width: '12%' }}>CTC</th>
//           </tr>
//         </thead>
//         <tbody>{rows}</tbody>
//       </Table>

//       {/* Pagination */}
//       <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
//         <Pagination
//           total={Math.ceil(records.length / recordsPerPage)}
//           page={activePage}
//           onChange={setActivePage}
//         />
//       </div>
//     </Card>
//   );
// }

// export default PlacementRecordsTable;
import React, { useState } from "react";
import { Table, Pagination, TextInput, Select, Card, Title } from "@mantine/core";

function PlacementRecordsTable() {
  // Sample data for the table
  const records = [
    { studentName: "Jane Cooper", company: "Microsoft", batch: "2022", branch: "CSE", ctc: "48 LPA" },
    { studentName: "Floyd Miles", company: "Yahoo", batch: "2022", branch: "ECE", ctc: "56 LPA" },
    { studentName: "Ronald Richards", company: "Adobe", batch: "2022", branch: "CSE", ctc: "42 LPA" },
    { studentName: "Marvin McKinney", company: "Tesla", batch: "2022", branch: "CSE", ctc: "44 LPA" },
    { studentName: "Jerome Bell", company: "Google", batch: "2021", branch: "CSE", ctc: "32 LPA" },
    { studentName: "Kathryn Murphy", company: "Microsoft", batch: "2021", branch: "ME", ctc: "12 LPA" },
    { studentName: "Jacob Jones", company: "Yahoo", batch: "2019", branch: "SM", ctc: "52 LPA" },
    { studentName: "Kristin Watson", company: "Facebook", batch: "2019", branch: "ME", ctc: "32 LPA" },
    { studentName: "Jane Cooper", company: "Microsoft", batch: "2022", branch: "CSE", ctc: "48 LPA" },
    { studentName: "Floyd Miles", company: "Yahoo", batch: "2022", branch: "ECE", ctc: "56 LPA" },
    { studentName: "Ronald Richards", company: "Adobe", batch: "2022", branch: "CSE", ctc: "42 LPA" },
    { studentName: "Marvin McKinney", company: "Tesla", batch: "2022", branch: "CSE", ctc: "44 LPA" },
    { studentName: "Jerome Bell", company: "Google", batch: "2021", branch: "CSE", ctc: "32 LPA" },
    { studentName: "Kathryn Murphy", company: "Microsoft", batch: "2021", branch: "ME", ctc: "12 LPA" },
    { studentName: "Jacob Jones", company: "Yahoo", batch: "2019", branch: "SM", ctc: "52 LPA" },
    { studentName: "Kristin Watson", company: "Facebook", batch: "2019", branch: "ME", ctc: "32 LPA" },
    { studentName: "Jane Cooper", company: "Microsoft", batch: "2022", branch: "CSE", ctc: "48 LPA" },
    { studentName: "Floyd Miles", company: "Yahoo", batch: "2022", branch: "ECE", ctc: "56 LPA" },
    { studentName: "Ronald Richards", company: "Adobe", batch: "2022", branch: "CSE", ctc: "42 LPA" },
    { studentName: "Marvin McKinney", company: "Tesla", batch: "2022", branch: "CSE", ctc: "44 LPA" },
    { studentName: "Jerome Bell", company: "Google", batch: "2021", branch: "CSE", ctc: "32 LPA" },
    { studentName: "Kathryn Murphy", company: "Microsoft", batch: "2021", branch: "ME", ctc: "12 LPA" },
    { studentName: "Jacob Jones", company: "Yahoo", batch: "2019", branch: "SM", ctc: "52 LPA" },
    { studentName: "Kristin Watson", company: "Facebook", batch: "2019", branch: "ME", ctc: "32 LPA" },
    // Add more records as needed
  ];

  const [activePage, setActivePage] = useState(1);
  const recordsPerPage = 10; // Set the number of rows per page

  // Pagination logic to display rows based on the current page
  const paginatedRecords = records.slice(
    (activePage - 1) * recordsPerPage,
    activePage * recordsPerPage
  );

  const rows = paginatedRecords.map((record, index) => (
    <tr key={index}>
      <td style={{ padding: '4px', whiteSpace: 'nowrap' }}>{record.studentName}</td>
      <td style={{ padding: '4px', whiteSpace: 'nowrap' }}>{record.company}</td>
      <td style={{ padding: '4px', whiteSpace: 'nowrap' }}>{record.batch}</td>
      <td style={{ padding: '4px', whiteSpace: 'nowrap' }}>{record.branch}</td>
      <td style={{ padding: '4px', whiteSpace: 'nowrap' }}>{record.ctc}</td>
    </tr>
  ));

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder style={{ width: '900px' }}>
      {/* Title */}
      <Title order={3} style={{ marginBottom: '12px', fontSize: '18px' }}>All Students</Title>

      {/* Table Search and Sorting Options */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', gap: '8px' }}>
        <TextInput 
          placeholder="Search" 
          icon="🔍" 
          style={{ width: '180px', fontSize: '14px' }} 
        />
        <Select
          placeholder="Sort by"
          data={[
            { value: 'newest', label: 'Newest' },
            { value: 'highest_ctc', label: 'Highest CTC' },
            { value: 'lowest_ctc', label: 'Lowest CTC' },
          ]}
          style={{ width: '180px', fontSize: '14px' }} 
        />
      </div>

      {/* Placement Records Table */}
      <Table
        highlightOnHover
        style={{
          tableLayout: 'fixed',
          width: '100%',
          borderSpacing: '0px 0px', // Controls space between rows and columns
        }}
      >
        <thead>
          <tr>
            <th style={{ width: '30%' }}>Student Name</th>
            <th style={{ width: '30%' }}>Company</th>
            <th style={{ width: '12%' }}>Batch</th>
            <th style={{ width: '12%' }}>Branch</th>
            <th style={{ width: '12%' }}>CTC</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
        <Pagination
          total={Math.ceil(records.length / recordsPerPage)}
          page={activePage}
          onChange={setActivePage}
        />
      </div>
    </Card>
  );
}

export default PlacementRecordsTable;
