import { useState, useEffect } from "react";
import { notifications } from "@mantine/notifications";
import { Text } from "@mantine/core";
import * as XLSX from "xlsx";
import { host } from "../../../../routes/globalRoutes";
import { INITIAL_FORM_DATA, STUDENT_FIELDS_CONFIG } from "../AdminUpcomingBatchesConstants";
import { applyUniversalValidation, validatePhoneNumbers } from "../AdminUpcomingBatchesValidation";
import { processExcelUpload, saveStudentsBatch, addSingleStudent, updateStudent } from "../../api/api";
import {
  batchYearToAcademicYear, getBatchForBranch, getCurrentBatchYear, getUploadDisciplines,
  getViewAcademicYearOptions, mapAllottedCategoryValue, mapAllottedGenderValue, mapCategoryValue,
  mapGenderValue, mapPwdValue, parseDuplicateError, applyCaseConversion, cleanDisciplineName,
  extractSpecializationFromBatchName,
} from "../AdminUpcomingBatchesUtils";

// Owns the entire Add-Students modal: shell + excel-upload + manual-entry state
// and all their handlers. External filter/batch/student-list deps are injected.
export function useAddStudents({
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
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState([]);
  const [processedBatchData, setProcessedBatchData] = useState(null);
  const [allocationSummary, setAllocationSummary] = useState(null);
  const [showBatchPreview, setShowBatchPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [manualFormData, setManualFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState({});

  const showWorkflowGuidance = (errorType, details = {}) => {
    switch (errorType) {
      case 'curriculum_required':
        notifications.show({
          title: " Setup Required: Step 1 of 3",
          message: (
            <div>
              <Text size="sm" mb={8}>
                <strong>Create a curriculum first:</strong>
              </Text>
              <Text size="xs" color="gray.7">
                1. Go to Programme Curriculum → Admin Curriculum<br/>
                2. Click "Add Curriculum" to create a new curriculum<br/>
                3. Set status to "Working" when ready<br/>
                4. Then come back to create batches
              </Text>
            </div>
          ),
          color: "blue",
          autoClose: 12000,
          style: {
            backgroundColor: '#e3f2fd',
            borderColor: '#90caf9',
            color: '#1565c0',
          },
        });
        break;
        
      case 'batches_required':
        notifications.show({
          title: "🎯 Setup Required: Step 2 of 3", 
          message: (
            <div>
              <Text size="sm" mb={8}>
                <strong>Create batches for {details.academicYear || 'current year'}:</strong>
              </Text>
              <Text size="xs" color="gray.7">
                1. Curriculum ✅ (completed)<br/>
                2. Create batches and assign curriculum to each<br/>
                3. Then upload student data
              </Text>
            </div>
          ),
          color: "blue",
          autoClose: 10000,
          style: {
            backgroundColor: '#e3f2fd',
            borderColor: '#90caf9',
            color: '#1565c0',
          },
        });
        break;
        
      case 'curriculum_assignment_required':
        notifications.show({
          title: "🎯 Setup Required: Step 2b of 3",
          message: (
            <div>
              <Text size="sm" mb={8}>
                <strong>Assign curriculum to batches:</strong>
              </Text>
              <Text size="xs" color="gray.7">
                1. Curriculum ✅ (completed)<br/>
                2. Batches ✅ (completed)<br/>
                3. Assign curriculum to: {details.batchNames}<br/>
                4. Then upload student data
              </Text>
            </div>
          ),
          color: "orange",
          autoClose: 12000,
          style: {
            backgroundColor: '#fff3cd',
            borderColor: '#ffeaa7',
            color: '#856404',
          },
        });
        break;
        
      case 'ready_for_students':
        notifications.show({
          title: "🎉 Ready for Step 3!",
          message: (
            <div>
              <Text size="sm" mb={8}>
                <strong>All prerequisites completed:</strong>
              </Text>
              <Text size="xs" color="gray.7">
                1. Curriculum ✅<br/>
                2. Batches ✅<br/>
                3. Curriculum Assignment ✅<br/>
                You can now upload student data!
              </Text>
            </div>
          ),
          color: "green",
          autoClose: 8000,
          style: {
            backgroundColor: '#d4edda',
            borderColor: '#c3e6cb',
            color: '#155724',
          },
        });
        break;
    }
  };

  const validateRequiredFields = (formData, isEditMode = false) => {
    let errors = {};

    const dropdownFields = [
      "gender",
      "category",
      "allottedGender",
      "allottedCategory",
      "pwd",
      "branch",
      "bloodGroup",
      "admissionMode",
      "pwdCategory",
      "incomeGroup",
      "categoryRank",
    ];

    Object.keys(STUDENT_FIELDS_CONFIG).forEach((fieldKey) => {
      const fieldConfig = STUDENT_FIELDS_CONFIG[fieldKey];

      if (isEditMode && dropdownFields.includes(fieldKey)) {
        return;
      }
      
      // Skip validation for fields that don't apply to current programme type
      if (fieldConfig.showForProgrammes) {
        const currentProgramType = activeSection.toUpperCase();
        if (!fieldConfig.showForProgrammes.includes(currentProgramType)) {
          return;
        }
      }

      if (fieldConfig.required) {
        const value = formData[fieldKey];
        const isEmpty = value === undefined || 
                       value === null || 
                       value === "" ||
                       (typeof value === 'string' && value.trim() === "");
        
        if (isEmpty) {
          console.log(`Field ${fieldKey} (${fieldConfig.label}) is missing or empty. Value:`, value);
          errors[fieldKey] = `${fieldConfig.label} is required`;
        }
      }
    });

    const universalErrors = applyUniversalValidation(formData, isEditMode);
    errors = { ...errors, ...universalErrors };

    return errors;
  };

  const validateCurrentStep = (formData, step, isEditMode = false) => {
    const errors = {};
    let fieldsToValidate = [];

    const dropdownFields = [
      "gender",
      "category",
      "allottedGender",
      "allottedCategory",
      "pwd",
      "branch",
      "categoryRank",
    ];

    switch (step) {
      case 0: 
        fieldsToValidate = ["name", "fname", "mname", "gender", "category"];
        break;
      case 1:
        fieldsToValidate = ["pwd", "jeeAppNo", "address"];
        break;
      case 2: 
        fieldsToValidate = ["branch"];
        break;
      default:
        return errors;
    }

    if (isEditMode) {
      fieldsToValidate = fieldsToValidate.filter(
        (field) => !dropdownFields.includes(field),
      );
    }

    fieldsToValidate.forEach((fieldKey) => {
      const fieldConfig = STUDENT_FIELDS_CONFIG[fieldKey];
      if (!fieldConfig) return;

      // Skip fields not applicable to the current programme type
      if (fieldConfig.showForProgrammes) {
        const currentProgramType = activeSection.toUpperCase();
        if (!fieldConfig.showForProgrammes.includes(currentProgramType)) return;
      }

      if (
        fieldConfig.required &&
        (!formData[fieldKey] || formData[fieldKey].trim() === "")
      ) {
        errors[fieldKey] = `${fieldConfig.label} is required`;
      }
    });

    return errors;
  };

  useEffect(() => {
    if (editingStudent && showAddModal && addMode === "manual") {
      const isFormEmpty = !manualFormData.name && !manualFormData.fname && !manualFormData.category;
      
      if (isFormEmpty) {
        const studentData = {};
        Object.keys(STUDENT_FIELDS_CONFIG).forEach((fieldKey) => {
        const fieldConfig = STUDENT_FIELDS_CONFIG[fieldKey];
        let value = "";

        if (
          editingStudent[fieldKey] !== undefined &&
          editingStudent[fieldKey] !== null &&
          editingStudent[fieldKey] !== ""
        ) {
          value = editingStudent[fieldKey];
          
          if (fieldKey === "category") {
            value = mapCategoryValue(value);
          } else if (fieldKey === "gender") {
            value = mapGenderValue(value);
          } else if (fieldKey === "pwd") {
            value = mapPwdValue(value);
          } else if (fieldKey === "allottedCategory") {
            value = mapAllottedCategoryValue(value);
          } else if (fieldKey === "allottedGender") {
            value = mapAllottedGenderValue(value);
          }
        }
        else if (fieldConfig.backendField && editingStudent[fieldConfig.backendField] !== undefined &&
          editingStudent[fieldConfig.backendField] !== null &&
          editingStudent[fieldConfig.backendField] !== "") {
          value = editingStudent[fieldConfig.backendField];

          if (fieldKey === "category") {
            value = mapCategoryValue(value);
          } else if (fieldKey === "gender") {
            value = mapGenderValue(value);
          } else if (fieldKey === "pwd") {
            value = mapPwdValue(value);
          } else if (fieldKey === "allottedCategory") {
            value = mapAllottedCategoryValue(value);
          } else if (fieldKey === "allottedGender") {
            value = mapAllottedGenderValue(value);
          }
        }
        else if (fieldConfig.excelColumns) {
          for (const excelCol of fieldConfig.excelColumns) {
            const colValue = editingStudent[excelCol];
            if (
              colValue !== undefined &&
              colValue !== null &&
              colValue !== ""
            ) {
              value = colValue;
              if (fieldKey === "category") {
                value = mapCategoryValue(value);
              } else if (fieldKey === "gender") {
                value = mapGenderValue(value);
              } else if (fieldKey === "pwd") {
                value = mapPwdValue(value);
              } else if (fieldKey === "allottedCategory") {
                value = mapAllottedCategoryValue(value);
              } else if (fieldKey === "allottedGender") {
                value = mapAllottedGenderValue(value);
              }
              break;
            }
          }
        }

        if (!value) {
          const specialMappings = {
            fname: [
              "father_name",
              "fatherName",
              "father",
              "Father Name",
              "Father's Name",
            ],
            mname: [
              "mother_name",
              "motherName",
              "mother",
              "Mother Name",
              "Mother's Name",
            ],
            name: ["Name", "student_name", "full_name", "fullName"],
            email: [
              "personal_email",
              "personalEmail",
              "Alternate_email_id",
              "Alternate Email ID",
            ],
            phoneNumber: [
              "phone_number",
              "phoneNumber",
              "mobile",
              "Mobile",
              "contact",
            ],
            dob: ["date_of_birth", "dateOfBirth", "Date of Birth", "DOB"],
            jeeRank: ["ai_rank", "aiRank", "AI rank", "AI Rank"],
            jeeAppNo: [
              "jee_app_no",
              "jeeAppNo",
              "application_no",
              "Application No",
              "JEE App. No. / CCMT Roll No.",
            ],
            address: ["Address", "permanent_address", "permanentAddress"],
            state: ["State", "home_state", "homeState"],
            gender: ["Gender"],
            category: ["Category"],
            allottedCategory: ["allottedcat", "allotted_category", "Allotted Cat"],
            allottedGender: ["allotted_gender", "Allotted Gender"],
            pwd: ["PWD"],
            branch: ["Branch", "discipline", "Discipline"],
            pwdCategoryRemarks: [
              "pwd_category_remarks", 
              "pwdCategoryRemarks", 
              "pwd category remarks"
            ],
            bloodGroupRemarks: [
              "blood_group_remarks", 
              "bloodGroupRemarks", 
              "blood group remarks"
            ],
            admissionModeRemarks: [
              "admission_mode_remarks", 
              "admissionModeRemarks", 
              "admission mode remarks"
            ],
            categoryRank: ["category_rank", "categoryRank", "cat rank"],
            rollNumber: ["roll_number", "rollNumber", "institute_roll_number"],
            instituteEmail: ["institute_email", "instituteEmail", "official_email"],
            alternateEmail: ["personal_email", "alternate_email", "alternateEmail"],
            parentEmail: ["parent_email", "parentEmail", "guardian_email"],
            fatherOccupation: ["father_occupation", "fatherOccupation"],
            fatherMobile: ["father_mobile", "fatherMobile", "father_phone"],
            motherOccupation: ["mother_occupation", "motherOccupation"],
            motherMobile: ["mother_mobile", "motherMobile", "mother_phone"],
            bloodGroup: ["blood_group", "bloodGroup"],
            country: ["Country", "nation"],
            nationality: ["Nationality", "citizenship"],
            admissionMode: ["admission_mode", "admissionMode"],
            pwdCategory: ["pwd_category", "pwdCategory", "disability_category"],
            incomeGroup: ["income_group", "incomeGroup"],
            income: ["Income", "annual_income", "family_income"],
            minority: ["Minority", "minority_status", "religious_minority"],
          };

          const variations = specialMappings[fieldKey] || [];

          for (const variation of variations) {
            if (
              editingStudent[variation] !== undefined &&
              editingStudent[variation] !== null &&
              editingStudent[variation] !== ""
            ) {
              value = editingStudent[variation];

              if (fieldKey === "category") {
                value = mapCategoryValue(value);
              }
              break;
            }
          }
        }

        studentData[fieldKey] = value || "";
      });

      setManualFormData(studentData);
      }
    }
  }, [editingStudent, showAddModal, addMode]);

  const jeeAppKeys = [
    'jee_app_no',
    'jee_app_number',
    'application_number', 
    'app_no',
    'JEE App. No / CCMT Roll No',
    'JEE App. No./CCMT Roll. No.',
    'JEE App. No. / CCMT Roll No.',
    'JEE App No / CCMT Roll No',
    'Jee Main Application Number'
  ];

  const specializationKeys = [
    'Specialization',
    'specialization',
    'Specialisation',
    'specialisation',
    'Stream',
    'stream'
  ];

  const handleFileUpload = async (file) => {
    setUploadedFile(file);
    if (file) {
      setIsProcessing(true);
      setUploadProgress(10);

      try {
        setUploadProgress(30);


        const response = await processExcelUpload(file, activeSection);

        setUploadProgress(80);

        if (response.success) {
          const validStudents = response.valid_students || [];
          const invalidStudents = response.invalid_students || [];

          const transformStudentData = (student) => {
            const transformed = { ...student };
            
            for (const key of jeeAppKeys) {
              if (transformed[key] && !transformed.jeeAppNo) {
                transformed.jeeAppNo = transformed[key];
                break;
              }
            }
            
            for (const key of specializationKeys) {
              if (transformed[key] && !transformed.specialization) {
                transformed.specialization = transformed[key];
                break;
              }
            }
            
            return transformed;
          };

          const transformedValidStudents = validStudents.map(transformStudentData);
          const transformedInvalidStudents = invalidStudents.map(item => ({
            ...transformStudentData(item.data || item),
            _validation_error: item.error, 
            _row_number: item.row,
          }));
          
          setUploadProgress(100);

          notifications.show({
            title: "Success",
            message: `Excel file processed successfully! ${response.valid_records} valid records found.`,
            color: "green",
          });

          const allStudents = [...transformedValidStudents, ...transformedInvalidStudents];

          setExtractedData(allStudents);
          setShowPreview(true);
        } else {
          throw new Error(response.message || "Failed to process Excel file");
        }
      } catch (error) {
        setUploadProgress(0);

        const errorData = error.response?.data;
        const errorMessage = errorData?.message || errorData?.error || error.message;

        if (errorMessage?.includes("No working curriculums found")) {
          showWorkflowGuidance('curriculum_required');
        } else if (errorMessage?.includes("No active batches found")) {
          showWorkflowGuidance('batches_required', { 
            academicYear: getViewAcademicYearOptions()[0]?.label || 'current year'
          });
        } else if (errorMessage?.includes("have no curriculum assigned")) {
          const batchMatch = errorMessage.match(/assigned: (.+?)\./);
          const batchNames = batchMatch ? batchMatch[1] : "some batches";
          
          showWorkflowGuidance('curriculum_assignment_required', { batchNames });
        } else if (errorMessage?.includes("validation") || errorMessage?.includes("prerequisite")) {
          notifications.show({
            title: "📋 Validation Error",
            message: errorMessage,
            color: "red",
            autoClose: 8000,
            style: {
              backgroundColor: '#f8d7da',
              borderColor: '#f5c6cb',
              color: '#721c24',
            },
          });
        } else {
          notifications.show({
            title: " Upload Error",
            message: errorMessage || "Failed to process Excel file. Please check the format and try again.",
            color: "red",
            autoClose: 6000,
            style: {
              backgroundColor: '#f8d7da',
              borderColor: '#f5c6cb',
              color: '#721c24',
            },
          });
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const transformDataForDatabase = (studentList) => {
    return studentList.map((student) => {
      const transformedStudent = {};

      Object.keys(STUDENT_FIELDS_CONFIG).forEach((fieldKey) => {
        const fieldInfo = STUDENT_FIELDS_CONFIG[fieldKey];

        let fieldValue = student[fieldKey];

        if (!fieldValue && fieldInfo.backendField) {
          fieldValue = student[fieldInfo.backendField];
        }

        if (!fieldValue && fieldInfo.excelColumns) {
          for (const excelCol of fieldInfo.excelColumns) {
            if (student[excelCol]) {
              fieldValue = student[excelCol];
              break;
            }
            const exactMatch = Object.keys(student).find(
              (key) => key.toLowerCase() === excelCol.toLowerCase(),
            );
            if (exactMatch && student[exactMatch]) {
              fieldValue = student[exactMatch];
              break;
            }
          }
        }

        if (!fieldValue) {
          const variations = [
            fieldKey.toLowerCase(),
            fieldKey.replace(/([A-Z])/g, "_$1").toLowerCase(),
            fieldKey.replace(/([A-Z])/g, " $1").toLowerCase(),
            fieldInfo.label?.toLowerCase(),
          ];

          for (const variation of variations) {
            if (student[variation]) {
              fieldValue = student[variation];
              break;
            }
          }
        }

        // Extract specialization from batch name if not found in student data
        if (fieldKey === "specialization" && (!fieldValue || fieldValue === "")) {
          const studentBranch = student.branch || student.discipline || student.Discipline || "";
          const studentYear = student.year || student.Year || "";

          if (studentBranch && (studentBranch.includes("M.Tech") || studentBranch.includes("M.Des"))) {
            const extractedSpec = extractSpecializationFromBatchName(`${studentBranch} ${studentYear}`);
            if (extractedSpec) {
              fieldValue = extractedSpec;
            } else {
              if (studentBranch.includes("Design") || studentBranch === "Design") {
                fieldValue = "Design";
              } else if (studentBranch.includes("Mechatronics") || studentBranch === "Mechatronics") {
                fieldValue = "Mechatronics";
              }
            }
          } else if (studentBranch && !studentBranch.includes("B.Tech") && !studentBranch.includes("B.Des")) {
            if (studentBranch.includes("Design") || studentBranch === "Design") {
              fieldValue = "Design";
            } else if (studentBranch.includes("Mechatronics") || studentBranch === "Mechatronics") {
              fieldValue = "Mechatronics";
            }
          }
        }

        if (fieldKey === "dob" && fieldValue) {
          fieldValue = typeof fieldValue === 'string' ? fieldValue.split(' ')[0].split('T')[0] : fieldValue;
        }

        // Clean up branch/discipline names by removing extra details in parentheses
        if (fieldKey === "branch" && fieldValue) {
          fieldValue = cleanDisciplineName(fieldValue);
        }

        transformedStudent[fieldKey] = fieldValue || "";
        
        // Also set backend field if configured
        if (fieldInfo.backendField && fieldValue) {
          transformedStudent[fieldInfo.backendField] = fieldValue;
        }
      });

      Object.assign(
        transformedStudent,
        applyCaseConversion(transformedStudent),
      );

      // Handle additional backend field mappings (only for fields not already configured in STUDENT_FIELDS_CONFIG)
      // Most fields are now handled automatically via fieldInfo.backendField in the main loop above

      transformedStudent.id = student.id;
      transformedStudent._validation_error = student._validation_error;

      return transformedStudent;
    });
  };

  const validateBatchPrerequisites = async (academicYear, disciplines = []) => {
    try {
      const response = await fetch(`${host}/programme_curriculum/api/batches/validate_prerequisites/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ academic_year: academicYear, disciplines })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return validateBatchPrerequisitesFrontend(academicYear);
      }
      
      const data = await response.json();
      
      if (!data.can_upload_students) {
        const errorMessages = data.missing_batches.slice(0, 5).map(batch => 
          `• ${batch.acronym} - ${batch.discipline}: ${batch.action_required}`
        ).join('\n');
        
        const additionalErrors = data.missing_batches.length > 5 ? 
          `\n... and ${data.missing_batches.length - 5} more missing batches` : '';
        
        notifications.show({
          title: "Batches Required",
          message: (
            <div>
              <Text size="sm" mb={8}>
                <strong>Please create required batches first:</strong>
              </Text>
              <Text size="xs" style={{ whiteSpace: 'pre-line', color: '#721c24' }}>
                {errorMessages}{additionalErrors}
              </Text>
            </div>
          ),
          color: "red",
          autoClose: false,
        });
        return false;
      }
      
      return true;
    } catch (error) {
      if (error.message.includes('Unexpected token') || error.message.includes('<!doctype')) {
        return validateBatchPrerequisitesFrontend(academicYear, disciplines);
      }
      
      return true; 
    }
  };

  const validateBatchPrerequisitesFrontend = (academicYear, disciplines = []) => {
    const currentBatches = getCurrentBatches();
    
    if (!currentBatches || currentBatches.length === 0) {
      notifications.show({
        title: "No Batches Found",
        message: "Please create batches first before uploading students.",
        color: "red",
        autoClose: false,
      });
      return false;
    }

    // Use the passed academicYear (e.g. 2025 for PhD Even Jan-2026 intake, same as
    // for PhD Odd Aug-2025, both map to academic year 2025-26) to avoid defaulting
    // to getCurrentBatchYear() which returns currentYear-1 in Jan-June.
    const yearToCheck = academicYear || getCurrentBatchYear();
    const batchesForYear = currentBatches.filter(batch => batch.year === yearToCheck);
    
    if (batchesForYear.length === 0) {
      notifications.show({
        title: "No Batches for Current Year",
        message: `Please create batches for year ${yearToCheck} first.`,
        color: "red",
        autoClose: false,
      });
      return false;
    }

    const requiredDisciplines = disciplines.length > 0
      ? disciplines
      : batchesForYear.map(batch => batch.discipline || batch.branch).filter(Boolean);

    for (const disciplineName of requiredDisciplines) {
      const matchingBatch = batchesForYear.find(batch => {
        const batchDiscipline = (batch.discipline || batch.branch || '').trim().toLowerCase();
        return batchDiscipline === disciplineName.trim().toLowerCase();
      });

      if (!matchingBatch) {
        notifications.show({
          title: "Batches Required",
          message: (
            <div>
              <Text size="sm" mb={8}>
                <strong>Please create the required batch first:</strong>
              </Text>
              <Text size="xs" style={{ whiteSpace: 'pre-line', color: '#721c24' }}>
                • {disciplineName} - Create batch for year {yearToCheck}
              </Text>
            </div>
          ),
          color: "red",
          autoClose: false,
        });
        return false;
      }
    }
    
    return true;
  };

  const validateExcelData = (data) => {
    const validationErrors = [];
    
    data.forEach((student, index) => {
      const rowNumber = index + 2;
      
      // Transform student data to standardized field names before validation
      const transformedStudent = {};
      Object.keys(STUDENT_FIELDS_CONFIG).forEach((fieldKey) => {
        const fieldInfo = STUDENT_FIELDS_CONFIG[fieldKey];
        let fieldValue = student[fieldKey];

        if (!fieldValue && fieldInfo.backendField) {
          fieldValue = student[fieldInfo.backendField];
        }

        if (!fieldValue && fieldInfo.excelColumns) {
          for (const excelCol of fieldInfo.excelColumns) {
            if (student[excelCol]) {
              fieldValue = student[excelCol];
              break;
            }
            const matchedKey = Object.keys(student).find(
              key => key.toLowerCase() === excelCol.toLowerCase()
            );
            if (matchedKey && student[matchedKey]) {
              fieldValue = student[matchedKey];
              break;
            }
          }
        }
        
        if (fieldValue) {
          transformedStudent[fieldKey] = fieldValue;
        }
      });

      const errors = applyUniversalValidation(transformedStudent, false);
      
      if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([field, error]) => {
          validationErrors.push({
            row: rowNumber,
            student: student.name || student.Name || `Row ${rowNumber}`,
            field: STUDENT_FIELDS_CONFIG[field]?.label || field,
            error: error
          });
        });
      }

      // Validate dropdown values
      const dropdownValidations = {
        admissionMode: STUDENT_FIELDS_CONFIG.admissionMode.options.map(opt => opt.value),
        pwdCategory: STUDENT_FIELDS_CONFIG.pwdCategory.options.map(opt => opt.value), 
        incomeGroup: STUDENT_FIELDS_CONFIG.incomeGroup.options.map(opt => opt.value),
        bloodGroup: STUDENT_FIELDS_CONFIG.bloodGroup.options.map(opt => opt.value),
        allottedGender: STUDENT_FIELDS_CONFIG.allottedGender.options.map(opt => opt.value),
        allottedCategory: STUDENT_FIELDS_CONFIG.allottedCategory.options.map(opt => opt.value),
        gender: STUDENT_FIELDS_CONFIG.gender.options.map(opt => opt.value),
        category: STUDENT_FIELDS_CONFIG.category.options.map(opt => opt.value),
        pwd: STUDENT_FIELDS_CONFIG.pwd.options.map(opt => opt.value),
      };

      Object.entries(dropdownValidations).forEach(([fieldKey, validOptions]) => {
        const value = student[fieldKey];
        if (value && value.trim() !== "" && value !== "-" && !validOptions.includes(value)) {
          validationErrors.push({
            row: rowNumber,
            student: student.name || student.Name || `Row ${rowNumber}`,
            field: STUDENT_FIELDS_CONFIG[fieldKey]?.label || fieldKey,
            error: `Invalid value "${value}". Must be one of: ${validOptions.join(', ')}`
          });
        }
      });

      // Validate phone numbers for duplicates
      const phoneErrors = validatePhoneNumbers(student);
      if (Object.keys(phoneErrors).length > 0) {
        Object.entries(phoneErrors).forEach(([field, error]) => {
          validationErrors.push({
            row: rowNumber,
            student: student.name || student.Name || `Row ${rowNumber}`,
            field: STUDENT_FIELDS_CONFIG[field]?.label || field,
            error: error
          });
        });
      }
    });
    
    return validationErrors;
  };

  const handleExcelUpload = async () => {
    try {
      // Check if PhD semester is selected for PhD section
      console.log('handleExcelUpload called:', { activeSection, selectedPhdSemester });
      
      if (activeSection === 'phd' && !selectedPhdSemester) {
        console.log('Blocked: PhD semester not selected');
        notifications.show({
          title: "Semester Selection Required",
          message: "Please select PhD semester (Odd or Even) before uploading students.",
          color: "yellow",
        });
        return;
      }

      const dataToUpload = extractedData;

      if (!dataToUpload || dataToUpload.length === 0) {
        notifications.show({
          title: "Error",
          message: "No data to upload. Please process an Excel file first.",
          color: "red",
        });
        return;
      }

      // Validate Excel data before proceeding
      const excelValidationErrors = validateExcelData(dataToUpload);
      
      if (excelValidationErrors.length > 0) {
        const errorMessages = excelValidationErrors.slice(0, 10).map(error => 
          `• Row ${error.row} (${error.student}): ${error.field} - ${error.error}`
        ).join('\n');
        
        const additionalErrors = excelValidationErrors.length > 10 ? 
          `\n... and ${excelValidationErrors.length - 10} more validation errors` : '';
        
        notifications.show({
          title: "Upload Failed - Data Validation Errors",
          message: (
            <div>
              <Text size="sm" mb={8}>
                <strong>Please fix the following errors in your Excel file:</strong>
              </Text>
              <Text size="xs" style={{ whiteSpace: 'pre-line', color: '#721c24' }}>
                {errorMessages}{additionalErrors}
              </Text>
            </div>
          ),
          color: "red",
          autoClose: false,
        });
        return;
      }
      // Use viewAcademicYear (the admin-selected year) for batch lookup.
      const currentAcademicYear = viewAcademicYear;
      const uploadDisciplines = getUploadDisciplines(dataToUpload);
      const canUpload = await validateBatchPrerequisites(currentAcademicYear, uploadDisciplines);
      
      if (!canUpload) {
        return;
      }

      const currentBatches = getCurrentBatches();
      const batchValidationErrors = [];
      const studentBatchMap = new Map();
      
      for (const student of dataToUpload) {
        const studentBranch = student.branch || student.discipline || student.Branch || student.Discipline;
        const studentYear = viewAcademicYear; // Must match getCurrentBatches() which filters by viewAcademicYear

        const matchingBatch = getBatchForBranch(
          studentBranch, 
          currentBatches,
          activeSection === 'phd' ? selectedPhdSemester : null
        );

        let finalMatchingBatch = matchingBatch;
        if (!finalMatchingBatch) {
          finalMatchingBatch = currentBatches.find(batch => {
            const batchBranch = batch.discipline || batch.branch;
            return (
              batchBranch === studentBranch &&
              batch.year === studentYear
            );
          });
        }

        if (finalMatchingBatch && finalMatchingBatch.year !== studentYear) {
          finalMatchingBatch = null;
        }
        
        if (!finalMatchingBatch) {
          const semesterInfo = activeSection === 'phd' && selectedPhdSemester ? ` (${selectedPhdSemester.toUpperCase()} semester)` : '';
          batchValidationErrors.push({
            student: student.name || student.Name || 'Unknown',
            branch: studentBranch,
            year: studentYear,
            message: `No existing batch found for ${studentBranch} ${studentYear}${semesterInfo}`
          });
        } else {
          const studentsForThisBatch = studentBatchMap.get(finalMatchingBatch.id) || [];
          studentsForThisBatch.push(student);
          studentBatchMap.set(finalMatchingBatch.id, studentsForThisBatch);
          
          const totalStudentsForBatch = (finalMatchingBatch.filledSeats || 0) + studentsForThisBatch.length;
          if (totalStudentsForBatch > finalMatchingBatch.totalSeats) {
            batchValidationErrors.push({
              student: student.name || student.Name || 'Unknown',
              branch: studentBranch,
              year: studentYear,
              message: `Batch ${studentBranch} ${studentYear} will exceed capacity (${totalStudentsForBatch}/${finalMatchingBatch.totalSeats})`
            });
          }
        }
      }

      if (batchValidationErrors.length > 0) {
        const errorMessages = batchValidationErrors.slice(0, 5).map(error => 
          `• ${error.student}: ${error.message}`
        ).join('\n');
        
        const additionalErrors = batchValidationErrors.length > 5 ? 
          `\n... and ${batchValidationErrors.length - 5} more errors` : '';
        
        notifications.show({
          title: "Upload Failed - Batch Validation Errors",
          message: (
            <div>
              <Text size="sm" mb={8}>
                <strong>Cannot upload students. Please create required batches first:</strong>
              </Text>
              <Text size="xs" style={{ whiteSpace: 'pre-line', color: '#721c24' }}>
                {errorMessages}{additionalErrors}
              </Text>
            </div>
          ),
          color: "red",
          autoClose: false,
        });
        return;
      }

      // First pass: show the allocation preview for confirmation. The preview's
      // Save button re-invokes this (showBatchPreview=true) and the save below runs.
      if (!showBatchPreview) {
        const branchCounts = {};
        dataToUpload.forEach((stu) => {
          const b = stu.branch || stu.discipline || stu.Branch || stu.Discipline || "Unknown";
          branchCounts[b] = (branchCounts[b] || 0) + 1;
        });
        setProcessedBatchData(dataToUpload);
        setAllocationSummary({
          programme: activeSection,
          year: viewAcademicYear,
          totalStudents: dataToUpload.length,
          branchCounts,
        });
        setShowBatchPreview(true);
        return;
      }

      const transformedData = transformDataForDatabase(dataToUpload);
      
      // Debug logging
      console.log('PhD Upload Debug:', {
        activeSection,
        selectedPhdSemester,
        sendingValue: activeSection === 'phd' ? selectedPhdSemester : null
      });
      
      const response = await saveStudentsBatch(
        transformedData, 
        activeSection,
        activeSection === 'phd' ? selectedPhdSemester : null,
        viewAcademicYear  // Pass the current view year so backend targets the right batch year
      );

      if (response.success) {
        const uploadCount =
          response.data?.successful_uploads || response.data?.saved_count || 0;

        if (uploadCount === 0) {
          // Backend returned success but nothing was saved — treat as failure
          const errorDetail = response.error_detail || response.message || 'No students were saved.';
          const errorList = response.errors;
          let displayMsg = errorDetail;
          if (Array.isArray(errorList) && errorList.length > 0) {
            const firstErr = errorList[0];
            const errText = typeof firstErr === 'string' ? firstErr
              : (firstErr.required_action || firstErr.error || JSON.stringify(firstErr));
            displayMsg = errText || errorDetail;
          }
          notifications.show({
            title: "❌ Upload Failed",
            message: displayMsg,
            color: "red",
            autoClose: false,
          });
        } else {
          notifications.show({
            title: "✅ Upload Successful",
            message: `${uploadCount} student${uploadCount !== 1 ? 's' : ''} uploaded to existing batches successfully!`,
            color: "green",
          });

          setShowAddModal(false);
          setAddMode(null);
          setUploadedFile(null);
          setExtractedData([]);
          setProcessedBatchData(null);
          setAllocationSummary(null);
          setShowBatchPreview(false);
          setShowPreview(false);

          setTimeout(() => {
            forceRefreshData();
          }, 500);
        }
      } else {
        // Show the actual error from backend
        const errorDetail = response.error_detail || response.message;
        const errorList = response.errors;
        let displayMsg = errorDetail;
        if (Array.isArray(errorList) && errorList.length > 0) {
          const firstErr = errorList[0];
          const errText = typeof firstErr === 'string' ? firstErr
            : (firstErr.required_action || firstErr.error || JSON.stringify(firstErr));
          displayMsg = errText || errorDetail;
        }
        if (response.error_code === 'BATCH_NOT_FOUND') {
          notifications.show({
            title: "Batch Required",
            message: response.required_action || displayMsg,
            color: "red",
            autoClose: false,
          });
        } else if (response.error_code === 'BATCH_MATCHING_ERROR') {
          notifications.show({
            title: "Configuration Error",
            message: response.message,
            color: "red",
            autoClose: false,
          });
        } else {
          notifications.show({
            title: "❌ Upload Failed",
            message: displayMsg || "Failed to upload students",
            color: "red",
            autoClose: false,
          });
        }
      }
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData?.error || error.message;

      if (errorMessage?.includes("No working curriculums found")) {
        showWorkflowGuidance('curriculum_required');
      } else if (errorMessage?.includes("No active batches found")) {
        showWorkflowGuidance('batches_required', { 
          academicYear: getViewAcademicYearOptions()[0]?.label || 'current year'
        });
      } else if (errorMessage?.includes("have no curriculum assigned")) {
        const batchMatch = errorMessage.match(/assigned: (.+?)\./);
        const batchNames = batchMatch ? batchMatch[1] : "some batches";
        
        showWorkflowGuidance('curriculum_assignment_required', { batchNames });
      } else if (errorMessage?.includes("validation") || errorMessage?.includes("prerequisite")) {
        notifications.show({
          title: "📋 Validation Error",
          message: errorMessage,
          color: "red",
          autoClose: 8000,
          style: {
            backgroundColor: '#f8d7da',
            borderColor: '#f5c6cb',
            color: '#721c24',
          },
        });
      } else {
        const { title, message } = parseDuplicateError(error, "upload students");

        notifications.show({
          title,
          message,
          color: "red",
          autoClose: 8000,
        });
      }
    }
  };

  const nextStep = async () => {
    if (currentStep < 3) {
      setErrors({});
      setCurrentStep(currentStep + 1);
    } else {
      try {
        const finalErrors = validateRequiredFields(
          manualFormData,
          !!editingStudent,
        );
        
        if (Object.keys(finalErrors).length > 0) {
          console.log("Validation failed. Errors:", finalErrors);
          console.log("Form data:", manualFormData);
          console.log("Active section:", activeSection);
          
          setErrors(finalErrors);
          const phoneErrors = Object.values(finalErrors).filter(error => 
            error.includes("mobile number cannot be the same") || 
            error.includes("phone number cannot be the same")
          );
          
          if (phoneErrors.length > 0) {
            notifications.show({
              title: "Duplicate Phone Number",
              message: phoneErrors[0],
              color: "red",
            });
          } else {
            const missingFields = Object.entries(finalErrors)
              .map(([field, error]) => `• ${STUDENT_FIELDS_CONFIG[field]?.label || field}: ${error}`)
              .join('\n');
            
            notifications.show({
              title: "Validation Error",
              message: (
                <div>
                  <Text size="sm" mb={8}>Please fill the following required fields:</Text>
                  <Text size="xs" style={{ whiteSpace: 'pre-line', color: '#721c24' }}>
                    {missingFields}
                  </Text>
                </div>
              ),
              color: "red",
              autoClose: 8000,
            });
          }
          return;
        }

        const transformedData = transformDataForDatabase([manualFormData]);

        if (!editingStudent) {
          // Use viewAcademicYear (the admin-selected year) for batch lookup.
          const studentYear = viewAcademicYear;
          if (activeSection === 'phd' && !selectedPhdSemester) {
            notifications.show({
              title: "Semester Selection Required",
              message: "Please select PhD semester (Odd or Even) before saving a manual student.",
              color: "yellow",
            });
            return;
          }
          const uploadDisciplines = getUploadDisciplines([manualFormData]);
          const canUpload = await validateBatchPrerequisites(studentYear, uploadDisciplines);
          
          if (!canUpload) {
            return;
          }

          let allBatches;
          if (activeSection === "ug") allBatches = ugBatches || [];
          else if (activeSection === "pg") allBatches = pgBatches || [];
          else allBatches = phdBatches || [];

          const batchesForYear = allBatches.filter(batch => batch.year === studentYear);
          const studentBranch = manualFormData.branch;

          const matchingBatch = getBatchForBranch(
            studentBranch, 
            batchesForYear,
            activeSection === 'phd' ? selectedPhdSemester : null
          );
          
          if (!matchingBatch) {
            const academicYearStr = batchYearToAcademicYear(studentYear);
            const availableBranches = batchesForYear.map(b => b.discipline || b.branch).filter(Boolean);
            
            notifications.show({
              title: "Cannot Add Student",
              message: (
                <div>
                  <Text size="sm" mb={8}>
                    <strong>No matching batch found.</strong>
                  </Text>
                  <Text size="xs" style={{ color: '#721c24' }}>
                    Looking for: {studentBranch} {studentYear} (Academic Year: {academicYearStr})
                  </Text>
                  <Text size="xs" style={{ color: '#856404', marginTop: '8px' }}>
                    Available: {availableBranches.length > 0 ? availableBranches.join(', ') : 'None for this year'}
                  </Text>
                </div>
              ),
              color: "red",
              autoClose: false,
            });
            return;
          }

          const totalStudentsForBatch = (matchingBatch.filledSeats || 0) + 1;
          if (totalStudentsForBatch > matchingBatch.totalSeats) {
            notifications.show({
              title: "Batch Full",
              message: `Batch ${studentBranch} ${studentYear} is full (${matchingBatch.filledSeats}/${matchingBatch.totalSeats} seats)`,
              color: "red",
              autoClose: 5000,
            });
            return;
          }
        }

        if (editingStudent) {
          const oldBranch = editingStudent.branch || editingStudent.Branch || editingStudent.discipline || editingStudent.Discipline;
          const newBranch = manualFormData.branch;
          const branchChanged = oldBranch && newBranch && oldBranch.toLowerCase().trim() !== newBranch.toLowerCase().trim();
          const updateData = { ...transformedData[0], programmeType: activeSection };

          let targetBatch = null;
          if (branchChanged) {
            const currentBatches = activeSection === 'ug' ? ugBatches : 
                                 activeSection === 'pg' ? pgBatches : phdBatches;
            targetBatch = getBatchForBranch(
              newBranch, 
              currentBatches,
              activeSection === 'phd' ? selectedPhdSemester : null
            );
            
            if (!targetBatch) {
              notifications.show({
                title: "Branch Transfer Warning",
                message: `No batch found for branch "${newBranch}". Student will be updated but may need manual batch assignment.`,
                color: "yellow",
                autoClose: 7000,
              });
            }
          }

          const response = await updateStudent(
            editingStudent.id || editingStudent.student_id,
            updateData,
          );

          if (response.success) {
            let successMessage = "Student updated successfully!";

            // Branch changed during edit: sync the academic batch via the existing
            // batch-change backend (apply_batch_changes) instead of a bespoke endpoint.
            if (branchChanged && targetBatch) {
              try {
                const token = localStorage.getItem("authToken");
                const syncResp = await fetch(
                  `${host}/academic-procedures/api/acad/batch_change/apply/`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Token ${token}`,
                    },
                    body: JSON.stringify([
                      {
                        student_id:
                          editingStudent.id || editingStudent.student_id,
                        new_batch_id: targetBatch.id,
                        new_batch_year: targetBatch.year,
                      },
                    ]),
                  },
                );
                const syncData = await syncResp.json().catch(() => ({}));
                const syncErr =
                  Array.isArray(syncData.errors) && syncData.errors.length
                    ? syncData.errors[0].detail
                    : null;
                successMessage = syncErr
                  ? `Student updated, but batch move needs attention: ${syncErr}`
                  : `Student successfully transferred from ${oldBranch} to ${newBranch}. Academic batch assignment updated.`;
              } catch (syncError) {
                successMessage = `Student updated and discipline set to "${newBranch}", but the academic batch move could not be synced — verify in the Batch/Branch Change tab.`;
              }
            } else if (branchChanged) {
              successMessage += ` Discipline updated to "${newBranch}".`;
            }
            
            notifications.show({
              title: branchChanged ? "Discipline Change Completed" : "Update Successful",
              message: successMessage,
              color: "green",
              autoClose: branchChanged ? 10000 : 4000,
            });

            setStudentList((prev) =>
              prev.map((student) => {
                if (
                  (student.id || student.student_id) ===
                  (editingStudent.id || editingStudent.student_id)
                ) {
                  const updatedStudent = { ...student, ...updateData };
                  setEditingStudent(updatedStudent);
                  return updatedStudent;
                }
                return student;
              }),
            );

            setShowAddModal(false);
            setEditingStudent(null);
            setCurrentStep(0);
            setManualFormData(INITIAL_FORM_DATA);
            setErrors({});

            setShowStudentModal(false);
            setSelectedBatch(null);

            forceRefreshData();
          } else {
            throw new Error(response.message || "Failed to update student");
          }
        } else {
          const response = await addSingleStudent(
            transformedData[0],
            activeSection,
            activeSection === 'phd' ? selectedPhdSemester : null,
            viewAcademicYear  // Pass current view year so backend uses the right batch year
          );

          if (response.success) {
            notifications.show({
              title: "Success",
              message: `Student added successfully! Roll Number: ${response.data.roll_number}, Institute Email: ${response.data.institute_email}`,
              color: "green",
            });

            setShowAddModal(false);
            setAddMode(null);
            setCurrentStep(0);
            setManualFormData(INITIAL_FORM_DATA);
            setErrors({});

            forceRefreshData();
          } else {
            if (response.error_code === 'BATCH_NOT_FOUND') {
              notifications.show({
                title: "Batch Required",
                message: response.required_action || response.message,
                color: "red",
                autoClose: false,
              });
            } else if (response.error_code === 'BATCH_MATCHING_ERROR') {
              notifications.show({
                title: "Configuration Error", 
                message: response.message,
                color: "red",
                autoClose: false,
              });
            } else {
              throw new Error(response.message || "Failed to add student");
            }
          }
        }
      } catch (error) {
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || errorData?.error || error.message;

        if (errorMessage?.includes("No working curriculums found")) {
          showWorkflowGuidance('curriculum_required');
        } else if (errorMessage?.includes("No active batches found")) {
          showWorkflowGuidance('batches_required', { 
            academicYear: getViewAcademicYearOptions()[0]?.label || 'current year'
          });
        } else if (errorMessage?.includes("have no curriculum assigned")) {
          const batchMatch = errorMessage.match(/assigned: (.+?)\./);
          const batchNames = batchMatch ? batchMatch[1] : "some batches";
          
          showWorkflowGuidance('curriculum_assignment_required', { batchNames });
        } else if (errorMessage?.includes("validation") || errorMessage?.includes("prerequisite")) {
          notifications.show({
            title: "📋 Validation Error",
            message: errorMessage,
            color: "red",
            autoClose: 8000,
            style: {
              backgroundColor: '#f8d7da',
              borderColor: '#f5c6cb',
              color: '#721c24',
            },
          });
        } else {
          const operationType = editingStudent ? "update student" : "add student";
          const { title, message } = parseDuplicateError(error, operationType);

          notifications.show({
            title,
            message,
            color: "red",
            autoClose: 8000,
          });
        }
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setErrors({}); 
      setCurrentStep(currentStep - 1);
    }
  };

  const generateExcelTemplate = () => {
    const isPhd = activeSection === 'phd';

    // ── PhD template ────────────────────────────────────────────────────────
    if (isPhd) {
      const headers = [
        "Sno",
        "Application No.",
        "Institute Roll Number",
        "Name",
        "Discipline",
        "Admission Type",
        "Gender",
        "Category",
        "Minority",
        "PwD",
        "PwD Category",
        "PwD Category Remarks",
        "MobileNo",
        "Institute Email ID",
        "Alternate Email ID",
        "Parent Email",
        "Father's Name",
        "Father's Occupation",
        "Father Mobile Number",
        "Mother's Name",
        "Mother's Occupation",
        "Mother Mobile Number",
        "Date of Birth",
        "Blood Group",
        "Blood Group Remarks",
        "Country",
        "Nationality",
        "Admission Mode",
        "Admission Mode Remarks",
        "Income Group",
        "Income",
        "GATE Qualaified",
        "GATE Stream",
        "GATE Rank",
        "allottedcat",
        "State",
        "Full Address (with pincode)",
      ];

      const sampleData = [
        [
          1,
          "PHD2025001",
          "25PHD001",
          "SAMPLE STUDENT",
          "Computer Science and Engineering",
          "FULL TIME with Institute Assistantship",
          "Female",
          "General",
          "",
          "NO",
          "",
          "",
          "9229109424",
          "25phd001@iiitdmj.ac.in",
          "student@gmail.com",
          "parent@gmail.com",
          "FATHER NAME",
          "Engineer",
          "9876543210",
          "MOTHER NAME",
          "Teacher",
          "9876543211",
          "15/05/1998",
          "O+",
          "",
          "India",
          "Indian",
          "Institute Level",
          "",
          "Between 4 to 6 Lakh",
          "500000",
          "YES",
          "CS",
          "1234",
          "OPNO",
          "MADHYA PRADESH",
          "House No. 123, Street Name, City, State, 452001",
        ],
      ];

      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Student Data Template");

      worksheet["!cols"] = headers.map((h) => ({ wch: Math.max(h.length + 4, 22) }));

      XLSX.writeFile(workbook, "student_data_template_PHD.xlsx");

      notifications.show({
        title: "Template Downloaded",
        message: "PhD Excel template with all required fields has been downloaded",
        color: "green",
      });
      return;
    }

    // ── UG / PG template ────────────────────────────────────────────────────
    const headers = [
      "Sno",
      "JEE App. No. / CCMT Roll No.",
      "Institute Roll Number",
      "Name",
      "Discipline",
      "Specialization",
      "Gender",
      "Category",
      "Minority",
      "PwD",
      "PwD Category",
      "PwD Category Remarks",
      "MobileNo",
      "Institute Email ID",
      "Alternate Email ID",
      "Parent Email",
      "Father's Name",
      "Father's Occupation",
      "Father Mobile Number",
      "Mother's Name",
      "Mother's Occupation",
      "Mother Mobile Number",
      "Date of Birth",
      "Blood Group",
      "Blood Group Remarks",
      "Country",
      "Nationality",
      "Admission Mode",
      "Admission Mode Remarks",
      "Income Group",
      "Income",
      "AI rank",
      "Category Rank",
      "allottedcat",
      "Allotted Gender",
      "State",
      "Full Address",
    ];

    const sampleData = [
      [
        1,
        "240310030189",
        "25BCS001",
        "PALLAVI ARAS",
        "Computer Science and Engineering (4 Years, Bachelor of Technology)",
        "",
        "Female",
        "General",
        "JAIN",
        "NO",
        "", // PwD Category - empty since PwD is NO
        "", // PwD Category Remarks - empty since PwD is NO
        "9229109424",
        "25bcs001@iiitdmj.ac.in",
        "ARAS15@GMAIL.COM",
        "parent.aras@gmail.com",
        "SACHIN ARAS",
        "Business",
        "1234567890",
        "SNIGDHA ARAS",
        "Teacher",
        "1234567890",
        "5/10/2005",
        "O+",
        "", // Blood Group Remarks - empty since blood group is standard
        "India",
        "Indian",
        "JoSAA/CSAB Counselling",
        "", // Admission Mode Remarks - empty since not "Any other"
        "Between 4 to 6 Lakh",
        "500000",
        "10356",
        "10356",
        "OPNO",
        "Female-Only (including Supernumerary)",
        "MADHYA PRADESH",
        "A 902 sterling skyline near mayank blue water park, indore, NA, Indore, MADHYA PRADESH, 452016",
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Student Data Template");

    const colWidths = headers.map((header) => ({
      wch: Math.max(header.length, 20),
    }));
    worksheet["!cols"] = colWidths;

    // Add data validation for dropdown fields
    const dropdownValidations = {
      'G': { // Gender column (moved right by one after adding Specialization)
        type: 'list',
        values: ['Male', 'Female', 'Other']
      },
      'H': { // Category column (moved right by one)
        type: 'list', 
        values: ['General', 'OBC-NCL', 'SC', 'ST', 'GEN-EWS']
      },
      'J': { // PwD column (moved right by one)
        type: 'list',
        values: ['YES', 'NO']
      },
      'K': { // PwD Category column (moved right by one)
        type: 'list',
        values: ['Locomotor Disability', 'Low vision Disability', 'Deaf Disability', 'Cerebral Palsy', 'Dyslexia', 'Amputee (Both Hand)', 'Deafness', 'Any other (remarks)']
      },
      'X': { // Blood Group column (moved right by one)
        type: 'list',
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Other']
      },
      'AB': { // Admission Mode column (moved right by one)
        type: 'list',
        values: ['Direct Institute advertisement', 'CCMT Counselling', 'JoSAA/CSAB Counselling', 'UCEED Counselling', 'Study In India (SII) Counselling', 'DASA Counselling', 'Any other (remarks)']
      },
      'AD': { // Income Group column (moved right by one)
        type: 'list',
        values: ['Between 0 to 2 Lakh', 'Between 2 to 4 Lakh', 'Between 4 to 6 Lakh', 'Between 6 to 8 Lakh', 'More than 8 Lakh']
      },
      'AH': { // Allotted Category column (moved right by one)
        type: 'list',
        values: ['OPNO', 'OPPH', 'EWNO', 'EWPH', 'BCNO', 'BCPH', 'SCNO', 'SCPH', 'STNO']
      },
      'AI': { // Allotted Gender column (moved right by one)
        type: 'list',
        values: ['Gender-Neutral', 'Female-Only (including Supernumerary)']
      }
    };

    XLSX.writeFile(
      workbook,
      `student_data_template_${activeSection.toUpperCase()}.xlsx`,
    );

    notifications.show({
      title: "Template Downloaded",
      message: `Excel template with updated fields and sample data for ${activeSection.toUpperCase()} students has been downloaded`,
      color: "green",
    });
  };

  return {
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
  };
}
