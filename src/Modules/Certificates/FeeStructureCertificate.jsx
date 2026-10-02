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
  feeStructureCertificatePdfRoute,
  feeStructureCertificateStudentRoute,
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
      const parsed = JSON.parse(await payload.text());
      return [parsed.error, ...(parsed.details ?? [])]
        .filter(Boolean)
        .join(" ");
    } catch {
      return "Certificate generation failed.";
    }
  }
  return (
    [payload?.error, ...(payload?.details ?? [])].filter(Boolean).join(" ") ||
    payload?.message ||
    payload?.detail ||
    "Unable to complete the request."
  );
};

const filenameFrom = (header, fallback) => {
  const match = header?.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallback;
};

const indianCurrency = (value) => {
  const [whole, fraction] = Number(value).toFixed(2).split(".");
  const head = whole.slice(0, -3);
  const tail = whole.slice(-3);
  const grouped = head
    ? `${head.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},${tail}`
    : tail;
  return `${grouped}.${fraction}`;
};

const columnTotal = (rows, key) =>
  rows.reduce((sum, row) => sum + Number(row[key] || 0), 0);

export default function FeeStructureCertificate() {
  const [rollNumber, setRollNumber] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [structure, setStructure] = useState(null);
  const [certificateMeta, setCertificateMeta] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [historyOpened, setHistoryOpened] = useState(false);

  const clearStudent = () => {
    setSelectedStudent(null);
    setStructure(null);
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
      const { data } = await axios.get(feeStructureCertificateStudentRoute, {
        ...authConfig(),
        params: { roll_number: normalizedRollNumber },
      });
      setSelectedStudent(data.student || null);
      setStructure(data.structure || null);
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
    if (!selectedStudent || !structure?.rows?.length || !certificateMeta)
      return;
    setPreview({
      student: selectedStudent,
      structure,
      meta: certificateMeta,
    });
  };

  const download = async () => {
    if (!selectedStudent || downloading) return;
    setDownloading(true);
    try {
      const response = await axios.post(
        feeStructureCertificatePdfRoute,
        { student_id: selectedStudent.student_id },
        { ...authConfig(), responseType: "blob" },
      );
      const filename = filenameFrom(
        response.headers["content-disposition"],
        `${selectedStudent.roll_number}_Fee_Structure_Certificate.pdf`,
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

  const ready = Boolean(selectedStudent?.is_ready && structure?.rows?.length);

  return (
    <>
      <Grid gutter="lg" className={classes.layout}>
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Paper withBorder p="lg" radius="md" className={classes.controls}>
            <Stack gap="md">
              <div>
                <Title order={3}>Generate fee structure certificate</Title>
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
                  {structure?.academic_year_label && (
                    <Text size="sm">
                      Financial Year: {structure.academic_year_label}
                    </Text>
                  )}
                </Paper>
              )}

              {selectedStudent && !selectedStudent.is_ready && (
                <Alert
                  color="red"
                  icon={<Warning size={18} />}
                  title="Cannot issue this certificate"
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
              <article
                className={`${classes.certificate} ${classes.certificateSmall}`}
              >
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
                <div
                  className={classes.structureDetails}
                  style={{ marginTop: "20pt" }}
                >
                  <strong>Name:</strong>
                  <span className={classes.structureDetailsSpan}>
                    {preview.student.name}
                  </span>
                  <strong>Father&apos;s Name:</strong>
                  <span className={classes.structureDetailsSpan}>
                    Mr. {preview.student.father_name}
                  </span>
                  <strong>Roll No:</strong>
                  <span>{preview.student.roll_number}</span>
                  <strong>Branch:</strong>
                  <span>{preview.student.discipline}</span>
                  <strong>Semester:</strong>
                  <span>{preview.student.semester_ordinal}</span>
                  <strong>Programme:</strong>
                  <span>{preview.student.programme_short}</span>
                  <strong>Financial Year:</strong>
                  <span className={classes.structureDetailsSpan}>
                    {preview.structure.academic_year_label}
                  </span>
                </div>
                <p
                  className={classes.body}
                  style={{ fontWeight: 700, textDecoration: "underline" }}
                >
                  Details Break-up:
                </p>
                <table className={classes.structureTable}>
                  <colgroup>
                    <col style={{ width: "9%" }} />
                    <col style={{ width: "37%" }} />
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "18%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Fee Head(s)</th>
                      <th>Semester-I</th>
                      <th>Semester-II</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.structure.rows.map((row, index) => (
                      <tr key={`${row.label}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{row.label}</td>
                        <td>{indianCurrency(row.sem1)}</td>
                        <td>{indianCurrency(row.sem2)}</td>
                        <td>{indianCurrency(row.total)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={2}>
                        <strong>Total (Rs)</strong>
                      </td>
                      <td>
                        <strong>
                          {indianCurrency(
                            columnTotal(preview.structure.rows, "sem1"),
                          )}
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {indianCurrency(
                            columnTotal(preview.structure.rows, "sem2"),
                          )}
                        </strong>
                      </td>
                      <td>
                        <strong>
                          {indianCurrency(
                            columnTotal(preview.structure.rows, "total"),
                          )}
                        </strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
        variant="feeStructure"
      />
    </>
  );
}
