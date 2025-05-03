import React, { useEffect, useState } from "react";
import {
  Select,
  Button,
  Group,
  Text,
  Container,
  Stack,
  Flex,
  FileInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { fetchAllCourses, fetchFacultiesData } from "../api/api";
import { host } from "../../../routes/globalRoutes";

export default function Admin_add_course_instructor() {
  const [activeSection, setActiveSection] = useState("manual");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const navigate = useNavigate();

  // Academic Year options (currentYear -4 ... +1)
  const currentYear = new Date().getFullYear();
  const academicYearOptions = Array.from({ length: 6 }, (_, i) => {
    const start = currentYear - 4 + i;
    const end = start + 1;
    const label = `${start}-${String(end).slice(-2)}`;
    return { value: label, label };
  });

  const semesterTypeOptions = [
    { value: "Odd Semester", label: "Odd Semester" },
    { value: "Even Semester", label: "Even Semester" },
    { value: "Summer Semester", label: "Summer Semester" },
  ];

  const form = useForm({
    initialValues: {
      courseId: "",
      instructorId: "",
      academicYear: academicYearOptions[4].value, // current−1/current
      semesterType: "Odd Semester",
    },
  });

  useEffect(() => {
    (async () => {
      try {
        const courseResp = await fetchAllCourses();
        setCourses(
          courseResp.map((c) => ({
            value: String(c.id),
            label: `${c.name} (${c.code})`,
          }))
        );
        const facResp = await fetchFacultiesData();
        setFaculties(
          facResp.map((f) => ({
            value: String(f.id),
            label: `${f.faculty_first_name} ${f.faculty_last_name}`,
          }))
        );
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleSubmit = async (values) => {
    localStorage.setItem("AdminInstructorsCacheChange", "true");
    const token = localStorage.getItem("authToken");
    const apiUrl = `${host}/programme_curriculum/api/admin_add_course_instructor/`;

    const payload = {
      course_id: values.courseId,
      instructor_id: values.instructorId,
      academic_year: values.academicYear,
      semester_type: values.semesterType,
      form_submit: true,
    };

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        alert("Course Instructor added successfully!");
        navigate("/programme_curriculum/admin_course_instructor");
      } else {
        const err = await res.json();
        alert("Failed: " + (err.error || JSON.stringify(err.details)));
      }
    } catch (e) {
      console.error(e);
      alert("Error adding instructor.");
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Select an Excel file first.");
    if (!/\.(xls|xlsx)$/i.test(file.name)) {
      return alert("Only .xls/.xlsx allowed.");
    }
    setIsUploading(true);
    const token = localStorage.getItem("authToken");
    const apiUrl = `${host}/programme_curriculum/api/admin_add_course_instructor/`;

    try {
      const formData = new FormData();
      formData.append("manual_instructor_xsl", file);
      formData.append("excel_submit", "true");
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.success);
        navigate("/programme_curriculum/admin_course_instructor");
      } else {
        throw new Error(data.error || JSON.stringify(data.details));
      }
    } catch (e) {
      alert("Upload error: " + e.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () =>
    navigate("/programme_curriculum/admin_course_instructor");

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Container
        fluid
        style={{
          display: "flex",
          justifyContent: "left",
          alignItems: "left",
          width: "100%",
          margin: "0 0 0 -3.2vw",
        }}
      >
        <div
          style={{
            maxWidth: "290vw",
            width: "100%",
            display: "flex",
            gap: "2rem",
            padding: "2rem",
            flex: 4,
          }}
        >
          <div
            style={{
              flex: 4,
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            }}
          >
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Text size="xl" weight={700} align="center" mb="md">
                Course Instructor Form
              </Text>

              <Flex justify="flex-start" align="center" mb={10}>
                <Button
                  variant={activeSection === "manual" ? "filled" : "outline"}
                  onClick={() => setActiveSection("manual")}
                  style={{ marginRight: "10px" }}
                >
                  Manual
                </Button>
                <Button
                  variant={activeSection === "excel" ? "filled" : "outline"}
                  onClick={() => setActiveSection("excel")}
                >
                  Upload Excel
                </Button>
              </Flex>

              <Stack spacing="lg">
                {activeSection === "manual" ? (
                  <>
                    <Select
                      label="Course"
                      placeholder="Select course"
                      data={courses}
                      {...form.getInputProps("courseId")}
                      searchable
                      required
                    />
                    <Select
                      label="Instructor"
                      placeholder="Select instructor"
                      data={faculties}
                      {...form.getInputProps("instructorId")}
                      searchable
                      required
                    />
                    <Select
                      label="Academic Year"
                      data={academicYearOptions}
                      {...form.getInputProps("academicYear")}
                      required
                    />
                    <Select
                      label="Semester Type"
                      data={semesterTypeOptions}
                      {...form.getInputProps("semesterType")}
                      required
                    />

                    <Group position="right" mt="lg">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button type="submit">Submit</Button>
                    </Group>
                  </>
                ) : (
                  <>
                    <Text size="xl" weight={700}>
                      Upload via Excel
                    </Text>
                    <Group spacing="sm" mb="md">
                      <FileInput
                        label="Excel file"
                        placeholder="Select .xls/.xlsx"
                        onChange={setFile}
                        disabled={isUploading}
                        style={{
                          width: "250px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const sample = [
                            [
                              "Course Code",
                              "Course Version",
                              "Instructor Id",
                              "Academic Year",
                              "Semester Type",
                            ],
                            [
                              "NS205i",
                              "1",
                              "amitv",
                              academicYearOptions[4].value,
                              "Odd Semester",
                            ],
                          ];
                          const ws = XLSX.utils.aoa_to_sheet(sample);
                          const wb = XLSX.utils.book_new();
                          XLSX.utils.book_append_sheet(wb, ws, "Instructors");
                          XLSX.writeFile(wb, "instructors_sample.xlsx");
                        }}
                        style={{ marginTop: "24px" }}
                      >
                        Download Sample
                      </Button>
                    </Group>
                    <Group position="right" mt="lg">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpload}
                        disabled={isUploading || !file}
                      >
                        {isUploading ? "Uploading…" : "Upload"}
                      </Button>
                    </Group>
                  </>
                )}
              </Stack>
            </form>
          </div>
          {/* Optional sidebar area */}
          <div style={{ flex: 1 }} />
        </div>
      </Container>
    </div>
  );
}
