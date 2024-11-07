import React, { useEffect, useState } from "react";
import { Table, Pagination, Select, Card, Title, Container, Button, Loader, Alert, TextInput } from "@mantine/core";
import { useSelector } from "react-redux";

function JobApplicationsTable() {
    const role = useSelector((state) => state.user.role);

    // Sample data for job applications
    const [applications, setApplications] = useState([
        {
            id: 1,
            name: "John Doe",
            rollno: "CS202401",
            email: "student1@example.com",
            cpi: 8.5,
            batch: "2024",
            branch: "CSE", // Computer Science
            status: "pending",
        },
        {
            id: 2,
            name: "Jane Smith",
            rollno: "ME202402",
            email: "student2@example.com",
            cpi: 7.9,
            batch: "2024",
            branch: "ME", // Mechanical Engineering
            status: "pending",
        },
        {
            id: 3,
            name: "Alice Johnson",
            rollno: "EE202303",
            email: "student3@example.com",
            cpi: 9.1,
            batch: "2023",
            branch: "EE", // Electrical Engineering
            status: "pending",
        },
        {
            id: 4,
            name: "Bob Brown",
            rollno: "CE202504",
            email: "student4@example.com",
            cpi: 8.0,
            batch: "2025",
            branch: "CE", // Civil Engineering
            status: "pending",
        },
        {
            id: 5,
            name: "Emily Davis",
            rollno: "EC202305",
            email: "student5@example.com",
            cpi: 8.8,
            batch: "2023",
            branch: "EC", // Electronics
            status: "pending",
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activePage, setActivePage] = useState(1);
    const recordsPerPage = 10;

    const paginatedApplications = applications.slice(
        (activePage - 1) * recordsPerPage,
        activePage * recordsPerPage
    );

    const handleStatusChange = (applicationId, status) => {
        console.log(`Application ${applicationId} updated to: ${status}`);
        // Update the status in the local state
        setApplications((prevApplications) =>
            prevApplications.map((application) =>
                application.id === applicationId ? { ...application, status } : application
            )
        );
    };

    if (loading) return <Loader />;
    if (error) return <Alert color="red">{error}</Alert>;

    return (
        <Container>
            <Card shadow="sm" padding="md" radius="md" withBorder>
                {/*  add job name to title */}
                <Title order={3} style={{ marginBottom: '12px' }}>Student Job Applications</Title>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', gap: '8px' }}>
                    <TextInput
                        placeholder="Search"
                        icon="🔍"
                        style={{ width: '180px', fontSize: '14px' }}
                    />
                </div>
                <Table highlightOnHover>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Roll No</th>
                            <th>Email</th>
                            <th>CPI</th>
                            <th>Batch</th>
                            <th>Branch</th>
                            <th>Status</th>
                            {/* <th>Action</th> */}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedApplications.map((application) => (
                            <tr key={application.id}>
                                <td>{application.name}</td>
                                <td>{application.rollno}</td>
                                <td>{application.email}</td>
                                <td>{application.cpi}</td>
                                <td>{application.batch}</td>
                                <td>{application.branch}</td>
                                <td>
                                    <Select
                                        data={[
                                            { value: 'accept', label: 'Accept' },
                                            { value: 'reject', label: 'Reject' },
                                        ]}
                                        placeholder="Select"
                                        value={application.status}
                                        onChange={(value) => handleStatusChange(application.id, value)}
                                    />
                                </td>
                                <td>
                                    {/* <Button variant="outline" color="blue" size="xs" onClick={() => console.log('Add next round details')}>
                    Add Next Round
                  </Button> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                <Pagination
                    total={Math.ceil(applications.length / recordsPerPage)}
                    page={activePage}
                    onChange={setActivePage}
                    style={{ marginTop: '12px' }}
                />
            </Card>
        </Container>
    );
}

export default JobApplicationsTable;
