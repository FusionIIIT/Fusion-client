// Static constants and config extracted from Admin_Upcoming_Batches.jsx.
// Pure data (no component state); imported back into the component and
// available for reuse by other Programme-Curriculum admin screens.

export const customTableStyles = `
  .student-allocation-table .mantine-Badge-root {
    overflow: visible !important;
    text-overflow: unset !important;
    white-space: nowrap !important;
    max-width: none !important;
    width: auto !important;
  }
  
  .student-allocation-table .mantine-Badge-inner {
    overflow: visible !important;
    text-overflow: unset !important;
    white-space: nowrap !important;
  }
  
  .student-allocation-table td {
    vertical-align: top !important;
    word-wrap: break-word !important;
    white-space: nowrap !important;
    overflow: visible !important;
    text-overflow: unset !important;
  }
  
  .student-allocation-table th {
    text-align: center !important;
    font-weight: 600 !important;
    background-color: #f8f9fa !important;
    white-space: nowrap !important;
    overflow: visible !important;
  }
  
  .auto-width-table {
    table-layout: auto !important;
    width: 100% !important;
  }
  
  .auto-width-table td,
  .auto-width-table th {
    width: auto !important;
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: unset !important;
    word-wrap: break-word !important;
    max-width: none !important;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
  
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  .sync-indicator {
    animation: pulse 2s ease-in-out infinite;
  }
  
  .content-container {
    animation: fadeIn 0.3s ease-in-out;
  }
`;

export const PROGRAMME_TYPES = {
  UG: "ug",
  PG: "pg",
  PHD: "phd",
};

