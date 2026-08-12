import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { STUDENT_FIELDS_CONFIG } from "../AdminUpcomingBatchesConstants";
import {
  getExportableFields,
  prepareExportData,
  exportToExcel,
  exportToCSV,
} from "../AdminUpcomingBatchesUtils";

// Owns the export-modal state (format/fields) and builds the xlsx/csv export.
// selectedBatch + getFilteredStudents are injected from useStudentList.
export function useExport({ selectedBatch, getFilteredStudents }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState({});
  const [exportFormat, setExportFormat] = useState("excel");
  const [isExporting, setIsExporting] = useState(false);
  const [selectAllFields, setSelectAllFields] = useState(true);

  const initializeSelectedFields = () => {
    const fields = {};
    getExportableFields().forEach((field) => {
      fields[field.key] = !STUDENT_FIELDS_CONFIG[field.key].systemGenerated;
    });
    setSelectedFields(fields);
  };

  const handleSelectAllFields = (checked) => {
    const newSelectedFields = {};
    getExportableFields().forEach((field) => {
      newSelectedFields[field.key] = checked;
    });
    setSelectedFields(newSelectedFields);
    setSelectAllFields(checked);
  };

  const handleToggleAllFields = (event) => {
    const checked = event.currentTarget.checked;
    handleSelectAllFields(checked);
  };

  const handleFieldChange = (fieldKey, checked) => {
    const newSelectedFields = {
      ...selectedFields,
      [fieldKey]: checked,
    };
    setSelectedFields(newSelectedFields);

    const allFields = getExportableFields();
    const allSelected = allFields.every(
      (field) => newSelectedFields[field.key],
    );
    const noneSelected = allFields.every(
      (field) => !newSelectedFields[field.key],
    );

    if (allSelected) {
      setSelectAllFields(true);
    } else if (noneSelected) {
      setSelectAllFields(false);
    } else {
      setSelectAllFields(false);
    }
  };

  const handleStudentExport = async () => {
    const selectedFieldKeys = Object.keys(selectedFields).filter(
      (key) => selectedFields[key],
    );

    if (selectedFieldKeys.length === 0) {
      notifications.show({
        title: "No Fields Selected",
        message: "Please select at least one field to export.",
        color: "orange",
      });
      return;
    }

    setIsExporting(true);

    try {
      const filteredStudents = getFilteredStudents();
      const exportData = prepareExportData(filteredStudents, selectedFieldKeys);

      const filename = `${selectedBatch?.programme || "Students"}_${selectedBatch?.discipline || "Export"}_${new Date().toISOString().split("T")[0]}`;

      switch (exportFormat) {
        case "excel":
          exportToExcel(exportData, filename);
          break;
        case "csv":
          exportToCSV(exportData, filename);
          break;
        default:
          throw new Error("Invalid export format");
      }

      notifications.show({
        title: "Export Successful",
        message: `Data exported successfully as ${exportFormat.toUpperCase()}`,
        color: "green",
      });

      setShowExportModal(false);
    } catch (error) {
      notifications.show({
        title: "Export Failed",
        message: "Failed to export data. Please try again.",
        color: "red",
      });
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (showExportModal && Object.keys(selectedFields).length === 0) {
      initializeSelectedFields();
    }
  }, [showExportModal]);

  return {
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
  };
}
