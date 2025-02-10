import {
  Paper,
  Title,
  Container,
  Stack,
  Select,
  Loader,
  Button,
  Image,
} from "@mantine/core";
import axios from "axios";
import { useState } from "react";
import { view_attendance } from "../../../../routes/hostelManagementRoutes";

export default function ViewAttendanceComponent() {
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [attendanceFile, setAttendanceFile] = useState(null);

  const years = Array.from({ length: 20 }, (_, i) => 2025 - i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleFetchAttendance = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Authentication token not found. Please log in again.");
      setLoading(false);
      return;
    }
    setLoading(true);
    // viewAttendance
    try {
      const response = axios.get(
        `${view_attendance}?year=${year}&month=${month}`,
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const blob = await response.blob();
      const fileType = blob.type;
      setAttendanceFile({ blob, fileType });
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
    setLoading(false);
  };

  return (
    <Container size="sm" px="xs">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Title order={1} size="h2" mb="xl">
          View Attendance
        </Title>

        <Stack spacing="md">
          <Select
            label="Year"
            placeholder="Select year"
            data={years.map((yr) => yr.toString())}
            value={year}
            onChange={setYear}
          />

          {year && (
            <Select
              label="Month"
              placeholder="Select month"
              data={months}
              value={month}
              onChange={setMonth}
            />
          )}
        </Stack>

        <Button
          mt="lg"
          onClick={handleFetchAttendance}
          disabled={!year || !month}
        >
          Fetch Attendance
        </Button>

        {loading && <Loader mt="md" />}

        {attendanceFile && (
          <Paper mt="lg" p="md" shadow="sm" withBorder>
            {attendanceFile.fileType.includes("image") ? (
              <Image
                src={URL.createObjectURL(attendanceFile.blob)}
                alt="Attendance Record"
              />
            ) : (
              <Button
                component="a"
                href={URL.createObjectURL(attendanceFile.blob)}
                download={`Attendance_${year}_${month}.pdf`}
                mt="md"
              >
                Download PDF
              </Button>
            )}
          </Paper>
        )}
      </Paper>
    </Container>
  );
}