export const STUDENT_FIELDS_CONFIG = {
  jeeAppNo: {
    label: "JEE App. No. / CCMT Roll No. / Application No.",
    placeholder: "Enter JEE application number or CCMT roll number",
    required: false,
    backendField: "jee_app_no",
    showForProgrammes: ["UG", "PG"],
    excelColumns: [
      "jee app. no / ccmt roll no",
      "jee app. no / ccmt roll no.",
      "jee main application number",
      "jee app. no.",
      "jee app. no./ccmt roll. no.",
      "jee app. no. / ccmt roll no.",
      "jee app no / ccmt roll no",
      "jee app no/ccmt roll no",
      "jee application number",
      "ccmt roll no",
      "ccmt roll number",
      "jeeprep",
      "jee app no",
      "isprep",
      "jee roll no",
      "jee roll number",
    ],
  },
  applicationNo: {
    label: "Application No.",
    placeholder: "Enter PhD application number",
    required: false,
    backendField: "application_no",
    showForProgrammes: ["PHD"],
    excelColumns: ["application no.", "application no", "app no.", "app no"],
  },
  admissionType: {
    label: "Admission Type",
    placeholder: "Select admission type",
    required: false,
    type: "select",
    backendField: "admission_type",
    showForProgrammes: ["PHD"],
    options: [
      {
        value: "FULL TIME with Institute Assistantship",
        label: "FULL TIME with Institute Assistantship",
      },
      {
        value: "FULL TIME with Govt. / Semi Govt. Fellowship Award",
        label: "FULL TIME with Govt. / Semi Govt. Fellowship Award",
      },
      { value: "FULL TIME Self Financed", label: "FULL TIME Self Financed" },
      { value: "PART TIME (External)", label: "PART TIME (External)" },
      { value: "QIP", label: "QIP" },
      { value: "Any other (remarks)", label: "Any other (remarks)" },
    ],
    excelColumns: ["admission type"],
  },
  gateQualified: {
    label: "GATE Qualified",
    placeholder: "Select GATE qualification status",
    required: false,
    type: "select",
    backendField: "gate_qualified",
    showForProgrammes: ["PHD"],
    options: [
      { value: "YES", label: "Yes" },
      { value: "NO", label: "No" },
    ],
    excelColumns: ["gate qualaified", "gate qualified"],
  },
  gateStream: {
    label: "GATE Stream",
    placeholder: "Enter GATE stream code (e.g., CS, EC, ME)",
    required: false,
    backendField: "gate_stream",
    showForProgrammes: ["PHD"],
    excelColumns: ["gate stream"],
  },
  gateRank: {
    label: "GATE Rank",
    placeholder: "Enter GATE rank (numeric value)",
    required: false,
    type: "number",
    backendField: "gate_rank",
    showForProgrammes: ["PHD"],
    excelColumns: ["gate rank"],
  },
  specialization: {
    label: "Specialization",
    placeholder: "Select specialization",
    required: true,
    type: "select",
    backendField: "specialization",
    options: [
      { value: "AI & ML", label: "AI & ML" },
      { value: "Data Science", label: "Data Science" },
      {
        value: "Communication and Signal Processing",
        label: "Communication and Signal Processing",
      },
      {
        value: "Nanoelectronics and VLSI Design",
        label: "Nanoelectronics and VLSI Design",
      },
      { value: "Power & Control", label: "Power & Control" },
      { value: "Design", label: "Design" },
      { value: "CAD/CAM", label: "CAD/CAM" },
      {
        value: "Manufacturing and Automation",
        label: "Manufacturing and Automation",
      },
      { value: "Mechatronics", label: "Mechatronics" },
    ],
    excelColumns: ["specialization", "specialisation", "stream", "track"],
    showForProgrammes: ["PG"],
  },
  name: {
    label: "Full Name",
    placeholder: "Enter full name",
    required: true,
    backendField: "name",
    excelColumns: ["name", "student name", "full name"],
  },
  hindiName: {
    label: "Name (Hindi)",
    placeholder: "पूरा नाम दर्ज करें",
    required: false,
    backendField: "hindi_name",
    excelColumns: ["hindi name", "name hindi", "name in hindi"],
  },
  aadharNo: {
    label: "Aadhaar No.",
    placeholder: "Enter 12-digit Aadhaar number",
    required: false,
    backendField: "aadhar_number",
    excelColumns: [
      "aadhar no",
      "aadhaar no",
      "aadhar number",
      "aadhaar number",
    ],
  },
  photo: {
    label: "Photo",
    placeholder: "Upload passport photo (max 200KB)",
    required: false,
    type: "image",
    backendField: "photo",
    excelColumns: ["photo"],
  },
  signature: {
    label: "Signature",
    placeholder: "Upload signature (max 30KB)",
    required: false,
    type: "image",
    backendField: "signature",
    excelColumns: ["signature"],
  },
  fname: {
    label: "Father Name",
    placeholder: "Enter father's name",
    required: true,
    showForProgrammes: ["UG", "PG"],
    backendField: "father_name",
    excelColumns: [
      "father's name",
      "father name",
      "fname",
      "Father Name",
      "Father's Name",
      "father_name",
      "fatherName",
    ],
  },
  mname: {
    label: "Mother Name",
    placeholder: "Enter mother's name",
    required: true,
    showForProgrammes: ["UG", "PG"],
    backendField: "mother_name",
    excelColumns: [
      "mother's name",
      "mother name",
      "mname",
      "Mother Name",
      "Mother's Name",
      "mother_name",
      "motherName",
    ],
  },

  gender: {
    label: "Gender",
    placeholder: "Select gender",
    required: true,
    type: "select",
    backendField: "gender",
    options: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
      { value: "Other", label: "Other" },
    ],
    excelColumns: ["gender", "sex"],
  },
  category: {
    label: "Category",
    placeholder: "Select category",
    required: true,
    type: "select",
    backendField: "category",
    options: [
      { value: "General", label: "General" },
      { value: "OBC-NCL", label: "Other Backward Class (Non-Creamy Layer)" },
      { value: "SC", label: "Scheduled Caste" },
      { value: "ST", label: "Scheduled Tribe" },
      { value: "GEN-EWS", label: "Economically Weaker Section (GEN-EWS)" },
    ],
    excelColumns: ["category", "caste", "reservation"],
  },
  minority: {
    label: "Minority",
    placeholder: "Enter minority status",
    required: false,
    backendField: "minority",
    excelColumns: ["minority", "minority status", "religious minority"],
  },
  allottedGender: {
    label: "Allotted Gender",
    placeholder: "Select allotted gender",
    required: false,
    type: "select",
    backendField: "allotted_gender",
    options: [
      { value: "Gender-Neutral", label: "Gender-Neutral" },
      {
        value: "Female-Only (including Supernumerary)",
        label: "Female-Only (including Supernumerary)",
      },
    ],
    excelColumns: ["allotted gender"],
    showForProgrammes: ["UG", "PG"],
  },
  allottedCategory: {
    label: "Allotted Category",
    placeholder: "Select allotted category",
    required: false,
    type: "select",
    backendField: "allotted_category",
    options: [
      { value: "OPNO", label: "OPNO" },
      { value: "OPPH", label: "OPPH" },
      { value: "EWNO", label: "EWNO" },
      { value: "EWPH", label: "EWPH" },
      { value: "BCNO", label: "BCNO" },
      { value: "BCPH", label: "BCPH" },
      { value: "SCNO", label: "SCNO" },
      { value: "SCPH", label: "SCPH" },
      { value: "STNO", label: "STNO" },
    ],
    excelColumns: ["allottedcat", "allotted category"],
    showForProgrammes: ["UG", "PG"],
  },
  pwd: {
    label: "PWD (Person with Disability)",
    placeholder: "Select PWD status",
    required: true,
    type: "select",
    backendField: "pwd",
    options: [
      { value: "YES", label: "Yes" },
      { value: "NO", label: "No" },
    ],
    excelColumns: ["pwd", "disability", "person with disability"],
  },

  branch: {
    label: "Discipline",
    placeholder: "Select discipline",
    required: true,
    type: "select",
    backendField: "branch",
    options: [
      {
        value: "Computer Science and Engineering",
        label: "Computer Science and Engineering",
      },
      {
        value: "Electronics and Communication Engineering",
        label: "Electronics and Communication Engineering",
      },
      { value: "Mechanical Engineering", label: "Mechanical Engineering" },
      { value: "Design", label: "Design" },
      {
        value: "Natural Sciences-Mathematics",
        label: "Natural Sciences-Mathematics",
      },
      { value: "Natural Sciences-Physics", label: "Natural Sciences-Physics" },
      { value: "Humanities - English", label: "Humanities - English" },
      { value: "Smart Manufacturing", label: "Smart Manufacturing" },
    ],
    excelColumns: [
      "discipline",
      "branch",
      "brtd",
      "brnm",
      "brcd",
      "department",
    ],
  },

  address: {
    label: "Address",
    placeholder:
      "Enter complete address with pincode (e.g., House No., Street, City, State - Pincode)",
    required: true,
    type: "textarea",
    backendField: "address",
    excelColumns: [
      "full address (with pincode)",
      "full address",
      "address",
      "permanent address",
      "home address",
    ],
  },

  phoneNumber: {
    label: "Phone Number",
    placeholder: "Enter 10-digit phone number",
    required: false,
    backendField: "phone_number",
    excelColumns: [
      "mobileno",
      "phone",
      "mobile",
      "contact number",
      "phone number",
      "mobile no",
    ],
  },

  dob: {
    label: "Date of Birth",
    placeholder: "Select date of birth",
    required: false,
    type: "date",
    backendField: "date_of_birth",
    excelColumns: [
      "date of birth",
      "dob",
      "birth date",
      "Date of Birth",
      "DOB",
      "date_of_birth",
      "dateOfBirth",
    ],
  },
  jeeRank: {
    label: "AI Rank",
    placeholder: "Enter AI rank (numeric value)",
    required: false,
    type: "number",
    backendField: "ai_rank",
    excelColumns: [
      "ai rank",
      "jee rank",
      "jee main rank",
      "rank",
      "AI Rank",
      "AI rank",
      "ai_rank",
      "aiRank",
      "JEE Rank",
    ],
    showForProgrammes: ["UG", "PG"],
  },
  categoryRank: {
    label: "Category Rank",
    placeholder: "Enter category rank (numeric value)",
    required: false,
    type: "number",
    backendField: "category_rank",
    excelColumns: ["category rank", "cat rank"],
    showForProgrammes: ["UG", "PG"],
  },

  fatherOccupation: {
    label: "Father's Occupation",
    placeholder: "Enter father's occupation",
    required: false,
    backendField: "father_occupation",
    excelColumns: ["father's occupation", "father occupation"],
  },
  fatherMobile: {
    label: "Father's Mobile",
    placeholder: "Enter 10-digit mobile number",
    required: false,
    backendField: "father_mobile",
    excelColumns: ["father mobile number", "father mobile", "father phone"],
  },
  motherOccupation: {
    label: "Mother's Occupation",
    placeholder: "Enter mother's occupation",
    required: false,
    backendField: "mother_occupation",
    excelColumns: ["mother's occupation", "mother occupation"],
  },
  motherMobile: {
    label: "Mother's Mobile",
    placeholder: "Enter 10-digit mobile number",
    required: false,
    backendField: "mother_mobile",
    excelColumns: ["mother mobile number", "mother mobile", "mother phone"],
  },
  state: {
    label: "State",
    placeholder: "Select state",
    required: false,
    type: "select",
    backendField: "state",
    excelColumns: ["state", "state name"],
    options: [
      { value: "Andhra Pradesh", label: "Andhra Pradesh" },
      { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
      { value: "Assam", label: "Assam" },
      { value: "Bihar", label: "Bihar" },
      { value: "Chhattisgarh", label: "Chhattisgarh" },
      { value: "Goa", label: "Goa" },
      { value: "Gujarat", label: "Gujarat" },
      { value: "Haryana", label: "Haryana" },
      { value: "Himachal Pradesh", label: "Himachal Pradesh" },
      { value: "Jharkhand", label: "Jharkhand" },
      { value: "Karnataka", label: "Karnataka" },
      { value: "Kerala", label: "Kerala" },
      { value: "Madhya Pradesh", label: "Madhya Pradesh" },
      { value: "Maharashtra", label: "Maharashtra" },
      { value: "Manipur", label: "Manipur" },
      { value: "Meghalaya", label: "Meghalaya" },
      { value: "Mizoram", label: "Mizoram" },
      { value: "Nagaland", label: "Nagaland" },
      { value: "Odisha", label: "Odisha" },
      { value: "Punjab", label: "Punjab" },
      { value: "Rajasthan", label: "Rajasthan" },
      { value: "Sikkim", label: "Sikkim" },
      { value: "Tamil Nadu", label: "Tamil Nadu" },
      { value: "Telangana", label: "Telangana" },
      { value: "Tripura", label: "Tripura" },
      { value: "Uttar Pradesh", label: "Uttar Pradesh" },
      { value: "Uttarakhand", label: "Uttarakhand" },
      { value: "West Bengal", label: "West Bengal" },
      {
        value: "Andaman and Nicobar Islands",
        label: "Andaman and Nicobar Islands",
      },
      { value: "Chandigarh", label: "Chandigarh" },
      {
        value: "Dadra and Nagar Haveli and Daman and Diu",
        label: "Dadra and Nagar Haveli and Daman and Diu",
      },
      { value: "Lakshadweep", label: "Lakshadweep" },
      { value: "Delhi", label: "Delhi" },
      { value: "Puducherry", label: "Puducherry" },
      { value: "Ladakh", label: "Ladakh" },
      { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
    ],
  },
  rollNumber: {
    label: "Institute Roll Number",
    placeholder: "Enter institute roll number",
    required: false,
    backendField: "roll_number",
    excelColumns: [
      "institute roll number",
      "roll number",
      "rollno",
      "Institute Roll Number",
      "Roll Number",
      "roll_number",
      "rollNumber",
    ],
  },
  instituteEmail: {
    label: "Institute Email ID",
    placeholder: "Enter valid email (e.g., name@institution.ac.in)",
    required: false,
    type: "email",
    backendField: "institute_email",
    excelColumns: [
      "institute email id",
      "institute email",
      "official email",
      "Institute Email ID",
      "Institute Email",
      "institute_email",
      "instituteEmail",
    ],
  },
  alternateEmail: {
    label: "Alternate Email",
    placeholder: "Enter valid personal email (e.g., name@gmail.com)",
    required: false,
    type: "email",
    backendField: "personal_email",
    excelColumns: [
      "Alternate Email ID",
      "alternate email id",
      "alternate email",
      "Alternate Email",
      "student alternate email",
    ],
  },
  parentEmail: {
    label: "Parent's Email",
    placeholder: "Enter valid parent email (e.g., parent@gmail.com)",
    required: false,
    type: "email",
    backendField: "parent_email",
    excelColumns: [
      "Parent Email",
      "parent email",
      "parent's email",
      "guardian email",
      "Parent's Email",
      "parent_email",
      "parentEmail",
    ],
  },
  bloodGroup: {
    label: "Blood Group",
    placeholder: "Select blood group",
    required: false,
    type: "select",
    backendField: "blood_group",
    options: [
      { value: "A+", label: "A+" },
      { value: "A-", label: "A-" },
      { value: "B+", label: "B+" },
      { value: "B-", label: "B-" },
      { value: "AB+", label: "AB+" },
      { value: "AB-", label: "AB-" },
      { value: "O+", label: "O+" },
      { value: "O-", label: "O-" },
      { value: "Other", label: "Other" },
    ],
    excelColumns: ["Blood Group", "blood group", "blood_group", "bloodGroup"],
  },
  bloodGroupRemarks: {
    label: "Blood Group Remarks",
    placeholder: "Enter blood group details",
    required: false,
    type: "text",
    backendField: "blood_group_remarks",
    excelColumns: [
      "blood group remarks",
      "blood_group_remarks",
      "bloodGroupRemarks",
    ],
  },
  country: {
    label: "Country",
    placeholder: "Enter country",
    required: false,
    backendField: "country",
    excelColumns: ["Country", "country", "nation", "Nation", "COUNTRY"],
  },
  nationality: {
    label: "Nationality",
    placeholder: "Enter nationality",
    required: false,
    backendField: "nationality",
    excelColumns: [
      "Nationality",
      "nationality",
      "NATIONALITY",
      "Citizen",
      "citizenship",
    ],
  },
  admissionMode: {
    label: "Admission Mode",
    placeholder: "Select admission mode",
    required: false,
    type: "select",
    showForProgrammes: ["UG", "PG"],
    backendField: "admission_mode",
    options: [
      {
        value: "Direct Institute advertisement",
        label: "Direct Institute advertisement",
      },
      { value: "CCMT Counselling", label: "CCMT Counselling" },
      { value: "JoSAA/CSAB Counselling", label: "JoSAA/CSAB Counselling" },
      { value: "UCEED Counselling", label: "UCEED Counselling" },
      {
        value: "Study In India (SII) Counselling",
        label: "Study In India (SII) Counselling",
      },
      { value: "DASA Counselling", label: "DASA Counselling" },
      { value: "Any other (remarks)", label: "Any other (remarks)" },
    ],
    excelColumns: [
      "Admission Mode",
      "admission mode",
      "admission_mode",
      "admissionMode",
    ],
  },
  admissionModeRemarks: {
    label: "Admission Mode Remarks",
    placeholder: "Enter admission mode remarks",
    required: false,
    showForProgrammes: ["UG", "PG"],
    backendField: "admission_mode_remarks",
    excelColumns: [
      "Admission Mode Remarks",
      "admission mode remarks",
      "admission_mode_remarks",
      "admissionModeRemarks",
    ],
  },
  pwdCategory: {
    label: "PwD Category",
    placeholder: "Select PwD category",
    required: false,
    type: "select",
    backendField: "pwd_category",
    options: [
      { value: "Locomotor Disability", label: "Locomotor Disability" },
      { value: "Low vision Disability", label: "Low vision Disability" },
      { value: "Deaf Disability", label: "Deaf Disability" },
      { value: "Cerebral Palsy", label: "Cerebral Palsy" },
      { value: "Dyslexia", label: "Dyslexia" },
      { value: "Amputee (Both Hand)", label: "Amputee (Both Hand)" },
      { value: "Deafness", label: "Deafness" },
      { value: "Any other (remarks)", label: "Any other (remarks)" },
    ],
    excelColumns: [
      "PwD Category",
      "pwd category",
      "pwd_category",
      "pwdCategory",
      "disability category",
    ],
  },
  pwdCategoryRemarks: {
    label: "PwD Category Remarks",
    placeholder: "Enter PwD category remarks",
    required: false,
    backendField: "pwd_category_remarks",
    excelColumns: [
      "pwd category remarks",
      "pwd_category_remarks",
      "pwdCategoryRemarks",
    ],
  },
  incomeGroup: {
    label: "Income Group",
    placeholder: "Select income group",
    required: false,
    type: "select",
    backendField: "income_group",
    options: [
      { value: "Between 0 to 2 Lakh", label: "Between 0 to 2 Lakh" },
      { value: "Between 2 to 4 Lakh", label: "Between 2 to 4 Lakh" },
      { value: "Between 4 to 6 Lakh", label: "Between 4 to 6 Lakh" },
      { value: "Between 6 to 8 Lakh", label: "Between 6 to 8 Lakh" },
      { value: "More than 8 Lakh", label: "More than 8 Lakh" },
    ],
    excelColumns: [
      "Income Group",
      "income group",
      "income_group",
      "incomeGroup",
    ],
  },
  income: {
    label: "Income",
    placeholder: "Enter annual income amount (e.g., 500000.00)",
    required: false,
    type: "number",
    backendField: "income",
    excelColumns: ["Income", "income", "annual income", "family income"],
  },
  reportedStatus: {
    label: "Status",
    placeholder: "Student reporting status",
    required: false,
    type: "select",
    backendField: "reported_status",
    systemField: true,
    options: [
      { value: "NOT_REPORTED", label: "Not Reported" },
      { value: "REPORTED", label: "Reported" },
      { value: "WITHDRAWAL", label: "Withdrawal" },
    ],
    excelColumns: ["Status", "status", "reported status", "reporting status"],
  },
  section: {
    label: "Section",
    placeholder: "Assigned in Academics > Section Assignment",
    required: false,
    backendField: "section",
    systemField: true,
    systemGenerated: true,
    excelColumns: ["Section", "section"],
  },
};

export const INITIAL_FORM_DATA = {
  // UG / PG identifier
  jeeAppNo: "",
  hindiName: "",
  aadharNo: "",
  photo: "",
  signature: "",
  // PhD identifier
  applicationNo: "",
  admissionType: "",
  gateQualified: "",
  gateStream: "",
  gateRank: "",
  specialization: "",
  name: "",
  fname: "",
  mname: "",
  gender: "",
  category: "",
  minority: "",
  pwd: "NO",
  branch: "",
  address: "",

  phoneNumber: "",
  alternateEmail: "",
  dob: "",
  jeeRank: "",
  categoryRank: "",

  allottedGender: "",
  allottedCategory: "",
  fatherOccupation: "",
  fatherMobile: "",
  motherOccupation: "",
  motherMobile: "",
  state: "",
  rollNumber: "",
  instituteEmail: "",
  parentEmail: "",
  bloodGroup: "",
  bloodGroupRemarks: "",
  country: "",
  nationality: "",
  admissionMode: "",
  admissionModeRemarks: "",
  pwdCategory: "",
  pwdCategoryRemarks: "",
  incomeGroup: "",
  income: "",
};

export const BRANCH_MAPPINGS = {
  "computer science and engineering": [
    "CSE",
    "Computer Science and Engineering",
    "Computer Science",
    "CS",
  ],
  cse: ["CSE", "Computer Science and Engineering", "Computer Science", "CS"],
  "electronics and communication engineering": [
    "ECE",
    "Electronics and Communication Engineering",
    "Electronics",
    "EC",
  ],
  ece: [
    "ECE",
    "Electronics and Communication Engineering",
    "Electronics",
    "EC",
  ],
  "mechanical engineering": [
    "ME",
    "Mechanical Engineering",
    "Mechanical",
    "Mech",
  ],
  me: ["ME", "Mechanical Engineering", "Mechanical", "Mech"],
  "smart manufacturing": ["SM", "Smart Manufacturing"],
  sm: ["SM", "Smart Manufacturing"],
  design: ["Design", "Des.", "DES", "Des"],
  des: ["Design", "Des.", "DES", "Des"],
};

export const STUDENT_TABLE_COLUMNS = [
  {
    key: "jeeAppNo",
    label: "Application No.",
    minWidth: "140px",
    fields: [
      "jeeAppNo",
      "jee_app_no",
      "Jee Main Application Number",
      "applicationNo",
      "application_no",
      "Application No.",
    ],
  },
  {
    key: "aadharNo",
    label: "Aadhaar No.",
    minWidth: "140px",
    fields: ["aadharNo", "aadhar_number", "aadharNumber", "Aadhaar No."],
  },
  {
    key: "rollNumber",
    label: "Roll Number",
    minWidth: "120px",
    fields: ["rollNumber", "roll_number", "Institute Roll Number"],
  },
  { key: "name", label: "Name", minWidth: "180px", fields: ["name", "Name"] },
  {
    key: "hindiName",
    label: "Name (Hindi)",
    minWidth: "180px",
    fields: ["hindiName", "hindi_name", "Name (Hindi)"],
  },
  {
    key: "branch",
    label: "Discipline",
    minWidth: "200px",
    fields: ["discipline", "branch", "Discipline"],
  },
  {
    key: "section",
    label: "Section",
    minWidth: "80px",
    fields: ["section", "Section"],
  },
  {
    key: "specialization",
    label: "Specialization",
    minWidth: "180px",
    fields: ["specialization", "Specialization"],
  },
  {
    key: "gateQualified",
    label: "GATE Qualified",
    minWidth: "120px",
    fields: [
      "gateQualified",
      "gate_qualified",
      "GATE Qualaified",
      "GATE Qualified",
    ],
  },

  {
    key: "gender",
    label: "Gender",
    minWidth: "80px",
    fields: ["gender", "Gender"],
  },
  {
    key: "photo",
    label: "Photo",
    minWidth: "80px",
    type: "image",
    fields: ["photo"],
  },
  {
    key: "signature",
    label: "Signature",
    minWidth: "100px",
    type: "image",
    fields: ["signature"],
  },
  {
    key: "category",
    label: "Category",
    minWidth: "90px",
    fields: ["category", "Category"],
  },
  {
    key: "allottedCategory",
    label: "Allotted Cat",
    minWidth: "100px",
    fields: ["allottedcat", "allotted_category", "Allotted Category"],
  },
  {
    key: "allottedGender",
    label: "Allotted Gender",
    minWidth: "120px",
    fields: ["allotted_gender", "Allotted Gender"],
  },
  {
    key: "minority",
    label: "Minority",
    minWidth: "90px",
    fields: ["minority", "Minority"],
  },
  { key: "pwd", label: "PwD", minWidth: "60px", fields: ["pwd", "PWD"] },
  {
    key: "pwdCategory",
    label: "PwD Category",
    minWidth: "120px",
    fields: ["pwdCategory", "pwd_category", "PwD Category"],
  },
  {
    key: "pwdCategoryRemarks",
    label: "PwD Category Remarks",
    minWidth: "150px",
    fields: [
      "pwdCategoryRemarks",
      "pwd_category_remarks",
      "PwD Category Remarks",
    ],
  },
  {
    key: "phoneNumber",
    label: "Mobile",
    minWidth: "120px",
    fields: ["phoneNumber", "phone_number", "mobile", "Mobile No"],
  },
  {
    key: "instituteEmail",
    label: "Institute Email",
    minWidth: "200px",
    fields: ["instituteEmail", "institute_email", "Institute Email ID"],
  },
  {
    key: "alternateEmail",
    label: "Alternate Email",
    minWidth: "200px",
    fields: ["alternateEmail", "personal_email", "Alternate Email ID"],
  },
  {
    key: "parentEmail",
    label: "Parent Email",
    minWidth: "200px",
    fields: ["parentEmail", "parent_email", "Parent Email", "Parent's Email"],
  },
  {
    key: "fname",
    label: "Father's Name",
    minWidth: "150px",
    fields: ["fname", "father_name", "Father's Name"],
  },
  {
    key: "fatherOccupation",
    label: "Father's Job",
    minWidth: "140px",
    fields: ["fatherOccupation", "father_occupation", "Father's Occupation"],
  },
  {
    key: "fatherMobile",
    label: "Father Mobile",
    minWidth: "120px",
    fields: ["fatherMobile", "father_mobile", "Father Mobile Number"],
  },
  {
    key: "mname",
    label: "Mother's Name",
    minWidth: "150px",
    fields: ["mname", "mother_name", "Mother's Name"],
  },
  {
    key: "motherOccupation",
    label: "Mother's Job",
    minWidth: "140px",
    fields: ["motherOccupation", "mother_occupation", "Mother's Occupation"],
  },
  {
    key: "motherMobile",
    label: "Mother Mobile",
    minWidth: "120px",
    fields: ["motherMobile", "mother_mobile", "Mother Mobile Number"],
  },
  {
    key: "dob",
    label: "DOB",
    minWidth: "100px",
    fields: ["dob", "date_of_birth", "Date of Birth"],
  },
  {
    key: "bloodGroup",
    label: "Blood Group",
    minWidth: "100px",
    fields: ["bloodGroup", "blood_group", "Blood Group"],
  },
  {
    key: "bloodGroupRemarks",
    label: "Blood Group Remarks",
    minWidth: "150px",
    fields: ["bloodGroupRemarks", "blood_group_remarks", "Blood Group Remarks"],
  },
  {
    key: "country",
    label: "Country",
    minWidth: "100px",
    fields: ["country", "Country"],
  },
  {
    key: "nationality",
    label: "Nationality",
    minWidth: "100px",
    fields: ["nationality", "Nationality"],
  },
  {
    key: "admissionMode",
    label: "Admission Mode",
    minWidth: "180px",
    fields: [
      "admissionMode",
      "admission_mode",
      "Admission Mode",
      "admissionType",
      "admission_type",
      "Admission Type",
    ],
  },
  {
    key: "admissionModeRemarks",
    label: "Admission Mode Remarks",
    minWidth: "180px",
    fields: [
      "admissionModeRemarks",
      "admission_mode_remarks",
      "Admission Mode Remarks",
    ],
  },
  {
    key: "incomeGroup",
    label: "Income Group",
    minWidth: "130px",
    fields: ["incomeGroup", "income_group", "Income Group"],
  },
  {
    key: "income",
    label: "Income",
    minWidth: "100px",
    fields: ["income", "Income"],
  },
  {
    key: "jeeRank",
    label: "AI Rank",
    minWidth: "80px",
    fields: ["jeeRank", "ai_rank", "jee_rank", "AI rank"],
  },
  {
    key: "categoryRank",
    label: "Category Rank",
    minWidth: "100px",
    fields: ["categoryRank", "category_rank", "Category Rank"],
  },
  {
    key: "state",
    label: "State",
    minWidth: "80px",
    fields: ["state", "State"],
  },
  {
    key: "address",
    label: "Address",
    minWidth: "200px",
    fields: ["address", "Address", "Full Address"],
  },
];
