// import React, { useState, useEffect } from "react";
// import {
//   TextInput,
//   Button,
//   Group,
//   Select,
//   Textarea,
//   Card,
//   Title,
//   Grid,
//   ActionIcon,
//   Chip,
// } from "@mantine/core";
// import { DatePicker, TimeInput } from "@mantine/dates";
// import { Calendar } from "@phosphor-icons/react";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { notifications } from "@mantine/notifications";
// import { addPlacementEventForm } from "../../../routes/placementCellRoutes";
// import { fetchRegistrationRoute } from "../../../routes/placementCellRoutes";

// function AddPlacementEventForm() {
//   const role = useSelector((state) => state.user.role);
//   const [company, setCompany] = useState("");
//   const [date, setDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [location, setLocation] = useState("");
//   const [ctc, setCtc] = useState("");
//   const [time, setTime] = useState("");
//   const [endDateTime, setEndDateTime] = useState(""); // Separate variable for end time
//   const [placementType, setPlacementType] = useState("");
//   const [description, setDescription] = useState("");
//   const [jobrole, setRole] = useState("");
//   // const [resumeFile, setResumeFile] = useState(null);
//   const [eligibility, setEligibility] = useState([]);
//   // const [eligibilityInput, setEligibilityInput] = useState("");
//   const [datePickerOpened, setDatePickerOpened] = useState(false);
//   const [endDatePickerOpened, setEndDatePickerOpened] = useState(false);

//   // State to handle new eligibility form fields
//   const [passoutYear, setPassoutYear] = useState(-1);
//   const [gender, setGender] = useState("All");
//   const [cpi, setCpi] = useState(-1);
//   const [branch, setBranch] = useState("All");

//   const [showPassoutYearInput, setShowPassoutYearInput] = useState(false);
//   const [showGenderSelect, setShowGenderSelect] = useState(false);
//   const [showCpiInput, setShowCpiInput] = useState(false);
//   const [showBranchSelect, setShowBranchSelect] = useState(false);

//   const [selectedCompany, setSelectedCompany] = useState(null);

//   // sample dta for companies
//   const [companies] = useState([
//     {
//       id: 1,
//       companyName: "Company A",
//       description: "Description A",
//       address: "Address A",
//       website: "www.companya.com",
//     },
//     {
//       id: 2,
//       companyName: "Company B",
//       description: "Description B",
//       address: "Address B",
//       website: "www.companyb.com",
//     },
//     {
//       id: 3,
//       companyName: "Company C",
//       description: "Description C",
//       address: "Address C",
//       website: "www.companyc.com",
//     },
//   ]);

//   const getCurrentTime = () => {
//     const now = new Date();
//     return now.toLocaleTimeString("en-GB", { hour12: false });
//   };

//   useEffect(() => {
//     setTime(getCurrentTime());
//   }, []);

//   const handleSubmit = async () => {
//     console.log("Submitting form");
//     console.log("selected companiy", selectedCompany);

//     const token = localStorage.getItem("authToken");
//     if (!token) {
//       notifications.show({
//         title: "Unauthorized",
//         message: "You must log in to perform this action.",
//         color: "red",
//         position: "top-center",
//       });
//       return;
//     }

//     const formData = new FormData();
//     formData.append("placement_type", placementType);
//     // formData.append("company_name", company);
//     formData.append("ctc", ctc);
//     formData.append("description", description);
//     formData.append("title", company);
//     formData.append("location", location);
//     formData.append("role", jobrole);
//     formData.append("eligibility", eligibility.join(", "));
//     formData.append("passoutyr", passoutYear);
//     formData.append("gender", gender);
//     formData.append("cpi", cpi);
//     formData.append("branch", branch);

//     // if (resumeFile) {
//     //   formData.append("resume", resumeFile);
//     // }

//     formData.append("schedule_at", time);

//     if (date) {
//       formData.append("placement_date", date.toISOString().split("T")[0]);
//     }

