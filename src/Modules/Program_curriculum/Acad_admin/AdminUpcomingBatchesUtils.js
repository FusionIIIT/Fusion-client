// Pure helper functions extracted from Admin_Upcoming_Batches.jsx.
// No component state or hooks; safe to import and reuse.

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  PROGRAMME_TYPES,
  STUDENT_FIELDS_CONFIG,
  BRANCH_MAPPINGS,
  STUDENT_TABLE_COLUMNS,
} from "./AdminUpcomingBatchesConstants";

export const batchYearToAcademicYear = (batchYear) => {
  const year = parseInt(batchYear, 10);
  return `${year}-${(year + 1).toString().slice(-2)}`;
};

export const mapCategoryValue = (value) => {
  const categoryMapping = {
    GEN: "General",
    General: "General",
    "Other Backward Class (Non-Creamy Layer)": "OBC-NCL",
    "OBC-NCL": "OBC-NCL",
    "Scheduled Caste": "SC",
    SC: "SC",
    "Scheduled Tribe": "ST",
    ST: "ST",
    "Economically Weaker Section": "GEN-EWS",
    EWS: "GEN-EWS",
    "GEN-EWS": "GEN-EWS",
  };
  return categoryMapping[value] || value;
};
export const mapGenderValue = (value) => {
  if (!value) return value;
  const genderMapping = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
    M: "Male",
    F: "Female",
  };
  return genderMapping[value.toUpperCase()] || value;
};
export const mapPwdValue = (value) => {
  if (!value) return value;
  const pwdMapping = {
    YES: "YES",
    NO: "NO",
    Y: "YES",
    N: "NO",
    TRUE: "YES",
    FALSE: "NO",
    1: "YES",
    0: "NO",
  };
  return pwdMapping[value.toString().toUpperCase()] || value;
};
export const mapAllottedCategoryValue = (value) => {
  if (!value) return value;
  return value;
};
export const mapAllottedGenderValue = (value) => {
  if (!value) return value;
  const allottedGenderMapping = {
    "GENDER-NEUTRAL": "Gender-Neutral",
    GENDER_NEUTRAL: "Gender-Neutral",
    "FEMALE-ONLY": "Female-Only (including Supernumerary)",
    FEMALE_ONLY: "Female-Only (including Supernumerary)",
    "FEMALE-ONLY (INCLUDING SUPERNUMERARY)":
      "Female-Only (including Supernumerary)",
  };
  return allottedGenderMapping[value.toUpperCase()] || value;
};
// Clean up discipline/branch names by removing extra details in parentheses
export const cleanDisciplineName = (disciplineName) => {
  if (!disciplineName || typeof disciplineName !== "string") {
    return disciplineName;
  }
  return disciplineName.replace(/\s*\([^)]*\)/g, "").trim();
};
export const getCurrentBatchYear = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (currentMonth >= 7) {
    return currentYear;
  }
  return currentYear - 1;
};
// Automatically adds new years in July, separate for UG/PG/PHD
export const getBatchYearOptions = (programmeType) => {
  const currentBatchYear = getCurrentBatchYear();
  const options = [];
  const baseStartYear = 2016;
  let startYear;
  let endYear;

  switch (programmeType) {
    case PROGRAMME_TYPES.UG:
      startYear = Math.max(baseStartYear, currentBatchYear - 3);
      endYear = currentBatchYear;
      break;
    case PROGRAMME_TYPES.PG:
      startYear = Math.max(baseStartYear, currentBatchYear - 1);
      endYear = currentBatchYear;
      break;
    case PROGRAMME_TYPES.PHD:
      startYear = Math.max(baseStartYear, currentBatchYear - 5);
      // PhD Even and Odd batches both use batch_year = academic year start.
      // e.g. Jan 2026 intake → batch_year=2025 (academic year 2025-26).
      endYear = currentBatchYear;
      break;
    default:
      startYear = baseStartYear;
      endYear = currentBatchYear;
  }
  for (let year = endYear; year >= startYear; year -= 1) {
    const academicYear = batchYearToAcademicYear(year);
    options.push({
      value: year.toString(),
      label: `${year} (Academic Year: ${academicYear})`,
    });
  }

  return options;
};
export const getViewAcademicYearOptions = () => {
  const currentBatchYear = getCurrentBatchYear();
  const options = [];
  // Show one year ahead so admins can browse upcoming academic years.
  const displayEndYear = currentBatchYear + 1;
  for (let year = displayEndYear; year >= currentBatchYear - 5; year -= 1) {
    const academicYear = batchYearToAcademicYear(year);
    options.push({
      value: year.toString(),
      label: academicYear,
    });
  }

  return options;
};
export const academicYearToBatchYear = (academicYear) => {
  if (typeof academicYear === "number") return academicYear;
  if (typeof academicYear === "string" && academicYear.includes("-")) {
    return parseInt(academicYear.split("-")[0], 10);
  }
  return parseInt(academicYear, 10);
};
export const getCurrentAcademicYearString = () => {
  return batchYearToAcademicYear(getCurrentBatchYear());
};

