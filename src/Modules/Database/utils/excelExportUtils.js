import * as XLSX from "xlsx-js-style";
import { showNotification } from "@mantine/notifications";

/**
 * Sanitizes filename to prevent path traversal and special characters
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 */
export const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9_.-]/g, "_");
};

/**
 * Creates Excel workbook with borders, styling, and column widths
 * @param {string[]} headers - Column headers
 * @param {Array[]} rows - Data rows
 * @param {Object} columnWidths - Column width configuration
 * @returns {Object} - XLSX workbook
 */
export const createStyledWorkbook = (headers, rows, columnWidths = []) => {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  // Define border style for all cells
  const border = {
    top: { style: "thin", color: { rgb: "000000" } },
    bottom: { style: "thin", color: { rgb: "000000" } },
    left: { style: "thin", color: { rgb: "000000" } },
    right: { style: "thin", color: { rgb: "000000" } },
  };

  // Add borders and styling to all cells
  const range = XLSX.utils.decode_range(ws["!ref"]);
  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!ws[cellAddress]) ws[cellAddress] = { v: "", t: "s" };

      ws[cellAddress].s = {
        border,
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        ...(row === 0 && {
          fill: { fgColor: { rgb: "D3D3D3" } },
          font: { bold: true },
        }),
      };
    }
  }

  // Set column widths if provided
  if (columnWidths && columnWidths.length > 0) {
    ws["!cols"] = columnWidths;
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  return wb;
};

/**
 * Downloads Excel file with error handling
 * @param {Object} wb - XLSX workbook
 * @param {string} filename - Filename for download
 * @param {Function} onClose - Callback to close modal
 */
export const downloadExcelFile = (wb, filename, onClose = null) => {
  try {
    const sanitized = sanitizeFilename(filename);
    XLSX.writeFile(wb, `${sanitized}.xlsx`);

    showNotification({
      title: "Downloaded",
      message: "Export completed successfully.",
      color: "green",
    });

    if (onClose) onClose();
  } catch (err) {
    console.error("Export error:", err);
    showNotification({
      title: "Export Failed",
      message: err.message || "Failed to export data.",
      color: "red",
    });
  }
};