//     if (endDate) {
//       formData.append("end_date", endDate.toISOString().split("T")[0]);
//     }

//     if (endDateTime) {
//       formData.append("end_datetime", endDateTime);
//     }

//     if (endDate) {
//       formData.append("end_date", endDate.toISOString().split("T")[0]);
//     }

//     if (endDateTime) {
//       formData.append("end_datetime", endDateTime);
//     }

//     try {
//       const response = await axios.post(addPlacementEventForm, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Token ${token}`,
//         },
//       });
//       // alert(response.data.message);
//       // Notification for success
//       notifications.show({
//         title: "Event Added",
//         message: "Placement Event has been added successfully.",
//         color: "green",
//         position: "top-center",
//       });
//     } catch (error) {
//       const errorMessage = error.response?.data?.error || error.message;
//       notifications.show({
//         title: "Error",
//         message: `Failed to add Placement Event: ${errorMessage}`,
//         color: "red",
//         position: "top-center",
//       });
//       console.error(
//         "Error adding schedule:",
//         error.response?.data?.error || error.message,
//       );
//     }
//   };

//   // const handleAddEligibility = () => {
//   //   if (eligibilityInput.trim()) {
//   //     setEligibility([...eligibility, eligibilityInput.trim()]);
//   //     setEligibilityInput("");
//   //   }
//   // };

//   return (
//     <Card style={{ maxWidth: "800px", margin: "0 auto" }}>
//       <Title order={3} align="center" style={{ marginBottom: "20px" }}>
//         Add Placement Event
//       </Title>

//       <Grid gutter="lg">
//         {/* <Grid.Col span={4}>
//           <TextInput
//             label="Company Name"
//             placeholder="Enter company name"
//             value={company}
//             onChange={(e) => setCompany(e.target.value)}
//           />
//         </Grid.Col> */}
//         <Grid.Col span={4} style={{ position: "relative" }}>
//           <Select
//             label="Select Company"
//             placeholder="Select a company"
//             data={companies.map((company) => company.companyName)}
//             value={selectedCompany}
//             onChange={setSelectedCompany}
//             required
//           />
//         </Grid.Col>

//         {/* Date of Drive */}
//         <Grid.Col span={4} style={{ position: "relative" }}>
//           <TextInput
//             label="Date of Drive"
//             placeholder="Pick date"
//             value={date ? date.toLocaleDateString() : ""}
//             readOnly
//             rightSection={
//               <ActionIcon onClick={() => setDatePickerOpened((prev) => !prev)}>
//                 <Calendar size={16} />
//               </ActionIcon>
//             }
//           />
//           {datePickerOpened && (
//             <DatePicker
//               value={date}
//               onChange={(selectedDate) => {
//                 setDate(selectedDate);
//                 setDatePickerOpened(false);
//               }}
//               onBlur={() => setDatePickerOpened(false)}
//               style={{ zIndex: 1 }}
//             />
//           )}
//         </Grid.Col>

//         {/* End Date */}
//         <Grid.Col span={4} style={{ position: "relative" }}>
//           <TextInput
//             label="End Date"
//             placeholder="Pick end date"
//             value={endDate ? endDate.toLocaleDateString() : ""}
//             readOnly
//             rightSection={
//               <ActionIcon
//                 onClick={() => setEndDatePickerOpened((prev) => !prev)}
//               >
//                 <Calendar size={16} />
//               </ActionIcon>
//             }
//           />
//           {endDatePickerOpened && (
//             <DatePicker
//               value={endDate}
//               onChange={(selectedDate) => {
//                 setEndDate(selectedDate);
//                 setEndDatePickerOpened(false);
//               }}
//               onBlur={() => setEndDatePickerOpened(false)}
//               style={{ zIndex: 1 }}
//             />
//           )}
//         </Grid.Col>

