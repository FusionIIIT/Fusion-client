import PropTypes from "prop-types";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  FileInput,
  Grid,
  Group,
  Modal,
  Progress,
  ScrollArea,
  Select,
  Stack,
  Stepper,
  Table,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  CaretLeft,
  CaretRight,
  Check,
  Database,
  Download,
  FileXls,
  GraduationCap,
  Info,
  Upload,
  User,
  Users,
  Warning,
} from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import {
  INITIAL_FORM_DATA,
  PROGRAMME_TYPES,
  STUDENT_FIELDS_CONFIG,
} from "../AdminUpcomingBatchesConstants";
import {
  batchYearToAcademicYear,
  cleanDisciplineName,
  getBatchYearOptions,
} from "../AdminUpcomingBatchesUtils";

const PREVIEW_FIELD_ORDER = [
  "jeeAppNo", // 1. JEE App No (UG/PG)
  "applicationNo", // 1. Application No (PhD)
  "rollNumber", // 2. Roll Number
  "name", // 3. Name
  "gender", // 4. Gender
  "category", // 5. Category
  "allottedCategory", // 6. Allotted Category
  "allottedGender", // 7. Allotted Gender
  "minority", // 8. Minority
  "pwd", // 9. PWD Status
  "pwdCategory", // 10. PWD Category
  "pwdCategoryRemarks", // 11. PWD Category Remarks
  "branch", // 12. Branch/Discipline
  "specialization", // 13. Specialization (PG only)
  "admissionType", // 14. Admission Type (PhD)
  "gateQualified", // 15. GATE Qualified (PhD)
  "gateStream", // 16. GATE Stream (PhD)
  "gateRank", // 17. GATE Rank (PhD)

  "phoneNumber", // 15. Mobile Number
  "instituteEmail", // 15. Institute Email
  "alternateEmail", // 16. Alternate Email
  "parentEmail", // 17. Parent Email
  "fname", // 17. Father Name
  "fatherOccupation", // 18. Father Occupation
  "fatherMobile", // 19. Father Mobile
  "mname", // 20. Mother Name
  "motherOccupation", // 21. Mother Occupation
  "motherMobile", // 22. Mother Mobile
  "dob", // 23. Date of Birth
  "bloodGroup", // 24. Blood Group
  "bloodGroupRemarks", // 25. Blood Group Remarks
  "country", // 26. Country
  "nationality", // 27. Nationality
  "state", // 28. State
  "address", // 29. Address
  "admissionMode", // 30. Admission Mode
  "admissionModeRemarks", // 31. Admission Mode Remarks
  "incomeGroup", // 32. Income Group
  "income", // 33. Income
  "jeeRank", // 34. JEE Rank (UG/PG)
  "categoryRank", // 35. Category Rank
];

