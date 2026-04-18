// src/Modules/HR/components/CPDA_ClaimForm.js
import React from "react";
import { Button } from "@mantine/core";
import {
  PaperPlaneRight,
  CheckCircle,
  User,
  Tag,
  IdentificationCard,
  Calendar,
  ClipboardText,
  CurrencyDollar,
  FileText,
} from "@phosphor-icons/react";
import { useDispatch, useSelector } from "react-redux";
import { updateForm, resetForm } from "../../../../redux/formSlice";
import { submitCpdaClaimForm } from "../../services/api";
import { get_my_details, search_employee } from "../../../../routes/hr";
import "../../styles/CPDA_ClaimForm.css";

function CPDA_ClaimForm() {
  const formData = useSelector((state) => state.form);
  const dispatch = useDispatch();
  const [verifiedReceiver, setVerifiedReceiver] = React.useState(false);

  const handleCheck = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found!");
        return;
      }
      if (!formData.username) {
        alert("Please enter a receiver username first.");
        return;
      }
      const response = await fetch(
        `${search_employee}?search=${formData.username}`,
        { headers: { Authorization: `Token ${token}` } },
      );
      if (!response.ok) {
        alert("Receiver not found. Please check the username and try again.");
        throw new Error("Network response was not ok");
      }
      const fetchedReceiverData = await response.json();
      dispatch(updateForm({
        designationFooter: fetchedReceiverData.designation || "",
      }));
      setVerifiedReceiver(true);
      alert("Receiver verified successfully!");
    } catch (error) {
      console.error("Failed to fetch receiver data:", error);
    }
  };

  React.useEffect(() => {
    const fetchMyDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        
        const response = await fetch(get_my_details, {
          headers: { Authorization: `Token ${token}` },
        });
        
        if (response.ok) {
          const fetchedData = await response.json();
          dispatch(updateForm({
            name: fetchedData.username || "",
            designation: fetchedData.designation || "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      }
    };
    fetchMyDetails();
  }, [dispatch]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    dispatch(updateForm({ [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!verifiedReceiver) {
      alert("Please verify the receiver's designation before submitting.");
      return;
    }

    const processedData = { ...formData };
    delete processedData.username;
    delete processedData.designationFooter;

    const payload = [
      processedData,
      {
        uploader_name: formData.name,
        uploader_designation: formData.designation,
        receiver_name: formData.username,
        receiver_designation: formData.designationFooter,
      }
    ];

    try {
      const result = await submitCpdaClaimForm(payload);
      console.log("Form submitted successfully:", result);
      alert("CPDA Claim form submitted successfully!");
      setVerifiedReceiver(false);
      dispatch(resetForm());
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit form: " + error.message);
    }
  };

  return (
    <div className="CPDA_ClaimForm_container">
      <form onSubmit={handleSubmit}>
        {/* Row 1: Name and Designation */}
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
                  value={formData.name}
                  placeholder="Name"
                  onChange={handleChange}
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
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>

        {/* Row 2: Amount Required and Date */}
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="adjustmentSubmitted">
              Adjustment/Reimbursement Submitted for Rs.
              <div className="input-wrapper">
                <CurrencyDollar size={20} />
                <input
                  type="text"
                  id="adjustmentSubmitted"
                  name="adjustmentSubmitted"
                  placeholder="Amount Required"
                  value={formData.adjustmentSubmitted}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>

          <div className="grid-col">
            <label className="input-label" htmlFor="balanceDate">
              Date
              <div className="input-wrapper">
                <Calendar size={20} />
                <input
                  type="date"
                  id="balanceDate"
                  name="balanceDate"
                  value={formData.balanceDate}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>

        {/* Row 3: Advance Taken and PF Number */}
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="advanceTaken">
              Advance Taken
              <div className="input-wrapper">
                <CurrencyDollar size={20} />
                <input
                  type="text"
                  id="advanceTaken"
                  name="advanceTaken"
                  placeholder="Amount Required"
                  value={formData.advanceTaken}
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
                <IdentificationCard size={20} />
                <input
                  type="text"
                  id="pfNo"
                  name="pfNo"
                  placeholder="XXXXXXXXXXXX"
                  value={formData.pfNo}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>

        {/* Row 4: Purpose */}
        <div className="grid-row">
          <div className="grid-col" style={{ flexGrow: 2 }}>
            <label className="input-label" htmlFor="purpose">
              Purpose
              <div className="input-wrapper">
                <ClipboardText size={20} />
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  placeholder="Purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  className="input"
                  style={{ width: "60%" }}
                  required
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
              Bill Checked in Audit for Rs.
              <div className="input-wrapper">
                <FileText size={20} />
                <input
                  type="text"
                  id="amountCheckedInPDA"
                  name="amountCheckedInPDA"
                  placeholder="Audit Entry"
                  value={formData.amountCheckedInPDA}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Row :6 Estt. Section */}
        <div className="section-divider">
          <hr className="divider-line" />
          <h3 className="section-heading">Estt. Section</h3>
        </div>
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="balanceDate">
              Balance available as on date
              <div className="input-wrapper">
                <Calendar size={20} />
                <input
                  type="date"
                  id="balanceDate"
                  name="balanceDate"
                  value={formData.balanceDate}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="advanceAmountPDA">
              Adjustment/Reimbursement amount entered in PDA Register page no.
              <div className="input-wrapper">
                <FileText size={20} />
                <input
                  type="text"
                  id="advanceAmountPDA"
                  name="advanceAmountPDA"
                  placeholder="advanceAmountPDA"
                  value={formData.advanceAmountPDA}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="footer-section">
          <div className="input-wrapper">
            <User size={20} />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="username-input"
              required
            />
          </div>
          <div className="input-wrapper">
            <Tag size={20} />
            <input
              type="text"
              name="designationFooter"
              placeholder="Designation"
              value={formData.designationFooter}
              onChange={handleChange}
              className="designation-input"
              required
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

export default CPDA_ClaimForm;