export const normalizeBranchName = (branchName) => {
  if (!branchName) return null;
  const normalized = branchName.toLowerCase().trim();
  return BRANCH_MAPPINGS[normalized] || [branchName];
};

export const getBatchForBranch = (
  targetBranch,
  batchesToSearch,
  phdSemester = null,
) => {
  if (!targetBranch || !batchesToSearch || batchesToSearch.length === 0)
    return null;

  const targetVariants = normalizeBranchName(targetBranch);

  const matchedBatch = batchesToSearch.find((batch) => {
    const batchBranch = (batch.discipline || batch.branch || "").trim();
    if (!batchBranch) return false;

    const batchVariants = normalizeBranchName(batchBranch);

    const branchMatches = targetVariants.some((target) =>
      batchVariants.some(
        (batchVar) => target.toLowerCase() === batchVar.toLowerCase(),
      ),
    );

    // If PhD and semester is specified, also check batch name
    if (phdSemester && batch.name) {
      const batchName = batch.name.toLowerCase();
      const semesterMatches = batchName.includes(phdSemester.toLowerCase());
      console.log(
        `PhD Batch matching: Branch=${batchBranch}, BatchName=${batch.name}, Semester=${phdSemester}, BranchMatch=${branchMatches}, SemesterMatch=${semesterMatches}`,
      );
      return branchMatches && semesterMatches;
    }

    return branchMatches;
  });

  if (!matchedBatch && phdSemester) {
    console.log(
      `No batch found for: Branch=${targetBranch}, Semester=${phdSemester}. Available batches:`,
      batchesToSearch.map((b) => ({
        name: b.name,
        discipline: b.discipline,
        branch: b.branch,
      })),
    );
  }

  return matchedBatch;
};

export const getCurrentProgrammeType = (batch) => {
  if (!batch) return null;

  const programme = (batch.programme || "").toLowerCase();
  if (programme.includes("b.tech") || programme.includes("b.des")) {
    return "ug";
  }
  if (programme.includes("m.tech") || programme.includes("m.des")) {
    return "pg";
  }
  if (programme.includes("phd") || programme.includes("ph.d")) {
    return "phd";
  }

  // Fallback based on programme_type field
  return batch.programme_type || "ug";
};

