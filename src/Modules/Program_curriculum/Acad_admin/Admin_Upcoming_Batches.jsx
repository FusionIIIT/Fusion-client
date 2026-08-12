import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Container, Button, TextInput, Select, Grid, Flex } from "@mantine/core";
import { Plus, MagnifyingGlass, Funnel } from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import { useMediaQuery } from "@mantine/hooks";
import { updateBatch } from "../api/api";

import { customTableStyles, INITIAL_FORM_DATA } from "./AdminUpcomingBatchesConstants";

import { getCurrentBatchYear, getViewAcademicYearOptions, normalizeBranchName, validateTransferCompatibility, getCurrentProgrammeType, performBatchBranchChangeAPI, getExportableFields, getDisciplineOptions } from "./AdminUpcomingBatchesUtils";
import AddBatchModal from "./components/AddBatchModal";
import DeleteBatchModal from "./components/DeleteBatchModal";
import DeleteStudentModal from "./components/DeleteStudentModal";
import ExportModal from "./components/ExportModal";
import StudentListModal from "./components/StudentListModal";
import AddStudentsModal from "./components/AddStudentsModal";
import BatchTable from "./components/BatchTable";
import { useBatchData } from "./hooks/useBatchData";
import { useAddBatch } from "./hooks/useAddBatch";
import { useBatchFilters } from "./hooks/useBatchFilters";
import { useStudentList } from "./hooks/useStudentList";
import { useExport } from "./hooks/useExport";
import { useAddStudents } from "./hooks/useAddStudents";

