

import { Paper, TextInput, Button, Title, Container, Stack } from "@mantine/core"
import { Upload } from "@phosphor-icons/react"
import { useState } from "react"

export default function UploadAttendance() {
  const [file, setFile] = useState(null)

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0])
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    // Handle form submission here
    console.log("Form submitted")
  }

  return (
    <Container size="sm" px="xs">
      <Paper shadow="sm" p="xl" radius="md" withBorder>
        <Title order={1} size="h2" mb="xl">
          Upload Attendance
        </Title>

        <form onSubmit={handleSubmit}>
          <Stack spacing="md">
            <TextInput
              label="Month:"
              placeholder="feb,2025"
              required
              styles={{
                label: { fontSize: "1rem", fontWeight: 500 },
              }}
            />

            <TextInput
              label="Hall Name:"
              placeholder="Vashishtha"
              required
              styles={{
                label: { fontSize: "1rem", fontWeight: 500 },
              }}
            />

            <TextInput
              label="Batch:"
              placeholder="2022"
              required
              styles={{
                label: { fontSize: "1rem", fontWeight: 500 },
              }}
            />

            <Title order={3} size="h4" mt="md">
              Upload Attendance
            </Title>

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
              color="dark"
              leftIcon={<Upload size={20} />}
              fullWidth
              styles={{
                root: { backgroundColor: "#1a1b1e" },
              }}
            >
              {file ? file.name : "Attach Document"}
            </Button>

            <Button
              type="submit"
              variant="filled"
              color="dark"
              fullWidth
              mt="xl"
              styles={{
                root: { backgroundColor: "#1a1b1e" },
              }}
            >
              Submit
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
