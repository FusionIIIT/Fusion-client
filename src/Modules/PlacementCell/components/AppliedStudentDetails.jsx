import React, { useEffect, useState } from "react";
import { Table, Pagination, Select, Card, Title, Container, Button, Loader, Alert, TextInput } from "@mantine/core";
import axios from "axios";

function JobApplicationsTable() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const recordsPerPage = 10;

    const jobId = new URLSearchParams(window.location.search).get("jobId");

    useEffect(() => {
        const fetchApplications = async () => {
            const token = localStorage.getItem("authToken");
            try {
                const response = await axios.get(`http://127.0.0.1:8000/placement/api/student-applications/${jobId}/`, {
                    headers: { Authorization: `Token ${token}` },
                });
                setApplications(response.data.students);
            } catch (error) {
                console.error("Error fetching applications:", error);
            }
        };
        fetchApplications();
    }, [jobId]);

    const downloadExcel = async () => {
        const token = localStorage.getItem("authToken");
        try {
            const response = await axios.get(`http://127.0.0.1:8000/placement/api/download-applications/${jobId}/`, {
                headers: { Authorization: `Token ${token}` },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `applications_${jobId}.xlsx`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Error downloading Excel:", error);
        }
    };

    const paginatedApplications = applications.slice(
        (activePage - 1) * recordsPerPage,
        activePage * recordsPerPage
    );

    return (
        <Container>
            <Card shadow="sm" padding="md" radius="md" withBorder>
                <Title order={3}>Student Job Applications</Title>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                    <TextInput placeholder="Search" style={{ width: "200px" }} />
                    <Button onClick={downloadExcel}>Download Excel</Button>
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
                                <td>{application.name}</td>
                                <td>{application.roll_no}</td>
                                <td>{application.email}</td>
                                <td>{application.cpi}</td>
                                <td>
                                    <Select
                                        data={[
                                            { value: "accept", label: "Accept" },
                                            { value: "reject", label: "Reject" },
                                        ]}
                                        value={application.status}
                                        onChange={(value) =>
                                            handleStatusChange(application.id, value)
                                        }
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
                />
            </Card>
        </Container>
    );
}

export default JobApplicationsTable;
