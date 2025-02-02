import {
  Paper,
  TextInput,
  Button,
  Title,
  Container,
  Stack,
  Select,
} from "@mantine/core";
import { Upload } from "@phosphor-icons/react";
import { useState } from "react";

export default function UploadAttendanceComponent() {
  const [file, setFile] = useState(null);
  const [year, setYear] = useState(null);
  const [month, setMonth] = useState(null);

  // Example range of years
  const years = Array.from({ length: 10 }, (_, i) => 2020 + i);

  // Static months data
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

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
    }
  };
  const handleYearChange = (selectedYear) => {
    setYear(selectedYear); // Set the year state correctly
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission here
    console.log("Form submitted");
  };

  return (
    <Container size="sm" px="xs">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Title order={1} size="h2" mb="xl">
          Upload Attendance
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            {/* Year Dropdown */}
            <Select
              label="Year"
              placeholder="Select year"
              data={years.map((yr) => yr.toString())} // Map to string for display
              required
              value={year}
              onChange={handleYearChange} // Use the updated handler
              styles={{
                label: { fontSize: "1rem", fontWeight: 500 },
              }}
            />

            {/* Month Dropdown */}
            {year && (
              <Select
                label="Month"
                placeholder="Select month"
                data={months}
                required
                value={month}
                onChange={(selectedMonth) => setMonth(selectedMonth)}
                styles={{
                  label: { fontSize: "1rem", fontWeight: 500 },
                }}
              />
            )}

            {/* Hall Name */}
            <TextInput
              label="Hall Name:"
              placeholder="Vashishtha"
              required
              styles={{
                label: { fontSize: "1rem", fontWeight: 500 },
              }}
            />

            {/* Batch */}
            <TextInput
              label="Batch:"
              placeholder="2022"
              required
              styles={{
                label: { fontSize: "1rem", fontWeight: 500 },
              }}
            />

            <Title order={3} size="h4" mt="md">
              Upload Attendance Document
            </Title>

            {/* File Input */}
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx"
            />

            <Button
              component="label"
              htmlFor="file"
              variant="filled"
              color="blue"
              leftIcon={<Upload size={20} />}
              fullWidth
            >
              {file ? file.name : "Attach Document"}
            </Button>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="filled"
              color="blue"
              fullWidth
              mt="xl"
            >
              Submit
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
