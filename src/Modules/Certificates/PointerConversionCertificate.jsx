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
  pointerConversionPdfRoute,
  pointerConversionStudentRoute,
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

// The server accepts the same: a number from 0 to 10, at most two decimals.
const CPI_PATTERN = /^(10(\.0{1,2})?|\d(\.\d{1,2})?)$/;
const isValidCpi = (value) => CPI_PATTERN.test(value.trim());

const filenameFrom = (header, fallback) => {
  const match = header?.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallback;
};

// Laid out as the PDF, in the bonafide's type and spacing; only the list
// and details are indented.
const INDENT = { marginLeft: "0.7cm" };
const POINTS = { paddingLeft: "0.7cm", marginTop: "0.2cm", marginBottom: 0 };
const DETAILS = {
  ...INDENT,
  marginTop: "0.2cm",
  borderCollapse: "collapse",
  fontSize: "12pt",
  lineHeight: 1.42,
};

export default function PointerConversionCertificate() {
  const [rollNumber, setRollNumber] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [certificateMeta, setCertificateMeta] = useState(null);
  const [cpiText, setCpiText] = useState("");
  const [minCpi, setMinCpi] = useState("5.0");
  const [preview, setPreview] = useState(null);
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [historyOpened, setHistoryOpened] = useState(false);

  const clearStudent = () => {
    setSelectedStudent(null);
    setCertificateMeta(null);
    setCpiText("");
    setMinCpi("5.0");
    setPreview(null);
  };

  const fetchStudent = async () => {
    const normalizedRollNumber = rollNumber.trim().toUpperCase();
    if (!normalizedRollNumber || fetchingStudent) return;

    clearStudent();
    setRollNumber(normalizedRollNumber);
    setFetchingStudent(true);
    try {
      const { data } = await axios.get(pointerConversionStudentRoute, {
        ...authConfig(),
        params: { roll_number: normalizedRollNumber },
      });
      setSelectedStudent(data.student || null);
      setCertificateMeta(data.certificate || null);
      setCpiText(data.student?.cpi_display || "");
      setMinCpi(data.student?.min_cpi || "5.0");
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
      cpiText: cpiText.trim(),
      minCpi: minCpi.trim(),
    });
  };

  const download = async () => {
    if (!selectedStudent || downloading) return;
    setDownloading(true);
    try {
      const response = await axios.post(
        pointerConversionPdfRoute,
        {
          student_id: selectedStudent.student_id,
          cpi_text: cpiText.trim(),
          min_cpi: minCpi.trim(),
        },
        { ...authConfig(), responseType: "blob" },
      );
      const filename = filenameFrom(
        response.headers["content-disposition"],
        `${selectedStudent.roll_number}_Pointer_Conversion_Certificate.pdf`,
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

  const calculatedCpi = selectedStudent?.cpi_display || "";
  const cpiValid = isValidCpi(cpiText);
  const minCpiValid = isValidCpi(minCpi);
  const cpiChanged =
    cpiValid && calculatedCpi && Number(cpiText) !== Number(calculatedCpi);
  const ready = Boolean(selectedStudent?.is_ready) && cpiValid && minCpiValid;

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
                  {selectedStudent.semester_ordinal && (
                    <Text size="sm">
                      {selectedStudent.semester_ordinal} Semester
                    </Text>
                  )}
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

              {selectedStudent && (
                <>
                  <TextInput
                    label="CPI"
                    placeholder="e.g. 7.3"
                    description={
                      calculatedCpi
                        ? `Calculated from declared results: ${calculatedCpi}.`
                        : "No declared result yet. Enter the CPI."
                    }
                    error={
                      cpiText.trim() && !cpiValid
                        ? "Enter a number from 0 to 10, at most two decimals."
                        : null
                    }
                    value={cpiText}
                    onChange={(event) => {
                      setCpiText(event.currentTarget.value);
                      setPreview(null);
                    }}
                  />
                  <TextInput
                    label="Minimum CPI required for graduation"
                    placeholder="e.g. 5.0"
                    error={
                      minCpi.trim() && !minCpiValid
                        ? "Enter a number from 0 to 10, at most two decimals."
                        : null
                    }
                    value={minCpi}
                    onChange={(event) => {
                      setMinCpi(event.currentTarget.value);
                      setPreview(null);
                    }}
                  />
                  {cpiChanged && (
                    <Alert color="yellow" icon={<Warning size={18} />}>
                      The CPI entered differs from the calculated CPI (
                      {calculatedCpi}). It will be printed as entered.
                    </Alert>
                  )}
                </>
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
                  <div style={{ textAlign: "left", justifySelf: "end" }}>
                    <div>{preview.meta.reference_preview}</div>
                    <div>Date – {preview.meta.issued_on}</div>
                  </div>
                </header>
                <h2 className={classes.heading}>
                  TO WHOM SO EVER IT MAY CONCERN
                </h2>
                <p className={classes.body}>This is to certify that:</p>
                <ol className={classes.body} style={POINTS}>
                  <li>
                    The graduation requirement for{" "}
                    <strong>{preview.student.programme}</strong> (
                    {preview.student.programme_abbr}) programme at PDPM-IIITDM
                    Jabalpur is a minimum CPI of {preview.minCpi} out of the
                    maximum of 10.0.
                  </li>
                  <li>
                    Notionally, the CPI may be multiplied by a factor of 10 to
                    obtain the numerical percentage.
                  </li>
                </ol>
                <p
                  className={classes.body}
                  style={{ ...INDENT, marginTop: "0.9cm" }}
                >
                  <strong>Issued to :</strong>
                </p>
                <table style={DETAILS}>
                  <tbody>
                    {[
                      [
                        "Name",
                        `${preview.student.salutation} ${preview.student.name}`,
                      ],
                      ["Roll No.", preview.student.roll_number],
                      ["Branch", preview.student.discipline],
                      ["CPI", preview.cpiText],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={{ width: "2.2cm" }}>{label}</td>
                        <td style={{ width: "0.5cm" }}>:</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className={classes.signature}>
                  {preview.meta.signatory_name}
                </div>
              </article>
            </div>
          ) : (
            <Alert
              color="blue"
              icon={<Info size={18} />}
              title="Certificate preview"
            >
              Enter a roll number, fetch the student, adjust CPI if needed, and
              choose Preview. The certificate can then be printed or downloaded
              as PDF.
            </Alert>
          )}
        </Grid.Col>
      </Grid>
      <GeneratedCertificatesModal
        opened={historyOpened}
        onClose={() => setHistoryOpened(false)}
        variant="pointerConversion"
      />
    </>
  );
}
