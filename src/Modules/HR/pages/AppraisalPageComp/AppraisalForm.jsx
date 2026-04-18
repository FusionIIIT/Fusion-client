import React, { useState, useEffect } from "react";
import { Button } from "@mantine/core";
import {
  PaperPlaneRight,
  CheckCircle,
  User,
  Tag,
  ClipboardText,
} from "@phosphor-icons/react";
import { submitAppraisalForm } from "../../services/api";
import { get_my_details, search_employee } from "../../../../routes/hr";
import classes from "../../styles/AppraisalForm.module.css";

function AppraisalForm() {
  // ── form field state ──
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    disciplineInfo: "",
    specificFieldOfKnowledge: "",
    currentResearchInterests: "",
    newCoursesIntroduced: "",
    newCoursesDeveloped: "",
    otherInstructionalTasks: "",
    otherResearchElement: "",
    publication: "",
    referredConference: "",
    conferenceOrganised: "",
    membership: "",
    honours: "",
    editorOfPublications: "",
    expertLectureDelivered: "",
    membershipOfBOS: "",
    otherExtensionTasks: "",
    administrativeAssignment: "",
    serviceToInstitute: "",
    otherContribution: "",
    performanceComments: "",
  });

  // ── dynamic rows for "Courses taught" table ──
  const [rows, setRows] = useState([
    {
      semester: "",
      courseNameNumber: "",
      lectureHrs: "",
      tutorialHrs: "",
      labHrs: "",
      registeredStudents: "",
      coInstructor: "",
    },
  ]);

  // ── receiver / footer ──
  const [receiverUsername, setReceiverUsername] = useState("");
  const [receiverDesignation, setReceiverDesignation] = useState("");
  const [verifiedReceiver, setVerifiedReceiver] = useState(false);

  // ── autofill logged-in user ──
  useEffect(() => {
    const fetchMyDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const response = await fetch(get_my_details, {
          headers: { Authorization: `Token ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setFormData((prev) => ({
            ...prev,
            name: data.username || "",
            designation: data.designation || "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };
    fetchMyDetails();
  }, []);

  // ── handlers ──
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRowChange = (index, e) => {
    const newRows = [...rows];
    newRows[index][e.target.name] = e.target.value;
    setRows(newRows);
  };

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        semester: "",
        courseNameNumber: "",
        lectureHrs: "",
        tutorialHrs: "",
        labHrs: "",
        registeredStudents: "",
        coInstructor: "",
      },
    ]);
  };

  const handleCheck = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      if (!receiverUsername) {
        alert("Please enter a receiver username first.");
        return;
      }
      const response = await fetch(
        `${search_employee}?search=${receiverUsername}`,
        { headers: { Authorization: `Token ${token}` } },
      );
      if (!response.ok) {
        alert("Receiver not found. Please check the username and try again.");
        return;
      }
      const data = await response.json();
      setReceiverDesignation(data.designation || "");
      setVerifiedReceiver(true);
      alert("Receiver verified successfully!");
    } catch (error) {
      console.error("Failed to fetch receiver data:", error);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!verifiedReceiver) {
      alert("Please verify the receiver's designation before submitting.");
      return;
    }

    // Build the payload the backend expects: [form_data, user_info]
    const payload = [
      {
        ...formData,
        coursesTaught: rows,
      },
      {
        uploader_name: formData.name,
        uploader_designation: formData.designation,
        receiver_name: receiverUsername,
        receiver_designation: receiverDesignation,
      },
    ];

    try {
      const result = await submitAppraisalForm(payload);
      console.log("Appraisal form submitted successfully:", result);
      alert("Appraisal form submitted successfully!");
      setVerifiedReceiver(false);
    } catch (error) {
      console.error("Error submitting appraisal form:", error);
      alert("Failed to submit form: " + error.message);
    }
  };

  return (
    <div className={classes.AppraisalForm_container}>
      <form onSubmit={handleSubmit}>
        {/* Section 1: Name, Designation, Discipline */}
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="name">
              Name
              <div className="input-wrapper">
                <User size={20} />
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleFieldChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="designation">
              Designation
              <div className="input-wrapper">
                <Tag size={20} />
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  placeholder="Designation"
                  value={formData.designation}
                  onChange={handleFieldChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="disciplineInfo">
              Discipline
              <div className="input-wrapper">
                <Tag size={20} />
                <input
                  type="text"
                  id="disciplineInfo"
                  name="disciplineInfo"
                  placeholder="Discipline"
                  value={formData.disciplineInfo}
                  onChange={handleFieldChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>
        {/* Section 2: Specific field of knowledge, Current Research Interests */}
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="specificFieldOfKnowledge">
              Specific field of knowledge
              <div className="input-wrapper">
                <ClipboardText size={20} />
                <input
                  type="text"
                  id="specificFieldOfKnowledge"
                  name="specificFieldOfKnowledge"
                  placeholder="Specific field of knowledge"
                  value={formData.specificFieldOfKnowledge}
                  onChange={handleFieldChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="currentResearchInterests">
              Current Research Interests
              <div className="input-wrapper">
                <ClipboardText size={20} />
                <input
                  type="text"
                  id="currentResearchInterests"
                  name="currentResearchInterests"
                  placeholder="Current Research Interests"
                  value={formData.currentResearchInterests}
                  onChange={handleFieldChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>
        {/* Section 3: Instruction Element */}
        <div className="section-divider">
          <hr className="divider-line" />
          <h3 className="section-heading">Instruction Element</h3>
        </div>
        <div className="section-title">
          <h4 className="section-title">
            Please give information pertaining to the period of appraisal as per
            the format given below:
          </h4>
        </div>
        <div className="section-subtitle">
          <h5 className="section-subtitle">1. Teaching</h5>
        </div>
        <div className="section-subsubtitle">
          <h6 className="section-subsubtitle">
            1.1 Courses taught at UG/PG level
          </h6>
        </div>
        {rows.map((row, index) => (
          <div key={index} className="grid-row">
            <div className="grid-col">
              <label className="input-label" htmlFor={`semester_${index}`}>
                Semester
                <div className="input-wrapper">
                  <input
                    type="text"
                    id={`semester_${index}`}
                    name="semester"
                    placeholder="Semester"
                    value={row.semester}
                    onChange={(e) => handleRowChange(index, e)}
                    className="input"
                    required
                  />
                </div>
              </label>
            </div>
            <div className="grid-col">
              <label
                className="input-label"
                htmlFor={`courseNameNumber_${index}`}
              >
                Course Name and Number
                <div className="input-wrapper">
                  <input
                    type="text"
                    id={`courseNameNumber_${index}`}
                    name="courseNameNumber"
                    placeholder="Course Name and Number"
                    value={row.courseNameNumber}
                    onChange={(e) => handleRowChange(index, e)}
                    className="input"
                    required
                  />
                </div>
              </label>
            </div>
            <div className="grid-col">
              <label className="input-label" htmlFor={`lectureHrs_${index}`}>
                Lecture Hrs/wk
                <div className="input-wrapper">
                  <input
                    type="text"
                    id={`lectureHrs_${index}`}
                    name="lectureHrs"
                    placeholder="Lecture Hrs/wk"
                    value={row.lectureHrs}
                    onChange={(e) => handleRowChange(index, e)}
                    className="input"
                    required
                  />
                </div>
              </label>
            </div>
            <div className="grid-col">
              <label className="input-label" htmlFor={`tutorialHrs_${index}`}>
                Tutorial Hrs/wk
                <div className="input-wrapper">
                  <input
                    type="text"
                    id={`tutorialHrs_${index}`}
                    name="tutorialHrs"
                    placeholder="Tutorial Hrs/wk"
                    value={row.tutorialHrs}
                    onChange={(e) => handleRowChange(index, e)}
                    className="input"
                    required
                  />
                </div>
              </label>
            </div>
            <div className="grid-col">
              <label className="input-label" htmlFor={`labHrs_${index}`}>
                Lab Hrs/wk
                <div className="input-wrapper">
                  <input
                    type="text"
                    id={`labHrs_${index}`}
                    name="labHrs"
                    placeholder="Lab Hrs/wk"
                    value={row.labHrs}
                    onChange={(e) => handleRowChange(index, e)}
                    className="input"
                    required
                  />
                </div>
              </label>
            </div>
            <div className="grid-col">
              <label
                className="input-label"
                htmlFor={`registeredStudents_${index}`}
              >
                No of Registered Students
                <div className="input-wrapper">
                  <input
                    type="text"
                    id={`registeredStudents_${index}`}
                    name="registeredStudents"
                    placeholder="No of Registered Students"
                    value={row.registeredStudents}
                    onChange={(e) => handleRowChange(index, e)}
                    className="input"
                    required
                  />
                </div>
              </label>
            </div>
            <div className="grid-col">
              <label className="input-label" htmlFor={`coInstructor_${index}`}>
                Co-Instructor/ Instructor In charge (if any)
                <div className="input-wrapper">
                  <input
                    type="text"
                    id={`coInstructor_${index}`}
                    name="coInstructor"
                    placeholder="Co-Instructor/ Instructor In charge (if any)"
                    value={row.coInstructor}
                    onChange={(e) => handleRowChange(index, e)}
                    className="input"
                    required
                  />
                </div>
              </label>
            </div>
          </div>
        ))}
        <Button onClick={handleAddRow} style={{ marginTop: "20px" }}>
          Add Row
        </Button>
        <div className="section-subsubtitle">
          <h6 className="section-subsubtitle">
            1.2 New Courses/ laboratory experiments introduced and taught
          </h6>
        </div>
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="newCoursesIntroduced">
              Course Name and Number
              <div className="input-wrapper">
                <input
                  type="text"
                  id="newCoursesIntroduced"
                  name="newCoursesIntroduced"
                  placeholder="Course Name and Number"
                  value={formData.newCoursesIntroduced}
                  onChange={handleFieldChange}
                  className="input"
                />
              </div>
            </label>
          </div>
        </div>
        <div className="section-subsubtitle">
          <h6 className="section-subsubtitle">
            1.3 New course material developed/instructional software developed
            (should be made available on the web / public domain and may be
            under GIAN/NPTEL/SWAYAM etc)
          </h6>
        </div>
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="newCoursesDeveloped">
              Course Material / Software Developed
              <div className="input-wrapper">
                <input
                  type="text"
                  id="newCoursesDeveloped"
                  name="newCoursesDeveloped"
                  placeholder="Course Material / Software Developed"
                  value={formData.newCoursesDeveloped}
                  onChange={handleFieldChange}
                  className="input"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Footer: Receiver + Check + Submit */}
        <div className="footer-section">
          <div className="input-wrapper">
            <User size={20} />
            <input
              type="text"
              name="receiverUsername"
              placeholder="Receiver Username"
              value={receiverUsername}
              onChange={(e) => {
                setReceiverUsername(e.target.value);
                setVerifiedReceiver(false);
              }}
              className="username-input"
              required
            />
          </div>
          <div className="input-wrapper">
            <Tag size={20} />
            <input
              type="text"
              name="receiverDesignation"
              placeholder="Designation"
              value={receiverDesignation}
              readOnly
              className="designation-input"
            />
          </div>
          <Button
            leftIcon={<CheckCircle size={25} />}
            style={{ marginLeft: "50px", paddingRight: "15px" }}
            className="button"
            onClick={handleCheck}
          >
            <CheckCircle size={18} /> &nbsp; Check
          </Button>
          <Button
            type="submit"
            rightIcon={<PaperPlaneRight size={20} />}
            style={{
              marginLeft: "350px",
              width: "150px",
              paddingRight: "15px",
              borderRadius: "5px",
            }}
            className="button"
            disabled={!verifiedReceiver}
          >
            <PaperPlaneRight size={20} /> &nbsp; Submit
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AppraisalForm;