function AddStudentsModal({
  opened,
  onClose,
  activeSection,
  editingStudent,
  setEditingStudent,
  setShowStudentModal,
  addMode,
  allocationSummary,
  currentStep,
  errors,
  extractedData,
  generateExcelTemplate,
  handleExcelUpload,
  handleFileUpload,
  isMobile,
  isProcessing,
  manualFormData,
  nextStep,
  prevStep,
  processedBatchData,
  selectedBatchYear,
  selectedPhdSemester,
  setAddMode,
  setAllocationSummary,
  setCurrentStep,
  setErrors,
  setExtractedData,
  setManualFormData,
  setProcessedBatchData,
  setSelectedBatchYear,
  setSelectedPhdSemester,
  setShowAddModal,
  setShowBatchPreview,
  setShowPreview,
  setUploadedFile,
  showBatchPreview,
  showPreview,
  uploadProgress,
  uploadedFile,
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      closeOnClickOutside={false}
      size="90vw"
      centered
      padding="md"
      radius="md"
      shadow="xl"
      styles={{
        modal: {
          maxWidth: isMobile ? "95vw" : "90vw",
          width: isMobile ? "95vw" : "90vw",
          maxHeight: isMobile ? "95vh" : "85vh",
          height: "auto",
          minHeight: "50vh",
          margin: "0 auto",
        },
        body: {
          padding: isMobile ? "8px" : "15px",
          paddingTop: isMobile ? "0px" : "5px",
          maxHeight: isMobile ? "85vh" : "75vh",
          overflow: "auto",
        },
        header: {
          padding: isMobile ? "8px 8px 0" : "12px 15px 0",
          borderBottom: "none",
        },
        close: {
          marginTop: "4px",
        },
      }}
    >
      {!addMode && (
        <Container size="lg" style={{ padding: 0 }}>
          <Stack spacing={isMobile ? "md" : "lg"} align="center">
            <Text
              size={isMobile ? "lg" : "xl"}
              ta="center"
              color="#3498db"
              weight={700}
              style={{
                fontSize: isMobile ? "18px" : "24px",
                fontWeight: "bold",
                marginBottom: isMobile ? "5px" : "8px",
                marginTop: "0",
              }}
            >
              {activeSection === PROGRAMME_TYPES.UG
                ? "UG Student Data Entry Method"
                : activeSection === PROGRAMME_TYPES.PG
                  ? "PG Student Data Entry Method"
                  : "PhD Student Data Entry Method"}
            </Text>

            {/* Batch Year Selection */}
            <Stack spacing="xs" style={{ width: "100%", marginBottom: "20px" }}>
              <Group position="center" spacing="md">
                <Select
                  value={selectedBatchYear.toString()}
                  onChange={(value) =>
                    setSelectedBatchYear(parseInt(value, 10))
                  }
                  data={getBatchYearOptions(activeSection)}
                  style={{ width: isMobile ? "250px" : "300px" }}
                  placeholder="Select batch year"
                  size="sm"
                />
              </Group>
              <Text size="xs" color="dimmed" ta="center">
                {selectedBatchYear &&
                  `Academic Year: ${batchYearToAcademicYear(selectedBatchYear)}`}
              </Text>
            </Stack>

            {/* PhD Semester Selection - Only for PhD section */}
            {activeSection === "phd" && (
              <Stack
                spacing="xs"
                style={{ width: "100%", marginBottom: "20px" }}
              >
                <Group position="center" spacing="md">
                  <Select
                    label="Select PhD Semester"
                    value={selectedPhdSemester}
                    onChange={(value) => {
                      console.log("PhD Semester selected:", value);
                      setSelectedPhdSemester(value);
                    }}
                    data={[
                      { value: "odd", label: "PhD (Odd)" },
                      { value: "even", label: "PhD (Even)" },
                    ]}
                    style={{ width: isMobile ? "250px" : "300px" }}
                    placeholder="Select semester - Odd or Even"
                    size="sm"
                    required
                    error={
                      !selectedPhdSemester ? "Please select PhD semester" : null
                    }
                    styles={{
                      label: {
                        fontWeight: 600,
                        color: "#2c5282",
                        marginBottom: 8,
                      },
                    }}
                  />
                </Group>
                <Text size="xs" color="dimmed" ta="center">
                  Select whether you want to add students to Odd or Even
                  semester batch
                </Text>
              </Stack>
            )}

            <Grid
              gutter={isMobile ? "md" : "lg"}
              style={{ width: "100%", marginTop: "10px" }}
            >
              <Grid.Col span={isMobile ? 12 : 6}>
                <Card
                  shadow="sm"
                  radius="lg"
                  padding={isMobile ? "md" : "xl"}
                  style={{
                    height: isMobile ? "180px" : "240px",
                    cursor:
                      activeSection === "phd" && !selectedPhdSemester
                        ? "not-allowed"
                        : "pointer",
                    border: "2px solid transparent",
                    transition: "all 0.3s ease",
                    opacity:
                      activeSection === "phd" && !selectedPhdSemester ? 0.5 : 1,
                  }}
                  onClick={() => {
                    if (activeSection === "phd" && !selectedPhdSemester) {
                      notifications.show({
                        title: "Semester Selection Required",
                        message:
                          "Please select PhD semester (Odd or Even) before proceeding",
                        color: "yellow",
                      });
                      return;
                    }
                    setAddMode("excel");
                  }}
                  sx={() => ({
                    "&:hover": {
                      transform:
                        activeSection === "phd" && !selectedPhdSemester
                          ? "none"
                          : "translateY(-2px)",
                      boxShadow:
                        activeSection === "phd" && !selectedPhdSemester
                          ? "none"
                          : "0 8px 32px rgba(52, 152, 219, 0.15)",
                      borderColor:
                        activeSection === "phd" && !selectedPhdSemester
                          ? "transparent"
                          : "#3498db",
                    },
                  })}
                >
                  <Stack align="center" spacing="xs" h="100%" justify="center">
                    <ThemeIcon
                      size={isMobile ? 40 : 50}
                      radius="xl"
                      variant="light"
                      color="blue"
                    >
                      <FileXls size={isMobile ? 20 : 24} />
                    </ThemeIcon>
                    <Text size={isMobile ? "sm" : "md"} weight={600} mt={4}>
                      Excel Upload
                    </Text>
                    <Text
                      ta="center"
                      color="dimmed"
                      size="xs"
                      style={{ lineHeight: 1.3 }}
                    >
                      Upload Excel file to automatically extract and import
                      student data
                    </Text>
                    <Badge color="green" size={isMobile ? "xs" : "sm"} mt={4}>
                      AUTOMATED
                    </Badge>
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={isMobile ? 12 : 6}>
                <Card
                  shadow="sm"
                  radius="lg"
                  padding={isMobile ? "md" : "xl"}
                  style={{
                    height: isMobile ? "180px" : "240px",
                    cursor:
                      activeSection === "phd" && !selectedPhdSemester
                        ? "not-allowed"
                        : "pointer",
                    border: "2px solid transparent",
                    transition: "all 0.3s ease",
                    opacity:
                      activeSection === "phd" && !selectedPhdSemester ? 0.5 : 1,
                  }}
                  onClick={() => {
                    if (activeSection === "phd" && !selectedPhdSemester) {
                      notifications.show({
                        title: "Semester Selection Required",
                        message:
                          "Please select PhD semester (Odd or Even) before proceeding",
                        color: "yellow",
                      });
                      return;
                    }
                    setAddMode("manual");
                  }}
                  sx={() => ({
                    "&:hover": {
                      transform:
                        activeSection === "phd" && !selectedPhdSemester
                          ? "none"
                          : "translateY(-2px)",
                      boxShadow:
                        activeSection === "phd" && !selectedPhdSemester
                          ? "none"
                          : "0 8px 32px rgba(52, 152, 219, 0.15)",
                      borderColor:
                        activeSection === "phd" && !selectedPhdSemester
                          ? "transparent"
                          : "#3498db",
                    },
                  })}
                >
                  <Stack align="center" spacing="xs" h="100%" justify="center">
                    <ThemeIcon
                      size={isMobile ? 40 : 50}
                      radius="xl"
                      variant="light"
                      color="blue"
                    >
                      <Users size={isMobile ? 20 : 24} />
                    </ThemeIcon>
                    <Text size={isMobile ? "sm" : "md"} weight={600} mt={4}>
                      Manual Entry
                    </Text>
                    <Text
                      ta="center"
                      color="dimmed"
                      size="xs"
                      style={{ lineHeight: 1.3 }}
                    >
                      Enter student details manually using step-by-step form
                    </Text>
                    <Badge color="blue" size={isMobile ? "xs" : "sm"} mt={4}>
                      STEP BY STEP
                    </Badge>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      )}

      {/* Excel Upload Mode */}
      {addMode === "excel" && (
        <Container size="lg" style={{ padding: 0 }}>
          <Stack spacing={isMobile ? "md" : "lg"}>
            <Group
              position="apart"
              style={{ marginBottom: isMobile ? "16px" : "24px" }}
            >
              <Text
                size={isMobile ? "md" : "lg"}
                weight={700}
                style={{
                  fontWeight: "bold",
                  color: "#2c3e50",
                  fontSize: isMobile ? "18px" : "22px",
                }}
              >
                Excel Upload Mode
              </Text>
              <Button
                variant="subtle"
                size={isMobile ? "xs" : "sm"}
                onClick={() => {
                  setAddMode(null);
                  setShowPreview(false);
                  setExtractedData([]);
                  setUploadedFile(null);
                  setProcessedBatchData(null);
                  setAllocationSummary(null);
                  setShowBatchPreview(false);
                }}
              >
                <CaretLeft size={16} style={{ marginRight: "8px" }} />
                Back
              </Button>
            </Group>

            <Card
              shadow="sm"
              padding={isMobile ? "md" : "xl"}
              radius="md"
              style={{ border: "1px solid #e9ecef" }}
            >
              <Stack spacing="md">
                {/* Template Download Section */}
                <div
                  style={{
                    backgroundColor: "#e3f2fd",
                    padding: "15px",
                    borderRadius: "8px",
                    border: "1px solid #2196f3",
                  }}
                >
                  <Group position="apart" align="center">
                    <div>
                      <Text size="sm" weight={600} color="#1976d2">
                        📄 Download Excel Template
                      </Text>
                      <Text size="xs" color="#1976d2" mt={2}>
                        Download the standardized template with all required
                        fields for {activeSection.toUpperCase()} students
                      </Text>
                    </div>
                    <Button
                      size="sm"
                      variant="light"
                      color="blue"
                      leftSection={<Download size={16} />}
                      onClick={generateExcelTemplate}
                    >
                      Download Template
                    </Button>
                  </Group>
                </div>

                <FileInput
                  label="Upload Excel File"
                  description="Select an Excel file (.xlsx, .xls) containing student data using the template format"
                  placeholder="Click to select file"
                  icon={<Upload size={14} />}
                  value={uploadedFile}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls"
                />

                {isProcessing && (
                  <Stack spacing="xs">
                    <Text size="sm">Processing file...</Text>
                    <Progress value={uploadProgress} />
                  </Stack>
                )}

                {showBatchPreview && processedBatchData && !isProcessing && (
                  <Stack spacing="md">
                    <Alert color="green" icon={<Check size={16} />}>
                      Batch allocation completed!{" "}
                      {processedBatchData?.length || 0} students processed with
                      roll numbers and institute emails.
                    </Alert>

                    {allocationSummary && (
                      <Card
                        withBorder
                        padding="md"
                        style={{ backgroundColor: "#f8f9fa" }}
                      >
                        <Text size="md" weight={600} color="#3498db" mb="sm">
                          📊 Allocation Summary:
                        </Text>
                        <Grid>
                          <Grid.Col span={6}>
                            <Text size="sm">
                              <strong>Programme:</strong>{" "}
                              {allocationSummary.programme || "N/A"}
                            </Text>
                            <Text size="sm">
                              <strong>Year:</strong>{" "}
                              {allocationSummary.year || "N/A"}
                            </Text>
                            <Text size="sm">
                              <strong>Total Students:</strong>{" "}
                              {allocationSummary.totalStudents || 0}
                            </Text>
                          </Grid.Col>
                          <Grid.Col span={6}>
                            <Text size="sm" weight={600} mb="xs">
                              Branch-wise Distribution:
                            </Text>
                            {allocationSummary.branchCounts &&
                              typeof allocationSummary.branchCounts ===
                                "object" &&
                              Object.entries(
                                allocationSummary.branchCounts,
                              ).map(([branch, count]) => (
                                <Text key={branch} size="sm">
                                  <Badge variant="light" mr="xs">
                                    {branch}
                                  </Badge>
                                  {count} students
                                </Text>
                              ))}
                            {(!allocationSummary.branchCounts ||
                              typeof allocationSummary.branchCounts !==
                                "object") && (
                              <Text size="sm" color="dimmed">
                                No branch distribution available
                              </Text>
                            )}
                          </Grid.Col>
                        </Grid>
                      </Card>
                    )}

                    <Text size="md" weight={600} color="#3498db" mt="md">
                      🎓 Student Allocation Preview:
                    </Text>

                    <div
                      style={{
                        maxHeight: "400px",
                        overflowY: "auto",
                        overflowX: "auto",
                        border: "1px solid #e0e0e0",
                        borderRadius: "8px",
                      }}
                    >
                      <Table
                        striped
                        highlightOnHover
                        className="student-allocation-table"
                        style={{
                          minWidth: "1400px",
                          tableLayout: "fixed",
                          width: "100%",
                        }}
                      >
                        <thead>
                          <tr>
                            <th
                              style={{
                                width: "120px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Roll Number
                            </th>
                            <th style={{ width: "140px" }}>Name</th>
                            <th style={{ width: "140px" }}>Father Name</th>
                            <th style={{ width: "140px" }}>Mother Name</th>
                            <th style={{ width: "200px" }}>Address</th>
                            <th style={{ width: "130px" }}>JEE App. No.</th>
                            {(activeSection === "pg" ||
                              activeSection === "phd") && (
                              <th style={{ width: "140px" }}>Specialization</th>
                            )}
                            <th style={{ width: "100px" }}>Branch Code</th>
                            <th style={{ width: "180px" }}>Institute Email</th>
                            <th style={{ width: "120px" }}>Password</th>
                            <th style={{ width: "80px" }}>Category</th>
                            <th style={{ width: "60px" }}>PWD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {processedBatchData.map((student, index) => (
                            <tr key={index}>
                              <td
                                style={{
                                  padding: "8px 12px",
                                  whiteSpace: "nowrap",
                                  overflow: "visible",
                                }}
                              >
                                <Badge
                                  color="blue"
                                  variant="light"
                                  style={{
                                    fontSize: "11px",
                                    minWidth: "fit-content",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {student.rollNumber}
                                </Badge>
                              </td>
                              <td
                                style={{
                                  padding: "8px 12px",
                                  wordWrap: "break-word",
                                  fontSize: "13px",
                                }}
                              >
                                {student.name}
                              </td>
                              <td
                                style={{
                                  padding: "8px 12px",
                                  wordWrap: "break-word",
                                  fontSize: "13px",
                                }}
                              >
                                {student.fname}
                              </td>
                              <td
                                style={{
                                  padding: "8px 12px",
                                  wordWrap: "break-word",
                                  fontSize: "13px",
                                }}
                              >
                                {student.mname || "N/A"}
                              </td>
                              <td
                                style={{
                                  padding: "8px 12px",
                                  fontSize: "11px",
                                  wordWrap: "break-word",
                                  lineHeight: "1.3",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  position: "relative",
                                }}
                              >
                                <Tooltip
                                  label={student.address || "N/A"}
                                  multiline
                                  width={300}
                                  disabled={
                                    !student.address ||
                                    student.address.length < 50
                                  }
                                >
                                  <div
                                    style={{
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {student.address || "N/A"}
                                  </div>
                                </Tooltip>
                              </td>
                              <td
                                style={{
                                  padding: "8px 12px",
                                  fontSize: "12px",
                                  fontFamily: "monospace",
                                }}
                              >
                                {student.jeeAppNo || "N/A"}
                              </td>
                              {(activeSection === "pg" ||
                                activeSection === "phd") && (
                                <td
                                  style={{
                                    padding: "8px 12px",
                                    fontSize: "11px",
                                  }}
                                >
                                  <Badge
                                    color="blue"
                                    variant="light"
                                    style={{
                                      fontSize: "10px",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {student.specialization || "N/A"}
                                  </Badge>
                                </td>
                              )}
                              <td style={{ padding: "8px 12px" }}>
                                <Badge
                                  color="green"
                                  variant="light"
                                  style={{
                                    fontSize: "11px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {student.branchCode}
                                </Badge>
                              </td>
                              <td
                                style={{
                                  padding: "8px 12px",
                                  fontSize: "11px",
                                  fontFamily: "monospace",
                                  wordBreak: "break-all",
                                }}
                              >
                                {student.instituteEmail}
                              </td>
                              <td style={{ padding: "8px 12px" }}>
                                <Badge
                                  color="orange"
                                  variant="light"
                                  style={{
                                    fontSize: "10px",
                                    fontFamily: "monospace",
                                    minWidth: "fit-content",
                                    whiteSpace: "nowrap",
                                    cursor: "pointer",
                                  }}
                                  title={`Full password: ${student.password}`}
                                >
                                  {student.password}
                                </Badge>
                              </td>
                              <td
                                style={{
                                  padding: "8px 12px",
                                  fontSize: "12px",
                                }}
                              >
                                {student.category}
                              </td>
                              <td
                                style={{
                                  padding: "8px 12px",
                                  fontSize: "12px",
                                  textAlign: "center",
                                }}
                              >
                                {student.pwd}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>

                    {/* Important Save Reminder */}
                    <Alert
                      color="orange"
                      icon={<Warning size={16} />}
                      styles={{
                        root: {
                          border: "2px solid #f59e0b",
                          backgroundColor: "#fef3c7",
                        },
                        title: { color: "#92400e", fontWeight: 600 },
                        message: { color: "#92400e" },
                      }}
                    >
                      <Text weight={600} size="md">
                        ⚠️ IMPORTANT: Data Not Saved Yet!
                      </Text>
                      <Text size="sm" mt={4}>
                        The students have been processed but{" "}
                        <strong>NOT YET SAVED</strong> to the database. Click
                        "Save Students" below to permanently add them to the
                        system.
                      </Text>
                    </Alert>

                    <Group position="center" mt="lg" spacing="md">
                      <Button
                        variant="outline"
                        color="blue"
                        onClick={() => {
                          setShowBatchPreview(false);
                          setProcessedBatchData(null);
                          setAllocationSummary(null);
                          setExtractedData([]);
                        }}
                      >
                        ← Back to Upload
                      </Button>
                      <Button
                        onClick={handleExcelUpload}
                        size="md"
                        style={{
                          backgroundColor: "#e74c3c",
                          fontSize: "16px",
                          padding: "12px 24px",
                          boxShadow: "0 4px 12px rgba(231, 76, 60, 0.3)",
                        }}
                      >
                        <Upload size={16} style={{ marginRight: "8px" }} />
                        💾 SAVE STUDENTS TO DATABASE
                      </Button>
                    </Group>
                  </Stack>
                )}

                {/* Data Preview Section - After Excel Processing */}
                {extractedData &&
                  extractedData.length > 0 &&
                  showPreview &&
                  !isProcessing &&
                  !showBatchPreview && (
                    <Stack spacing="md">
                      <Alert color="green" icon={<Check size={16} />}>
                        ✅ Excel file processed successfully!{" "}
                        {extractedData.length} records found.
                        {extractedData.filter((s) => !s._validation_error)
                          .length > 0 &&
                          ` (${extractedData.filter((s) => !s._validation_error).length} valid)`}
                        {extractedData.filter((s) => s._validation_error)
                          .length > 0 &&
                          ` (${extractedData.filter((s) => s._validation_error).length} need attention)`}
                      </Alert>

                      {/* Discipline Summary */}
                      <Card
                        withBorder
                        padding="md"
                        style={{ backgroundColor: "#f8f9fa" }}
                      >
                        <Text size="md" weight={600} color="#3498db" mb="sm">
                          📋 Data Preview ({extractedData.length} students):
                        </Text>

                        <ScrollArea style={{ height: 400 }}>
                          <Table striped highlightOnHover fontSize="sm">
                            <thead>
                              <tr style={{ backgroundColor: "#f8f9fa" }}>
                                <th style={{ minWidth: "60px" }}>S.No</th>
                                {PREVIEW_FIELD_ORDER.filter((fieldKey) => {
                                  const field = STUDENT_FIELDS_CONFIG[fieldKey];
                                  if (!field || field.systemGenerated)
                                    return false;

                                  // Check if field should show for current program type
                                  if (field.showForProgrammes) {
                                    const currentProgramType =
                                      activeSection.toUpperCase();
                                    return field.showForProgrammes.includes(
                                      currentProgramType,
                                    );
                                  }

                                  return true;
                                }).map((fieldKey) => {
                                  const field = STUDENT_FIELDS_CONFIG[fieldKey];
                                  return (
                                    <th
                                      key={fieldKey}
                                      style={{
                                        minWidth:
                                          field.type === "email"
                                            ? "200px"
                                            : fieldKey.includes("Remarks") ||
                                                fieldKey.includes("address") ||
                                                fieldKey.includes("Name")
                                              ? "150px"
                                              : fieldKey.includes("Number") ||
                                                  fieldKey.includes("Mobile")
                                                ? "120px"
                                                : "100px",
                                      }}
                                    >
                                      {field.label}
                                    </th>
                                  );
                                })}
                                {extractedData.some(
                                  (student) => student._validation_error,
                                ) && (
                                  <th
                                    style={{
                                      minWidth: "200px",
                                      color: "#e74c3c",
                                    }}
                                  >
                                    Validation Status
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {extractedData.map((student, index) => {
                                const getFieldValue = (fieldKey) => {
                                  const fieldInfo =
                                    STUDENT_FIELDS_CONFIG[fieldKey];
                                  if (!fieldInfo) return "-";

                                  let fieldValue = null;

                                  // 1. Try direct field key first
                                  fieldValue = student[fieldKey];

                                  // 2. Try backend field mapping
                                  if (!fieldValue && fieldInfo.backendField) {
                                    fieldValue =
                                      student[fieldInfo.backendField];
                                  }

                                  // 3. Try configured excel column variations
                                  if (!fieldValue && fieldInfo.excelColumns) {
                                    fieldInfo.excelColumns.some((excelCol) => {
                                      // Try exact match first
                                      if (student[excelCol]) {
                                        fieldValue = student[excelCol];
                                        return true;
                                      }
                                      // Try case-insensitive match
                                      const matchedKey = Object.keys(
                                        student,
                                      ).find(
                                        (key) =>
                                          key.toLowerCase() ===
                                          excelCol.toLowerCase(),
                                      );
                                      if (matchedKey && student[matchedKey]) {
                                        fieldValue = student[matchedKey];
                                        return true;
                                      }
                                      return false;
                                    });
                                  }

                                  // 4. Clean and format the value
                                  if (fieldValue) {
                                    // Clean discipline names
                                    if (fieldKey === "branch") {
                                      fieldValue =
                                        cleanDisciplineName(fieldValue);
                                    }

                                    // Format dates
                                    if (
                                      fieldKey === "dob" &&
                                      typeof fieldValue === "string"
                                    ) {
                                      const [datePart] = fieldValue.split(" ");
                                      [fieldValue] = datePart.split("T");
                                    }

                                    return String(fieldValue).trim();
                                  }

                                  return "-";
                                };

                                return (
                                  <tr
                                    key={index}
                                    style={
                                      student._validation_error
                                        ? { backgroundColor: "#fff3cd" }
                                        : {}
                                    }
                                  >
                                    <td>
                                      {student._row_number ||
                                        student.sno ||
                                        index + 1}
                                    </td>
                                    {PREVIEW_FIELD_ORDER.filter((fieldKey) => {
                                      const field =
                                        STUDENT_FIELDS_CONFIG[fieldKey];
                                      if (!field || field.systemGenerated)
                                        return false;

                                      if (field.showForProgrammes) {
                                        const currentProgramType =
                                          activeSection.toUpperCase();
                                        return field.showForProgrammes.includes(
                                          currentProgramType,
                                        );
                                      }

                                      return true;
                                    }).map((fieldKey) => (
                                      <td key={fieldKey}>
                                        {getFieldValue(fieldKey)}
                                      </td>
                                    ))}
                                    {student._validation_error && (
                                      <td
                                        style={{
                                          color: "#e74c3c",
                                          fontSize: "11px",
                                        }}
                                      >
                                        ⚠️ {student._validation_error}
                                      </td>
                                    )}
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        </ScrollArea>
                      </Card>

                      <Group position="center" style={{ marginTop: "20px" }}>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowPreview(false);
                            setExtractedData([]);
                          }}
                          size="md"
                          style={{ fontSize: "16px", padding: "12px 24px" }}
                        >
                          ← Back to Upload
                        </Button>
                        <Button
                          onClick={handleExcelUpload}
                          size="md"
                          style={{
                            backgroundColor: "#28a745",
                            fontSize: "16px",
                            padding: "12px 24px",
                          }}
                        >
                          <Database size={16} style={{ marginRight: "8px" }} />
                          Review Allocation ({extractedData.length})
                        </Button>
                      </Group>
                    </Stack>
                  )}

                {extractedData &&
                  extractedData.length > 0 &&
                  !isProcessing &&
                  !showBatchPreview &&
                  !showPreview && (
                    <Stack spacing="md">
                      <Alert color="blue" icon={<Info size={16} />}>
                        Raw data extracted. Processing for batch allocation...
                      </Alert>
                    </Stack>
                  )}
              </Stack>
            </Card>
          </Stack>
        </Container>
      )}

      {/* Manual Entry Mode */}
      {addMode === "manual" && (
        <Container size="lg" style={{ padding: 0 }}>
          <Stack spacing={isMobile ? "md" : "lg"}>
            <Group
              position="apart"
              style={{ marginBottom: isMobile ? "16px" : "24px" }}
            >
              <Text
                size={isMobile ? "md" : "lg"}
                weight={700}
                style={{
                  fontWeight: "bold",
                  color: "#2c3e50",
                  fontSize: isMobile ? "18px" : "22px",
                }}
              >
                {editingStudent ? "Edit Student" : "Manual Entry Mode"}
              </Text>
              <Button
                variant="subtle"
                size={isMobile ? "xs" : "sm"}
                onClick={() => {
                  if (editingStudent) {
                    setAddMode(null);
                    setEditingStudent(null);
                    setManualFormData(INITIAL_FORM_DATA);
                    setCurrentStep(0);
                    setErrors({});
                    setShowAddModal(false);
                    setShowStudentModal(true);
                  } else {
                    setAddMode(null);
                    setEditingStudent(null);
                    setManualFormData(INITIAL_FORM_DATA);
                    setCurrentStep(0);
                    setErrors({});
                    setShowAddModal(false);
                  }
                }}
              >
                <CaretLeft size={16} style={{ marginRight: "8px" }} />
                Back
              </Button>
            </Group>

            <Card
              shadow="sm"
              padding={isMobile ? "md" : "xl"}
              radius="md"
              style={{ border: "1px solid #e9ecef" }}
            >
              <Stepper active={currentStep} breakpoint="sm">
                <Stepper.Step
                  label="Basic Info"
                  description="Personal information"
                  icon={<User size={18} />}
                >
                  <Stack spacing="md" mt="lg">
                    <Title order={3} size="h4" weight={700} mb="md">
                      Basic Info
                    </Title>

                    {/* Name Field */}
                    <TextInput
                      label={STUDENT_FIELDS_CONFIG.name.label}
                      placeholder={STUDENT_FIELDS_CONFIG.name.placeholder}
                      value={manualFormData.name || ""}
                      onChange={(e) =>
                        setManualFormData({
                          ...manualFormData,
                          name: e.target.value,
                        })
                      }
                      required={STUDENT_FIELDS_CONFIG.name.required}
                      error={errors.name}
                    />

                    {/* Parent Names */}
                    <Grid>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          label={`${STUDENT_FIELDS_CONFIG.fname.label}`}
                          placeholder={STUDENT_FIELDS_CONFIG.fname.placeholder}
                          value={manualFormData.fname || ""}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              fname: e.target.value,
                            })
                          }
                          required={STUDENT_FIELDS_CONFIG.fname.required}
                          error={errors.fname}
                        />
                      </Grid.Col>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          label={`${STUDENT_FIELDS_CONFIG.mname.label}`}
                          placeholder={STUDENT_FIELDS_CONFIG.mname.placeholder}
                          value={manualFormData.mname || ""}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              mname: e.target.value,
                            })
                          }
                          required={STUDENT_FIELDS_CONFIG.mname.required}
                          error={errors.mname}
                        />
                      </Grid.Col>
                    </Grid>

                    {/* Gender and Category */}
                    <Grid>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <Select
                          label={`${STUDENT_FIELDS_CONFIG.gender.label}`}
                          placeholder={STUDENT_FIELDS_CONFIG.gender.placeholder}
                          value={manualFormData.gender || ""}
                          onChange={(value) =>
                            setManualFormData({
                              ...manualFormData,
                              gender: value,
                            })
                          }
                          data={STUDENT_FIELDS_CONFIG.gender.options}
                          required={STUDENT_FIELDS_CONFIG.gender.required}
                          error={errors.gender}
                        />
                      </Grid.Col>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <Select
                          label={`${STUDENT_FIELDS_CONFIG.category.label}`}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.category.placeholder
                          }
                          value={manualFormData.category || ""}
                          onChange={(value) => {
                            if (editingStudent) {
                              setEditingStudent({
                                ...editingStudent,
                                category: value,
                              });
                            }
                            setManualFormData({
                              ...manualFormData,
                              category: value,
                            });
                          }}
                          data={STUDENT_FIELDS_CONFIG.category.options}
                          required={STUDENT_FIELDS_CONFIG.category.required}
                          error={errors.category}
                        />
                      </Grid.Col>
                    </Grid>

                    {/* Minority and PWD */}
                    <Grid>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          label={STUDENT_FIELDS_CONFIG.minority.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.minority.placeholder
                          }
                          value={manualFormData.minority || ""}
                          onChange={(event) => {
                            const { value } = event.currentTarget;
                            if (editingStudent) {
                              setEditingStudent({
                                ...editingStudent,
                                minority: value,
                              });
                            }
                            setManualFormData({
                              ...manualFormData,
                              minority: value,
                            });
                          }}
                          required={STUDENT_FIELDS_CONFIG.minority.required}
                          error={errors.minority}
                        />
                      </Grid.Col>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <Select
                          label={`${STUDENT_FIELDS_CONFIG.pwd.label}`}
                          placeholder={STUDENT_FIELDS_CONFIG.pwd.placeholder}
                          value={manualFormData.pwd || ""}
                          onChange={(value) =>
                            setManualFormData({
                              ...manualFormData,
                              pwd: value,
                            })
                          }
                          data={STUDENT_FIELDS_CONFIG.pwd.options}
                          required={STUDENT_FIELDS_CONFIG.pwd.required}
                          error={errors.pwd}
                        />
                      </Grid.Col>

                      {/* PwD Category - Show only when PwD is YES */}
                      {manualFormData.pwd === "YES" && (
                        <Grid.Col span={isMobile ? 12 : 6}>
                          <Select
                            label={STUDENT_FIELDS_CONFIG.pwdCategory.label}
                            placeholder={
                              STUDENT_FIELDS_CONFIG.pwdCategory.placeholder
                            }
                            value={manualFormData.pwdCategory || ""}
                            onChange={(value) => {
                              if (editingStudent) {
                                setEditingStudent({
                                  ...editingStudent,
                                  pwdCategory: value,
                                });
                              }
                              setManualFormData({
                                ...manualFormData,
                                pwdCategory: value,
                              });
                            }}
                            data={STUDENT_FIELDS_CONFIG.pwdCategory.options}
                            error={errors.pwdCategory}
                          />
                        </Grid.Col>
                      )}

                      {/* PwD Category Remarks - Show only when "Any other (remarks)" is selected */}
                      {manualFormData.pwdCategory === "Any other (remarks)" && (
                        <Grid.Col span={isMobile ? 12 : 6}>
                          <TextInput
                            label={
                              STUDENT_FIELDS_CONFIG.pwdCategoryRemarks.label
                            }
                            placeholder={
                              STUDENT_FIELDS_CONFIG.pwdCategoryRemarks
                                .placeholder
                            }
                            value={manualFormData.pwdCategoryRemarks || ""}
                            onChange={(e) => {
                              if (editingStudent) {
                                setEditingStudent({
                                  ...editingStudent,
                                  pwdCategoryRemarks: e.target.value,
                                });
                              }
                              setManualFormData({
                                ...manualFormData,
                                pwdCategoryRemarks: e.target.value,
                              });
                            }}
                            error={errors.pwdCategoryRemarks}
                          />
                        </Grid.Col>
                      )}
                    </Grid>

                    {/* Contact Information */}
                    <Grid>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          label={`${STUDENT_FIELDS_CONFIG.phoneNumber.label}`}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.phoneNumber.placeholder
                          }
                          value={manualFormData.phoneNumber || ""}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              phoneNumber: e.target.value,
                            })
                          }
                          required={STUDENT_FIELDS_CONFIG.phoneNumber.required}
                          error={errors.phoneNumber}
                        />
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Stepper.Step>

                <Stepper.Step
                  label="Additional Info"
                  description={
                    activeSection === "phd"
                      ? "PWD, App No. & Address details"
                      : "PWD, JEE & Address details"
                  }
                  icon={<GraduationCap size={18} />}
                >
                  <Stack spacing="md" mt="lg">
                    <Title order={3} size="h4" weight={700} mb="md">
                      Additional Info
                    </Title>

                    {/* Date of Birth and Blood Group */}
                    <Grid>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          type="date"
                          label={STUDENT_FIELDS_CONFIG.dob.label}
                          placeholder={STUDENT_FIELDS_CONFIG.dob.placeholder}
                          value={manualFormData.dob || ""}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              dob: e.target.value,
                            })
                          }
                          required={STUDENT_FIELDS_CONFIG.dob.required}
                          error={errors.dob}
                        />
                      </Grid.Col>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <Select
                          label={STUDENT_FIELDS_CONFIG.bloodGroup.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.bloodGroup.placeholder
                          }
                          value={manualFormData.bloodGroup || ""}
                          onChange={(value) => {
                            if (editingStudent) {
                              setEditingStudent({
                                ...editingStudent,
                                bloodGroup: value,
                              });
                            }
                            setManualFormData({
                              ...manualFormData,
                              bloodGroup: value,
                            });
                          }}
                          data={STUDENT_FIELDS_CONFIG.bloodGroup.options}
                          error={errors.bloodGroup}
                        />
                      </Grid.Col>
                    </Grid>

                    {/* Blood Group Remarks - Show only when "Other" is selected */}
                    {manualFormData.bloodGroup === "Other" && (
                      <Grid>
                        <Grid.Col span={isMobile ? 12 : 6}>
                          <TextInput
                            label={
                              STUDENT_FIELDS_CONFIG.bloodGroupRemarks.label
                            }
                            placeholder={
                              STUDENT_FIELDS_CONFIG.bloodGroupRemarks
                                .placeholder
                            }
                            value={manualFormData.bloodGroupRemarks || ""}
                            onChange={(e) => {
                              if (editingStudent) {
                                setEditingStudent({
                                  ...editingStudent,
                                  bloodGroupRemarks: e.target.value,
                                });
                              }
                              setManualFormData({
                                ...manualFormData,
                                bloodGroupRemarks: e.target.value,
                              });
                            }}
                            error={errors.bloodGroupRemarks}
                          />
                        </Grid.Col>
                      </Grid>
                    )}

                    {/* Country and Nationality */}
                    <Grid>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          label={STUDENT_FIELDS_CONFIG.country.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.country.placeholder
                          }
                          value={manualFormData.country || ""}
                          onChange={(e) => {
                            if (editingStudent) {
                              setEditingStudent({
                                ...editingStudent,
                                country: e.target.value,
                              });
                            }
                            setManualFormData({
                              ...manualFormData,
                              country: e.target.value,
                            });
                          }}
                          error={errors.country}
                        />
                      </Grid.Col>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          label={STUDENT_FIELDS_CONFIG.nationality.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.nationality.placeholder
                          }
                          value={manualFormData.nationality || ""}
                          onChange={(e) => {
                            if (editingStudent) {
                              setEditingStudent({
                                ...editingStudent,
                                nationality: e.target.value,
                              });
                            }
                            setManualFormData({
                              ...manualFormData,
                              nationality: e.target.value,
                            });
                          }}
                          error={errors.nationality}
                        />
                      </Grid.Col>
                    </Grid>

                    {/* Admission Mode */}
                    <Grid>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <Select
                          key="admission-mode-field"
                          label={STUDENT_FIELDS_CONFIG.admissionMode.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.admissionMode.placeholder
                          }
                          value={manualFormData.admissionMode || ""}
                          onChange={(value) => {
                            if (editingStudent) {
                              setEditingStudent({
                                ...editingStudent,
                                admissionMode: value,
                              });
                            }
                            setManualFormData({
                              ...manualFormData,
                              admissionMode: value,
                            });
                          }}
                          data={
                            activeSection === "phd"
                              ? [
                                  {
                                    value: "Institute Level",
                                    label: "Institute Level",
                                  },
                                  { value: "QIP", label: "QIP" },
                                  { value: "GATE", label: "GATE" },
                                  { value: "Sponsored", label: "Sponsored" },
                                  {
                                    value: "Foreign National",
                                    label: "Foreign National",
                                  },
                                  {
                                    value: "Any other (remarks)",
                                    label: "Any other (remarks)",
                                  },
                                ]
                              : STUDENT_FIELDS_CONFIG.admissionMode.options
                          }
                          error={errors.admissionMode}
                        />
                      </Grid.Col>

                      {/* Admission Mode Remarks - Show only when "Any other (remarks)" is selected */}
                      {manualFormData.admissionMode ===
                        "Any other (remarks)" && (
                        <Grid.Col span={isMobile ? 12 : 6}>
                          <TextInput
                            label={
                              STUDENT_FIELDS_CONFIG.admissionModeRemarks.label
                            }
                            placeholder={
                              STUDENT_FIELDS_CONFIG.admissionModeRemarks
                                .placeholder
                            }
                            value={manualFormData.admissionModeRemarks || ""}
                            onChange={(e) => {
                              if (editingStudent) {
                                setEditingStudent({
                                  ...editingStudent,
                                  admissionModeRemarks: e.target.value,
                                });
                              }
                              setManualFormData({
                                ...manualFormData,
                                admissionModeRemarks: e.target.value,
                              });
                            }}
                            error={errors.admissionModeRemarks}
                          />
                        </Grid.Col>
                      )}
                    </Grid>

                    {/* Income Group and Income */}
                    <Grid>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <Select
                          label={STUDENT_FIELDS_CONFIG.incomeGroup.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.incomeGroup.placeholder
                          }
                          value={manualFormData.incomeGroup || ""}
                          onChange={(value) => {
                            if (editingStudent) {
                              setEditingStudent({
                                ...editingStudent,
                                incomeGroup: value,
                              });
                            }
                            setManualFormData({
                              ...manualFormData,
                              incomeGroup: value,
                            });
                          }}
                          data={STUDENT_FIELDS_CONFIG.incomeGroup.options}
                          error={errors.incomeGroup}
                        />
                      </Grid.Col>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          type="number"
                          label={STUDENT_FIELDS_CONFIG.income.label}
                          placeholder={STUDENT_FIELDS_CONFIG.income.placeholder}
                          value={manualFormData.income || ""}
                          onChange={(e) => {
                            if (editingStudent) {
                              setEditingStudent({
                                ...editingStudent,
                                income: e.target.value,
                              });
                            }
                            setManualFormData({
                              ...manualFormData,
                              income: e.target.value,
                            });
                          }}
                          error={errors.income}
                        />
                      </Grid.Col>
                    </Grid>

                    {/* Parent Email */}
                    <Grid>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          type="email"
                          label={STUDENT_FIELDS_CONFIG.parentEmail.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.parentEmail.placeholder
                          }
                          value={manualFormData.parentEmail || ""}
                          onChange={(e) => {
                            if (editingStudent) {
                              setEditingStudent({
                                ...editingStudent,
                                parentEmail: e.target.value,
                              });
                            }
                            setManualFormData({
                              ...manualFormData,
                              parentEmail: e.target.value,
                            });
                          }}
                          error={errors.parentEmail}
                        />
                      </Grid.Col>
                    </Grid>

                    {/* Application No (PhD) / JEE App No (UG/PG) */}
                    {activeSection === "phd" ? (
                      <TextInput
                        label={STUDENT_FIELDS_CONFIG.applicationNo.label}
                        placeholder={
                          STUDENT_FIELDS_CONFIG.applicationNo.placeholder
                        }
                        value={manualFormData.applicationNo || ""}
                        onChange={(e) =>
                          setManualFormData({
                            ...manualFormData,
                            applicationNo: e.target.value,
                          })
                        }
                        error={errors.applicationNo}
                      />
                    ) : (
                      <TextInput
                        label={STUDENT_FIELDS_CONFIG.jeeAppNo.label}
                        placeholder={STUDENT_FIELDS_CONFIG.jeeAppNo.placeholder}
                        value={manualFormData.jeeAppNo}
                        onChange={(e) =>
                          setManualFormData({
                            ...manualFormData,
                            jeeAppNo: e.target.value,
                          })
                        }
                        required={STUDENT_FIELDS_CONFIG.jeeAppNo.required}
                        error={errors.jeeAppNo}
                      />
                    )}

                    {/* Address */}
                    <Textarea
                      label={`${STUDENT_FIELDS_CONFIG.address.label}`}
                      placeholder={STUDENT_FIELDS_CONFIG.address.placeholder}
                      value={manualFormData.address}
                      onChange={(e) =>
                        setManualFormData({
                          ...manualFormData,
                          address: e.target.value,
                        })
                      }
                      required={STUDENT_FIELDS_CONFIG.address.required}
                      error={errors.address}
                      minRows={3}
                    />

                    {/* State */}
                    <Select
                      label={STUDENT_FIELDS_CONFIG.state.label}
                      placeholder={STUDENT_FIELDS_CONFIG.state.placeholder}
                      value={manualFormData.state}
                      onChange={(value) => {
                        if (editingStudent) {
                          setEditingStudent({
                            ...editingStudent,
                            state: value,
                          });
                        }
                        setManualFormData({
                          ...manualFormData,
                          state: value,
                        });
                      }}
                      data={STUDENT_FIELDS_CONFIG.state.options}
                      required={STUDENT_FIELDS_CONFIG.state.required}
                      error={errors.state}
                      searchable
                      clearable
                    />

                    {/* Father's Details */}
                    <Grid>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          label={STUDENT_FIELDS_CONFIG.fatherOccupation.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.fatherOccupation.placeholder
                          }
                          value={manualFormData.fatherOccupation}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              fatherOccupation: e.target.value,
                            })
                          }
                          required={
                            STUDENT_FIELDS_CONFIG.fatherOccupation.required
                          }
                          error={errors.fatherOccupation}
                        />
                      </Grid.Col>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          label={STUDENT_FIELDS_CONFIG.fatherMobile.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.fatherMobile.placeholder
                          }
                          value={manualFormData.fatherMobile}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              fatherMobile: e.target.value,
                            })
                          }
                          required={STUDENT_FIELDS_CONFIG.fatherMobile.required}
                          error={errors.fatherMobile}
                        />
                      </Grid.Col>
                    </Grid>

                    {/* Mother's Details */}
                    <Grid>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          label={STUDENT_FIELDS_CONFIG.motherOccupation.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.motherOccupation.placeholder
                          }
                          value={manualFormData.motherOccupation}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              motherOccupation: e.target.value,
                            })
                          }
                          required={
                            STUDENT_FIELDS_CONFIG.motherOccupation.required
                          }
                          error={errors.motherOccupation}
                        />
                      </Grid.Col>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          label={STUDENT_FIELDS_CONFIG.motherMobile.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.motherMobile.placeholder
                          }
                          value={manualFormData.motherMobile}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              motherMobile: e.target.value,
                            })
                          }
                          required={STUDENT_FIELDS_CONFIG.motherMobile.required}
                          error={errors.motherMobile}
                        />
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Stepper.Step>

                <Stepper.Step
                  label="Academic Info"
                  description="Branch & marks details"
                  icon={<GraduationCap size={18} />}
                >
                  <Stack spacing="md" mt="lg">
                    <Title order={3} size="h4" weight={700} mb="md">
                      Academic Info
                    </Title>

                    {/* Branch Selection */}
                    <Select
                      label={`${STUDENT_FIELDS_CONFIG.branch.label}`}
                      placeholder={STUDENT_FIELDS_CONFIG.branch.placeholder}
                      value={manualFormData.branch || ""}
                      onChange={(value) => {
                        if (editingStudent) {
                          setEditingStudent({
                            ...editingStudent,
                            branch: value,
                          });
                        }
                        setManualFormData({
                          ...manualFormData,
                          branch: value,
                        });
                      }}
                      data={STUDENT_FIELDS_CONFIG.branch.options}
                      required={STUDENT_FIELDS_CONFIG.branch.required}
                      error={errors.branch}
                      searchable
                    />

                    {/* Specialization - Only for PG programmes (not PhD or UG) */}
                    {activeSection === "pg" && (
                      <Select
                        label={`${STUDENT_FIELDS_CONFIG.specialization.label}`}
                        placeholder={
                          STUDENT_FIELDS_CONFIG.specialization.placeholder
                        }
                        value={manualFormData.specialization || ""}
                        onChange={(value) => {
                          if (editingStudent) {
                            setEditingStudent({
                              ...editingStudent,
                              specialization: value,
                            });
                          }
                          setManualFormData({
                            ...manualFormData,
                            specialization: value,
                          });
                        }}
                        data={STUDENT_FIELDS_CONFIG.specialization.options}
                        required={STUDENT_FIELDS_CONFIG.specialization.required}
                        error={errors.specialization}
                        searchable
                        clearable
                      />
                    )}

                    {/* Admission Type + GATE fields - PhD only */}
                    {activeSection === "phd" && (
                      <>
                        <Select
                          label={STUDENT_FIELDS_CONFIG.admissionType.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.admissionType.placeholder
                          }
                          value={manualFormData.admissionType || ""}
                          onChange={(value) => {
                            if (editingStudent)
                              setEditingStudent({
                                ...editingStudent,
                                admissionType: value,
                              });
                            setManualFormData({
                              ...manualFormData,
                              admissionType: value,
                            });
                          }}
                          data={STUDENT_FIELDS_CONFIG.admissionType.options}
                          error={errors.admissionType}
                          clearable
                        />
                        <Grid>
                          <Grid.Col span={isMobile ? 12 : 4}>
                            <Select
                              label={STUDENT_FIELDS_CONFIG.gateQualified.label}
                              placeholder={
                                STUDENT_FIELDS_CONFIG.gateQualified.placeholder
                              }
                              value={manualFormData.gateQualified || ""}
                              onChange={(value) => {
                                if (editingStudent)
                                  setEditingStudent({
                                    ...editingStudent,
                                    gateQualified: value,
                                  });
                                setManualFormData({
                                  ...manualFormData,
                                  gateQualified: value,
                                });
                              }}
                              data={STUDENT_FIELDS_CONFIG.gateQualified.options}
                              error={errors.gateQualified}
                              clearable
                            />
                          </Grid.Col>
                          <Grid.Col span={isMobile ? 12 : 4}>
                            <TextInput
                              label={STUDENT_FIELDS_CONFIG.gateStream.label}
                              placeholder={
                                STUDENT_FIELDS_CONFIG.gateStream.placeholder
                              }
                              value={manualFormData.gateStream || ""}
                              onChange={(e) => {
                                if (editingStudent)
                                  setEditingStudent({
                                    ...editingStudent,
                                    gateStream: e.target.value,
                                  });
                                setManualFormData({
                                  ...manualFormData,
                                  gateStream: e.target.value,
                                });
                              }}
                              error={errors.gateStream}
                              disabled={manualFormData.gateQualified === "NO"}
                            />
                          </Grid.Col>
                          <Grid.Col span={isMobile ? 12 : 4}>
                            <TextInput
                              type="number"
                              label={STUDENT_FIELDS_CONFIG.gateRank.label}
                              placeholder={
                                STUDENT_FIELDS_CONFIG.gateRank.placeholder
                              }
                              value={manualFormData.gateRank || ""}
                              onChange={(e) => {
                                if (editingStudent)
                                  setEditingStudent({
                                    ...editingStudent,
                                    gateRank: e.target.value,
                                  });
                                setManualFormData({
                                  ...manualFormData,
                                  gateRank: e.target.value,
                                });
                              }}
                              error={errors.gateRank}
                              min={1}
                              disabled={manualFormData.gateQualified === "NO"}
                            />
                          </Grid.Col>
                        </Grid>
                      </>
                    )}

                    {/* AI Rank and Category Rank - Only for UG and PG, not PhD */}
                    {(activeSection === "ug" || activeSection === "pg") && (
                      <Grid>
                        <Grid.Col span={isMobile ? 12 : 6}>
                          <TextInput
                            type="number"
                            label="AI Rank"
                            placeholder="Enter AI rank"
                            value={manualFormData.jeeRank}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                jeeRank: e.target.value,
                              })
                            }
                            required={STUDENT_FIELDS_CONFIG.jeeRank.required}
                            error={errors.jeeRank}
                            min={1}
                          />
                        </Grid.Col>
                        <Grid.Col span={isMobile ? 12 : 6}>
                          <TextInput
                            type="number"
                            label={STUDENT_FIELDS_CONFIG.categoryRank.label}
                            placeholder={
                              STUDENT_FIELDS_CONFIG.categoryRank.placeholder
                            }
                            value={manualFormData.categoryRank}
                            onChange={(e) =>
                              setManualFormData({
                                ...manualFormData,
                                categoryRank: e.target.value,
                              })
                            }
                            required={
                              STUDENT_FIELDS_CONFIG.categoryRank.required
                            }
                            error={errors.categoryRank}
                            min={1}
                          />
                        </Grid.Col>
                      </Grid>
                    )}

                    {/* Allotted Category and Gender - Only for UG and PG, not PhD */}
                    {(activeSection === "ug" || activeSection === "pg") && (
                      <Grid>
                        <Grid.Col span={isMobile ? 12 : 6}>
                          <Select
                            key="allotted-category-field"
                            label={STUDENT_FIELDS_CONFIG.allottedCategory.label}
                            placeholder={
                              STUDENT_FIELDS_CONFIG.allottedCategory.placeholder
                            }
                            value={manualFormData.allottedCategory || ""}
                            onChange={(value) => {
                              setManualFormData({
                                ...manualFormData,
                                allottedCategory: value,
                              });
                            }}
                            data={STUDENT_FIELDS_CONFIG.allottedCategory.options.map(
                              (option) => ({
                                value: option.value,
                                label: option.label,
                              }),
                            )}
                            required={
                              STUDENT_FIELDS_CONFIG.allottedCategory.required
                            }
                            error={errors.allottedCategory}
                            searchable
                            clearable
                          />
                        </Grid.Col>
                        <Grid.Col span={isMobile ? 12 : 6}>
                          <Select
                            label={STUDENT_FIELDS_CONFIG.allottedGender.label}
                            placeholder={
                              STUDENT_FIELDS_CONFIG.allottedGender.placeholder
                            }
                            value={manualFormData.allottedGender || ""}
                            onChange={(value) =>
                              setManualFormData({
                                ...manualFormData,
                                allottedGender: value,
                              })
                            }
                            data={STUDENT_FIELDS_CONFIG.allottedGender.options}
                            required={
                              STUDENT_FIELDS_CONFIG.allottedGender.required
                            }
                            error={errors.allottedGender}
                          />
                        </Grid.Col>
                      </Grid>
                    )}

                    {/* Institute Details */}
                    <Grid>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          label={STUDENT_FIELDS_CONFIG.rollNumber.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.rollNumber.placeholder
                          }
                          value={manualFormData.rollNumber}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              rollNumber: e.target.value,
                            })
                          }
                          required={STUDENT_FIELDS_CONFIG.rollNumber.required}
                          error={errors.rollNumber}
                        />
                      </Grid.Col>
                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          type="email"
                          label={STUDENT_FIELDS_CONFIG.instituteEmail.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.instituteEmail.placeholder
                          }
                          value={manualFormData.instituteEmail}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              instituteEmail: e.target.value,
                            })
                          }
                          required={
                            STUDENT_FIELDS_CONFIG.instituteEmail.required
                          }
                          error={errors.instituteEmail}
                        />
                      </Grid.Col>

                      <Grid.Col span={isMobile ? 12 : 6}>
                        <TextInput
                          type="email"
                          label={STUDENT_FIELDS_CONFIG.alternateEmail.label}
                          placeholder={
                            STUDENT_FIELDS_CONFIG.alternateEmail.placeholder
                          }
                          value={manualFormData.alternateEmail || ""}
                          onChange={(e) =>
                            setManualFormData({
                              ...manualFormData,
                              alternateEmail: e.target.value,
                            })
                          }
                          required={
                            STUDENT_FIELDS_CONFIG.alternateEmail.required
                          }
                          error={errors.alternateEmail}
                        />
                      </Grid.Col>
                    </Grid>
                  </Stack>
                </Stepper.Step>

                <Stepper.Step
                  label="Review & Submit"
                  description="Verify details"
                  icon={<Check size={18} />}
                >
                  <Stack spacing="lg" mt="lg">
                    <div style={{ textAlign: "center", marginBottom: "20px" }}>
                      <Title
                        order={2}
                        size="h3"
                        weight={700}
                        mb="xs"
                        color="#2c3e50"
                      >
                        📋 Review & Submit
                      </Title>
                      <Text size="md" color="dimmed">
                        Please review all the information below before
                        submitting
                      </Text>
                    </div>

                    {/* Basic Information Card */}
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        padding: "20px",
                        borderRadius: "12px",
                        border: "1px solid #e9ecef",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "15px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#3498db",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "12px",
                          }}
                        >
                          <Text color="white" size="sm" weight={700}>
                            👤
                          </Text>
                        </div>
                        <Title order={4} weight={600} color="#2c3e50">
                          Basic Information
                        </Title>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "6px",
                          }}
                        >
                          <Text size="xs" weight={600} color="dimmed" mb={2}>
                            FULL NAME
                          </Text>
                          <Text size="sm" weight={500}>
                            {manualFormData.name || "Not provided"}
                          </Text>
                        </div>
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "6px",
                          }}
                        >
                          <Text size="xs" weight={600} color="dimmed" mb={2}>
                            FATHER'S NAME
                          </Text>
                          <Text size="sm" weight={500}>
                            {manualFormData.fname || "Not provided"}
                          </Text>
                        </div>
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "6px",
                          }}
                        >
                          <Text size="xs" weight={600} color="dimmed" mb={2}>
                            MOTHER'S NAME
                          </Text>
                          <Text size="sm" weight={500}>
                            {manualFormData.mname || "Not provided"}
                          </Text>
                        </div>
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "6px",
                          }}
                        >
                          <Text size="xs" weight={600} color="dimmed" mb={2}>
                            GENDER
                          </Text>
                          <Text size="sm" weight={500}>
                            {manualFormData.gender || "Not selected"}
                          </Text>
                        </div>
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "6px",
                          }}
                        >
                          <Text size="xs" weight={600} color="dimmed" mb={2}>
                            CATEGORY
                          </Text>
                          <Text size="sm" weight={500}>
                            {manualFormData.category || "Not selected"}
                          </Text>
                        </div>
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "6px",
                          }}
                        >
                          <Text size="xs" weight={600} color="dimmed" mb={2}>
                            MINORITY
                          </Text>
                          <Text size="sm" weight={500}>
                            {manualFormData.minority || "Not specified"}
                          </Text>
                        </div>
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "6px",
                          }}
                        >
                          <Text size="xs" weight={600} color="dimmed" mb={2}>
                            PWD STATUS
                          </Text>
                          <Text size="sm" weight={500}>
                            {manualFormData.pwd || "Not specified"}
                          </Text>
                        </div>
                        {manualFormData.pwd === "YES" &&
                          manualFormData.pwdCategory && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                PWD CATEGORY
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.pwdCategory}
                              </Text>
                            </div>
                          )}
                        {manualFormData.pwdCategory === "Any other (remarks)" &&
                          manualFormData.pwdCategoryRemarks && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                PWD CATEGORY REMARKS
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.pwdCategoryRemarks}
                              </Text>
                            </div>
                          )}
                        {manualFormData.phoneNumber && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              PHONE NUMBER
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.phoneNumber}
                            </Text>
                          </div>
                        )}
                        {manualFormData.parentEmail && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              PARENT'S EMAIL
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.parentEmail}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Information Card */}
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        padding: "20px",
                        borderRadius: "12px",
                        border: "1px solid #e9ecef",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "15px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#27ae60",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "12px",
                          }}
                        >
                          <Text color="white" size="sm" weight={700}>
                            📄
                          </Text>
                        </div>
                        <Title order={4} weight={600} color="#2c3e50">
                          Additional Information
                        </Title>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                          gap: "12px",
                        }}
                      >
                        {manualFormData.dob && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              DATE OF BIRTH
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.dob}
                            </Text>
                          </div>
                        )}
                        {manualFormData.bloodGroup && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              BLOOD GROUP
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.bloodGroup}
                            </Text>
                          </div>
                        )}
                        {manualFormData.bloodGroupRemarks && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              BLOOD GROUP REMARKS
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.bloodGroupRemarks}
                            </Text>
                          </div>
                        )}
                        {manualFormData.country && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              COUNTRY
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.country}
                            </Text>
                          </div>
                        )}
                        {manualFormData.nationality && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              NATIONALITY
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.nationality}
                            </Text>
                          </div>
                        )}
                        {manualFormData.admissionMode && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              ADMISSION MODE
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.admissionMode}
                            </Text>
                          </div>
                        )}
                        {manualFormData.admissionMode ===
                          "Any other (remarks)" &&
                          manualFormData.admissionModeRemarks && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                ADMISSION MODE REMARKS
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.admissionModeRemarks}
                              </Text>
                            </div>
                          )}
                        {manualFormData.incomeGroup && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              INCOME GROUP
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.incomeGroup}
                            </Text>
                          </div>
                        )}
                        {manualFormData.income && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              INCOME
                            </Text>
                            <Text size="sm" weight={500}>
                              ₹
                              {parseInt(
                                manualFormData.income,
                                10,
                              ).toLocaleString("en-IN")}
                            </Text>
                          </div>
                        )}
                        {activeSection === "phd" ? (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              APPLICATION NO.
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.applicationNo || "Not provided"}
                            </Text>
                          </div>
                        ) : (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              JEE APPLICATION NO.
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.jeeAppNo || "Not provided"}
                            </Text>
                          </div>
                        )}
                        {activeSection === "phd" &&
                          manualFormData.admissionType && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                ADMISSION TYPE
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.admissionType}
                              </Text>
                            </div>
                          )}
                        {activeSection === "pg" &&
                          manualFormData.specialization && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                SPECIALIZATION
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.specialization}
                              </Text>
                            </div>
                          )}
                        {manualFormData.address && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                              gridColumn: "1 / -1",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              ADDRESS
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.address}
                            </Text>
                          </div>
                        )}
                        {manualFormData.state && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              STATE
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.state}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Family Information Card */}
                    {(manualFormData.fatherOccupation ||
                      manualFormData.fatherMobile ||
                      manualFormData.motherOccupation ||
                      manualFormData.motherMobile) && (
                      <div
                        style={{
                          backgroundColor: "#ffffff",
                          padding: "20px",
                          borderRadius: "12px",
                          border: "1px solid #e9ecef",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            marginBottom: "15px",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#e67e22",
                              borderRadius: "50%",
                              width: "32px",
                              height: "32px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              marginRight: "12px",
                            }}
                          >
                            <Text color="white" size="sm" weight={700}>
                              👨‍👩‍👧‍👦
                            </Text>
                          </div>
                          <Title order={4} weight={600} color="#2c3e50">
                            Family Information
                          </Title>
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "12px",
                          }}
                        >
                          {manualFormData.fatherOccupation && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                FATHER'S OCCUPATION
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.fatherOccupation}
                              </Text>
                            </div>
                          )}
                          {manualFormData.fatherMobile && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                FATHER'S MOBILE
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.fatherMobile}
                              </Text>
                            </div>
                          )}
                          {manualFormData.motherOccupation && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                MOTHER'S OCCUPATION
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.motherOccupation}
                              </Text>
                            </div>
                          )}
                          {manualFormData.motherMobile && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                MOTHER'S MOBILE
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.motherMobile}
                              </Text>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Academic Information Card */}
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        padding: "20px",
                        borderRadius: "12px",
                        border: "1px solid #e9ecef",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "15px",
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: "#9b59b6",
                            borderRadius: "50%",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: "12px",
                          }}
                        >
                          <Text color="white" size="sm" weight={700}>
                            🎓
                          </Text>
                        </div>
                        <Title order={4} weight={600} color="#2c3e50">
                          Academic Information
                        </Title>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(250px, 1fr))",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            padding: "8px",
                            backgroundColor: "#f8f9fa",
                            borderRadius: "6px",
                          }}
                        >
                          <Text size="xs" weight={600} color="dimmed" mb={2}>
                            BRANCH
                          </Text>
                          <Text size="sm" weight={500}>
                            {manualFormData.branch || "Not selected"}
                          </Text>
                        </div>
                        {activeSection === "pg" &&
                          manualFormData.specialization && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#e8f4fd",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                SPECIALIZATION
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.specialization}
                              </Text>
                            </div>
                          )}
                        {activeSection === "phd" &&
                          manualFormData.admissionType && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#e8f4fd",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                ADMISSION TYPE
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.admissionType}
                              </Text>
                            </div>
                          )}
                        {activeSection === "phd" &&
                          manualFormData.gateQualified && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                GATE QUALIFIED
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.gateQualified}
                              </Text>
                            </div>
                          )}
                        {activeSection === "phd" &&
                          manualFormData.gateStream && (
                            <div
                              style={{
                                padding: "8px",
                                backgroundColor: "#f8f9fa",
                                borderRadius: "6px",
                              }}
                            >
                              <Text
                                size="xs"
                                weight={600}
                                color="dimmed"
                                mb={2}
                              >
                                GATE STREAM
                              </Text>
                              <Text size="sm" weight={500}>
                                {manualFormData.gateStream}
                              </Text>
                            </div>
                          )}
                        {activeSection === "phd" && manualFormData.gateRank && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              GATE RANK
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.gateRank}
                            </Text>
                          </div>
                        )}
                        {manualFormData.jeeRank && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              AI RANK
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.jeeRank}
                            </Text>
                          </div>
                        )}
                        {manualFormData.categoryRank && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              CATEGORY RANK
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.categoryRank}
                            </Text>
                          </div>
                        )}
                        {manualFormData.allottedCategory && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              ALLOTTED CATEGORY
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.allottedCategory}
                            </Text>
                          </div>
                        )}
                        {manualFormData.allottedGender && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              ALLOTTED GENDER
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.allottedGender}
                            </Text>
                          </div>
                        )}
                        {manualFormData.rollNumber && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              INSTITUTE ROLL NUMBER
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.rollNumber}
                            </Text>
                          </div>
                        )}
                        {manualFormData.instituteEmail && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              INSTITUTE EMAIL ID
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.instituteEmail}
                            </Text>
                          </div>
                        )}
                        {manualFormData.alternateEmail && (
                          <div
                            style={{
                              padding: "8px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                            }}
                          >
                            <Text size="xs" weight={600} color="dimmed" mb={2}>
                              ALTERNATE EMAIL
                            </Text>
                            <Text size="sm" weight={500}>
                              {manualFormData.alternateEmail}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Confirmation Message */}
                    <div
                      style={{
                        backgroundColor: "#d4edda",
                        padding: "15px",
                        borderRadius: "8px",
                        border: "1px solid #c3e6cb",
                        textAlign: "center",
                      }}
                    >
                      <Text size="sm" color="#155724" weight={500}>
                        ✅ Please verify all the information above is correct
                        before submitting
                      </Text>
                    </div>
                  </Stack>
                </Stepper.Step>
              </Stepper>

              <Group position="apart" mt="xl">
                <Button
                  variant="default"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  <CaretLeft size={16} style={{ marginRight: "8px" }} />
                  Previous
                </Button>
                <Button
                  onClick={nextStep}
                  style={{ backgroundColor: "#3498db" }}
                >
                  {currentStep === 3
                    ? editingStudent
                      ? "Update"
                      : "Submit"
                    : "Next"}
                  {currentStep === 3 ? (
                    <Check size={16} style={{ marginLeft: "8px" }} />
                  ) : (
                    <CaretRight size={16} style={{ marginLeft: "8px" }} />
                  )}
                </Button>
              </Group>
            </Card>
          </Stack>
        </Container>
      )}
    </Modal>
  );
}

