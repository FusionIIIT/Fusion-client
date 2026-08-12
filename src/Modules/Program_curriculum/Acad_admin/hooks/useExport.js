import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import {
  getExportableFields,
  getCurrentProgrammeType,
  prepareExportData,
  exportToExcel,
  exportToCSV,
  exportStudentImages,
} from "../AdminUpcomingBatchesUtils";
import { host } from "../../../../routes/globalRoutes";

// Owns the export-modal state (format/fields) and builds the xlsx/csv export.
// selectedBatch + getFilteredStudents are injected from useStudentList.
export function useExport({ selectedBatch, getFilteredStudents }) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedFields, setSelectedFields] = useState({});
  const [exportFormat, setExportFormat] = useState("excel");
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingImages, setIsExportingImages] = useState(false);
  const [selectAllFields, setSelectAllFields] = useState(true);

  const handleExportImages = async () => {
    setIsExportingImages(true);
    try {
      const filename = `${selectedBatch?.programme || "Students"}_${
        selectedBatch?.displayBranch || selectedBatch?.discipline || "Batch"
      }_images`.replace(/\s+/g, "_");
      const count = await exportStudentImages(
        getFilteredStudents(),
        filename,
        host,
      );
      if (count === 0) {
        notifications.show({
          title: "No Images",
          message: "No photos or signatures found for these students.",
          color: "orange",
        });
      } else {
        notifications.show({
          title: "Images Exported",
          message: `Downloaded ${count} image(s) as a zip.`,
          color: "green",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Export Failed",
        message: "Failed to export images. Please try again.",
        color: "red",
      });
    } finally {
      setIsExportingImages(false);
    }
  };

  // Offer only the fields relevant to this batch's programme type.
  const exportableFields = getExportableFields(
    getCurrentProgrammeType(selectedBatch),
  );

  const initializeSelectedFields = () => {
    const fields = {};
    exportableFields.forEach((field) => {
      fields[field.key] = true;
    });
    setSelectedFields(fields);
    setSelectAllFields(true);
  };

  const handleSelectAllFields = (checked) => {
    const newSelectedFields = {};
    exportableFields.forEach((field) => {
      newSelectedFields[field.key] = checked;
    });
    setSelectedFields(newSelectedFields);
    setSelectAllFields(checked);
  };

  const handleToggleAllFields = (event) => {
    const { checked } = event.currentTarget;
    handleSelectAllFields(checked);
  };

  const handleFieldChange = (fieldKey, checked) => {
    const newSelectedFields = {
      ...selectedFields,
      [fieldKey]: checked,
    };
    setSelectedFields(newSelectedFields);

    const allFields = exportableFields;
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

  // Re-select every field each time the modal opens (default: all toggles on).
  useEffect(() => {
    if (showExportModal) {
      initializeSelectedFields();
    }
  }, [showExportModal]);

  return {
    showExportModal,
    setShowExportModal,
    exportableFields,
    selectedFields,
    exportFormat,
    setExportFormat,
    isExporting,
    isExportingImages,
    handleExportImages,
    selectAllFields,
    handleToggleAllFields,
    handleFieldChange,
    handleStudentExport,
  };
}