const AdminUpcomingBatch = () => {

  const isViewingCurrentYear = () => {
    const currentYear = getCurrentBatchYear();
    const viewYear = parseInt(viewAcademicYear, 10);
    // Allow reporting for the current academic year (and future years if navigated).
    return viewYear >= currentYear;
  };




  // Proactive validation check before attempting student operations




  const getBatchForBranchTransfer = (targetBranch, targetYear = null, programmeType = null, allBatches = null) => {
    if (!targetBranch) return null;

    const batchesToSearch = allBatches || getCurrentBatches();
    if (!batchesToSearch || batchesToSearch.length === 0) return null;

    const targetVariants = normalizeBranchName(targetBranch);

    // Filter batches by programme type if specified
    let filteredBatches = batchesToSearch;
    if (programmeType) {
      filteredBatches = batchesToSearch.filter(batch => {
        const batchProgramme = (batch.programme || '').toLowerCase();
        switch (programmeType) {
          case 'ug':
            return batchProgramme.includes('b.tech') || batchProgramme.includes('b.des');
          case 'pg':
            return batchProgramme.includes('m.tech') || batchProgramme.includes('m.des');
          case 'phd':
            return batchProgramme.includes('phd') || batchProgramme.includes('ph.d');
          default:
            return true;
        }
      });
    }

    if (targetYear) {
      filteredBatches = filteredBatches.filter(batch => batch.year === parseInt(targetYear));
    }
    const exactMatch = filteredBatches.find(batch => {
      const batchBranch = (batch.discipline || batch.branch || '').trim();
      if (!batchBranch) return false;
      
      const batchVariants = normalizeBranchName(batchBranch);
      return targetVariants.some(target => 
        batchVariants.some(batchVar => 
          target.toLowerCase() === batchVar.toLowerCase()
        )
      );
    });

    return exactMatch || null;
  };

  const getAvailableTargetBatches = (currentBatch, transferType = 'batch_change') => {
    const allBatches = [...ugBatches, ...pgBatches, ...phdBatches];
    
    return allBatches.filter(batch => {
      if (batch.id === currentBatch?.id) return false;
      const availableSeats = (batch.totalSeats || 0) - (batch.filledSeats || 0);
      if (availableSeats <= 0) return false;

      switch (transferType) {
        case 'batch_change':
          return batch.discipline === currentBatch?.discipline;
        
        case 'branch_change':
          const currentProgrammeType = getCurrentProgrammeType(currentBatch);
          const batchProgrammeType = getCurrentProgrammeType(batch);
          return batchProgrammeType === currentProgrammeType && 
                 batch.discipline !== currentBatch?.discipline;
        
        case 'programme_change':
          const currentProgramme = getCurrentProgrammeType(currentBatch);
          const targetProgramme = getCurrentProgrammeType(batch);
          return targetProgramme !== currentProgramme;
        
        default:
          return true;
      }
    }).sort((a, b) => {
      if (a.programme !== b.programme) {
        return a.programme.localeCompare(b.programme);
      }
      if (a.discipline !== b.discipline) {
        return a.discipline.localeCompare(b.discipline);
      }
      return b.year - a.year; // Latest year first
    });
  };

  // Function to handle student batch/branch transfer
  const handleBatchBranchTransfer = async (studentData, transferDetails) => {
    try {
      // Frontend validation only
      const transferValidation = validateTransferCompatibility(
        transferDetails.currentBatch, 
        transferDetails.newBatch, 
        transferDetails.transferType
      );
      
      if (!transferValidation.isValid) {
        throw new Error(transferValidation.message);
      }

      // Call backend - it handles everything
      const result = await performBatchBranchChangeAPI(studentData, transferDetails);

      // Show success notification
      notifications.show({
        title: "Transfer Successful",
        message: result.message || "Student transferred successfully",
        color: "green",
        autoClose: 5000,
      });

      // Refresh data from backend
      await fetchBatchData(); // Let backend provide updated counts

      // Remove from current view if needed
      if (selectedBatch && (selectedBatch.id === transferDetails.currentBatch?.id)) {
        setStudentList((prev) => 
          prev.filter(student => 
            (student.id || student.student_id) !== (studentData.id || studentData.student_id)
          )
        );
      }

      return { success: true, message: result.message };

    } catch (error) {
      notifications.show({
        title: "Transfer Error",
        message: `Failed to transfer student: ${error.message}`,
        color: "red",
      });
      return { success: false, error: error.message };
    }
  };


  // Helper function to determine programme type from batch



  const handleBranchTransfer = async (studentData, oldBatch, newBatch) => {
    return await handleBatchBranchTransfer(studentData, {
      currentBatch: oldBatch,
      newBatch: newBatch,
      transferType: 'branch_change',
      reason: 'Automatic branch transfer'
    });
  };

  const { userDetails } = useSelector((state) => state.user);
  const isMobile = useMediaQuery("(max-width: 768px)");


  const {
    activeSection,
    setActiveSection,
    selectedBatchYear,
    setSelectedBatchYear,
    viewAcademicYear,
    setViewAcademicYear,
    searchQuery,
    setSearchQuery,
    filterYear,
    setFilterYear,
    filterProgramme,
    setFilterProgramme,
    phdSemesterFilter,
    setPhdSemesterFilter,
    selectedPhdSemester,
    setSelectedPhdSemester,
  } = useBatchFilters();

  const {
    ugBatches,
    pgBatches,
    phdBatches,
    backgroundSync,
    loading,
    setUgBatches,
    setPgBatches,
    setPhdBatches,
    setLoading,
    getCurrentBatches,
    fetchBatchData,
    forceRefreshData,
    syncBatchData,
  } = useBatchData(activeSection, viewAcademicYear);

  const {
    showAddBatchModal,
    setShowAddBatchModal,
    newBatchData,
    setNewBatchData,
    deletingBatchId,
    setDeletingBatchId,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleAddBatch,
    handleDeleteBatch,
  } = useAddBatch({
    activeSection,
    selectedBatchYear,
    batchSetters: { setUgBatches, setPgBatches, setPhdBatches },
    getCurrentBatches,
    forceRefreshData,
  });

  const {
    showStudentModal,
    setShowStudentModal,
    selectedBatch,
    setSelectedBatch,
    studentList,
    setStudentList,
    updatingReportStatus,
    deletingStudent,
    selectedStudents,
    isAllSelected,
    isBulkReporting,
    showDeleteStudentConfirm,
    setShowDeleteStudentConfirm,
    studentToDelete,
    studentSearchQuery,
    setStudentSearchQuery,
    getFilteredStudents,
    handleBatchRowClick,
    handleReportedStatusChange,
    handleBulkStatusChange,
    handleStudentSelect,
    handleSelectAll,
    handleDeleteStudent,
    confirmDeleteStudent,
  } = useStudentList({
    activeSection,
    batchSetters: { setUgBatches, setPgBatches, setPhdBatches },
    getCurrentBatches,
    forceRefreshData,
    fetchBatchData,
  });
  const [editingStudent, setEditingStudent] = useState(null);

  const {
    showAddModal,
    setShowAddModal,
    addMode,
    setAddMode,
    showPreview,
    setShowPreview,
    uploadedFile,
    setUploadedFile,
    isProcessing,
    setIsProcessing,
    uploadProgress,
    extractedData,
    setExtractedData,
    processedBatchData,
    allocationSummary,
    showBatchPreview,
    currentStep,
    manualFormData,
    setManualFormData,
    errors,
    handleFileUpload,
    handleExcelUpload,
    nextStep,
    prevStep,
    generateExcelTemplate,
    setCurrentStep,
    setErrors,
    setProcessedBatchData,
    setAllocationSummary,
    setShowBatchPreview,
    transformDataForDatabase,
  } = useAddStudents({
    activeSection,
    selectedPhdSemester,
    viewAcademicYear,
    ugBatches,
    pgBatches,
    phdBatches,
    getCurrentBatches,
    forceRefreshData,
    editingStudent,
    setEditingStudent,
    setStudentList,
    setSelectedBatch,
    setShowStudentModal,
  });

  const {
    showExportModal,
    setShowExportModal,
    selectedFields,
    exportFormat,
    setExportFormat,
    isExporting,
    selectAllFields,
    handleToggleAllFields,
    handleFieldChange,
    handleStudentExport,
  } = useExport({ selectedBatch, getFilteredStudents });




  // Helper function to parse backend duplicate errors and return user-friendly messages



  const handleStatusChange = (rollNo, newStatus) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.rollNo === rollNo ? { ...student, status: newStatus } : student
      )
    );
  };









  const [modalOpened, setModalOpened] = useState(false);
  const [entryMode, setEntryMode] = useState("excel");


  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const [editingBatchId, setEditingBatchId] = useState(null);
  const [editTotalSeats, setEditTotalSeats] = useState("");
  const [seatsUpdateLoading, setSeatsUpdateLoading] = useState(false);

  const [editingRow, setEditingRow] = useState(null); 
  const [editFormData, setEditFormData] = useState({});
  const [savingBatchEdit, setSavingBatchEdit] = useState(false);

  const handleEditBatchClick = (batch) => {
    setEditFormData({
      programme: batch.programme,
      discipline: batch.displayBranch || batch.discipline,
      year: batch.year,
      totalSeats: batch.totalSeats,
    });
    setEditingRow(batch.id);
  };

  const handleCancelBatchEdit = () => {
    setEditingRow(null);
    setEditFormData({});
  };

  const handleSaveBatchEdit = async () => {
    setSavingBatchEdit(true);
    try {
      const result = await updateBatch(editingRow, {
        programme: editFormData.programme,
        discipline: editFormData.discipline,
        year: editFormData.year,
        total_seats: editFormData.totalSeats,
      });
      if (result.success) {
        notifications.show({ title: "Batch Updated", message: "Batch updated successfully.", color: "green" });
        setEditingRow(null);
        setEditFormData({});
        forceRefreshData();
      } else {
        throw new Error(result.message || "Failed to update batch");
      }
    } catch (error) {
      notifications.show({ title: "Update Failed", message: error.message || "Failed to update batch", color: "red" });
    } finally {
      setSavingBatchEdit(false);
    }
  }; 





  useEffect(() => {
    setFilterProgramme("");
    syncBatchData();
  }, [activeSection]);

  // Handle editing student data mapping



  // Automatically sync batch data using backend API

  const filteredBatches = getCurrentBatches().filter((batch) => {
    const matchesSearch =
      searchQuery === "" ||
      batch.programme.toLowerCase().includes(searchQuery.toLowerCase()) ||
      batch.discipline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (batch.displayBranch &&
        batch.displayBranch.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesYear =
      filterYear === "" || batch.year.toString() === filterYear;
    const matchesProgramme =
      filterProgramme === "" || batch.programme === filterProgramme;

    const matchesViewYear = batch.year === viewAcademicYear;
    
    // PhD semester filter
    const matchesPhdSemester = 
      activeSection !== "phd" || 
      phdSemesterFilter === "" || 
      (batch.name && batch.name.toLowerCase().includes(phdSemesterFilter.toLowerCase()));

    return matchesSearch && matchesProgramme && matchesViewYear && matchesPhdSemester;
  });

  // Constants for field mapping
  

  // Handle file upload for Excel - Now connected to backend with enhanced programme detection

  // Function to apply case conversion rules

  // Export utility functions









  // Filter students based on search query



  // Student table column configuration for organized display


  // Filter table columns based on programme type

  // Enhanced Excel upload with workflow validation



  // Validate Excel data before upload


  // Manual form navigation and submission



  // ==================== CRUD OPERATIONS ====================

  // CREATE - Add new batch

  // DELETE - Execute delete

  // Helper function to get programme options based on active section
  const getProgrammeOptions = () => {
    if (activeSection === "ug") {
      return [
        { value: "B.Tech", label: "B.Tech" },
        { value: "B.Des", label: "B.Des" },
      ];
    } else if (activeSection === "pg") {
      return [
        { value: "M.Tech AI & ML", label: "M.Tech AI & ML" },
        { value: "M.Tech Data Science", label: "M.Tech Data Science" },
        { value: "M.Tech Communication and Signal Processing", label: "M.Tech Communication and Signal Processing" },
        { value: "M.Tech Nanoelectronics and VLSI Design", label: "M.Tech Nanoelectronics and VLSI Design" },
        { value: "M.Tech Power & Control", label: "M.Tech Power & Control" },
        { value: "M.Tech Design", label: "M.Tech Design" },
        { value: "M.Tech CAD/CAM", label: "M.Tech CAD/CAM" },
        { value: "M.Tech Manufacturing and Automation", label: "M.Tech Manufacturing and Automation" },
        { value: "M.Des", label: "M.Des" },
      ];
    } else {
      return [{ value: "PhD", label: "PhD" }];
    }
  };

  // Helper function to get discipline options based on programme

  // ==================== END CRUD OPERATIONS ====================

  // Generate Excel template with all unified fields
  // Helper function to extract specialization from batch name for PG programs

  // Helper function to filter students by specialization for PG programs

  // Handle batch row click to fetch and display students

  // Fallback method to try alternative API endpoints when primary fails

  // API function to update student reported status

  // Handle reported status change for students


  // Helper function to get status display properties

  // Helper function to render status badge

  // Bulk selection functionality



  // Generalized bulk status change function




  // Handle Edit Student
  const handleEditStudent = (student) => {
    setEditingStudent(student);

    setShowStudentModal(false);
    setShowAddModal(true);
    setAddMode("manual");
    setCurrentStep(0); 

    notifications.show({
      title: "Edit Mode",
      message: `Editing student: ${student.Name || student.name || "Unknown"}`,
      color: "blue",
    });

    window.lastEditedStudent = student;
  };

  // Handle Delete Student


  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customTableStyles }} />
      <Container 
        fluid 
        className="content-container"
        style={{ padding: "20px", maxWidth: "95vw" }}
      >
        {/* Section Tabs */}
        <Flex justify="flex-start" align="center" mb={10}>
          <Button
            variant={activeSection === "ug" ? "filled" : "outline"}
            style={{
              marginRight: "10px",
              backgroundColor:
                activeSection === "ug" ? "#3498db" : "transparent",
              color: activeSection === "ug" ? "white" : "#3498db",
              borderColor: "#3498db",
            }}
            onClick={() => setActiveSection("ug")}
          >
            UG: Undergraduate
          </Button>
          <Button
            variant={activeSection === "pg" ? "filled" : "outline"}
            style={{
              marginRight: "10px",
              backgroundColor:
                activeSection === "pg" ? "#3498db" : "transparent",
              color: activeSection === "pg" ? "white" : "#3498db",
              borderColor: "#3498db",
            }}
            onClick={() => setActiveSection("pg")}
          >
            PG: Post Graduate
          </Button>
          <Button
            variant={activeSection === "phd" ? "filled" : "outline"}
            style={{
              backgroundColor:
                activeSection === "phd" ? "#3498db" : "transparent",
              color: activeSection === "phd" ? "white" : "#3498db",
              borderColor: "#3498db",
            }}
            onClick={() => setActiveSection("phd")}
          >
            PhD: Doctor of Philosophy
          </Button>
        </Flex>
        <hr />

        {/* Top Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            marginTop: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {backgroundSync && (
              <div
                className="sync-indicator"
                style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "6px",
                  padding: "4px 10px",
                  backgroundColor: "#e3f2fd",
                  border: "1px solid #2196f3",
                  borderRadius: "20px",
                  fontSize: "11px",
                  fontWeight: "500",
                  color: "#1565c0"
                }}
              >
                <div 
                  style={{
                    width: "10px",
                    height: "10px",
                    border: "2px solid #2196f3",
                    borderTop: "2px solid transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }}
                />
                Updating data...
              </div>
            )}
            <Button
              onClick={() => {
                setSelectedBatchYear(getCurrentBatchYear());
                setShowAddModal(true);
              }}
              style={{
                backgroundColor: "#3498db",
                color: "white",
                border: "none",
              }}
              leftSection={<Plus size={16} />}
            >
              Add Students
            </Button>
          </div>

          {/* Search and Filters */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <TextInput
              placeholder="Search by programme or discipline..."
              icon={<MagnifyingGlass size={16} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: "250px" }}
            />
            
            {/* Programme Filter - Only show for UG and PG sections, not PhD */}
            {activeSection !== "phd" && (
              <Select
                placeholder="Filter by Programme"
                icon={<Funnel size={16} />}
                data={
                  activeSection === "ug"
                    ? [
                        { value: "", label: "All Programmes" },
                        { value: "B.Tech", label: "B.Tech" },
                        { value: "B.Des", label: "B.Des" },
                      ]
                    : [
                        { value: "", label: "All Programmes" },
                        { value: "M.Tech", label: "M.Tech" },
                        { value: "M.Des", label: "M.Des" },
                      ]
                }
                value={filterProgramme}
                onChange={setFilterProgramme}
                style={{ minWidth: 150 }}
              />
            )}
            
            {/* PhD Semester Filter - Only show for PhD section */}
            {activeSection === "phd" && (
              <Select
                placeholder="Odd / Even"
                icon={<Funnel size={16} />}
                data={[
                  { value: "odd", label: "Odd" },
                  { value: "even", label: "Even" },
                ]}
                value={phdSemesterFilter}
                onChange={setPhdSemesterFilter}
                style={{ minWidth: 150 }}
                clearable
              />
            )}

            {/* Academic Year Selector */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 12px",
                backgroundColor: "#e7f3ff",
                border: "1px solid #3498db",
                borderRadius: "6px",
              }}
            >
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#2c5282" }}>
                📅 Academic Year:
              </span>
              <Select
                value={viewAcademicYear.toString()}
                onChange={(value) => setViewAcademicYear(parseInt(value, 10))}
                data={getViewAcademicYearOptions()}
                style={{ width: "100px" }}
                size="xs"
                variant="unstyled"
                styles={{
                  input: {
                    fontWeight: 600,
                    color: "#2c5282",
                    fontSize: "14px",
                    padding: "0 4px",
                    minHeight: "auto",
                    height: "auto",
                  },
                  dropdown: {
                    fontSize: "14px",
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <Grid gutter="md">
          <Grid.Col span={12}>
            <div style={{ backgroundColor: "white", padding: "0px" }}>
              <BatchTable
                batches={filteredBatches}
                loading={loading}
                editingRow={editingRow}
                editFormData={editFormData}
                setEditFormData={setEditFormData}
                onRowClick={handleBatchRowClick}
                getProgrammeOptions={getProgrammeOptions}
                onEditClick={handleEditBatchClick}
                onSaveEdit={handleSaveBatchEdit}
                onCancelEdit={handleCancelBatchEdit}
                savingEdit={savingBatchEdit}
              />
            </div>
          </Grid.Col>
        </Grid>

        {/* Add Students Modal */}
        <AddStudentsModal
          opened={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setAddMode(null);
            setCurrentStep(0);
            setShowPreview(false);
            setExtractedData([]);
            setUploadedFile(null);
            setProcessedBatchData(null);
            setAllocationSummary(null);
            setShowBatchPreview(false);
            setSelectedPhdSemester('');
          }}
          activeSection={activeSection}
          editingStudent={editingStudent}
          setEditingStudent={setEditingStudent}
          setShowStudentModal={setShowStudentModal}
          addMode={addMode}
          allocationSummary={allocationSummary}
          currentStep={currentStep}
          errors={errors}
          extractedData={extractedData}
          generateExcelTemplate={generateExcelTemplate}
          handleExcelUpload={handleExcelUpload}
          handleFileUpload={handleFileUpload}
          isMobile={isMobile}
          isProcessing={isProcessing}
          manualFormData={manualFormData}
          nextStep={nextStep}
          prevStep={prevStep}
          processedBatchData={processedBatchData}
          selectedBatchYear={selectedBatchYear}
          selectedPhdSemester={selectedPhdSemester}
          setAddMode={setAddMode}
          setAllocationSummary={setAllocationSummary}
          setCurrentStep={setCurrentStep}
          setErrors={setErrors}
          setExtractedData={setExtractedData}
          setManualFormData={setManualFormData}
          setProcessedBatchData={setProcessedBatchData}
          setSelectedBatchYear={setSelectedBatchYear}
          setSelectedPhdSemester={setSelectedPhdSemester}
          setShowAddModal={setShowAddModal}
          setShowBatchPreview={setShowBatchPreview}
          setShowPreview={setShowPreview}
          setUploadedFile={setUploadedFile}
          showBatchPreview={showBatchPreview}
          showPreview={showPreview}
          uploadProgress={uploadProgress}
          uploadedFile={uploadedFile}
        />

        {/* Student List Modal */}
        <StudentListModal
          opened={showStudentModal}
          onClose={() => {
            setShowStudentModal(false);
            setSelectedBatch(null);
            setStudentList([]);
            setStudentSearchQuery("");
            setShowExportModal(false);
          }}
          selectedBatch={selectedBatch}
          studentList={studentList}
          studentSearchQuery={studentSearchQuery}
          setStudentSearchQuery={setStudentSearchQuery}
          selectedStudents={selectedStudents}
          isAllSelected={isAllSelected}
          isBulkReporting={isBulkReporting}
          updatingReportStatus={updatingReportStatus}
          editingStudent={editingStudent}
          deletingStudent={deletingStudent}
          getFilteredStudents={getFilteredStudents}
          handleBulkStatusChange={handleBulkStatusChange}
          handleSelectAll={handleSelectAll}
          handleStudentSelect={handleStudentSelect}
          handleReportedStatusChange={handleReportedStatusChange}
          handleEditStudent={handleEditStudent}
          handleDeleteStudent={handleDeleteStudent}
          setShowExportModal={setShowExportModal}
          isViewingCurrentYear={isViewingCurrentYear}
        />

        {/* Add New Batch Modal */}
        <AddBatchModal
          opened={showAddBatchModal}
          onClose={() => setShowAddBatchModal(false)}
          newBatchData={newBatchData}
          setNewBatchData={setNewBatchData}
          programmeOptions={getProgrammeOptions()}
          getDisciplineOptions={getDisciplineOptions}
          onSubmit={handleAddBatch}
        />

        <DeleteBatchModal
          opened={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          batch={[...ugBatches, ...pgBatches, ...phdBatches].find(
            (b) => b.id === deletingBatchId,
          )}
          onConfirm={handleDeleteBatch}
        />

        <DeleteStudentModal
          opened={showDeleteStudentConfirm}
          onClose={() => setShowDeleteStudentConfirm(false)}
          student={studentToDelete}
          deleting={deletingStudent === studentToDelete?.id}
          onConfirm={confirmDeleteStudent}
        />

        <ExportModal
          opened={showExportModal}
          onClose={() => setShowExportModal(false)}
          exportFormat={exportFormat}
          setExportFormat={setExportFormat}
          selectAllFields={selectAllFields}
          onToggleAll={handleToggleAllFields}
          fields={getExportableFields()}
          selectedFields={selectedFields}
          onFieldChange={handleFieldChange}
          recordCount={getFilteredStudents().length}
          isExporting={isExporting}
          onExport={handleStudentExport}
        />
      </Container>
    </>
  );
};

export default AdminUpcomingBatch;