AddStudentsModal.propTypes = {
  opened: PropTypes.bool,
  onClose: PropTypes.func,
  activeSection: PropTypes.string,
  editingStudent: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Object),
  ]),
  setEditingStudent: PropTypes.func,
  setShowStudentModal: PropTypes.func,
  addMode: PropTypes.string,
  allocationSummary: PropTypes.instanceOf(Object),
  currentStep: PropTypes.number,
  errors: PropTypes.instanceOf(Object),
  extractedData: PropTypes.arrayOf(PropTypes.shape({})),
  generateExcelTemplate: PropTypes.func,
  handleExcelUpload: PropTypes.func,
  handleFileUpload: PropTypes.func,
  isMobile: PropTypes.bool,
  isProcessing: PropTypes.bool,
  manualFormData: PropTypes.instanceOf(Object),
  nextStep: PropTypes.func,
  prevStep: PropTypes.func,
  processedBatchData: PropTypes.instanceOf(Object),
  selectedBatchYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  selectedPhdSemester: PropTypes.string,
  setAddMode: PropTypes.func,
  setAllocationSummary: PropTypes.func,
  setCurrentStep: PropTypes.func,
  setErrors: PropTypes.func,
  setExtractedData: PropTypes.func,
  setManualFormData: PropTypes.func,
  setProcessedBatchData: PropTypes.func,
  setSelectedBatchYear: PropTypes.func,
  setSelectedPhdSemester: PropTypes.func,
  setShowAddModal: PropTypes.func,
  setShowBatchPreview: PropTypes.func,
  setShowPreview: PropTypes.func,
  setUploadedFile: PropTypes.func,
  showBatchPreview: PropTypes.bool,
  showPreview: PropTypes.bool,
  uploadProgress: PropTypes.number,
  uploadedFile: PropTypes.instanceOf(File),
};

export default AddStudentsModal;
