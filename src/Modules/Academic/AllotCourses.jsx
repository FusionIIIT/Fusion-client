import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Button,
  LoadingOverlay,
  Select,
  Stack,
  TextInput,
  Group,
  FileButton,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconUpload, IconDownload } from "@tabler/icons-react";
import axios from "axios";
import * as XLSX from "xlsx";
import { allotCoursesRoute, batchesRoute } from "../../routes/academicRoutes";

export default function AllotCourses() {
  const [programmeOptions, setProgrammeOptions] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [programme, setProgramme] = useState("");
  const [semester, setSemester] = useState("");
  const [semesterType, setSemesterType] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [academicYearOptions, setAcademicYearOptions] = useState([]);

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const start = y - 3;
    const yrs = [];
    for (let i = 0; i <= 6; i++) {
      const y1 = start + i;
      const y2 = y1 + 1;
      yrs.push({ value: `${y1}-${String(y2).slice(-2)}`, label: `${y1}-${String(y2).slice(-2)}` });
    }
    setAcademicYearOptions(yrs);
  }, []);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      showNotification({ title: "Error", message: "No auth token", color: "red" });
      setLoading(false);
      return;
    }
    axios.get(batchesRoute, { headers: { Authorization: `Token ${token}` } })
      .then((res) => {
        setProgrammeOptions(
          res.data.batches.map((bat) => ({
            value: bat.batch_id.toString(),
            label: `${bat.name} ${bat.discipline} ${bat.year}`,
          }))
        );
      })
      .catch((err) => {
        showNotification({ title: "Error fetching batches", message: err.message, color: "red" });
      })
      .finally(() => setLoading(false));
  }, []);

  const downloadTemplate = () => {
    const rows = [
      { RollNo: "220101001", CourseSlot: "Slot A", CourseCode: "CSE101", CourseName: "Data Structures" },
      { RollNo: "220101002", CourseSlot: "Slot B", CourseCode: "CSE102", CourseName: "Algorithms" },
    ];
    const ws = XLSX.utils.json_to_sheet(rows, {
      header: ["RollNo", "CourseSlot", "CourseCode", "CourseName"],
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
  
    XLSX.writeFile(wb, "allotment_template.xls", { bookType: "xls" });
  };

  const isFormValid = selectedFile && programme && semester && semesterType && academicYear;

  const handleUpload = () => {
    if (!isFormValid) {
      showNotification({ title: "Incomplete", message: "Please fill all fields and select a file", color: "yellow" });
      return;
    }
    setIsUploading(true);
    setLoading(true);
    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("allotedCourses", selectedFile);
    formData.append("batch", programme);
    formData.append("semester", semester);
    formData.append("semester_type", semesterType);
    formData.append("academic_year", academicYear);
  
    axios.post(allotCoursesRoute, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Token ${token}`,
      },
    })
      .then(() =>
        showNotification({ title: "Success", message: "Courses allotted successfully", color: "green" })
      )
      .catch((err) => {
        const msg = err.response?.data?.error || err.response?.data?.message || err.message;
        showNotification({ title: "Error", message: msg || "Upload failed", color: "red" });
      })
      .finally(() => {
        setIsUploading(false);
        setLoading(false);
        setSelectedFile(null);
        setProgramme("");
        setSemester("");
        setSemesterType("");
        setAcademicYear("");
      });
  };

  return (
    <Card>
      <LoadingOverlay visible={loading} overlayBlur={3} />
      <Text size="2xl" weight={700} align="center" mb="md">
        Allot Student Courses
      </Text>
      <Button leftIcon={<IconDownload />} variant="light" onClick={downloadTemplate}>
          Download Template
      </Button>
      <Group position="apart" mb="md">
        <Text size="sm" color="dimmed">Format: RollNo | CourseSlot | CourseCode | CourseName</Text>
      </Group>
      <Divider mb="lg" />

      <Stack spacing="md" mb="lg">
        <Select
          label="Programme"
          placeholder="Select batch"
          data={programmeOptions}
          value={programme}
          onChange={setProgramme}
          searchable
          nothingFound="No programmes"
        />
        <Group noWrap>
          <TextInput
            label="Semester"
            placeholder="e.g. 1"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            style={{ flex: 1 }}
          />
          <Select
            label="Type"
            placeholder="Odd / Even"
            data={[{ value: "Odd Semester", label: "Odd Semester" }, { value: "Even Semester", label: "Even Semester" }, { value: "Summer Semester", label: "Summer Semester" }]}
            value={semesterType}
            onChange={setSemesterType}
            style={{ flex: 1 }}
          />
        </Group>
        <Select
          label="Academic Year"
          placeholder="Select year"
          data={academicYearOptions}
          value={academicYear}
          onChange={setAcademicYear}
        />
      </Stack>

      <FileButton onChange={setSelectedFile} accept=".xlsx,.xls">
        {(props) => (
          <Button {...props} leftIcon={<IconUpload />} variant="outline" fullWidth mb="md">
            {selectedFile ? selectedFile.name : "Choose Excel file"}
          </Button>
        )}
      </FileButton>

      <Button
        fullWidth
        size="md"
        leftIcon={<IconUpload />}
        loading={isUploading}
        onClick={handleUpload}
        disabled={!isFormValid || isUploading}
      >
        {isUploading ? "Uploading..." : "Upload & Allot"}
      </Button>
    </Card>
  );
}