export const parseDuplicateError = (error, context = "operation") => {
  let errorMessage = `Failed to ${context}`;
  let errorTitle = "Error";

  if (error.response?.data?.message) {
    const backendMessage = error.response.data.message.toLowerCase();

    if (
      backendMessage.includes("jee_app_no") &&
      backendMessage.includes("already exists")
    ) {
      errorTitle = "Duplicate JEE Application Number";
      errorMessage = context.includes("upload")
        ? "One or more JEE Application Numbers already exist in the database. Please check your Excel file and remove duplicates."
        : "This JEE Application Number already exists in the database. Please check and enter a different number.";
    } else if (
      backendMessage.includes("roll_number") &&
      backendMessage.includes("already exists")
    ) {
      errorTitle = "Duplicate Roll Number";
      errorMessage = context.includes("upload")
        ? "One or more Institute Roll Numbers already exist in the database. Please check your Excel file and remove duplicates."
        : "This Institute Roll Number already exists in the database. Please check and enter a different number.";
    } else if (
      backendMessage.includes("institute_email") &&
      backendMessage.includes("already exists")
    ) {
      errorTitle = "Duplicate Institute Email";
      errorMessage = context.includes("upload")
        ? "One or more Institute Email IDs already exist in the database. Please check your Excel file and remove duplicates."
        : "This Institute Email ID already exists in the database. Please check and enter a different email.";
    } else if (
      backendMessage.includes("duplicate key") ||
      backendMessage.includes("already exists")
    ) {
      errorTitle = "Duplicate Entries";
      errorMessage = context.includes("upload")
        ? "Some entries in your Excel file already exist in the database. Please check for duplicate JEE App Numbers, Roll Numbers, and Institute Emails."
        : "Some information you entered already exists in the database. Please check JEE App No, Roll Number, and Institute Email for duplicates.";
    } else {
      errorMessage = error.response.data.message || errorMessage;
    }
  } else if (error.message) {
    errorMessage = error.message;
  }

  return { title: errorTitle, message: errorMessage };
};

export const getCurrentAcademicYear = () => {
  return getCurrentAcademicYearString();
};

export const getDisplayBranchName = (branchName, branchCode) => {
  const branch = (branchName || branchCode || "").toLowerCase().trim();

  const branchMappings = {
    "computer science and engineering": "CSE",
    cse: "CSE",
    "computer science": "CSE",
    "electronics and communication engineering": "ECE",
    ece: "ECE",
    electronics: "ECE",
    "mechanical engineering": "ME",
    mechanical: "ME",
    me: "ME",
    "smart manufacturing": "SM",
    sm: "SM",
    manufacturing: "SM",
    design: "DES",
    bdes: "DES",
  };

  const matchedBranch = Object.entries(branchMappings).find(([key]) =>
    branch.includes(key),
  );
  if (matchedBranch) {
    const [, displayName] = matchedBranch;
    return displayName;
  }

  return branchName || branchCode || "Unknown";
};

export const categorizeBatchesByProgramme = (allBatches) => {
  const categorized = {
    ug: [],
    pg: [],
    phd: [],
  };

  allBatches.forEach((batch) => {
    const programme = (batch.programme || "").trim();
    const name = (batch.name || "").trim();
    const discipline = (batch.discipline || "").toLowerCase();
    const displayBranch = (batch.displayBranch || "").toLowerCase();

    if (
      programme.startsWith("B.Tech") ||
      programme.startsWith("B.Design") ||
      name.startsWith("B.Tech") ||
      name.startsWith("B.Design") ||
      programme === "B.Tech" ||
      programme === "B.Des"
    ) {
      categorized.ug.push(batch);
    } else if (
      programme.startsWith("M.Tech") ||
      programme.startsWith("M.Des") ||
      name.startsWith("M.Tech") ||
      name.startsWith("M.Des") ||
      programme === "M.Tech" ||
      programme === "M.Des"
    ) {
      categorized.pg.push(batch);
    } else if (
      programme.startsWith("PhD") ||
      programme.startsWith("Phd") ||
      programme.toLowerCase().includes("phd") ||
      name.startsWith("PhD") ||
      name.startsWith("Phd") ||
      programme === "PhD"
    ) {
      categorized.phd.push(batch);
    } else if (
      discipline.includes("phd") ||
      displayBranch.includes("phd") ||
      discipline.includes("doctor") ||
      name.toLowerCase().includes("phd")
    ) {
      categorized.phd.push(batch);
    } else if (
      discipline.includes("m.tech") ||
      discipline.includes("mtech") ||
      discipline.includes("m.des") ||
      discipline.includes("mdes") ||
      displayBranch.includes("mtech") ||
      displayBranch.includes("mdes") ||
      discipline.includes("master") ||
      name.toLowerCase().includes("m.")
    ) {
      categorized.pg.push(batch);
    } else {
      categorized.ug.push(batch);
    }
  });

  return categorized;
};