//         {/* Location */}
//         <Grid.Col span={4}>
//           <TextInput
//             label="Location"
//             placeholder="Enter location"
//             value={location}
//             onChange={(e) => setLocation(e.target.value)}
//           />
//         </Grid.Col>

//         {/* CTC */}
//         <Grid.Col span={4}>
//           <TextInput
//             label="CTC In Lpa"
//             placeholder="Enter CTC"
//             value={ctc}
//             onChange={(e) => setCtc(e.target.value)}
//           />
//         </Grid.Col>

//         {/* Start Time */}
//         <Grid.Col span={4}>
//           <TimeInput
//             label="Start Time"
//             placeholder="Select time"
//             value={time ? new Date(`1970-01-01T${time}:00`) : null}
//             onChange={(value) => {
//               if (value instanceof Date && !Number.isNaN(value)) {
//                 setTime(value.toTimeString().slice(0, 5));
//               }
//             }}
//             format="24"
//           />
//         </Grid.Col>

//         {/* End Time */}
//         <Grid.Col span={4}>
//           <TimeInput
//             label="End Time"
//             placeholder="Select end time"
//             value={
//               endDateTime ? new Date(`1970-01-01T${endDateTime}:00`) : null
//             }
//             onChange={(value) => {
//               if (value instanceof Date && !Number.isNaN(value)) {
//                 setEndDateTime(value.toTimeString().slice(0, 5)); // Store as HH:mm
//               }
//             }}
//             format="24"
//           />
//         </Grid.Col>

//         {/* Placement Type */}
//         <Grid.Col span={4}>
//           <Select
//             label="Placement Type"
//             placeholder="Select placement type"
//             data={["Placement", "Internship"]}
//             value={placementType}
//             onChange={setPlacementType}
//           />
//         </Grid.Col>

//         {/* Description */}
//         <Grid.Col span={12}>
//           <Textarea
//             label="Description"
//             placeholder="Enter a description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             minRows={3}
//           />
//         </Grid.Col>

//         {/* Role Offered */}
//         <Grid.Col span={12}>
//           <TextInput
//             label="Role Offered"
//             placeholder="Enter the role offered"
//             value={jobrole}
//             onChange={(e) => setRole(e.target.value)}
//           />
//         </Grid.Col>

//         {/* Eligibility Criteria */}
//         <Grid.Col span={12}>
//           <b>Eligibility Criteria</b>
//           {/* <TextInput
//             //label="Eligibility Criteria"
//             // placeholder="Enter eligibility criteria"
//             // value={eligibilityInput}
//             // onChange={(e) => setEligibilityInput(e.target.value)}
//             // onKeyDown={(e) => {
//             //   if (e.key === "Enter") {
//             //     e.preventDefault();
//             //     handleAddEligibility();
//             //   }
//             // }}
//           /> */}
//           <Chip.Group
//             multiple
//             value={eligibility}
//             onChange={setEligibility}
//             style={{ marginTop: "10px" }}
//           >
//             {eligibility.map((criteria, index) => (
//               <Chip key={index} value={criteria}>
//                 {criteria}
//               </Chip>
//             ))}
//           </Chip.Group>
//         </Grid.Col>

//         {/* Eligibility Buttons */}
//         <Grid.Col span={12}>
//           <Group direction="column" spacing="xs">
//             <Button
//               onClick={() => setShowPassoutYearInput(!showPassoutYearInput)}
//             >
//               Passout Year
//             </Button>
//             {showPassoutYearInput && (
//               <TextInput
//                 placeholder="Enter Passout Year"
//                 value={passoutYear}
//                 onChange={(e) => setPassoutYear(e.target.value)}
//               />
//             )}

//             <Button onClick={() => setShowGenderSelect(!showGenderSelect)}>
//               Gender
//             </Button>
//             {showGenderSelect && (
//               <Select
//                 value={gender}
//                 onChange={setGender}
//                 data={["Male", "Female"]}
//                 placeholder="Select Gender"
//               />
//             )}

