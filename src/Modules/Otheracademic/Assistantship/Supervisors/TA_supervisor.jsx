import React, { useState } from "react";
import axios from "axios";
import { Assistantship_Form_Submit } from "../../../../routes/otheracademicRoutes";

export default function AssistantshipForm() {
  const [formData, setFormData] = useState({
    student_name: "John Doe",
    roll_no: "1234567",
    discipline: "",
    date_from: "",
    date_to: "",
    bank_account_no: "",
    signature: null,
    applicability: "",
    ta_supervisor: "",
    thesis_supervisor: "",
    date_applied: new Date().toISOString().split("T")[0], // Default to today's date
    hod: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      signature: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form...");

    // Check for missing required fields using .some()
    const requiredFields = [
      "discipline",
      "date_from",
      "date_to",
      "bank_account_no",
      "signature",
      "applicability",
      "ta_supervisor",
      "thesis_supervisor",
      "hod",
    ];

    const missingField = requiredFields.find((field) => !formData[field]);
    if (missingField) {
      alert(`Please fill out the "${missingField}" field.`);
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("No auth token found");
      alert("Authentication failed. Please log in again.");
      return;
    }

    try {
      const response = await axios.post(Assistantship_Form_Submit, form, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });
      alert(response.data.message || "Form submitted successfully!");
    } catch (error) {
      console.error(error);
      alert("Error submitting the form. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "auto" }}>
      <input
        type="text"
        name="discipline"
        placeholder="Discipline"
        value={formData.discipline}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="date_from"
        value={formData.date_from}
        onChange={handleChange}
        required
      />
      <input
        type="date"
        name="date_to"
        value={formData.date_to}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="bank_account_no"
        placeholder="Bank Account Number"
        value={formData.bank_account_no}
        onChange={handleChange}
        required
      />
      <input
        type="file"
        name="signature"
        accept=".png,.jpg,.jpeg"
        onChange={handleFileChange}
        required
      />
      <input
        type="text"
        name="applicability"
        placeholder="Applicability"
        value={formData.applicability}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="ta_supervisor"
        placeholder="TA Supervisor"
        value={formData.ta_supervisor}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="thesis_supervisor"
        placeholder="Thesis Supervisor"
        value={formData.thesis_supervisor}
        onChange={handleChange}
        required
      />
      <input
        type="text"
        name="hod"
        placeholder="HOD"
        value={formData.hod}
        onChange={handleChange}
        required
      />
      <button type="submit" style={{ marginTop: "20px", padding: "10px 20px" }}>
        Submit
      </button>
    </form>
  );
}
