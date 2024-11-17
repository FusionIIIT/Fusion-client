import React, { useEffect, useState } from "react";
import { Table, Pagination, Select, Card, Title, Container, Button, Loader, Alert, TextInput } from "@mantine/core";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import axios from "axios";  // Correctly import Axios

function JobApplicationsTable() {
    const role = useSelector((state) => state.user.role);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const jobId = searchParams.get("jobId");

    // Sample data for job applications
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activePage, setActivePage] = useState(1);
    const recordsPerPage = 10;

    useEffect(() => {
        const fetchAppliedStudents = async () => {
            const token = localStorage.getItem("authToken");
            console.log(jobId);
            
            try {
                const response = await axios.get(`http://127.0.0.1:8000/placement/api/student-applications/${jobId}/`, {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.status === 200) {  
                    setApplications(response.data.students);
                } else {
                    console.error('Failed to fetch');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchAppliedStudents();
    }, [jobId]);

    const paginatedApplications = applications.slice(
        (activePage - 1) * recordsPerPage,
        activePage * recordsPerPage
    );

    const handleStatusChange = (applicationId, status) => {
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
                <Title order={3} style={{ marginBottom: '12px' }}>Student Job Applications</Title>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', gap: '20px' }}>
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
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedApplications.map((application) => (
                            <tr key={application.id}>
                                <td style={{ padding: '20px' }}>{application.name}</td>
                                <td style={{ padding: '20px' }}>{application.roll_no}</td>
                                <td style={{ padding: '20px' }}>{application.email}</td>
                                <td style={{ padding: '20px' }}>{application.cpi}</td>
                                <td style={{ padding: '20px' }}>
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
