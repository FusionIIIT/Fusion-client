import React, { useEffect, useState } from "react";
import { Card, Title, Container, Loader, Alert, Select } from "@mantine/core";
import { MantineReactTable } from "mantine-react-table";
import { useLocation } from "react-router-dom";
import axios from "axios";

function JobApplicationsTable() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const jobId = searchParams.get("jobId");

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchAppliedStudents = async () => {
      const token = localStorage.getItem("authToken");

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/placement/api/student-applications/${jobId}/`,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.status === 200) {
          setApplications(response.data.students);
        } else {
          setError("Failed to fetch data");
        }
      } catch (error) {
        setError("Error fetching applications");
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedStudents();
  }, [jobId]);

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "roll_no", header: "Roll No" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "cpi", header: "CPI" },
    {
      accessorKey: "status",
      header: "Status",
      Cell: ({ row }) => (
        <Select
          data={[
            { value: "accept", label: "Accept" },
            { value: "reject", label: "Reject" },
          ]}
          placeholder="Select"
          value={row.original.status}
          onChange={(value) => handleStatusChange(row.original.id, value)}
        />
      ),
    },
  ];

  const paginatedApplications = applications.slice(
    (activePage - 1) * recordsPerPage,
    activePage * recordsPerPage,
  );

  const handleStatusChange = (applicationId, status) => {
    setApplications((prevApplications) =>
      prevApplications.map((application) =>
        application.id === applicationId
          ? { ...application, status }
          : application,
      ),
    );
  };

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <Container fluid>
      <Card padding="md" radius="md">
        <Title order={3} style={{ marginBottom: "12px" }}>
          Student Job Applications
        </Title>
        <MantineReactTable
          columns={columns}
          data={paginatedApplications}
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
    </Container>
  );
}

export default JobApplicationsTable;
