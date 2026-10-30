import { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import {
  Alert,
  Badge,
  Button,
  Divider,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  ClockCounterClockwise,
  DownloadSimple,
  Eye,
  Info,
  MagnifyingGlass,
  Warning,
} from "@phosphor-icons/react";

import {
  mediumOfInstructionPdfRoute,
  mediumOfInstructionStudentRoute,
} from "../../routes/academicRoutes";
import classes from "./BonafideCertificate.module.css";
import GeneratedCertificatesModal from "./GeneratedCertificatesModal";

const authConfig = () => ({
  headers: {
    Authorization: `Token ${localStorage.getItem("authToken")}`,
  },
});

const responseMessage = async (error) => {
  const payload = error?.response?.data;
  if (payload instanceof Blob) {
    try {
      return JSON.parse(await payload.text()).error;
    } catch {
      return "Certificate generation failed.";
    }
  }
  return (
    payload?.error ||
    payload?.message ||
    payload?.detail ||
    "Unable to complete the request."
  );
};

const filenameFrom = (header, fallback) => {
  const match = header?.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallback;
};

// Renders an ordinal such as "4th" with the suffix raised, as the PDF does.
function ordinalWithSuperscript(value) {
  const match = /^(\d+)(st|nd|rd|th)$/.exec((value ?? "").trim());
  if (!match) return value;
  return (
    <>
      {match[1]}
      <sup>{match[2]}</sup>
    </>
  );
}

export default function MediumOfInstructionCertificate() {
  const [rollNumber, setRollNumber] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [certificateMeta, setCertificateMeta] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [historyOpened, setHistoryOpened] = useState(false);

  const clearStudent = () => {
    setSelectedStudent(null);
    setCertificateMeta(null);
    setPreview(null);
  };

  const fetchStudent = async () => {
    const normalizedRollNumber = rollNumber.trim().toUpperCase();
    if (!normalizedRollNumber || fetchingStudent) return;

    clearStudent();
    setRollNumber(normalizedRollNumber);
    setFetchingStudent(true);
    try {
      const { data } = await axios.get(mediumOfInstructionStudentRoute, {
        ...authConfig(),
        params: { roll_number: normalizedRollNumber },
      });
      setSelectedStudent(data.student || null);
      setCertificateMeta(data.certificate || null);
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Student unavailable",
        message: await responseMessage(error),
      });
    } finally {
      setFetchingStudent(false);
    }
  };

  const showPreview = () => {
    if (!selectedStudent || !certificateMeta) return;
    setPreview({
      student: selectedStudent,
      meta: certificateMeta,
    });
  };

  const download = async () => {
    if (!selectedStudent || downloading) return;
    setDownloading(true);
    try {
      const response = await axios.post(
        mediumOfInstructionPdfRoute,
        {
          student_id: selectedStudent.student_id,
        },
        { ...authConfig(), responseType: "blob" },
      );
      const filename = filenameFrom(
        response.headers["content-disposition"],
        `${selectedStudent.roll_number}_Medium_of_Instruction_Certificate.pdf`,
      );
      saveAs(response.data, filename);
      notifications.show({
        color: "green",
        title: "Certificate downloaded",
        message: response.headers["x-certificate-reference"] || filename,
      });
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Download failed",
        message: await responseMessage(error),
      });
    } finally {
      setDownloading(false);
    }
  };

  const ready = Boolean(selectedStudent?.is_ready);

  return (
    <>
      <Grid gutter="lg" className={classes.layout}>
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Paper withBorder p="lg" radius="md" className={classes.controls}>
            <Stack gap="md">
              <div>
                <Title order={3}>Generate certificate</Title>
                <Text c="dimmed" size="sm" mt={4}>
                  Enter a roll number to fetch the student details.
                </Text>
              </div>
              <Divider />
              <TextInput
                label="Roll number"
                placeholder="Enter roll number"
                value={rollNumber}
                onChange={(event) => {
                  setRollNumber(event.currentTarget.value.toUpperCase());
                  clearStudent();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    fetchStudent();
                  }
                }}
                rightSection={
                  fetchingStudent ? <Loader size={16} /> : undefined
                }
              />
              <Button
                variant="light"
                leftSection={<MagnifyingGlass size={18} />}
                onClick={fetchStudent}
                disabled={!rollNumber.trim()}
                loading={fetchingStudent}
                fullWidth
              >
                Fetch student details
              </Button>
              {selectedStudent && (
                <Paper withBorder p="md" radius="sm">
                  <Group justify="space-between" mb="xs">
                    <Text fw={600}>{selectedStudent.name}</Text>
                    <Badge color={selectedStudent.is_ready ? "green" : "red"}>
                      {selectedStudent.is_ready ? "Ready" : "Incomplete"}
                    </Badge>
                  </Group>
                  <Text size="sm">Roll No.: {selectedStudent.roll_number}</Text>
                  <Text size="sm">
                    {selectedStudent.programme} in {selectedStudent.discipline}
                  </Text>
                  <Text size="sm">
                    {selectedStudent.year_ordinal} Year,{" "}
                    {selectedStudent.semester_ordinal} Semester
                  </Text>
                </Paper>
              )}

              {selectedStudent && !selectedStudent.is_ready && (
                <Alert
                  color="red"
                  icon={<Warning size={18} />}
                  title="Student data incomplete"
                >
                  {selectedStudent.validation_errors.join(" ")}
                </Alert>
              )}

              <Group grow>
                <Button
                  variant="default"
                  leftSection={<Eye size={18} />}
                  onClick={showPreview}
                  disabled={!ready}
                >
                  Preview
                </Button>
                <Button
                  leftSection={<DownloadSimple size={18} />}
                  onClick={download}
                  disabled={!ready}
                  loading={downloading}
                >
                  Download
                </Button>
              </Group>
              <Button
                variant="light"
                leftSection={<ClockCounterClockwise size={18} />}
                onClick={() => setHistoryOpened(true)}
                fullWidth
              >
                Already Generated
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, xl: 8 }}>
          {preview ? (
            <div className={classes.previewViewport}>
              <article className={classes.certificate}>
                <header className={classes.certificateHeader}>
                  <div>
                    <div>{preview.meta.signatory_name}</div>
                    <div>{preview.meta.signatory_title}</div>
                  </div>
                  <div className={classes.reference}>
                    <div>{preview.meta.reference_preview}</div>
                    <div>Date: {preview.meta.issued_on}</div>
                  </div>
                </header>
                <h2 className={classes.heading}>
                  TO WHOM SO EVER IT MAY CONCERN
                </h2>
                <p className={classes.body}>
                  This is to certify that{" "}
                  <strong>
                    {preview.student.salutation} {preview.student.name}
                  </strong>{" "}
                  (Roll No. {preview.student.roll_number}),{" "}
                  {preview.student.relation} Mr. {preview.student.father_name},
                  is a student of{" "}
                  {ordinalWithSuperscript(preview.student.year_ordinal)} Year (
                  {ordinalWithSuperscript(preview.student.semester_ordinal)}{" "}
                  Semester) <strong>{preview.student.programme_short}</strong>{" "}
                  programme from <strong>{preview.student.discipline}</strong>{" "}
                  discipline. Institute provides education mode of instruction
                  to the students in English only.
                </p>
                <div className={classes.signature}>
                  ({preview.meta.signatory_name})
                </div>
              </article>
            </div>
          ) : (
            <Alert
              color="blue"
              icon={<Info size={18} />}
              title="Certificate preview"
            >
              Enter a roll number, fetch the student, and choose Preview. The
              certificate can then be printed or downloaded as PDF.
            </Alert>
          )}
        </Grid.Col>
      </Grid>
      <GeneratedCertificatesModal
        opened={historyOpened}
        onClose={() => setHistoryOpened(false)}
        variant="mediumOfInstruction"
      />
    </>
  );
}