//             <Button onClick={() => setShowCpiInput(!showCpiInput)}>CPI</Button>
//             {showCpiInput && (
//               <TextInput
//                 placeholder="Enter CPI"
//                 value={cpi}
//                 onChange={(e) => setCpi(e.target.value)}
//               />
//             )}

//             <Button onClick={() => setShowBranchSelect(!showBranchSelect)}>
//               Branch
//             </Button>
//             {showBranchSelect && (
//               <Select
//                 value={branch}
//                 onChange={setBranch}
//                 data={["CSE", "ECE", "MECH", "SM", "BDES"]}
//                 placeholder="Select Branch"
//               />
//             )}
//           </Group>
//         </Grid.Col>

//         <Grid.Col span={12}>
//           <Button onClick={handleSubmit} fullWidth>
//             Submit
//           </Button>
//         </Grid.Col>
//       </Grid>
//     </Card>
//   );
// }

// export default AddPlacementEventForm;

import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Group,
  Select,
  Textarea,
  Card,
  Title,
  Grid,
  ActionIcon,
  Chip,
  MultiSelect,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";
import { Calendar } from "@phosphor-icons/react";
import axios from "axios";
import { useSelector } from "react-redux";
import { notifications } from "@mantine/notifications";
import { addPlacementEventForm } from "../../../routes/placementCellRoutes";
import { fetchRegistrationRoute } from "../../../routes/placementCellRoutes";