export const applyCaseConversion = (student) => {
  const convertedStudent = { ...student };
  const emailFields = [
    "email",
    "instituteEmail",
    "personalEmail",
    "personal_email",
    "institute_email",
  ];
  const fieldsToConvert = [
    "name",
    "fname",
    "mname",
    "father_name",
    "mother_name",
    "address",
    "state",
    "fatherOccupation",
    "father_occupation",
    "motherOccupation",
    "mother_occupation",
    "rollNumber",
    "roll_number",
  ];

  Object.keys(convertedStudent).forEach((key) => {
    const value = convertedStudent[key];

    if (typeof value === "string" && value.trim() !== "") {
      if (emailFields.includes(key)) {
        convertedStudent[key] = value.toLowerCase().trim();
      } else if (fieldsToConvert.includes(key)) {
        convertedStudent[key] = value.toUpperCase().trim();
      } else {
        convertedStudent[key] = value.trim();
      }
    }
  });

  return convertedStudent;
};

export const getExportableFields = () => {
  const organizedFieldOrder = [
    // Basic Information
    "jeeAppNo",
    "rollNumber",
    "name",
    "fname",
    "mname",

    // Demographics
    "gender",
    "category",
    "allottedCategory",
    "allottedGender",
    "minority",
    "dob",

    // PWD Information (grouped)
    "pwd",
    "pwdCategory",
    "pwdCategoryRemarks", // Remarks immediately after main field

    // Blood Group Information (grouped)
    "bloodGroup",
    "bloodGroupRemarks", // Remarks immediately after main field

    // Academic Information
    "branch",
    "specialization",
    "jeeRank",
    "categoryRank",

    // Admission Information (grouped)
    "admissionMode",
    "admissionModeRemarks", // Remarks immediately after main field

    // Contact Information
    "phoneNumber",
    "instituteEmail",
    "alternateEmail",
    "parentEmail",

    // Family Information
    "fatherOccupation",
    "fatherMobile",
    "motherOccupation",
    "motherMobile",

    // Financial Information (grouped)
    "incomeGroup",
    "income",

    // Location Information
    "country",
    "nationality",
    "state",
    "address",
    "reportedStatus",
  ];

  // Return fields in the organized order, filtering out non-existent fields
  return organizedFieldOrder
    .filter(
      (key) =>
        STUDENT_FIELDS_CONFIG[key] &&
        !STUDENT_FIELDS_CONFIG[key].systemGenerated,
    )
    .map((key) => ({
      key,
      label: STUDENT_FIELDS_CONFIG[key].label,
      type: STUDENT_FIELDS_CONFIG[key].type,
      systemField: STUDENT_FIELDS_CONFIG[key].systemField,
    }));
};

