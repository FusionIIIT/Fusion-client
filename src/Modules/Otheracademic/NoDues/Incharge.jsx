import { useState, useEffect, useMemo } from "react";
import {
  Select,
  Button,
  Table,
  Container,
  Stack,
  Alert,
  Badge,
  Group,
  Text,
  Paper,
  Checkbox,
  Loader,
  Progress,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import axios from "axios";
import { Warning, CheckCircle } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import {
  NoDues_Pending,
  NoDues_Verify,
} from "../../../routes/otheracademicRoutes";

function Incharge() {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [department, setDepartment] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isClear, setIsClear] = useState(false);

  const authToken = localStorage.getItem("authToken");
  const isAboveMd = useMediaQuery("(min-width: 992px)");
  const roles = useSelector((state) => state.user.roles);
  const activeRole = useSelector((state) => state.user.role);

  const departmentLabels = {
    library: "Librarian",
    mess: "Mess Incharge",
    hostel: "Hostel Warden",
    lab_supervisor: "Lab Supervisor",
    acad_admin: "Acad Admin Finalization",
  };

  const normalizeRole = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  const departmentRoleMap = {
    librarian: ["library"],
    mess_incharge: ["mess"],
    hostel_warden: ["hostel"],
    lab_supervisor: ["lab_supervisor"],
    acadadmin: ["acad_admin"],
  };

  const allowedDepartments = useMemo(() => {
    const mergedRoles = [...(Array.isArray(roles) ? roles : []), activeRole]
      .map(normalizeRole)
      .filter(Boolean);

    const departmentSet = new Set();
    mergedRoles.forEach((roleName) => {
      (departmentRoleMap[roleName] || []).forEach((dept) =>
        departmentSet.add(dept),
      );
    });

    return Array.from(departmentSet);
  }, [roles, activeRole]);

  const filteredPendingDepartments = useMemo(() => {
    const backendAvailableApprovals = selectedStudent?.available_approvals;
    if (
      Array.isArray(backendAvailableApprovals) &&
      backendAvailableApprovals.length > 0
    ) {
      return backendAvailableApprovals;
    }

    const statuses = selectedStudent?.departments || {};
    const firstFourClear =
      statuses.librarian === "clear" &&
      statuses.mess_incharge === "clear" &&
      statuses.hostel_warden === "clear" &&
      statuses.lab_supervisor === "clear";

    return allowedDepartments.filter((dept) => {
      if (dept === "acad_admin" && !firstFourClear) {
        return false;
      }
      return statuses[dept] === "pending";
    });
  }, [allowedDepartments, selectedStudent]);

  const fetchPendingStudents = async () => {
    try {
      const response = await axios.get(NoDues_Pending, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });
      setPendingStudents(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch pending students");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (department && !filteredPendingDepartments.includes(department)) {
      setDepartment("");
    }
  }, [department, filteredPendingDepartments]);

  // Fetch pending students on mount and auto-refresh every 5 seconds
  useEffect(() => {
    fetchPendingStudents();
    const interval = setInterval(fetchPendingStudents, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (!selectedStudent) {
      setError("Please select a student");
      return;
    }

    if (!department) {
      setError("Please select a department");
      return;
    }

    setVerifying(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(
        NoDues_Verify,
        {
          roll_no: selectedStudent.roll_no,
          department,
          is_clear: isClear,
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        },
      );

      setMessage(response.data.message);
      setVerifying(false);
      setSelectedStudent(null);
      setDepartment("");
      setIsClear(false);

      // Refresh the list
      setTimeout(fetchPendingStudents, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to verify clearance");
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <Container size="sm" py="xl">
        <Loader />
      </Container>
    );
  }

  const rows = pendingStudents.map((student) => (
    <Table.Tr
      key={student.roll_no}
      style={{
        backgroundColor:
          selectedStudent?.roll_no === student.roll_no ? "#e7f5ff" : "white",
        cursor: "pointer",
      }}
      onClick={() => setSelectedStudent(student)}
    >
      <Table.Td>
        <Text fw={500}>{student.roll_no}</Text>
      </Table.Td>
      <Table.Td>
        <Text>{student.name}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Progress
            value={student.progress_percentage}
            size="sm"
            style={{ flex: 1 }}
            color={student.progress_percentage === 100 ? "green" : "blue"}
          />
          <Text size="sm">{Math.round(student.progress_percentage)}%</Text>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={student.progress_percentage === 100 ? "green" : "yellow"}>
          {student.cleared_count}/{student.total_count}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="lg" py="xl">
      <Stack spacing="lg">
        {error && (
          <Alert icon={<Warning size={16} />} color="red" title="Error">
            {error}
          </Alert>
        )}

        {message && !error && (
          <Alert icon={<CheckCircle size={16} />} color="green" title="Success">
            {message}
          </Alert>
        )}

        <Paper p="lg" radius="lg" withBorder shadow="sm">
          <Stack spacing="md">
            <div>
              <Text fw={700} size="lg" mb="sm">
                Pending No-Dues Clearances
              </Text>
              <Text c="dimmed" size="sm">
                Click on a student to select them, then choose your department
                and mark as cleared/not cleared
              </Text>
            </div>

            {pendingStudents.length === 0 ? (
              <Alert color="blue">
                No pending no-dues clearance requests at the moment
              </Alert>
            ) : (
              <div
                style={{
                  overflowX: isAboveMd ? "visible" : "auto",
                }}
              >
                <Table
                  striped
                  highlightOnHover
                  style={{ minWidth: isAboveMd ? "" : "600px" }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Roll No</Table.Th>
                      <Table.Th>Name</Table.Th>
                      <Table.Th>Progress</Table.Th>
                      <Table.Th>Cleared Count</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>{rows}</Table.Tbody>
                </Table>
              </div>
            )}
          </Stack>
        </Paper>

        {selectedStudent && (
          <Paper p="lg" radius="lg" withBorder shadow="sm" bg="#f0f9ff">
            <Stack spacing="md">
              <div>
                <Text fw={700} size="lg">
                  Verify Clearance
                </Text>
                <Text c="dimmed">
                  Student: {selectedStudent.name} ({selectedStudent.roll_no})
                </Text>
              </div>

              <Select
                label="Department"
                placeholder="Select department"
                data={filteredPendingDepartments.map((d) => ({
                  value: d,
                  label:
                    departmentLabels[d] || d.replace(/_/g, " ").toUpperCase(),
                }))}
                value={department}
                onChange={(value) => setDepartment(value)}
                searchable
                disabled={filteredPendingDepartments.length === 0}
                description={
                  filteredPendingDepartments.length === 0
                    ? "No pending approvals available for your role on this request."
                    : "Only pending approvals assigned to your role are shown."
                }
              />

              <Checkbox
                label="Is student cleared?"
                checked={isClear}
                onChange={(e) => setIsClear(e.currentTarget.checked)}
              />

              <Group position="right">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedStudent(null);
                    setDepartment("");
                    setIsClear(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerify}
                  loading={verifying}
                  disabled={!department}
                >
                  Verify Clearance
                </Button>
              </Group>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}

export default Incharge;
