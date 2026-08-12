// Pure student-form validation helpers extracted from Admin_Upcoming_Batches.jsx.
// No component state or hooks; each takes its inputs as arguments, so they are
// safe to import and reuse anywhere.

// Universal validation logic for PwD and Income fields
export const validatePwDFields = (formData) => {
  const errors = {};

  if (
    (formData.pwd === "YES" || formData.pwd === "Yes") &&
    (!formData.pwdCategory || formData.pwdCategory.trim() === "")
  ) {
    errors.pwdCategory = "PwD Category is required when PwD is Yes.";
  }

  if (
    formData.pwdCategory === "Any other (remarks)" &&
    (!formData.pwdCategoryRemarks || formData.pwdCategoryRemarks.trim() === "")
  ) {
    errors.pwdCategoryRemarks =
      "PwD Category remarks are required when 'Any other (remarks)' is selected.";
  }

  return errors;
};

export const validateIncomeFields = (formData) => {
  const errors = {};

  if (formData.incomeGroup && formData.income) {
    const income = parseInt(formData.income, 10);

    if (Number.isNaN(income) || income < 0) {
      errors.income = "Income must be a valid positive number.";
      return errors;
    }

    switch (formData.incomeGroup) {
      case "Between 0 to 2 Lakh":
        if (income < 0 || income > 200000) {
          errors.income =
            "Income must be between 0 and 2,00,000 for the selected Income Group.";
        }
        break;
      case "Between 2 to 4 Lakh":
        if (income <= 200000 || income > 400000) {
          errors.income =
            "Income must be between 2,00,001 and 4,00,000 for the selected Income Group.";
        }
        break;
      case "Between 4 to 6 Lakh":
        if (income <= 400000 || income > 600000) {
          errors.income =
            "Income must be between 4,00,001 and 6,00,000 for the selected Income Group.";
        }
        break;
      case "Between 6 to 8 Lakh":
        if (income <= 600000 || income > 800000) {
          errors.income =
            "Income must be between 6,00,001 and 8,00,000 for the selected Income Group.";
        }
        break;
      case "More than 8 Lakh":
        if (income <= 800000) {
          errors.income =
            "Income must be more than 8,00,000 for the selected Income Group.";
        }
        break;
      default:
        break;
    }
  }

  return errors;
};

export const validateAdmissionModeFields = (formData) => {
  const errors = {};

  if (
    formData.admissionMode === "Any other (remarks)" &&
    (!formData.admissionModeRemarks ||
      formData.admissionModeRemarks.trim() === "")
  ) {
    errors.admissionModeRemarks =
      "Admission Mode remarks are required when 'Any other (remarks)' is selected.";
  }

  return errors;
};

export const validateBloodGroupFields = (formData) => {
  const errors = {};

  if (
    formData.bloodGroup === "Other" &&
    (!formData.bloodGroupRemarks || formData.bloodGroupRemarks.trim() === "")
  ) {
    errors.bloodGroupRemarks =
      "Blood Group remarks are required when 'Other' is selected.";
  }

  return errors;
};

export const validateEmailField = (email, fieldName) => {
  const errors = {};

  if (email && email.trim() !== "") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors[fieldName] = "Please enter a valid email address.";
    }
  }

  return errors;
};

export const validatePhoneNumbers = (formData) => {
  const errors = {};

  if (
    formData.phoneNumber &&
    formData.fatherMobile &&
    formData.phoneNumber.trim() === formData.fatherMobile.trim()
  ) {
    errors.fatherMobile =
      "Father's mobile number cannot be the same as student's phone number.";
  }

  if (
    formData.phoneNumber &&
    formData.motherMobile &&
    formData.phoneNumber.trim() === formData.motherMobile.trim()
  ) {
    errors.motherMobile =
      "Mother's mobile number cannot be the same as student's phone number.";
  }

  if (
    formData.fatherMobile &&
    formData.motherMobile &&
    formData.fatherMobile.trim() === formData.motherMobile.trim()
  ) {
    errors.motherMobile =
      "Mother's mobile number cannot be the same as father's mobile number.";
  }

  return errors;
};

export const applyUniversalValidation = (formData) => {
  let errors = {};

  // Apply PwD validation
  errors = { ...errors, ...validatePwDFields(formData) };

  // Apply Income validation
  errors = { ...errors, ...validateIncomeFields(formData) };

  // Apply Admission Mode validation
  errors = { ...errors, ...validateAdmissionModeFields(formData) };

  // Apply Blood Group validation
  errors = { ...errors, ...validateBloodGroupFields(formData) };

  // Apply Phone number validation
  errors = { ...errors, ...validatePhoneNumbers(formData) };

  // Apply Email validation
  if (formData.alternateEmail) {
    errors = {
      ...errors,
      ...validateEmailField(formData.alternateEmail, "alternateEmail"),
    };
  }
  if (formData.parentEmail) {
    errors = {
      ...errors,
      ...validateEmailField(formData.parentEmail, "parentEmail"),
    };
  }
  if (formData.instituteEmail) {
    errors = {
      ...errors,
      ...validateEmailField(formData.instituteEmail, "instituteEmail"),
    };
  }

  return errors;
};