export const prepareExportData = (students, selectedFieldKeys) => {
  const organizedFieldOrder = [
    "jeeAppNo",
    "rollNumber",
    "name",
    "fname",
    "mname",
    "gender",
    "category",
    "allottedCategory",
    "allottedGender",
    "minority",
    "dob",
    "pwd",
    "pwdCategory",
    "pwdCategoryRemarks", // Grouped with pwdCategory
    "bloodGroup",
    "bloodGroupRemarks", // Grouped with bloodGroup
    "branch",
    "jeeRank",
    "categoryRank",
    "admissionMode",
    "admissionModeRemarks", // Grouped with admissionMode
    "phoneNumber",
    "instituteEmail",
    "alternateEmail",
    "parentEmail",
    "fatherOccupation",
    "fatherMobile",
    "motherOccupation",
    "motherMobile",
    "incomeGroup",
    "income",
    "country",
    "nationality",
    "state",
    "address",
    "reportedStatus",
  ];

  // Sort selected fields according to organized order
  const sortedFieldKeys = [
    ...organizedFieldOrder.filter((field) => selectedFieldKeys.includes(field)),
    ...selectedFieldKeys.filter(
      (field) => !organizedFieldOrder.includes(field),
    ),
  ];

  return students.map((student, index) => {
    const exportRow = {};

    exportRow["S.No"] = index + 1;

    sortedFieldKeys.forEach((fieldKey) => {
      const fieldConfig = STUDENT_FIELDS_CONFIG[fieldKey];
      let value = "";

      if (fieldKey === "fname") {
        value =
          student.fname ||
          student.father_name ||
          student["Father Name"] ||
          student["Father's Name"] ||
          student.fatherName ||
          student["father name"] ||
          student["father's name"] ||
          "";
      } else if (fieldKey === "mname") {
        value =
          student.mname ||
          student.mother_name ||
          student["Mother Name"] ||
          student["Mother's Name"] ||
          student.motherName ||
          student["mother name"] ||
          student["mother's name"] ||
          "";
      } else if (fieldKey === "email") {
        value =
          student.email ||
          student.personal_email ||
          student.personalEmail ||
          student["personal email"] ||
          student["Alternate Email ID"] ||
          student["Alternate email id"] ||
          student["alternate email"] ||
          student["email id"] ||
          "";
      } else if (fieldKey === "dob") {
        value =
          student.dob ||
          student.date_of_birth ||
          student.dateOfBirth ||
          student["Date of Birth"] ||
          student["date of birth"] ||
          student["birth date"] ||
          "";
      } else if (fieldKey === "jeeRank") {
        value =
          student.jeeRank ||
          student.ai_rank ||
          student.aiRank ||
          student["AI Rank"] ||
          student["ai rank"] ||
          student["AI rank"] ||
          student["jee rank"] ||
          student["jee main rank"] ||
          student.rank ||
          "";
      } else if (fieldKey === "rollNumber") {
        value =
          student.rollNumber ||
          student.roll_number ||
          student.rollno ||
          student["Institute Roll Number"] ||
          student["institute roll number"] ||
          student["Roll Number"] ||
          student["roll number"] ||
          "";
      } else if (fieldKey === "instituteEmail") {
        value =
          student.instituteEmail ||
          student.institute_email ||
          student["Institute Email ID"] ||
          student["institute email id"] ||
          student["institute email"] ||
          student["official email"] ||
          "";
      } else if (fieldKey === "reportedStatus") {
        // Handle reported status with proper labels
        const statusValue =
          student.reportedStatus || student.reported_status || "NOT_REPORTED";
        const statusLabels = {
          NOT_REPORTED: "Not Reported",
          REPORTED: "Reported",
          WITHDRAWAL: "Withdrawal",
        };
        value = statusLabels[statusValue] || statusValue;
      } else {
        value = student[fieldKey] || "";

        if (!value && fieldConfig.excelColumns) {
          fieldConfig.excelColumns.some((excelCol) => {
            if (student[excelCol]) {
              value = student[excelCol];
              return true;
            }
            const exactMatch = Object.keys(student).find(
              (key) => key.toLowerCase() === excelCol.toLowerCase(),
            );
            if (exactMatch && student[exactMatch]) {
              value = student[exactMatch];
              return true;
            }
            return false;
          });
        }

        if (!value) {
          const variations = [
            fieldKey.toLowerCase(),
            fieldKey.replace(/([A-Z])/g, "_$1").toLowerCase(),
            fieldKey.replace(/([A-Z])/g, " $1").toLowerCase(),
            fieldConfig.label?.toLowerCase(),
          ];

          variations.some((variation) => {
            const exactMatch = Object.keys(student).find(
              (key) => key.toLowerCase() === variation,
            );
            if (exactMatch && student[exactMatch]) {
              value = student[exactMatch];
              return true;
            }
            return false;
          });
        }
      }

      if (typeof value === "string" && value.trim() !== "") {
        const emailFields = ["email", "instituteEmail", "personalEmail"];
        if (emailFields.includes(fieldKey)) {
          value = value.toLowerCase();
        } else if (
          [
            "name",
            "fname",
            "mname",
            "address",
            "state",
            "fatherOccupation",
            "motherOccupation",
            "rollNumber",
          ].includes(fieldKey)
        ) {
          value = value.toUpperCase();
        }
      }

      exportRow[fieldConfig.label] = value || "";
    });

    return exportRow;
  });
};

