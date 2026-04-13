import React, { useState, useEffect } from "react";
import { Container, Paper, Title, Grid, Group, Badge, Progress, Card, SimpleGrid, Alert, Loader, Center } from "@mantine/core";
import { IconCheck, IconX, IconClock } from "@tabler/icons-react";
import axios from "axios";

function NoDuesStatus() {
  const authToken = localStorage.getItem("authToken");
  const [noDuesData, setNoDuesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNoDuesStatus();
  }, []);

  const fetchNoDuesStatus = async () => {
    try {
      setLoading(true);
      // In a real scenario, this would fetch the user's no dues status
      // For now, we'll use dummy data to demonstrate the UI
      const userData = JSON.parse(localStorage.getItem("userData") || "{}");
      
      // Simulated no dues data - in production, this would come from the API
      const simulatedData = {
        student: userData,
        clearance_status: "Pending",
        cleared_departments: ["Library", "Discipline Office", "Student Gymkhana"],
        not_cleared_departments: ["Hostel", "Mess", "Bank"],
        pending_departments: ["ECE Lab", "Physics Lab", "Design Studio", "BTP Supervisor", "I-Card DSA", "Placement Cell"],
      };
      
      setNoDuesData(simulatedData);
      setError("");
    } catch (err) {
      setError("Failed to fetch no dues status");
    } finally {
      setLoading(false);
    }
  };

  // Department grouping by category
  const departmentsByCategory = {
    "Laboratories": ["ECE Lab", "Physics Lab", "Design Studio", "VLSI", "Signal Processing Lab"],
    "Accommodation & Dining": ["Hostel", "Mess"],
    "Administrative": ["Bank", "I-Card DSA", "Accounts", "Discipline Office"],
    "Academic": ["BTP Supervisor", "Library", "Placement Cell", "Student Gymkhana"],
  };

  const getStatusIcon = (status) => {
    if (noDuesData?.cleared_departments?.includes(status)) {
      return <IconCheck size={20} color="green" />;
    } else if (noDuesData?.not_cleared_departments?.includes(status)) {
      return <IconX size={20} color="red" />;
    } else {
      return <IconClock size={20} color="orange" />;
    }
  };

  const getStatusColor = (status) => {
    if (noDuesData?.cleared_departments?.includes(status)) {
      return "green";
    } else if (noDuesData?.not_cleared_departments?.includes(status)) {
      return "red";
    } else {
      return "yellow";
    }
  };

  const getStatusText = (status) => {
    if (noDuesData?.cleared_departments?.includes(status)) {
      return "Clear";
    } else if (noDuesData?.not_cleared_departments?.includes(status)) {
      return "Not Clear";
    } else {
      return "Pending";
    }
  };

  if (loading) {
    return (
      <Center style={{ height: "400px" }}>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Container size="lg" style={{ marginTop: "50px" }}>
        <Alert color="red" title="Error">
          {error}
        </Alert>
      </Container>
    );
  }

  // Calculate progress
  const totalDepartments = Object.values(departmentsByCategory).flat().length;
  const clearedCount = noDuesData?.cleared_departments?.length || 0;
  const progressPercentage = (clearedCount / totalDepartments) * 100;

  return (
    <Container size="xl" style={{ marginTop: "40px", marginBottom: "50px" }}>
      <Paper padding="lg" shadow="sm" style={{ marginBottom: "2rem" }}>
        <Title order={2} align="center" mb="xl">
          No Dues Clearance Status
        </Title>

        {/* Progress Overview */}
        <Paper p="md" style={{ backgroundColor: "#f0f0f0", marginBottom: "1.5rem", borderRadius: "8px" }}>
          <Group justify="space-between" mb="xs">
            <div>
              <Title order={4}>Overall Progress</Title>
              <p style={{ margin: "0.5rem 0 0 0", color: "#666" }}>
                {clearedCount} of {totalDepartments} departments cleared
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <Title order={3} color={progressPercentage === 100 ? "green" : "blue"}>
                {Math.round(progressPercentage)}%
              </Title>
            </div>
          </Group>
          <Progress value={progressPercentage} color={progressPercentage === 100 ? "green" : "blue"} size="lg" />
        </Paper>

        {/* Department Status by Category */}
        {Object.entries(departmentsByCategory).map(([category, departments]) => (
          <div key={category} style={{ marginBottom: "2rem" }}>
            <Title order={4} style={{ marginBottom: "1rem", paddingBottom: "0.5rem", borderBottom: "2px solid #ddd" }}>
              {category}
            </Title>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 2 }} spacing="md">
              {departments.map((dept) => (
                <Card key={dept} padding="md" style={{ border: `1px solid ${getStatusColor(dept) === "green" ? "#d3f9d8" : getStatusColor(dept) === "red" ? "#ffe3e3" : "#fff3cd"}`, backgroundColor: `${getStatusColor(dept) === "green" ? "#f1fce4" : getStatusColor(dept) === "red" ? "#ffe8e8" : "#fffbf0"}` }}>
                  <Group justify="space-between">
                    <div>
                      <p style={{ margin: "0", fontWeight: "500" }}>{dept}</p>
                    </div>
                    <Group gap="xs">
                      {getStatusIcon(dept)}
                      <Badge color={getStatusColor(dept)} variant="light">
                        {getStatusText(dept)}
                      </Badge>
                    </Group>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </div>
        ))}

        {/* Summary */}
        <Paper p="md" style={{ backgroundColor: "#f8f9fa", marginTop: "2rem", borderRadius: "8px" }}>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <div style={{ textAlign: "center" }}>
                <Group justify="center" gap="xs" mb="xs">
                  <IconCheck size={24} color="green" />
                  <Title order={4}>Cleared</Title>
                </Group>
                <Title order={2} color="green">
                  {clearedCount}
                </Title>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <div style={{ textAlign: "center" }}>
                <Group justify="center" gap="xs" mb="xs">
                  <IconClock size={24} color="orange" />
                  <Title order={4}>Pending</Title>
                </Group>
                <Title order={2} color="orange">
                  {noDuesData?.pending_departments?.length || 0}
                </Title>
              </div>
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <div style={{ textAlign: "center" }}>
                <Group justify="center" gap="xs" mb="xs">
                  <IconX size={24} color="red" />
                  <Title order={4}>Not Clear</Title>
                </Group>
                <Title order={2} color="red">
                  {noDuesData?.not_cleared_departments?.length || 0}
                </Title>
              </div>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Action Note */}
        {noDuesData?.not_cleared_departments?.length > 0 && (
          <Alert color="red" title="Action Required" style={{ marginTop: "1.5rem" }}>
            You have <strong>{noDuesData?.not_cleared_departments?.length}</strong> department(s) that have not cleared your dues. Please contact the respective departments to resolve this.
          </Alert>
        )}

        {progressPercentage === 100 && (
          <Alert color="green" title="All Clear!" style={{ marginTop: "1.5rem" }}>
            Congratulations! You have cleared all departments. Your no dues certificate is ready for download.
          </Alert>
        )}
      </Paper>
    </Container>
  );
}

export default NoDuesStatus;
