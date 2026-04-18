import React, { useEffect, useState } from "react";
import { Button } from "@mantine/core";
import {
  PaperPlaneRight,
  User,
  Tag,
  IdentificationCard,
  Calendar,
  ClipboardText,
  CurrencyDollar,
  FileText,
} from "@phosphor-icons/react";
import { get_my_details } from "../../../../routes/hr";
import "../../styles/CPDA_ADVANCEForm.css";

function CPDA_ADVANCEForm() {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    pfNo: "",
    purpose: "",
    amountRequired: "",
    submissionDate: "",
    advanceDueAdjustment: "",
    balanceAvailable: "",
    advanceAmountPDA: "",
    amountCheckedInPDA: "",
  });

  useEffect(() => {
    const fetchMyDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No authentication token found!");
          return;
        }
        const response = await fetch(get_my_details, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!response.ok) {
          alert("Failed to fetch user details. Please try again later.");
          throw new Error("Network response was not ok");
        }
        const fetchedData = await response.json();
        setFormData((prev) => ({
          ...prev,
          name: fetchedData.username || "",
          designation: fetchedData.designation || "",
        }));
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };
    fetchMyDetails();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const requiredFields = [
      { name: "name", label: "Name" },
      { name: "designation", label: "Designation" },
      { name: "pfNo", label: "PF Number" },
      { name: "purpose", label: "Purpose" },
      { name: "amountRequired", label: "Amount Required" },
      { name: "submissionDate", label: "Submission Date" },
    ];

    const missingField = requiredFields.find(
      (field) => !formData[field.name] || formData[field.name] === "",
    );

    if (missingField) {
      alert(`${missingField.label} is required.`);
      return;
    }

    const processedData = {
      name: formData.name,
      designation: formData.designation,
      pfNo: parseInt(formData.pfNo, 10),
      purpose: formData.purpose,
      amountRequired: parseInt(formData.amountRequired, 10),
      submissionDate: formData.submissionDate,
      advanceDueAdjustment: formData.advanceDueAdjustment
        ? parseFloat(formData.advanceDueAdjustment)
        : null,
      balanceAvailable: formData.balanceAvailable
        ? parseFloat(formData.balanceAvailable)
        : null,
      advanceAmountPDA: formData.advanceAmountPDA
        ? parseFloat(formData.advanceAmountPDA)
        : null,
      amountCheckedInPDA: formData.amountCheckedInPDA
        ? parseFloat(formData.amountCheckedInPDA)
        : null,
    };

    const submitForm = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No authentication token found!");
          return;
        }
        const response = await fetch("/api/hr/cpdaadv/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify([
            processedData,
            {
              uploader_designation: formData.designation,
            },
          ]),
        });
        if (!response.ok) {
          const errText = await response.text();
          let message = errText || `Request failed (${response.status})`;
          try {
            const parsed = JSON.parse(errText);
            if (parsed && typeof parsed === "object") {
              if (parsed.detail) message = String(parsed.detail);
              else if (parsed.non_field_errors)
                message = String(parsed.non_field_errors);
              else message = JSON.stringify(parsed);
            }
          } catch {
            /* use raw text */
          }
          console.error(
            "CPDA Advance submit failed:",
            response.status,
            message,
          );
          alert(message);
          throw new Error(message);
        }
        alert(
          "CPDA Advance submitted. It has been routed to your department HOD for verification.",
        );
        setFormData({
          name: formData.name,
          designation: formData.designation,
          pfNo: "",
          purpose: "",
          amountRequired: "",
          submissionDate: "",
          advanceDueAdjustment: "",
          balanceAvailable: "",
          advanceAmountPDA: "",
          amountCheckedInPDA: "",
        });
      } catch (error) {
        console.error("Failed to submit CPDA Advance form:", error);
      }
    };
    submitForm();
  };

  return (
    <div className="CPDA_ADVANCEForm_container">
      <form onSubmit={handleSubmit}>
        <p
          style={{
            margin: "0 0 16px 8px",
            color: "#444",
            maxWidth: 720,
            lineHeight: 1.5,
          }}
        >
          Your application is sent automatically to the Head of Department (HOD)
          for your academic department, based on your profile. Ensure your
          department and HOD designation (e.g. HOD (CSE)) are configured in the
          system.
        </p>
        {/* Row 1: Name and Designation */}
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="name">
              Name
              <div className="input-wrapper">
                <User size={20} aria-hidden="true" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  className="input"
                  disabled
                />
              </div>
            </label>
          </div>

          <div className="grid-col">
            <label className="input-label" htmlFor="designation">
              Designation
              <div className="input-wrapper">
                <Tag size={20} aria-hidden="true" />
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  className="input"
                  disabled
                />
              </div>
            </label>
          </div>
        </div>

        {/* Row 2: Amount Required and Date */}
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="amountRequired">
              Amount Required
              <div className="input-wrapper">
                <CurrencyDollar size={20} aria-hidden="true" />
                <input
                  type="number"
                  id="amountRequired"
                  name="amountRequired"
                  placeholder="Amount Required"
                  value={formData.amountRequired}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>

          <div className="grid-col">
            <label className="input-label" htmlFor="submissionDate">
              Date
              <div className="input-wrapper">
                <Calendar size={20} aria-hidden="true" />
                <input
                  type="date"
                  id="submissionDate"
                  name="submissionDate"
                  value={formData.submissionDate}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>

        {/* Row 3: Purpose, PF Number, Advance Due */}
        <div className="grid-row">
          <div className="grid-col" style={{ flexGrow: 2 }}>
            <label className="input-label" htmlFor="purpose">
              Purpose
              <div className="input-wrapper">
                <ClipboardText size={20} aria-hidden="true" />
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  placeholder="Purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>

          <div className="grid-col">
            <label className="input-label" htmlFor="pfNo">
              PF Number
              <div className="input-wrapper">
                <IdentificationCard size={20} aria-hidden="true" />
                <input
                  type="text"
                  id="pfNo"
                  name="pfNo"
                  placeholder="XXXXXXXXXXXX"
                  value={formData.pfNo}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </label>
          </div>

          <div className="grid-col">
            <label className="input-label" htmlFor="advanceDueAdjustment">
              Advance (PDA) due for adjustment (if any)
              <div className="input-wrapper">
                <CurrencyDollar size={20} aria-hidden="true" />
                <input
                  type="text"
                  id="advanceDueAdjustment"
                  name="advanceDueAdjustment"
                  placeholder="Advance Due"
                  value={formData.advanceDueAdjustment}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Row 4: Estt. Section */}
        <div className="section-divider">
          <hr className="divider-line" />
          <h3 className="section-heading">Estt. Section</h3>
        </div>
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="balanceAvailable">
              Balance available as on date
              <div className="input-wrapper">
                <CurrencyDollar size={20} aria-hidden="true" />
                <input
                  type="number"
                  id="balanceAvailable"
                  name="balanceAvailable"
                  value={formData.balanceAvailable}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="advanceAmountPDA">
              Advance amount entered in PDA Register page no.
              <div className="input-wrapper">
                <FileText size={20} aria-hidden="true" />
                <input
                  type="number"
                  id="advanceAmountPDA"
                  name="advanceAmountPDA"
                  placeholder="Enter amount"
                  value={formData.advanceAmountPDA}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Row 5: Internal Audit */}
        <div className="section-divider">
          <hr className="divider-line" />
          <h3 className="section-heading">Internal Audit</h3>
        </div>
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="amountCheckedInPDA">
              Entry checked in PDA Register for Rs.
              <div className="input-wrapper">
                <FileText size={20} aria-hidden="true" />
                <input
                  type="number"
                  id="amountCheckedInPDA"
                  name="amountCheckedInPDA"
                  placeholder="PDA Register Entry"
                  value={formData.amountCheckedInPDA}
                  onChange={handleChange}
                  className="input"
                  style={{ maxWidth: "50%" }}
                />
              </div>
            </label>
          </div>
        </div>

        <div className="footer-section">
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
          >
            <PaperPlaneRight size={20} /> &nbsp; Submit
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CPDA_ADVANCEForm;