export const exportToExcel = (data, filename) => {
  const wb = XLSX.utils.book_new();

  if (data.length > 0) {
    const firstRow = data[0];
    const orderedKeys = [];

    if (firstRow["S.No"] !== undefined) {
      orderedKeys.push("S.No");
    }

    const priorityLabels = [
      "Institute Roll Number",
      "JEE App. No.",
      "Full Name",
      "Institute Email ID",
    ];
    priorityLabels.forEach((label) => {
      if (firstRow[label] !== undefined && !orderedKeys.includes(label)) {
        orderedKeys.push(label);
      }
    });

    Object.keys(firstRow).forEach((key) => {
      if (!orderedKeys.includes(key)) {
        orderedKeys.push(key);
      }
    });

    const orderedData = data.map((row) => {
      const orderedRow = {};
      orderedKeys.forEach((key) => {
        orderedRow[key] = row[key] || "";
      });
      return orderedRow;
    });

    const ws = XLSX.utils.json_to_sheet(orderedData, { header: orderedKeys });

    const colWidths = orderedKeys.map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Students");
  } else {
    const ws = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, ws, "Students");
  }

  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToCSV = (data, filename) => {
  if (data.length === 0) {
    const blob = new Blob(["No data to export"], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, `${filename}.csv`);
    return;
  }

  const firstRow = data[0];
  const orderedKeys = [];

  if (firstRow["S.No"] !== undefined) {
    orderedKeys.push("S.No");
  }

  const priorityLabels = [
    "Institute Roll Number",
    "JEE App. No.",
    "Full Name",
    "Institute Email ID",
  ];
  priorityLabels.forEach((label) => {
    if (firstRow[label] !== undefined && !orderedKeys.includes(label)) {
      orderedKeys.push(label);
    }
  });

  Object.keys(firstRow).forEach((key) => {
    if (!orderedKeys.includes(key)) {
      orderedKeys.push(key);
    }
  });

  const csvContent = [
    orderedKeys.join(","),
    ...data.map((row) =>
      orderedKeys
        .map((header) => {
          const value = row[header] || "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, `${filename}.csv`);
};

export const getStudentFieldValue = (student, column) => {
  const fieldName = column.fields.find(
    (name) =>
      Object.prototype.hasOwnProperty.call(student, name) &&
      student[name] !== undefined &&
      student[name] !== null &&
      student[name] !== "",
  );

  if (fieldName === undefined) return "-";

  let value = student[fieldName];

  // Clean discipline names
  if (column.key === "branch") {
    value = cleanDisciplineName(value);
  }

  // Format dates
  if (column.key === "dob" && typeof value === "string") {
    const [datePart] = value.split(" ");
    [value] = datePart.split("T");
  }

  return String(value).trim();
};

export const getVisibleColumns = (programmeType) => {
  // Fields to hide for PhD students
  const phdHiddenFields = [
    "jeeAppNo",
    "specialization",
    "allottedCategory",
    "allottedGender",
    "jeeRank",
    "categoryRank",
  ];

  // Fields to hide for PG students (JEE doesn't apply — PG admission is GATE-based)
  const pgHiddenFields = ["jeeAppNo"];

  // Fields to hide for UG students (GATE/Specialization/Admission Type are PG-only)
  const ugHiddenFields = [
    "applicationNo",
    "specialization",
    "admissionType",
    "gateQualified",
    "gateStream",
    "gateRank",
  ];

  if (programmeType === "phd") {
    return STUDENT_TABLE_COLUMNS.filter(
      (column) => !phdHiddenFields.includes(column.key),
    );
  }
  if (programmeType === "pg") {
    return STUDENT_TABLE_COLUMNS.filter(
      (column) => !pgHiddenFields.includes(column.key),
    );
  }
  if (programmeType === "ug") {
    return STUDENT_TABLE_COLUMNS.filter(
      (column) => !ugHiddenFields.includes(column.key),
    );
  }

  return STUDENT_TABLE_COLUMNS;
};

export const getUploadDisciplines = (students) => {
  const disciplines = new Set();

  (students || []).forEach((student) => {
    const discipline = (
      student.Discipline ||
      student.discipline ||
      student.branch ||
      student.Branch ||
      ""
    )
      .toString()
      .trim();

    if (discipline) {
      disciplines.add(discipline);
    }
  });

  return Array.from(disciplines);
};

export const getDisciplineOptions = (programme) => {
  if (programme === "B.Tech") {
    return [
      {
        value: "Computer Science and Engineering",
        label: "Computer Science and Engineering",
      },
      {
        value: "Electronics and Communication Engineering",
        label: "Electronics and Communication Engineering",
      },
      { value: "Mechanical Engineering", label: "Mechanical Engineering" },
      { value: "Smart Manufacturing", label: "Smart Manufacturing" },
    ];
  }
  if (programme && programme.startsWith("M.Tech")) {
    if (programme.includes("AI & ML")) {
      return [
        {
          value: "Computer Science and Engineering",
          label: "Computer Science and Engineering",
        },
      ];
    }
    if (programme.includes("Data Science")) {
      return [
        {
          value: "Computer Science and Engineering",
          label: "Computer Science and Engineering",
        },
      ];
    }
    if (programme.includes("Communication and Signal Processing")) {
      return [
        {
          value: "Electronics and Communication Engineering",
          label: "Electronics and Communication Engineering",
        },
      ];
    }
    if (programme.includes("Nanoelectronics and VLSI Design")) {
      return [
        {
          value: "Electronics and Communication Engineering",
          label: "Electronics and Communication Engineering",
        },
      ];
    }
    if (programme.includes("Power & Control")) {
      return [
        {
          value: "Electronics and Communication Engineering",
          label: "Electronics and Communication Engineering",
        },
      ];
    }
    if (programme.includes("Design")) {
      return [{ value: "Design", label: "Design" }];
    }
    if (programme.includes("CAD/CAM")) {
      return [
        { value: "Mechanical Engineering", label: "Mechanical Engineering" },
      ];
    }
    if (programme.includes("Manufacturing and Automation")) {
      return [
        { value: "Mechanical Engineering", label: "Mechanical Engineering" },
      ];
    }
    return [
      {
        value: "Computer Science and Engineering",
        label: "Computer Science and Engineering",
      },
      {
        value: "Electronics and Communication Engineering",
        label: "Electronics and Communication Engineering",
      },
      { value: "Mechanical Engineering", label: "Mechanical Engineering" },
      { value: "Smart Manufacturing", label: "Smart Manufacturing" },
    ];
  }
  if (programme === "B.Des" || programme === "M.Des") {
    return [{ value: "Design", label: "Design" }];
  }
  if (programme === "PhD") {
    return [
      {
        value: "Computer Science and Engineering",
        label: "Computer Science and Engineering",
      },
      {
        value: "Electronics and Communication Engineering",
        label: "Electronics and Communication Engineering",
      },
      { value: "Mechanical Engineering", label: "Mechanical Engineering" },
      { value: "Smart Manufacturing", label: "Smart Manufacturing" },
      { value: "Design", label: "Design" },
    ];
  }
  return [];
};

export const extractSpecializationFromBatchName = (batchName) => {
  if (!batchName) return null;

  if (
    batchName.includes("M.Des") ||
    batchName.includes("B.Des") ||
    batchName === "M.Des" ||
    batchName === "B.Des"
  ) {
    return null;
  }

  if (batchName.includes("M.Tech")) {
    if (batchName.includes("AI & ML")) {
      return "AI & ML";
    }
    if (batchName.includes("Data Science")) {
      return "Data Science";
    }
    if (batchName.includes("Communication and Signal Processing")) {
      return "Communication and Signal Processing";
    }
    if (batchName.includes("Nanoelectronics and VLSI Design")) {
      return "Nanoelectronics and VLSI Design";
    }
    if (batchName.includes("Power & Control")) {
      return "Power & Control";
    }
    if (batchName.includes("Design")) {
      return "Design";
    }
    if (batchName.includes("CAD/CAM")) {
      return "CAD/CAM";
    }
    if (batchName.includes("Manufacturing and Automation")) {
      return "Manufacturing and Automation";
    }
    if (batchName.includes("Mechatronics")) {
      return "Mechatronics";
    }

    if (batchName.trim() === "M.Tech") {
      return null;
    }
  }

  return null;
};

export const filterStudentsBySpecialization = (students, batch) => {
  const batchName = batch.name || batch.programme || "";
  const expectedSpecialization = extractSpecializationFromBatchName(batchName);

  if (
    batchName.includes("M.Des") ||
    batchName.includes("B.Des") ||
    batchName === "M.Des" ||
    batchName === "B.Des"
  ) {
    return students;
  }

  if (!expectedSpecialization) {
    return students;
  }

  const filteredStudents = students.filter((student) => {
    const studentSpecialization =
      student.specialization || student.specialisation || "";
    const studentDiscipline = student.discipline || "";
    const studentBranch = student.branch || "";

    // Try multiple field matches
    let matches = false;
    if (studentSpecialization && studentSpecialization.trim() !== "") {
      matches =
        studentSpecialization === expectedSpecialization ||
        studentSpecialization.includes(expectedSpecialization) ||
        expectedSpecialization.includes(studentSpecialization);
    } else if (studentDiscipline && studentDiscipline.trim() !== "") {
      matches =
        studentDiscipline === expectedSpecialization ||
        studentDiscipline.includes(expectedSpecialization) ||
        expectedSpecialization.includes(studentDiscipline);
    } else if (studentBranch && studentBranch.trim() !== "") {
      matches =
        studentBranch === expectedSpecialization ||
        studentBranch.includes(expectedSpecialization) ||
        expectedSpecialization.includes(studentBranch);
    }

    return matches;
  });

  return filteredStudents;
};

export const getStatusProperties = (status) => {
  switch (status) {
    case "REPORTED":
      return {
        color: "green",
        variant: "filled",
        icon: "✓",
        label: "Reported",
      };
    case "WITHDRAWAL":
      return {
        color: "red",
        variant: "filled",
        icon: "⚠",
        label: "Withdrawal",
      };
    case "NOT_REPORTED":
    default:
      return {
        color: "orange",
        variant: "outline",
        icon: "○",
        label: "Not Reported",
      };
  }
};

export const normalizeBatchData = (batchData) => {
  return batchData.map((batch) => {
    const totalSeats = batch.totalSeats || batch.total_seats || 0;
    const filledSeats =
      batch.filledSeats || batch.filled_seats || batch.student_count || 0;
    const availableSeats = Math.max(0, totalSeats - filledSeats);

    return {
      ...batch,
      year: academicYearToBatchYear(batch.year),
      totalSeats,
      filledSeats,
      availableSeats,
      name: batch.name || batch.programme || "Unknown",
    };
  });
};
