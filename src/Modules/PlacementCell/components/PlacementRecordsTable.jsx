import React, { useEffect, useState } from "react";
import { Card, Title, Container, Button, Loader, Alert } from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";
import AddPlacementRecordForm from "./AddPlacementRecordForm";
import { useSelector } from "react-redux";

function PlacementRecordsTable() {
  const role = useSelector((state) => state.user.role);

  const [placementStats, setPlacementStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchPlacementStats = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/placement/api/statistics/",
        );
        if (response.ok) {
          const data = await response.json();
          setPlacementStats(data);
        } else {
          setError(`Error fetching data: ${response.status}`);
        }
      } catch (error) {
        setError("Failed to fetch placement statistics");
      } finally {
        setLoading(false);
      }
    };
    fetchPlacementStats();
  }, []);

  const columns = [
    { accessorKey: "first_name", header: "Student Name" },
    { accessorKey: "placement_name", header: "Company" },
    { accessorKey: "batch", header: "Batch" },
    { accessorKey: "branch", header: "Branch" },
    { accessorKey: "ctc", header: "CTC" },
  ];

  const paginatedRecords = placementStats.slice(
    (activePage - 1) * recordsPerPage,
    activePage * recordsPerPage,
  );

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <Container fluid>
      <Container
        fluid
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        my={16}
      >
        <Title order={2}>Placement Statistics</Title>

        {role === "placement officer" && (
          <Button onClick={() => setModalOpened(true)}>
            Add Placement Record
          </Button>
        )}
      </Container>

      <Card padding="md" radius="md" style={{ width: "100%" }}>
        <Title order={3} style={{ marginBottom: "12px", fontSize: "18px" }}>
          All Students
        </Title>

        <MantineReactTable
          columns={columns}
          data={paginatedRecords}
          enableColumnActions={false}
          enableColumnFilters={true}
          enablePagination={true}
          enableSorting={true}
          mantineTableProps={{
            highlightOnHover: false,
            striped: "odd",
            withColumnBorders: true,
            withRowBorders: true,
            withTableBorder: false,
          }}
        />
      </Card>

      <AddPlacementRecordForm
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />
    </Container>
  );
}

export default PlacementRecordsTable;
