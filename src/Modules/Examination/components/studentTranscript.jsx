import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { generate_transcript } from "../routes/examinationRoutes";
import {
  Card,
  Title,
  Paper,
  Table,
  Text,
  Group,
  Button,
  Divider,
  Loader,
  Box,
  Grid,
  Alert
} from "@mantine/core";
import {
  IconDownload,
  IconPrinter,
  IconAlertCircle,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useSelector } from "react-redux";

function StudentTranscript({ student, semester, onBack }) {
  const userRole = useSelector((state) => state.user.role);
  const [transcriptData, setTranscriptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!student?.id_id || !semester) {
      setError("Invalid student data");
      setLoading(false);
      return;
    }
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found!");
      setLoading(false);
      return;
    }

    axios
      .post(
        generate_transcript,
        {
          Role: userRole,
          student: student.id_id,
          semester : JSON.stringify(semester),
        },
        { headers: { Authorization: `Token ${token}` } }
      )
      .then((res) => setTranscriptData(res.data))
      .catch((err) => setError("Error fetching transcript: " + err.message))
      .finally(() => setLoading(false));
  }, [student, semester, userRole]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Student Transcript", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Student ID: ${student?.id_id || "N/A"}`, 14, 30);
    doc.text(`Name: ${transcriptData?.name || "Student"}`, 14, 40);
    doc.text(`Semester: ${semester?.no || "N/A"}`, 14, 50);
    doc.text(`SPI: ${transcriptData?.spi || "N/A"}`, 14, 60);
    doc.text(`CPI: ${transcriptData?.cpi || "N/A"}`, 14, 70);

    const tableColumn = ["Course Code", "Course Name", "Credits", "Grade"];
    const tableRows = [];

    if (transcriptData?.courses_grades) {
      Object.values(transcriptData.courses_grades).forEach((course) => {
        const credit = course.credit || "";
        tableRows.push([
          course.course_code,
          course.course_name,
          String(credit),
          course.grade,
        ]);
      });
    }

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: "grid",
      styles: { fontSize: 10 },
    });

    doc.save("student_transcript.pdf");
  };

  if (loading)
    return (
      <Card p="lg" radius="md" withBorder>
        <Group position="center" mt="xl">
          <Loader size="lg" />
          <Text>Loading transcript data...</Text>
        </Group>
      </Card>
    );

  if (error)
    return (
      <Card p="lg" radius="md" withBorder>
        <Button
          leftIcon={<IconArrowLeft size={16} />}
          variant="outline"
          onClick={onBack}
        >
          Back to List
        </Button>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Card>
    );

  if (
    !transcriptData?.courses_grades ||
    !Object.keys(transcriptData.courses_grades).length
  )
    return (
      <Card radius="md" withBorder>
        <Button
          size="md"
          radius="sm"
          leftIcon={<IconArrowLeft size={16} />}
          variant="outline"
          onClick={onBack}
        >
          Back to List
        </Button>
        <Paper p="md" withBorder>
          <Text align="center" size="lg">
            Marks not yet submitted.
          </Text>
        </Paper>
      </Card>
    );

  return (
    <Card p="lg" radius="md" withBorder>
      <Button leftIcon={<IconArrowLeft size={16} />} variant="outline" onClick={onBack}>
        Back to List
      </Button>
      <Card.Section withBorder inheritPadding py="xs">
        <Group position="apart">
          <Title order={2}>Student Transcript</Title>
          <Group>
            <Button
              leftIcon={<IconPrinter size={16} />}
              variant="outline"
              onClick={() => window.print()}
            >
              Print
            </Button>
            <Button leftIcon={<IconDownload size={16} />} onClick={generatePDF}>
              Download PDF
            </Button>
          </Group>
        </Group>
      </Card.Section>
      <Box mt="md">
        <Grid>
          <Grid.Col span={6}>
            <Text weight={500}>Student ID: {student?.id_id || "N/A"}</Text>
            <Text weight={500}>Name: {transcriptData?.name || "N/A"}</Text>
          </Grid.Col>
          <Grid.Col span={6} style={{ textAlign: "right" }}>
            <Text weight={500}>Semester: {semester.no || "N/A"}</Text>
          </Grid.Col>
        </Grid>
      </Box>
      <Divider my="md" />
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Credits</th>
            <th>Grade</th>
            <th>Grade Points</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(transcriptData.courses_grades).map((course, index) => (
            <tr key={index}>
              <td>{course.course_code}</td>
              <td>{course.course_name}</td>
              <td>{course.credit || ""}</td>
              <td>{course.grade}</td>
              <td>{course.points}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Divider my="md" />
      <Grid mt="xl">
        {[
          { label: "SPI", value: transcriptData.spi },
          { label: "CPI", value: transcriptData.cpi },
          { label: "SU",  value: transcriptData.su  },
          { label: "TU",  value: transcriptData.tu  },
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
      <Divider my="md" />
      <Group position="right">
        <Text size="sm" color="dimmed">
          Generated on: {new Date().toLocaleDateString()}
        </Text>
      </Group>
    </Card>
  );
}

export default StudentTranscript;
