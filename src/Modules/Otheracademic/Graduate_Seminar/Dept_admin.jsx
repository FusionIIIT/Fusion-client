import React, { useState, useEffect } from "react";
import { Table, Button, Paper, Container, Title, Group, Modal, Textarea, Badge, ScrollArea, Alert } from "@mantine/core";
import axios from "axios";
import "./DeptAdmin.css";

function GraduateSeminarDeptAdmin() {
  const authToken = localStorage.getItem("authToken");
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [actionType, setActionType] = useState("approve");
  const [selectedIds, setSelectedIds] = useState({
    approve: [],
    reject: [],
  });

  useEffect(() => {
    checkAccessAndFetchForms();
  }, []);

  const checkAccessAndFetchForms = async () => {
    try {
      setLoading(true);
      
      // Check user designation
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      const userDesignation = userData.designation || userData.user_type;
      
      // Verify user is department admin
      if (userDesignation !== 'deptadmin' && userDesignation !== 'department_admin') {
        setAccessDenied(true);
        setError("Access Denied: You must be a department admin to view this page.");
        return;
      }

      // Fetch pending forms
      const response = await axios.get("/api/otheracademic/admin-graduate-requests/", {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });
      setForms(response.data);
      setError("");
    } catch (err) {
      if (err.response?.status === 403) {
        setAccessDenied(true);
        setError("Access Denied: You do not have permission to access this resource.");
      } else {
        setError("Failed to fetch pending forms: " + (err.response?.data?.error || err.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewForm = (form) => {
    setSelectedForm(form);
    setRemarks("");
    setModalOpened(true);
  };

  const handleApprove = (form) => {
    setSelectedForm(form);
    setActionType("approve");
    setRemarks("");
    setModalOpened(true);
  };

  const handleReject = (form) => {
    setSelectedForm(form);
    setActionType("reject");
    setRemarks("");
    setModalOpened(true);
  };

  const submitAction = async () => {
    try {
      const payload = {
        approvedRequests: actionType === "approve" ? [selectedForm.id] : [],
        rejectedRequests: actionType === "reject" ? [selectedForm.id] : [],
        remarks: remarks,
      };

      await axios.post("/api/otheracademic/update-graduate-status/", payload, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      setModalOpened(false);
      setRemarks("");
      setSelectedForm(null);
      checkAccessAndFetchForms(); // Refresh the list
    } catch (err) {
      setError("Failed to update form status: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading pending forms...</div>;
  }

  if (accessDenied) {
    return (
      <Container size="xl" style={{ marginTop: "50px", marginBottom: "50px" }}>
        <Paper padding="md" shadow="xs">
          <Alert color="red" title="Access Denied">
            You do not have permission to access this page. Only department admins can approve graduate seminar forms.
          </Alert>
        </Paper>
      </Container>
    );
  }

  const rows = forms.map((form) => (
    <Table.Tr key={form.id}>
      <Table.Td>{form.roll_no}</Table.Td>
      <Table.Td>{form.student_name}</Table.Td>
      <Table.Td>{form.semester}</Table.Td>
      <Table.Td>{form.date_of_seminar}</Table.Td>
      <Table.Td>{form.theme_of_work.substring(0, 30)}...</Table.Td>
      <Table.Td>
        <Badge>{form.status}</Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button
            size="xs"
            variant="light"
            onClick={() => handleViewForm(form)}
          >
            View
          </Button>
          <Button
            size="xs"
            color="green"
            onClick={() => handleApprove(form)}
          >
            Approve
          </Button>
          <Button
            size="xs"
            color="red"
            onClick={() => handleReject(form)}
          >
            Reject
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" style={{ marginTop: "50px", marginBottom: "50px" }}>
      <Paper padding="md" shadow="xs">
        <Title order={2} align="center" mb="lg">
          Graduate Seminar Form Approvals
        </Title>

        {error && (
          <Paper p="md" style={{ backgroundColor: "#ffe3e3", marginBottom: "1rem" }}>
            <p style={{ color: "#d32f2f" }}>{error}</p>
          </Paper>
        )}

        {forms.length === 0 ? (
          <Paper p="md" style={{ textAlign: "center", backgroundColor: "#f8f9fa" }}>
            <p>No pending graduate seminar forms to approve.</p>
          </Paper>
        ) : (
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Roll No</Table.Th>
                  <Table.Th>Student Name</Table.Th>
                  <Table.Th>Semester</Table.Th>
                  <Table.Th>Seminar Date</Table.Th>
                  <Table.Th>Theme</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setSelectedForm(null);
          setRemarks("");
        }}
        title={actionType === "approve" ? "Approve Graduate Seminar Form" : actionType === "reject" ? "Reject Graduate Seminar Form" : "View Graduate Seminar Form"}
        size="lg"
      >
        {selectedForm && (
          <div>
            <div style={{ marginBottom: "1rem" }}>
              <p><strong>Roll No:</strong> {selectedForm.roll_no}</p>
              <p><strong>Student Name:</strong> {selectedForm.student_name}</p>
              <p><strong>Semester:</strong> {selectedForm.semester}</p>
              <p><strong>Date of Seminar:</strong> {selectedForm.date_of_seminar}</p>
              <p><strong>Time:</strong> {selectedForm.time}</p>
              <p><strong>Place:</strong> {selectedForm.place}</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <p><strong>Theme of Work:</strong></p>
              <p>{selectedForm.theme_of_work}</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <p><strong>Work Done Till Previous Semester:</strong></p>
              <p>{selectedForm.work_done_till_previous_sem}</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <p><strong>Specific Contribution in Current Semester:</strong></p>
              <p>{selectedForm.specific_contri_in_cur_sem}</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <p><strong>Future Plan:</strong></p>
              <p>{selectedForm.future_plan}</p>
            </div>

            <div style={{ marginBottom: "1rem", display: "flex", gap: "2rem" }}>
              <div>
                <p><strong>Quality of Work:</strong></p>
                <p>{selectedForm.quality_of_work}/10</p>
              </div>
              <div>
                <p><strong>Quantity of Work:</strong></p>
                <p>{selectedForm.quantity_of_work}/10</p>
              </div>
            </div>

            {(actionType === "approve" || actionType === "reject") && (
              <div style={{ marginTop: "2rem" }}>
                <Textarea
                  label="Remarks (Optional)"
                  placeholder="Add any remarks for your decision"
                  value={remarks}
                  onChange={(e) => setRemarks(e.currentTarget.value)}
                  minRows={3}
                />

                <Group justify="flex-end" style={{ marginTop: "1rem" }}>
                  <Button
                    variant="default"
                    onClick={() => {
                      setModalOpened(false);
                      setSelectedForm(null);
                      setRemarks("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color={actionType === "approve" ? "green" : "red"}
                    onClick={submitAction}
                  >
                    {actionType === "approve" ? "Approve" : "Reject"}
                  </Button>
                </Group>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Container>
  );
}

export default GraduateSeminarDeptAdmin;


  const handleViewForm = (form) => {
    setSelectedForm(form);
    setRemarks("");
    setModalOpened(true);
  };

  const handleApprove = (form) => {
    setSelectedForm(form);
    setActionType("approve");
    setRemarks("");
    setModalOpened(true);
  };

  const handleReject = (form) => {
    setSelectedForm(form);
    setActionType("reject");
    setRemarks("");
    setModalOpened(true);
  };

  const submitAction = async () => {
    try {
      const payload = {
        approvedRequests: actionType === "approve" ? [selectedForm.id] : [],
        rejectedRequests: actionType === "reject" ? [selectedForm.id] : [],
        remarks: remarks,
      };

      await axios.post("/api/otheracademic/update-graduate-status/", payload, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      setModalOpened(false);
      setRemarks("");
      setSelectedForm(null);
      fetchPendingForms(); // Refresh the list
    } catch (err) {
      setError("Failed to update form status: " + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div style={{ textAlign: "center", padding: "2rem" }}>Loading pending forms...</div>;
  }

  const rows = forms.map((form) => (
    <Table.Tr key={form.id}>
      <Table.Td>{form.roll_no}</Table.Td>
      <Table.Td>{form.student_name}</Table.Td>
      <Table.Td>{form.semester}</Table.Td>
      <Table.Td>{form.date_of_seminar}</Table.Td>
      <Table.Td>{form.theme_of_work.substring(0, 30)}...</Table.Td>
      <Table.Td>
        <Badge>{form.status}</Badge>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button
            size="xs"
            variant="light"
            onClick={() => handleViewForm(form)}
          >
            View
          </Button>
          <Button
            size="xs"
            color="green"
            onClick={() => handleApprove(form)}
          >
            Approve
          </Button>
          <Button
            size="xs"
            color="red"
            onClick={() => handleReject(form)}
          >
            Reject
          </Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" style={{ marginTop: "50px", marginBottom: "50px" }}>
      <Paper padding="md" shadow="xs">
        <Title order={2} align="center" mb="lg">
          Graduate Seminar Form Approvals
        </Title>

        {error && (
          <Paper p="md" style={{ backgroundColor: "#ffe3e3", marginBottom: "1rem" }}>
            <p style={{ color: "#d32f2f" }}>{error}</p>
          </Paper>
        )}

        {forms.length === 0 ? (
          <Paper p="md" style={{ textAlign: "center", backgroundColor: "#f8f9fa" }}>
            <p>No pending graduate seminar forms to approve.</p>
          </Paper>
        ) : (
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Roll No</Table.Th>
                  <Table.Th>Student Name</Table.Th>
                  <Table.Th>Semester</Table.Th>
                  <Table.Th>Seminar Date</Table.Th>
                  <Table.Th>Theme</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </ScrollArea>
        )}
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setSelectedForm(null);
          setRemarks("");
        }}
        title={actionType === "approve" ? "Approve Graduate Seminar Form" : actionType === "reject" ? "Reject Graduate Seminar Form" : "View Graduate Seminar Form"}
        size="lg"
      >
        {selectedForm && (
          <div>
            <div style={{ marginBottom: "1rem" }}>
              <p><strong>Roll No:</strong> {selectedForm.roll_no}</p>
              <p><strong>Student Name:</strong> {selectedForm.student_name}</p>
              <p><strong>Semester:</strong> {selectedForm.semester}</p>
              <p><strong>Date of Seminar:</strong> {selectedForm.date_of_seminar}</p>
              <p><strong>Time:</strong> {selectedForm.time}</p>
              <p><strong>Place:</strong> {selectedForm.place}</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <p><strong>Theme of Work:</strong></p>
              <p>{selectedForm.theme_of_work}</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <p><strong>Work Done Till Previous Semester:</strong></p>
              <p>{selectedForm.work_done_till_previous_sem}</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <p><strong>Specific Contribution in Current Semester:</strong></p>
              <p>{selectedForm.specific_contri_in_cur_sem}</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <p><strong>Future Plan:</strong></p>
              <p>{selectedForm.future_plan}</p>
            </div>

            <div style={{ marginBottom: "1rem", display: "flex", gap: "2rem" }}>
              <div>
                <p><strong>Quality of Work:</strong></p>
                <p>{selectedForm.quality_of_work}/10</p>
              </div>
              <div>
                <p><strong>Quantity of Work:</strong></p>
                <p>{selectedForm.quantity_of_work}/10</p>
              </div>
            </div>

            {(actionType === "approve" || actionType === "reject") && (
              <div style={{ marginTop: "2rem" }}>
                <Textarea
                  label="Remarks (Optional)"
                  placeholder="Add any remarks for your decision"
                  value={remarks}
                  onChange={(e) => setRemarks(e.currentTarget.value)}
                  minRows={3}
                />

                <Group justify="flex-end" style={{ marginTop: "1rem" }}>
                  <Button
                    variant="default"
                    onClick={() => {
                      setModalOpened(false);
                      setSelectedForm(null);
                      setRemarks("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    color={actionType === "approve" ? "green" : "red"}
                    onClick={submitAction}
                  >
                    {actionType === "approve" ? "Approve" : "Reject"}
                  </Button>
                </Group>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Container>
  );
}

export default GraduateSeminarDeptAdmin;
