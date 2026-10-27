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
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
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
  demandLetterPdfRoute,
  demandLetterStudentRoute,
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

const MONTHS = [
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

const ordinal = (value) => {
  const mod100 = value % 100;
  if (mod100 >= 10 && mod100 <= 20) return `${value}th`;
  const suffix = { 1: "st", 2: "nd", 3: "rd" }[value % 10] || "th";
  return `${value}${suffix}`;
};

const toISODate = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDueDate = (date) => {
  if (!date) return "";
  return `${MONTHS[date.getMonth()]} ${String(date.getDate()).padStart(2, "0")}, ${date.getFullYear()}`;
};

export default function DemandLetter() {
  const [rollNumber, setRollNumber] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [semesters, setSemesters] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [academicYearLabel, setAcademicYearLabel] = useState("");
  const [demand, setDemand] = useState(null);
  const [bank, setBank] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [certificateMeta, setCertificateMeta] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fetchingStudent, setFetchingStudent] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [historyOpened, setHistoryOpened] = useState(false);

  const clearStudent = () => {
    setSelectedStudent(null);
    setSemesters([]);
    setSelectedSemester(null);
    setAcademicYearLabel("");
    setDemand(null);
    setBank(null);
    setDueDate(null);
    setCertificateMeta(null);
    setPreview(null);
  };

  const fetchStudent = async (roll, semester) => {
    if (!roll || fetchingStudent) return;
    setFetchingStudent(true);
    try {
      const { data } = await axios.get(demandLetterStudentRoute, {
        ...authConfig(),
        params: { roll_number: roll, semester: semester || undefined },
      });
      setSelectedStudent(data.student || null);
      setSemesters(
        (data.semesters || []).map((item) => ({
          value: String(item.value),
          label: item.label,
        })),
      );
      setSelectedSemester(data.selected_semester ?? null);
      setAcademicYearLabel(data.academic_year_label || "");
      setDemand(data.demand || null);
      setBank(data.bank || null);
      setCertificateMeta(data.certificate || null);
      setPreview(null);
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

  const searchStudent = () => {
    const normalizedRollNumber = rollNumber.trim().toUpperCase();
    if (!normalizedRollNumber) return;
    clearStudent();
    setRollNumber(normalizedRollNumber);
    fetchStudent(normalizedRollNumber);
  };

  const changeSemester = (value) => {
    const semester = Number(value);
    setSelectedSemester(semester);
    setPreview(null);
    fetchStudent(rollNumber, semester);
  };

  const showPreview = () => {
    if (!selectedStudent || !demand || !dueDate || !certificateMeta) return;
    setPreview({
      student: selectedStudent,
      demand,
      bank,
      selectedSemester,
      academicYearLabel,
      dueDateDisplay: formatDueDate(dueDate),
      meta: certificateMeta,
    });
  };

  const download = async () => {
    if (!selectedStudent || !demand || !dueDate || downloading) return;
    setDownloading(true);
    try {
      const response = await axios.post(
        demandLetterPdfRoute,
        {
          student_id: selectedStudent.student_id,
          semester: selectedSemester,
          due_date: toISODate(dueDate),
        },
        { ...authConfig(), responseType: "blob" },
      );
      const filename = filenameFrom(
        response.headers["content-disposition"],
        `${selectedStudent.roll_number}_Demand_Letter.pdf`,
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

  const ready = Boolean(
    selectedStudent?.is_ready && demand && dueDate && selectedSemester,
  );

  return (
    <>
      <Grid gutter="lg" className={classes.layout}>
        <Grid.Col span={{ base: 12, xl: 4 }}>
          <Paper withBorder p="lg" radius="md" className={classes.controls}>
            <Stack gap="md">
              <div>
                <Title order={3}>Generate demand letter</Title>
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
                    searchStudent();
                  }
                }}
                rightSection={
                  fetchingStudent ? <Loader size={16} /> : undefined
                }
              />
              <Button
                variant="light"
                leftSection={<MagnifyingGlass size={18} />}
                onClick={searchStudent}
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
                  title="Cannot issue this certificate"
                >
                  {selectedStudent.validation_errors.join(" ")}
                </Alert>
              )}

              {semesters.length > 0 && (
                <Select
                  label="Fee demand for semester"
                  description={
                    academicYearLabel
                      ? `Academic Year: ${academicYearLabel}`
                      : undefined
                  }
                  data={semesters}
                  value={selectedSemester ? String(selectedSemester) : null}
                  onChange={changeSemester}
                  searchable
                />
              )}

              {selectedStudent?.is_ready && (
                <DatePickerInput
                  label="Fee submission due date"
                  placeholder="Select date"
                  value={dueDate}
                  onChange={(value) => {
                    setDueDate(value);
                    setPreview(null);
                  }}
                  valueFormat="DD MMM YYYY"
                />
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
                <h2 className={classes.heading}>
                  TO WHOM SO EVER IT MAY CONCERN
                </h2>
                <p className={classes.body}>
                  This is certify that{" "}
                  <strong>
                    {preview.student.salutation} {preview.student.name}
                  </strong>{" "}
                  (Roll No. {preview.student.roll_number}){" "}
                  {preview.student.relation}{" "}
                  <strong>MR. {preview.student.father_name}</strong> is a
                  bonafide student of{" "}
                  <strong>{preview.student.year_ordinal} year</strong> (
                  {preview.student.semester_ordinal} Semester) of{" "}
                  <strong>{preview.student.programme}</strong> Programme in{" "}
                  <strong>{preview.student.discipline_with_acronym}</strong> at{" "}
                  {preview.meta.institute_name}. The Date of fees submission as
                  detailed below for Semester{" "}
                  <strong>
                    {ordinalWithSuperscript(ordinal(preview.selectedSemester))}
                  </strong>
                  , <strong>{preview.academicYearLabel}</strong> is on or before{" "}
                  <strong>{preview.dueDateDisplay}</strong>.
                </p>
                <table
                  className={`${classes.feeTable} ${classes.demandFeeTable}`}
                >
                  <tbody>
                    <tr>
                      <td>{preview.demand.programme_short}</td>
                      <td>Category</td>
                      <td>Fee</td>
                      <td>Amount</td>
                    </tr>
                    <tr>
                      <td rowSpan={2}>{preview.demand.batch_year}</td>
                      <td rowSpan={2}>{preview.demand.category_label}</td>
                      <td>Academic Fee</td>
                      <td>{preview.demand.academic_fee_display}/-</td>
                    </tr>
                    <tr>
                      <td>Mess Fee</td>
                      <td>{preview.demand.mess_fee_display}/-</td>
                    </tr>
                    <tr>
                      <td colSpan={3} style={{ textAlign: "right" }}>
                        Total Rs. =
                      </td>
                      <td>{preview.demand.total_display}/-</td>
                    </tr>
                  </tbody>
                </table>
                <p className={classes.body}>
                  The above mentioned fee is to be paid through online mode
                  only, Institute bank details are as follows:
                </p>
                <p className={classes.bankTableHeading}>
                  <u>Bank A/c Details for Transferring Fee</u>
                </p>
                <div className={classes.bankTables}>
                  {["academic", "mess"].map((key) => (
                    <div key={key}>
                      <p className={classes.bankTableHeading}>
                        {key === "academic" ? "Academic Fee" : "Mess Fee"}
                      </p>
                      <table className={classes.bankTable}>
                        <tbody>
                          <tr>
                            <td>Account Name</td>
                            <td>{preview.bank[key].name}</td>
                          </tr>
                          <tr>
                            <td>Account Number</td>
                            <td>{preview.bank[key].number}</td>
                          </tr>
                          <tr>
                            <td>IFSC</td>
                            <td>{preview.bank[key].ifsc}</td>
                          </tr>
                          <tr>
                            <td>Bank &amp; Branch</td>
                            <td>{preview.bank[key].bank_branch}</td>
                          </tr>
                          <tr>
                            <td>Account Type</td>
                            <td>{preview.bank[key].account_type}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
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
              Enter a roll number, fetch the student, pick the semester being
              demanded and a due date, and choose Preview. The certificate can
              then be printed or downloaded as PDF.
            </Alert>
          )}
        </Grid.Col>
      </Grid>
      <GeneratedCertificatesModal
        opened={historyOpened}
        onClose={() => setHistoryOpened(false)}
        variant="demand"
      />
    </>
  );
}