function AddPlacementEventForm() {
  const role = useSelector((state) => state.user.role);
  const [company, setCompany] = useState("");
  const [date, setDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [location, setLocation] = useState("");
  const [ctc, setCtc] = useState("");
  const [time, setTime] = useState("");
  const [endDateTime, setEndDateTime] = useState(""); // Separate variable for end time
  const [placementType, setPlacementType] = useState("");
  const [description, setDescription] = useState("");
  const [jobrole, setRole] = useState("");
  const [eligibility, setEligibility] = useState([]);
  const [datePickerOpened, setDatePickerOpened] = useState(false);
  const [endDatePickerOpened, setEndDatePickerOpened] = useState(false);

  // State to handle new eligibility form fields
  const [passoutYear, setPassoutYear] = useState(-1);
  const [gender, setGender] = useState("All");
  const [cpi, setCpi] = useState(-1);
  const [branch, setBranch] = useState("All");

  const [showPassoutYearInput, setShowPassoutYearInput] = useState(false);
  const [showGenderSelect, setShowGenderSelect] = useState(false);
  const [showCpiInput, setShowCpiInput] = useState(false);
  const [showBranchSelect, setShowBranchSelect] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState(null);

  // sample dta for companies
  const [companies, setCompanies] = useState([]);

  // sample data for fields created by TPO
  const [tpoFields] = useState([
    { value: "field1", label: "Field 1" },
    { value: "field2", label: "Field 2" },
    { value: "field3", label: "Field 3" },
    { value: "Jee Mains Rank", label: "Jee Mains Rank" },
    { value: "Country of Residence", label: "Country of Residence" },
  ]);

  const [selectedFields, setSelectedFields] = useState([]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-GB", { hour12: false });
  };

  const getCompanyId = (companyName) => {
    const company = companies.find(c => c.companyName === companyName);
    return company ? company.id : null; 
  };
  
  useEffect(() => {
      const fetchRegistrationData = async () => {
        try {
          const token = localStorage.getItem("authToken");
          const response = await axios.get(fetchRegistrationRoute, {
            headers: { Authorization: `Token ${token}` },
          });
    
          if (response.status !== 200) {
            notifications.show({
              title: "Error fetching data",
              message: `Error fetching data: ${response.status}`,
              color: "red",
            });
          }
          else{
            const uniqueCompanies = [];
          const companyNames = new Set();

          response.data.forEach((comp) => {
            if (!companyNames.has(comp.companyName)) {
              companyNames.add(comp.companyName);
              uniqueCompanies.push(comp);
            }
          });

          setCompanies(uniqueCompanies);
          }
    
        } catch (error) {
          notifications.show({
            title: "Failed to fetch data",
            message: "Failed to fetch companies list",
            color: "red",
          });
          console.error(error);
        }
      };
      fetchRegistrationData();
    }, []);


  useEffect(() => {
    setTime(getCurrentTime());
  }, []);

  const handleSubmit = async () => {
    console.log("Submitting form");
    console.log("selected company", selectedCompany);

    const token = localStorage.getItem("authToken");
    if (!token) {
      notifications.show({
        title: "Unauthorized",
        message: "You must log in to perform this action.",
        color: "red",
        position: "top-center",
      });
      return;
    }
    // console.log(companies);
    const companyId = getCompanyId(selectedCompany);
    // console.log(companyId);
    const formData = new FormData();
    formData.append("placement_type", placementType);
    formData.append("company_name", selectedCompany);
    formData.append("company_id",companyId);
    formData.append("ctc", ctc);
    formData.append("description", description);
    formData.append("title", company);
    formData.append("location", location);
    formData.append("role", jobrole);
    formData.append("eligibility", eligibility.join(", "));
    formData.append("passoutyr", passoutYear);
    formData.append("gender", gender);
    formData.append("cpi", cpi);
    formData.append("branch", branch);
    formData.append("schedule_at", time);

    if (date) {
      formData.append("placement_date", date.toISOString().split("T")[0]);
    }

    if (endDate) {
      formData.append("end_date", endDate.toISOString().split("T")[0]);
    }

    if (endDateTime) {
      formData.append("end_datetime", endDateTime);
    }

    formData.append("selected_fields", selectedFields.join(", "));

    try {
      const response = await axios.post(addPlacementEventForm, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Token ${token}`,
        },
      });
      notifications.show({
        title: "Event Added",
        message: "Placement Event has been added successfully.",
        color: "green",
        position: "top-center",
      });
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message;
      notifications.show({
        title: "Error",
        message: `Failed to add Placement Event: ${errorMessage}`,
        color: "red",
        position: "top-center",
      });
      console.error(
        "Error adding schedule:",
        error.response?.data?.error || error.message,
      );
    }
  };

  return (
    <Card style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Title order={3} align="center" style={{ marginBottom: "20px" }}>
        Add Placement Event
      </Title>

      <Grid gutter="lg">
        <Grid.Col span={4} style={{ position: "relative" }}>
          <Select
            label="Select Company"
            placeholder="Select a company"
            data={companies.map((company) => company.companyName)}
            value={selectedCompany}
            onChange={setSelectedCompany}
            required
          />
        </Grid.Col>

        <Grid.Col span={4} style={{ position: "relative" }}>
          <TextInput
            label="Date of Drive"
            placeholder="Pick date"
            value={date ? date.toLocaleDateString() : ""}
            readOnly
            rightSection={
              <ActionIcon onClick={() => setDatePickerOpened((prev) => !prev)}>
                <Calendar size={16} />
              </ActionIcon>
            }
          />
          {datePickerOpened && (
            <DatePicker
              value={date}
              onChange={(selectedDate) => {
                setDate(selectedDate);
                setDatePickerOpened(false);
              }}
              onBlur={() => setDatePickerOpened(false)}
              style={{ zIndex: 1 }}
            />
          )}
        </Grid.Col>

        <Grid.Col span={4} style={{ position: "relative" }}>
          <TextInput
            label="End Date"
            placeholder="Pick end date"
            value={endDate ? endDate.toLocaleDateString() : ""}
            readOnly
            rightSection={
              <ActionIcon
                onClick={() => setEndDatePickerOpened((prev) => !prev)}
              >
                <Calendar size={16} />
              </ActionIcon>
            }
          />
          {endDatePickerOpened && (
            <DatePicker
              value={endDate}
              onChange={(selectedDate) => {
                setEndDate(selectedDate);
                setEndDatePickerOpened(false);
              }}
              onBlur={() => setEndDatePickerOpened(false)}
              style={{ zIndex: 1 }}
            />
          )}
        </Grid.Col>

        <Grid.Col span={4}>
          <TextInput
            label="Location"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Grid.Col>

        <Grid.Col span={4}>
          <TextInput
            label="CTC In Lpa"
            placeholder="Enter CTC"
            value={ctc}
            onChange={(e) => setCtc(e.target.value)}
          />
        </Grid.Col>

        <Grid.Col span={4}>
          <TimeInput
            label="Start Time"
            placeholder="Select time"
            value={time ? new Date(`1970-01-01T${time}:00`) : null}
            onChange={(value) => {
              if (value instanceof Date && !Number.isNaN(value)) {
                setTime(value.toTimeString().slice(0, 5));
              }
            }}
            format="24"
          />
        </Grid.Col>

        <Grid.Col span={4}>
          <TimeInput
            label="End Time"
            placeholder="Select end time"
            value={
              endDateTime ? new Date(`1970-01-01T${endDateTime}:00`) : null
            }
            onChange={(value) => {
              if (value instanceof Date && !Number.isNaN(value)) {
                setEndDateTime(value.toTimeString().slice(0, 5)); // Store as HH:mm
              }
            }}
            format="24"
          />
        </Grid.Col>

        <Grid.Col span={4}>
          <Select
            label="Placement Type"
            placeholder="Select placement type"
            data={["Placement", "Internship"]}
            value={placementType}
            onChange={setPlacementType}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Description"
            placeholder="Enter a description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minRows={3}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <TextInput
            label="Role Offered"
            placeholder="Enter the role offered"
            value={jobrole}
            onChange={(e) => setRole(e.target.value)}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <b>Eligibility Criteria</b>
          <Chip.Group
            multiple
            value={eligibility}
            onChange={setEligibility}
            style={{ marginTop: "10px" }}
          >
            {eligibility.map((criteria, index) => (
              <Chip key={index} value={criteria}>
                {criteria}
              </Chip>
            ))}
          </Chip.Group>
        </Grid.Col>

        <Grid.Col span={12}>
          <Group direction="column" spacing="xs">
            <Button
              onClick={() => setShowPassoutYearInput(!showPassoutYearInput)}
            >
              Passout Year
            </Button>
            {showPassoutYearInput && (
              <TextInput
                placeholder="Enter Passout Year"
                value={passoutYear}
                onChange={(e) => setPassoutYear(e.target.value)}
              />
            )}

            <Button onClick={() => setShowGenderSelect(!showGenderSelect)}>
              Gender
            </Button>
            {showGenderSelect && (
              <Select
                value={gender}
                onChange={setGender}
                data={["Male", "Female"]}
                placeholder="Select Gender"
              />
            )}

            <Button onClick={() => setShowCpiInput(!showCpiInput)}>CPI</Button>
            {showCpiInput && (
              <TextInput
                placeholder="Enter CPI"
                value={cpi}
                onChange={(e) => setCpi(e.target.value)}
              />
            )}

            <Button onClick={() => setShowBranchSelect(!showBranchSelect)}>
              Branch
            </Button>
            {showBranchSelect && (
              <Select
                value={branch}
                onChange={setBranch}
                data={["CSE", "ECE", "MECH", "SM", "BDES"]}
                placeholder="Select Branch"
              />
            )}
          </Group>
        </Grid.Col>

        <Grid.Col span={12}>
          <MultiSelect
            label="Select Fields"
            placeholder="Select fields"
            data={tpoFields}
            value={selectedFields}
            onChange={setSelectedFields}
            searchable
            clearable
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Button onClick={handleSubmit} fullWidth>
            Submit
          </Button>
        </Grid.Col>
      </Grid>
    </Card>
  );
}

export default AddPlacementEventForm;
