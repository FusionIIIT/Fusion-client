import React, { useState, useEffect, useMemo } from "react";
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
import { get_result_semesters, check_result } from "./routes/examinationRoutes";

export default function CheckResult() {
  // semester picker
  const [selection, setSelection] = useState(null);
  const [semesters, setSemesters] = useState([]);
  
  // result & UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courses, setCourses] = useState([]);
  const [spi, setSpi] = useState(0);
  const [cpi, setCpi] = useState(0);
  const [su, setSu] = useState(0);
  const [tu, setTu] = useState(0);
  const [show, setShow] = useState(false);

  // 1) Fetch semesters on mount
  useEffect(() => {
    async function fetchSemesters() {
      try {
        const token = localStorage.getItem("authToken");
        const { data } = await axios.get(get_result_semesters, {
          headers: { Authorization: `Token ${token}` },
        });
        if (data.success) {
          setSemesters(data.semesters);
        } else {
          setError(data.message || "Could not load semesters");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch semesters");
      }
    }
    fetchSemesters();
  }, []);

  // 2) Build Select options
  const semesterOptions = useMemo(
    () =>
      semesters.map(({ semester_no, semester_type, label }) => ({
        value: JSON.stringify({ no: semester_no, type: semester_type }),
        label,
      })),
    [semesters]
  );

  // 3) Handle View Result
  const handleSearch = async () => {
    if (!selection) {
      setError("Please select a semester.");
      return;
    }
    setError("");
    setLoading(true);
    setShow(false);

    const { no: semester_no, type: semester_type } = JSON.parse(selection);

    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.post(
        check_result,
        { semester_no, semester_type },
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

  // 4) Render rows
  const rows = courses.map((c, i) => (
    <tr key={i}>
      <td>{c.coursecode}</td>
      <td>{c.coursename}</td>
      <td>{c.credits}</td>
      <td>{c.grade}</td>
      <td>{c.points}</td>
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
              data={semesterOptions}
              value={selection}
              onChange={setSelection}
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
              <Title order={4}>
                {semesterOptions.find(o => o.value === selection)?.label}
              </Title>
            </Paper>

            <ScrollArea>
              <Table striped highlightOnHover withColumnBorders>
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Name</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    <th>Grade Points</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </Table>
            </ScrollArea>

            <Grid mt="xl">
              {[
                { label: "SPI", value: spi },
                { label: "CPI", value: cpi },
                { label: "SU",  value: su  },
                { label: "TU",  value: tu  },
              ].map((stat, i) => (
                <Grid.Col span={3} key={i}>
                  <Paper p="md" withBorder>
                    <Title order={5}>{stat.label}</Title>
                    <Text weight={700} size="xl" mt="md">
                      {stat.value ?? "N/A"}
                    </Text>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Box>
        )}
      </Paper>
    </Card>
  );
}
