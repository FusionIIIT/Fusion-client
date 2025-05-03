import React, { useState } from "react";
import {
  Card,
  Paper,
  Text,
  Grid,
  Select,
  Button,
  Loader,
  Center,
  ScrollArea,
  Table,
  Box,
  Alert,
  Title,
} from "@mantine/core";
import axios from "axios";
import { check_result } from "./routes/examinationRoutes";

export default function CheckResult() {
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [spi, setSpi] = useState(0);
  const [cpi, setCpi] = useState(0);
  const [su, setSu] = useState(0);
  const [tu, setTu] = useState(0);
  const [show, setShow] = useState(false);

  const handleSearch = async () => {
    if (!semester) {
      setError("Please select a semester.");
      return;
    }

    setError("");
    setLoading(true);
    setShow(false);

    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.post(
        check_result,
        { semester },
        { headers: { Authorization: `Token ${token}` } }
      );

      if (!data.success) {
        setError(data.message || "Cannot fetch results.");
      } else {
        setCourses(data.courses);
        setSpi(data.spi);
        setCpi(data.cpi);
        setSu(data.su);
        setTu(data.tu);
        setShow(true);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to fetch result. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const rows = courses.map((c, idx) => (
    <tr key={idx}>
      <td>{c.coursecode}</td>
      <td>{c.coursename}</td>
      <td>{c.credits}</td>
      <td>{c.grade}</td>
    </tr>
  ));

  return (
    <Card withBorder p="lg" radius="md">
      <Paper p="md">
        <Title order={3} mb="md">Check Result</Title>

        {error && <Alert color="red" mb="md">{error}</Alert>}

        <Grid>
          <Grid.Col xs={12} sm={4}>
            <Select
              label="Semester"
              placeholder="Select semester"
              data={[
                { value: "1", label: "Semester 1" },
                { value: "2", label: "Semester 2" },
                { value: "3", label: "Semester 3" },
                { value: "4", label: "Semester 4" },
                { value: "5", label: "Semester 5" },
                { value: "6", label: "Semester 6" },
                { value: "7", label: "Semester 7" },
                { value: "8", label: "Semester 8" },
              ]}
              value={semester}
              onChange={setSemester}
              required
            />
          </Grid.Col>
        </Grid>

        <Box mt="md">
          <Button onClick={handleSearch} disabled={loading} size="sm">
            View Result
          </Button>
        </Box>

        {loading && (
          <Center mt="lg">
            <Loader size="lg" variant="dots" />
          </Center>
        )}

        {show && !loading && (
          <Box mt="xl">
            <Paper p="md" withBorder mb="md">
              <Title order={4}>Semester {semester}</Title>
            </Paper>

            <ScrollArea>
              <Table striped highlightOnHover withColumnBorders>
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </Table>
            </ScrollArea>

            <Grid mt="xl">
              <Grid.Col span={3}>
                <Paper p="md" withBorder>
                  <Title order={5}>SPI</Title>
                  <Text weight={700} size="xl" mt="md">{spi || "N/A"}</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={3}>
                <Paper p="md" withBorder>
                  <Title order={5}>CPI</Title>
                  <Text weight={700} size="xl" mt="md">{cpi || "N/A"}</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={3}>
                <Paper p="md" withBorder>
                  <Title order={5}>SU</Title>
                  <Text weight={700} size="xl" mt="md">{su || "N/A"}</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={3}>
                <Paper p="md" withBorder>
                  <Title order={5}>TU</Title>
                  <Text weight={700} size="xl" mt="md">{tu || "N/A"}</Text>
                </Paper>
              </Grid.Col>
            </Grid>
          </Box>
        )}
      </Paper>
    </Card>
  );
}
