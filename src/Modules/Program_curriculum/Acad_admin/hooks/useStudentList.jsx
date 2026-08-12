import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { Badge } from "@mantine/core";
import { deleteStudent } from "../../api/api";
import { host } from "../../../../routes/globalRoutes";
import { PROGRAMME_TYPES } from "../AdminUpcomingBatchesConstants";
import {
  filterStudentsBySpecialization,
  getCurrentProgrammeType,
} from "../AdminUpcomingBatchesUtils";

// Owns the student-list modal: per-batch students, report-status, bulk ops,
// selection, delete. Batch setters + refresh fns injected from useBatchData.
export function useStudentList({
  activeSection,
  batchSetters,
  getCurrentBatches,
  forceRefreshData,
  fetchBatchData,
}) {
  const { setUgBatches, setPgBatches, setPhdBatches } = batchSetters;
  const [showDeleteStudentConfirm, setShowDeleteStudentConfirm] =
    useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [studentList, setStudentList] = useState([]);
  const [updatingReportStatus, setUpdatingReportStatus] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);

  const [selectedStudents, setSelectedStudents] = useState(new Set());
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isBulkReporting, setIsBulkReporting] = useState(false);

  const [studentSearchQuery, setStudentSearchQuery] = useState("");

  const getFilteredStudents = () => {
    if (!studentSearchQuery.trim()) {
      return studentList;
    }

    const query = studentSearchQuery.toLowerCase();
    return studentList.filter((student) => {
      return Object.values(student).some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      );
    });
  };

  const handleBatchRowClick = async (batch) => {
    setSelectedBatch(batch);
    setShowStudentModal(true);
    
    if (selectedBatch && selectedBatch.id === batch.id && showStudentModal) {
      return;
    }

    let students = batch.students || [];
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        notifications.show({
          title: "Authentication Error",
          message: "Please refresh the page and try again",
          color: "red",
        });
        return;
      }
      
      const response = await fetch(
        `${host}/programme_curriculum/api/batches/${batch.id}/students/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        const uploadStudents = data.upload_students || [];
        const academicStudents = data.academic_students || [];
        const directStudents = data.students || [];

        const combinedStudents = [...uploadStudents, ...academicStudents, ...directStudents];
        
        if (combinedStudents.length === 0) {
          await tryFallbackStudentFetch(batch);
          return;
        }

        const seenStudents = new Set();
        students = combinedStudents.filter(student => {
          const identifier = student.id || 
                           student.student_id || 
                           student.jee_app_no || 
                           student.jeeAppNo ||
                           student.roll_number || 
                           student.rollNumber ||
                           student.institute_email ||
                           student.instituteEmail ||
                           `${student.name}_${student.dob || student.date_of_birth}`;
          
          if (seenStudents.has(identifier)) {
            return false;
          }
          
          seenStudents.add(identifier);
          return true;
        });

        // Apply specialization filtering for PG programs
        students = filterStudentsBySpecialization(students, batch);
      } else {
        await tryFallbackStudentFetch(batch);
        return;
      }
    } catch (error) {
      await tryFallbackStudentFetch(batch);
      return;
    }
    
    setStudentList(students);
  };

  const tryFallbackStudentFetch = async (batch) => {
    const token = localStorage.getItem("authToken");
    
    try {
      const response = await fetch(
        `${host}/programme_curriculum/api/admin_batches/`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const targetBatch = data.find(b => b.id === batch.id);
        
        if (targetBatch) {
          let students = [];

          if (targetBatch.students) students.push(...targetBatch.students);
          if (targetBatch.upload_students) students.push(...targetBatch.upload_students);
          if (targetBatch.academic_students) students.push(...targetBatch.academic_students);

          const seenStudents = new Set();
          students = students.filter(student => {
            const identifier = student.id || student.student_id || student.jee_app_no || student.name;
            if (seenStudents.has(identifier)) return false;
            seenStudents.add(identifier);
            return true;
          });
          students = filterStudentsBySpecialization(students, batch);
          
          if (students.length > 0) {
            setStudentList(students);
            return;
          }
        }
      }

      setStudentList([]);
      
    } catch (error) {
      setStudentList([]);
    }
  };

  const updateStudentStatus = async (requestData) => {
    try {
      const token = localStorage.getItem("authToken");
      
      const payload = {
        studentId: requestData.studentId,  
        reportedStatus: requestData.newStatus || requestData.reportedStatus, 
        batchId: requestData.batchId || selectedBatch?.id,
        // Pass programmeType so the backend can disambiguate between
        // StudentBatchUpload and PhdStudentBatchUpload when IDs collide.
        programmeType: requestData.programmeType || (selectedBatch ? getCurrentProgrammeType(selectedBatch) : undefined),
      };

      const response = await fetch(
        `${host}/programme_curriculum/api/admin_update_student_status/`,
        {
          method: 'POST',
          headers: { 
            Authorization: `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData };
      }
      
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleReportedStatusChange = async (studentId, newStatus) => {
    setUpdatingReportStatus(studentId);

    try {
      const requestData = {
        studentId: studentId,
        newStatus: newStatus,
        batchId: selectedBatch.id,
      };

      const result = await updateStudentStatus(requestData);

      if (result.success) {
        setStudentList((prev) =>
          prev.map((student) =>
            (student.id === studentId || student.student_id === studentId)
              ? { 
                  ...student, 
                  reportedStatus: newStatus,
                  reported_status: newStatus 
                }
              : student,
          ),
        );

        const updateBatchStudents = (batches) => {
          if (!Array.isArray(batches)) return [];
          return batches.map((batch) => {
            if (batch.id === selectedBatch.id) {
              const currentStudents = batch.students || [];
              return {
                ...batch,
                students: currentStudents.map((student) =>
                  student.id === studentId
                    ? { ...student, reportedStatus: newStatus, reported_status: newStatus }
                    : student,
                ),
              };
            }
            return batch;
          });
        };

        if (activeSection === PROGRAMME_TYPES.UG) {
          setUgBatches((prev) => updateBatchStudents(prev || []));
        } else if (activeSection === PROGRAMME_TYPES.PG) {
          setPgBatches((prev) => updateBatchStudents(prev || []));
        } else if (activeSection === PROGRAMME_TYPES.PHD) {
          setPhdBatches((prev) => updateBatchStudents(prev || []));
        }

        notifications.show({
          title: "Success",
          message: `Student status updated to ${newStatus.replace("_", " ")}`,
          color: "green",
        });

        forceRefreshData();
      } else {
        throw new Error(result.message || "Failed to update student status");
      }
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to update student status. Please try again.",
        color: "red",
      });
    } finally {
      setUpdatingReportStatus(null);
    }
  };

  const handleSelectStudent = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
    
    // Update "select all" state
    const allStudentIds = getFilteredStudents().map(student => student.id || student.student_id);
    setIsAllSelected(allStudentIds.length > 0 && allStudentIds.every(id => newSelected.has(id)));
  };

  const handleStudentSelect = (studentId) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleSelectAll = () => {
    const allStudentIds = getFilteredStudents().map(student => student.id || student.student_id);
    if (isAllSelected) {
      setSelectedStudents(new Set());
      setIsAllSelected(false);
    } else {
      setSelectedStudents(new Set(allStudentIds));
      setIsAllSelected(true);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedStudents.size === 0) {
      notifications.show({
        title: "No Selection",
        message: "Please select at least one student to update.",
        color: "orange",
      });
      return;
    }

    setIsBulkReporting(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      for (const studentId of selectedStudents) {
        const student = getFilteredStudents().find(s => (s.id || s.student_id) === studentId);
        if (student) {
          try {
            const result = await updateStudentStatus({
              studentId: studentId,
              reportedStatus: newStatus,
              batchId: selectedBatch.id,
            });

            if (result.success) {
              successCount++;
              setStudentList(prevList =>
                prevList.map(student =>
                  (student.id || student.student_id) === studentId
                    ? { ...student, reportedStatus: newStatus, reported_status: newStatus }
                    : student
                )
              );

              const updateBatchData = (batchArray) =>
                batchArray.map((batch) => ({
                  ...batch,
                  students: batch.students?.map((student) =>
                    (student.id || student.student_id) === studentId
                      ? { ...student, reportedStatus: newStatus, reported_status: newStatus }
                      : student
                  ),
                }));

              setUgBatches(updateBatchData);
              setPgBatches(updateBatchData);
              setPhdBatches(updateBatchData);
            } else {
              failureCount++;
            }
          } catch (error) {
            failureCount++;
          }
        }
      }

      const statusLabel = newStatus.replace('_', ' ').toLowerCase();
      
      // Show results notification
      if (successCount > 0 && failureCount === 0) {
        notifications.show({
          title: "Bulk Status Update Completed",
          message: `Successfully updated ${successCount} students to ${statusLabel}.`,
          color: "green",
        });

        forceRefreshData();
      } else if (successCount > 0 && failureCount > 0) {
        notifications.show({
          title: "Partial Success",
          message: `Updated ${successCount} students to ${statusLabel} successfully. ${failureCount} failed.`,
          color: "yellow",
        });

        forceRefreshData();
      } else {
        notifications.show({
          title: "Bulk Status Update Failed",
          message: `Failed to update students to ${statusLabel}. Please try again.`,
          color: "red",
        });
      }
      setSelectedStudents(new Set());
      setIsAllSelected(false);

    } catch (error) {
      notifications.show({
        title: "Error",
        message: "An error occurred during bulk status update. Please try again.",
        color: "red",
      });
    } finally {
      setIsBulkReporting(false);
    }
  };

  const handleDeleteStudent = async (student) => {
    const studentName =
      student.Name || student.name || student.student_name || "Unknown";
    const studentId = student.id || student.student_id;

    if (!studentId) {
      notifications.show({
        title: "Error",
        message: "Cannot delete student: No valid ID found",
        color: "red",
      });
      return;
    }

    // Store student data and show confirmation modal
    setStudentToDelete({ id: studentId, name: studentName, programmeType: activeSection });
    setShowDeleteStudentConfirm(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;

    const { id: studentId, name: studentName, programmeType: studentProgrammeType } = studentToDelete;
    setDeletingStudent(studentId);

    try {
      const response = await deleteStudent(studentId, studentProgrammeType);

      if (response.success) {
        setStudentList((prev) => {
          const updated = prev.filter(
            (s) => (s.id || s.student_id) !== studentId,
          );
          return updated;
        });

        const updateBatchStudents = (batches) => {
          if (!Array.isArray(batches)) return [];
          return batches.map((batch) => {
            if (batch.id === selectedBatch.id) {
              const currentCount =
                batch.studentCount || batch.students?.length || 0;
              const currentStudents = batch.students || [];
              const updatedBatch = {
                ...batch,
                students: currentStudents.filter(
                  (s) => (s.id || s.student_id) !== studentId,
                ),
                studentCount: Math.max(0, currentCount - 1),
              };
              return updatedBatch;
            }
            return batch;
          });
        };

        if (activeSection === PROGRAMME_TYPES.UG) {
          setUgBatches((prev) => updateBatchStudents(prev || []));
        } else if (activeSection === PROGRAMME_TYPES.PG) {
          setPgBatches((prev) => updateBatchStudents(prev || []));
        } else if (activeSection === PROGRAMME_TYPES.PHD) {
          setPhdBatches((prev) => updateBatchStudents(prev || []));
        }

        if (selectedBatch) {
          await fetchBatchData();
        }

        setShowStudentModal(false);
        setSelectedBatch(null);

        notifications.show({
          title: "Success",
          message: `Student "${studentName}" deleted successfully`,
          color: "green",
        });

        forceRefreshData();
      } else {
        throw new Error(response.message || "Failed to delete student");
      }
    } catch (error) {

      let errorMessage = "Failed to delete student";
      let errorTitle = "Error";

      if (
        error.message &&
        (error.message.includes("foreign key constraint") ||
          error.message.includes("violates foreign key constraint"))
      ) {
        errorTitle = "Cannot Delete Student";
        errorMessage = `Cannot delete student "${studentName}" because they have associated records in the system. This student may be referenced in other modules (Academic, Examination, etc.) or have associated data that must be removed first.`;
      } else if (error.response?.status === 500) {
        errorTitle = "Server Error (500)";
        const serverMessage =
          error.response?.data?.message || error.response?.data?.error || "";

        if (
          serverMessage.toLowerCase().includes("foreign key") ||
          serverMessage.toLowerCase().includes("constraint")
        ) {
          errorMessage = `Cannot delete student "${studentName}" due to database dependencies. This student may be referenced in other modules like Academic Records, Examination Data, or Course Enrollments.`;
        } else if (serverMessage.toLowerCase().includes("integrity")) {
          errorMessage = `Data integrity error: Student "${studentName}" cannot be deleted because they have dependent records in the system.`;
        } else {
          errorMessage = `Server error occurred while deleting student "${studentName}". ${serverMessage ? `Server says: ${serverMessage}` : "Please try again or contact support."}`;
        }
      } else if (error.response?.status === 403) {
        errorTitle = "Permission Denied";
        errorMessage = `You don't have permission to delete student "${studentName}". Please contact your administrator.`;
      } else if (error.response?.status === 404) {
        errorTitle = "Student Not Found";
        errorMessage = `Student "${studentName}" was not found. They may have already been deleted.`;
      } else if (error.response?.status === 400) {
        errorTitle = "Bad Request";
        errorMessage = `Invalid request to delete student "${studentName}". ${error.response?.data?.message || "Please check the data and try again."}`;
      } else {
        errorMessage = `Failed to delete student "${studentName}": ${error.message || "Unknown error"}`;
      }

      notifications.show({
        title: errorTitle,
        message: errorMessage,
        color: "red",
        autoClose: false, 
      });

      if (selectedBatch) {
      }
    } finally {
      setDeletingStudent(null);
      setShowDeleteStudentConfirm(false);
      setStudentToDelete(null);
    }
  };

  useEffect(() => {
    setSelectedStudents(new Set());
    setIsAllSelected(false);
  }, [selectedBatch]);

  return {
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
    handleSelectStudent,
    handleStudentSelect,
    handleSelectAll,
    handleDeleteStudent,
    confirmDeleteStudent,
  };
}
