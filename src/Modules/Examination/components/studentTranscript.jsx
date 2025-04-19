import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { generate_transcript, get_courses } from "../routes/examinationRoutes";
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
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch transcript and course data in parallel.
  useEffect(() => {
    if (!student?.id_id || !semester) {
      setError("Invalid student data");
      return setLoading(false);
    }
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found!");
      return setLoading(false);
    }
    Promise.all([
      axios.post(get_courses, { Role: userRole, academic_year: "2024" }, { headers: { Authorization: `Token ${token}` } }),
      axios.post(generate_transcript, { Role: userRole, student: student.id_id, semester }, { headers: { Authorization: `Token ${token}` } })
    ])
      .then(([courseRes, transcriptRes]) => {
        setCourseData(courseRes.data.courses);
        setTranscriptData(transcriptRes.data);
      })
      .catch(err => setError("Error fetching data: " + err.message))
      .finally(() => setLoading(false));
  }, [student, semester, userRole]);

  // PDF Generation using provided transcript data.
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Student Transcript", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Student ID: ${student?.id_id || "N/A"}`, 14, 30);
    doc.text(`Name: ${student?.name || "Student"}`, 14, 40);
    doc.text(`Semester: ${semester || "N/A"}`, 14, 50);
    doc.text(`SPI: ${transcriptData?.spi || "N/A"}`, 14, 60);
    doc.text(`CPI: ${transcriptData?.cpi || "N/A"}`, 14, 70);
  
    const tableColumn = ["Course Code", "Course Name", "Credits", "Grade"];
    const tableRows = [];
    if (transcriptData?.courses_grades) {
      Object.values(transcriptData.courses_grades).forEach(course => {
        const credit = courseData?.find(c => c.code === course.course_code)?.credit || 3;
        tableRows.push([course.course_code, course.course_name, String(credit), course.grade]);
      });
    }
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: "grid",
      styles: { fontSize: 10 }
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
        <Button leftIcon={<IconArrowLeft size={16} />} variant="outline" onClick={onBack}>
          Back to List
        </Button>
        <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red">
          {error}
        </Alert>
      </Card>
    );

  if (!transcriptData?.courses_grades || !Object.keys(transcriptData.courses_grades).length)
    return (
      <Card radius="md" withBorder>
        <Button size="md" radius="sm" leftIcon={<IconArrowLeft size={16} />} variant="outline" onClick={onBack}>
          Back to List
        </Button>
        <Paper p="md" withBorder>
          <Text align="center" size="lg">Marks not yet submitted.</Text>
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
            <Button leftIcon={<IconPrinter size={16} />} variant="outline" onClick={() => window.print()}>
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
            <Text weight={500}>Semester: {semester || "N/A"}</Text>
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
          </tr>
        </thead>
        <tbody>
          {Object.entries(transcriptData.courses_grades).map(([_, course], index) => {
            const credit = courseData?.find(c => c.code === course.course_code)?.credit || 3;
            return (
              <tr key={index}>
                <td>{course.course_code}</td>
                <td>{course.course_name}</td>
                <td>{credit}</td>
                <td>{course.grade}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
      <Divider my="md" />
      <Grid>
        <Grid.Col span={6}>
          <Paper p="md" withBorder>
            <Title order={4}>SPI</Title>
            <Text weight={700} size="xl" mt="md">{transcriptData?.spi || "N/A"}</Text>
          </Paper>
        </Grid.Col>
        <Grid.Col span={6}>
          <Paper p="md" withBorder>
            <Title order={4}>CPI</Title>
            <Text weight={700} size="xl" mt="md">{transcriptData?.cpi || "N/A"}</Text>
          </Paper>
        </Grid.Col>
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
