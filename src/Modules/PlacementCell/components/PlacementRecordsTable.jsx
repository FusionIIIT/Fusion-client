import React, { useEffect, useState } from "react";
import { Table, Pagination, TextInput, Select, Card, Title, Container, Button } from "@mantine/core";
import { statisticsRoute } from "../../../routes/placementCellRoutes";
import AddPlacementRecordForm from "./AddPlacementRecordForm";
import { useSelector } from "react-redux";


function PlacementRecordsTable() {

  const role = useSelector((state) => state.user.role);
  // fetch data 

  const [placementStats, setPlacementStats] = useState([]);
  const [modalOpened, setModalOpened] = useState(false);

  useEffect(() => {
    const fetchPlacementStats = async () => {
      try {
        const response = await fetch(statisticsRoute);
        console.log(response.status, "fetch placement statistics");
        console.log((response), "fetch placement statistics"
        )
        const data = await response.json();
        console.log(JSON.stringify(data));
        setPlacementStats(data);
      } catch (error) {
        console.error("Failed to fetch placement statistics:", error);
      }

    }
    fetchPlacementStats();
  }, []);

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
    <Container style={{ display: 'flex' }}>

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


      {role === 'placement officer' && ( // Check if the user is a placement officer
        <Button onClick={() => setModalOpened(true)}>Add Placement Record</Button>
      )}

      <AddPlacementRecordForm opened={modalOpened} onClose={() => setModalOpened(false)} />

    </Container>
  );
}

export default PlacementRecordsTable;
