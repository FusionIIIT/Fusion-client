import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Button,
  LoadingOverlay,
  Select,
  Stack,
  FileButton,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconUpload, IconDownload } from "@tabler/icons-react";
import axios from "axios";
import * as XLSX from "xlsx";
import {
  allotCoursesRoute,
  allotThesisRoute,
  allotProgressSeminarRoute,
  allotTeachingCreditRoute,
  listBatchesRoute,
} from "../../routes/academicRoutes";

// Course needs a per-row slot/course lookup + academic year + semester type.
// Thesis/Seminar/Teaching Credit each have at most one slot per semester, so
// the slot is resolved server-side from the semester alone -- no per-row slot
// column, no academic year/semester type needed (the backend derives the
// session from the current date, same as the student self-registration flow).
const REGISTRATION_TYPES = [
  { value: "course", label: "Course" },
  { value: "thesis", label: "Thesis" },
  { value: "seminar", label: "Progress Seminar" },
  { value: "teaching_credit", label: "Teaching Credit" },
];

export default function AllotCourses() {
  const [programmeOptions, setProgrammeOptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationType, setRegistrationType] = useState("course");
  const [programme, setProgramme] = useState(null); // Changed to null
  const [semesterValue, setSemesterValue] = useState(null); // Changed to null
  const [semester, setSemester] = useState("");
  const [semesterType, setSemesterType] = useState("");
  const [academicYear, setAcademicYear] = useState(null); // Changed to null
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  const semesterOptions = [
    {
      value: JSON.stringify({ no: 1, type: "Odd Semester" }),
      label: "Semester 1 (Odd)",
    },
    {
      value: JSON.stringify({ no: 2, type: "Even Semester" }),
      label: "Semester 2 (Even)",
    },
    {
      value: JSON.stringify({ no: 2, type: "Summer Semester" }),
      label: "Summer Term 1",
    },
    {
      value: JSON.stringify({ no: 3, type: "Odd Semester" }),
      label: "Semester 3 (Odd)",
    },
    {
      value: JSON.stringify({ no: 4, type: "Even Semester" }),
      label: "Semester 4 (Even)",
    },
    {
      value: JSON.stringify({ no: 4, type: "Summer Semester" }),
      label: "Summer Term 2",
    },
    {
      value: JSON.stringify({ no: 5, type: "Odd Semester" }),
      label: "Semester 5 (Odd)",
    },
    {
      value: JSON.stringify({ no: 6, type: "Even Semester" }),
      label: "Semester 6 (Even)",
    },
    {
      value: JSON.stringify({ no: 6, type: "Summer Semester" }),
      label: "Summer Term 3",
    },
    {
      value: JSON.stringify({ no: 7, type: "Odd Semester" }),
      label: "Semester 7 (Odd)",
    },
    {
      value: JSON.stringify({ no: 8, type: "Even Semester" }),
      label: "Semester 8 (Even)",
    },
    {
      value: JSON.stringify({ no: 8, type: "Summer Semester" }),
      label: "Summer Term 4",
    },
    {
      value: JSON.stringify({ no: 9, type: "Odd Semester" }),
      label: "Semester 9 (Odd)",
    },
    {
      value: JSON.stringify({ no: 10, type: "Even Semester" }),
      label: "Semester 10 (Even)",
    },
    {
      value: JSON.stringify({ no: 10, type: "Summer Semester" }),
      label: "Summer Term 5",
    },
    {
      value: JSON.stringify({ no: 11, type: "Odd Semester" }),
      label: "Semester 11 (Odd)",
    },
    {
      value: JSON.stringify({ no: 12, type: "Even Semester" }),
      label: "Semester 12 (Even)",
    },
    {
      value: JSON.stringify({ no: 12, type: "Summer Semester" }),
      label: "Summer Term 6",
    },
  ];

  useEffect(() => {
    const endYear = new Date().getFullYear();
    const yrs = [];
    for (let y = endYear; y >= 2020; y -= 1) {
      yrs.push({
        value: `${y}-${String(y + 1).slice(-2)}`,
        label: `${y}-${String(y + 1).slice(-2)}`,
      });
    }
    setAcademicYearOptions(yrs);
  }, []);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      showNotification({
        title: "Error",
        message: "No auth token",
        color: "red",
      });
      setLoading(false);
      return;
    }
    axios
      .get(listBatchesRoute, { headers: { Authorization: `Token ${token}` } })
      .then((res) => {
        if (res.data && Array.isArray(res.data)) {
          const validBatches = res.data.filter((bat) => {
            const hasId = bat.id;
            const hasLabel = bat.label;
            const hasYear = bat.year;

            return hasId && hasLabel && hasYear;
          });

          if (validBatches.length === 0) {
            showNotification({
              title: "No Batches Available",
              message:
                "No valid batch data found. Please contact administrator.",
              color: "yellow",
            });
            setProgrammeOptions([]);
            return;
          }

          const uniqueOptions = validBatches.map((bat) => ({
            value: String(bat.id),
            label: bat.label,
            batchData: bat,
          }));

          const seenValues = new Set();
          const deduplicatedOptions = uniqueOptions
            .filter((option) => {
              if (seenValues.has(option.value)) return false;
              seenValues.add(option.value);
              return true;
            })
            .sort((a, b) => {
              const yearDiff =
                (b.batchData.year ?? 0) - (a.batchData.year ?? 0);
              if (yearDiff !== 0) return yearDiff;
              return (a.label ?? "").localeCompare(b.label ?? "");
            });

          setProgrammeOptions(deduplicatedOptions);
        } else {
          showNotification({
            title: "Error",
            message: "Invalid data format received",
            color: "red",
          });
        }
      })
      .catch((err) => {
        console.error("API Error:", err);
        const errorMsg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message;
        showNotification({
          title: "Error fetching batches",
          message: errorMsg,
          color: "red",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setProgramme(null);
    setSemesterValue(null);
    setSemester("");
    setSemesterType("");
    setAcademicYear(null);
    setSelectedFile(null);
    setFileKey((f) => f + 1);
  };

  const TEMPLATES = {
    course: {
      header: ["RollNo", "CourseSlot", "CourseCode", "CourseName"],
      rows: [
        {
          RollNo: "220101001",
          CourseSlot: "Slot A",
          CourseCode: "CSE101",
          CourseName: "Data Structures",
        },
        {
          RollNo: "220101002",
          CourseSlot: "Slot B",
          CourseCode: "CSE102",
          CourseName: "Algorithms",
        },
      ],
    },
    thesis: {
      header: ["RollNo", "ThesisSlot", "ThesisCode", "ThesisName", "Credits"],
      rows: [
        {
          RollNo: "22PCS001",
          ThesisSlot: "Slot A",
          ThesisCode: "TH101",
          ThesisName: "Doctoral Thesis",
          Credits: 6,
        },
        {
          RollNo: "22PCS002",
          ThesisSlot: "Slot A",
          ThesisCode: "TH101",
          ThesisName: "Doctoral Thesis",
          Credits: 12,
        },
      ],
    },
    seminar: {
      header: ["RollNo", "SeminarSlot", "SeminarCode", "SeminarName"],
      rows: [
        {
          RollNo: "22PCS001",
          SeminarSlot: "Slot A",
          SeminarCode: "PS101",
          SeminarName: "Progress Seminar",
        },
        {
          RollNo: "22PCS002",
          SeminarSlot: "Slot A",
          SeminarCode: "PS101",
          SeminarName: "Progress Seminar",
        },
      ],
    },
    teaching_credit: {
      header: [
        "RollNo",
        "TeachingCreditSlot",
        "TeachingCreditCode",
        "TeachingCreditName",
      ],
      rows: [
        {
          RollNo: "22PCS001",
          TeachingCreditSlot: "Slot A",
          TeachingCreditCode: "TC101",
          TeachingCreditName: "Teaching Assistantship",
        },
        {
          RollNo: "22PCS002",
          TeachingCreditSlot: "Slot A",
          TeachingCreditCode: "TC101",
          TeachingCreditName: "Teaching Assistantship",
        },
      ],
    },
  };

  const downloadTemplate = () => {
    const { header, rows } = TEMPLATES[registrationType];
    const ws = XLSX.utils.json_to_sheet(rows, { header });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "allotment_template.xls", { bookType: "xls" });
  };

  const isFormValid =
    registrationType === "course"
      ? Boolean(
          selectedFile && programme && semester && semesterType && academicYear,
        )
      : Boolean(selectedFile && programme && semester);

  const handleUpload = () => {
    if (!isFormValid) {
      showNotification({
        title: "Incomplete",
        message: "Please fill all fields and select a file",
        color: "yellow",
      });
      return;
    }

    const selectedBatch = programmeOptions.find(
      (option) => option.value === programme,
    );
    const batchLabel = selectedBatch?.label || "";
    let extractedSpecialization = null;

    // Extract specialization from the label (format: "B.Des Des. 2021" or "M.Tech AI & ML 2024")
    if (batchLabel.includes("M.Tech")) {
      const specializationMap = {
        "AI & ML": "AI & ML",
        "Data Science": "Data Science",
        "Signal Processing": "Signal Processing",
        Communication: "Communication",
        "CAD/CAM": "CAD/CAM",
        Thermal: "Thermal",
        VLSI: "VLSI",
        Mechatronics: "Mechatronics",
      };

      const matched = Object.entries(specializationMap).find(([key]) =>
        batchLabel.includes(key),
      );
      if (matched) {
        const [, value] = matched;
        extractedSpecialization = value;
      }
    }

    setIsUploading(true);
    setLoading(true);
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("batch", programme);
    formData.append("semester", semester);

    const UPLOAD_CONFIG = {
      course: { route: allotCoursesRoute, fileField: "allotedCourses" },
      thesis: { route: allotThesisRoute, fileField: "allotedThesis" },
      seminar: {
        route: allotProgressSeminarRoute,
        fileField: "allotedSeminar",
      },
      teaching_credit: {
        route: allotTeachingCreditRoute,
        fileField: "allotedTeachingCredit",
      },
    };
    const { route, fileField } = UPLOAD_CONFIG[registrationType];
    formData.append(fileField, selectedFile);

    if (registrationType === "course") {
      formData.append("semester_type", semesterType);
      formData.append("academic_year", academicYear);
      if (extractedSpecialization) {
        formData.append("specialization", extractedSpecialization);
      }
    }

    axios
      .post(route, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
      })
      .then(() => {
        showNotification({
          title: "Success",
          message: "Allotted successfully",
          color: "green",
        });
        resetForm();
      })
      .catch((err) => {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message;
        showNotification({
          title: "Error",
          message: msg || "Upload failed",
          color: "red",
        });
        setSelectedFile(null);
        setFileKey((f) => f + 1);
      })
      .finally(() => {
        setIsUploading(false);
        setLoading(false);
      });
  };

  const handleSemesterChange = (value) => {
    setSemesterValue(value || null);
    if (value) {
      try {
        const { no, type } = JSON.parse(value);
        setSemester(String(no));
        setSemesterType(type);
      } catch (error) {
        console.error("Error parsing semester value:", error);
        setSemester("");
        setSemesterType("");
      }
    } else {
      setSemester("");
      setSemesterType("");
    }
  };

  return (
    <Card>
      <LoadingOverlay visible={loading} />
      <Select
        label="Registration Type"
        data={REGISTRATION_TYPES}
        value={registrationType}
        onChange={(v) => {
          setRegistrationType(v);
          setSelectedFile(null);
          setFileKey((f) => f + 1);
        }}
        mb="md"
      />
      <Button
        leftSection={<IconDownload />}
        variant="light"
        onClick={downloadTemplate}
        mb="md"
      >
        Download Template
      </Button>
      <Text size="sm" c="dimmed" mb="sm">
        Format: {TEMPLATES[registrationType].header.join(" | ")}
      </Text>
      <Divider mb="lg" />
      <Stack gap="md" mb="lg">
        <Select
          clearable
          label="Programme"
          placeholder="Select batch"
          data={programmeOptions}
          value={programme}
          onChange={setProgramme}
          searchable
        />
        <Select
          clearable
          label="Semester"
          placeholder="Select semester"
          data={semesterOptions}
          value={semesterValue}
          onChange={handleSemesterChange}
          searchable
        />
        {registrationType === "course" && (
          <Select
            clearable
            label="Academic Year"
            placeholder="Select year"
            data={academicYearOptions}
            value={academicYear}
            onChange={setAcademicYear}
          />
        )}
      </Stack>
      <FileButton key={fileKey} onChange={setSelectedFile} accept=".xlsx,.xls">
        {({ onClick }) => (
          <Button
            onClick={onClick}
            leftSection={<IconUpload />}
            variant="outline"
            fullWidth
            mb="md"
          >
            {selectedFile ? selectedFile.name : "Choose Excel file"}
          </Button>
        )}
      </FileButton>
      <Button
        fullWidth
        size="md"
        leftSection={<IconUpload />}
        loading={isUploading}
        onClick={handleUpload}
        disabled={!isFormValid || isUploading}
      >
        {isUploading ? "Uploading..." : "Upload & Allot"}
      </Button>
    </Card>
  );
}
