import React, { useState } from "react";
import { Button, Select } from "@mantine/core";
import PropTypes from "prop-types";
import {
  User,
  Tag,
  IdentificationCard,
  Calendar,
  CheckCircle,
  Building,
  Money,
  Question,
  Airplane,
  MapPin,
  FloppyDisk,
  PaperPlaneRight,
  Leaf,
  Phone,
  Users,
} from "@phosphor-icons/react";
import "../../styles/LtcForm.css";

function Divider({ thickness = "3px", color = "#ccc", margin = "20px 0" }) {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `${thickness} solid ${color}`,
        margin,
      }}
    />
  );
}

function LtcForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    Blockyear: "",
    providentFundNo: "",
    basicPay: "",
    departmentSection: "",
    ltcAvailability: "",
    dateFrom: "",
    dateTo: "",
    familyDepartureDate: "",
    natureOfLeave: "",
    purpose: "",
    modeOfTravel: "",
    addressDuringLeave: "",
    selfName: "",
    wifeName: "",
    Children: "",
    amount: "",
    certificationDetails: "",
    date: "",
    previousLTCDate: "",
    phoneNumber: "",
    username: "",
    designationFooter: "",
  });

  const [numChildren, setNumChildren] = useState(1);
  const [childrenFields, setChildrenFields] = useState([{ name: "", age: "" }]);
  const [numDependents, setNumDependents] = useState(1);
  const [dependentsFields, setDependentsFields] = useState([
    { fullName: "", age: "", reason: "" },
  ]);
  const [selectedPlace, setSelectedPlace] = useState("HomeTown");
  const [visitingPlace, setVisitingPlace] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value, name) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceChange = (value) => {
    setSelectedPlace(value);
    if (value === "HomeTown") setVisitingPlace("");
  };

  const handleVisitingPlaceChange = (event) => {
    setVisitingPlace(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      formData.dateTo &&
      formData.dateFrom &&
      formData.dateTo < formData.dateFrom
    ) {
      alert(
        "Leave duration end date must be greater than or equal to start date.",
      );
      return;
    }

    onSubmit({ ...formData, visitingPlace, childrenFields, dependentsFields });
    // Reset form
    setFormData({
      name: "",
      designation: "",
      Blockyear: "",
      providentFundNo: "",
      basicPay: "",
      departmentSection: "",
      ltcAvailability: "",
      dateFrom: "",
      dateTo: "",
      familyDepartureDate: "",
      natureOfLeave: "",
      purpose: "",
      modeOfTravel: "",
      addressDuringLeave: "",
      selfName: "",
      wifeName: "",
      Children: "",
      amount: "",
      certificationDetails: "",
      date: "",
      previousLTCDate: "",
      phoneNumber: "",
      username: "",
      designationFooter: "",
    });
    setChildrenFields([{ name: "", age: "" }]);
    setDependentsFields([{ fullName: "", age: "", reason: "" }]);
    setSelectedPlace("HomeTown");
    setVisitingPlace("");
  };

  const handleChildrenChange = (value) => {
    const count = parseInt(value, 10);
    setNumChildren(count);
    setChildrenFields(new Array(count).fill({ name: "", age: "" }));
  };

  const handleChildInputChange = (index, field, value) => {
    setChildrenFields((prevFields) => {
      const updatedFields = [...prevFields];
      updatedFields[index] = { ...updatedFields[index], [field]: value };
      return updatedFields;
    });
  };

  const handleDependentsChange = (value) => {
    const count = parseInt(value, 10);
    setNumDependents(count);
    setDependentsFields(
      new Array(count).fill({ fullName: "", age: "", reason: "" }),
    );
  };

  const handleDependentInputChange = (index, field, value) => {
    setDependentsFields((prevFields) => {
      const updatedFields = [...prevFields];
      updatedFields[index] = { ...updatedFields[index], [field]: value };
      return updatedFields;
    });
  };

  const selectStyles = {
    input: {
      border: "none",
      backgroundColor: "transparent",
      color: "#000",
      fontSize: "14px",
      padding: "12px",
      fontFamily: "Roboto, sans-serif",
    },
    dropdown: {
      backgroundColor: "#fff",
      border: "1px solid #ccc",
      borderRadius: "4px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    },
    item: {
      padding: "10px",
      fontSize: "14px",
      color: "#2d3b45",
    },
  };

  return (
    <div className="Ltc_container">
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
                  placeholder="Enter Your Full Name"
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
                  value={formData.designation}
                  placeholder="Enter Your Designation"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>

        {/* Row 2: Block Year, Provident Fund No, Basic Pay */}
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="Blockyear">
              Block Year
              <div className="input-wrapper">
                <IdentificationCard size={20} />
                <input
                  type="number"
                  id="Blockyear"
                  name="Blockyear"
                  value={formData.Blockyear}
                  placeholder="Block year"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="providentFundNo">
              Provident Fund No.
              <div className="input-wrapper">
                <IdentificationCard size={20} />
                <input
                  type="number"
                  id="providentFundNo"
                  name="providentFundNo"
                  value={formData.providentFundNo}
                  placeholder="Provident Fund Number"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="basicPay">
              Basic Pay
              <div className="input-wrapper">
                <Money size={20} />
                <input
                  type="number"
                  id="basicPay"
                  name="basicPay"
                  value={formData.basicPay}
                  placeholder="Enter Basic Pay"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>

        {/* Row 3: Department */}
        <div className="grid-row">
          <div className="grid-col">
            <div className="input-label">
              Department / Section
              <div className="input-wrapper">
                <Building size={20} />
                <Select
                  id="departmentSection"
                  name="departmentSection"
                  data={[
                    {
                      value: "Computer Science Engineering",
                      label: "Computer Science Engineering",
                    },
                    {
                      value: "Electronics and Communication Engineering",
                      label: "Electronics and Communication Engineering",
                    },
                    {
                      value: "Mechanical Engineering",
                      label: "Mechanical Engineering",
                    },
                    {
                      value: "Smart Manufacturing",
                      label: "Smart Manufacturing",
                    },
                    { value: "Design", label: "Design" },
                  ]}
                  value={formData.departmentSection}
                  onChange={(value) =>
                    handleSelectChange(value, "departmentSection")
                  }
                  className="input"
                  styles={selectStyles}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* LTC Availability */}
        <div className="grid-col">
          <div className="input-label">
            (a) Whether leave is required for availing L.T.C.?
            <div className="input-wrapper">
              <Question size={20} />
              <Select
                id="ltcAvailability"
                name="ltcAvailability"
                data={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
                value={formData.ltcAvailability}
                onChange={(value) =>
                  handleSelectChange(value, "ltcAvailability")
                }
                className="input"
                styles={selectStyles}
                required
              />
            </div>
          </div>
        </div>

        {/* Date Fields */}
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="dateFrom">
              (b) (i) Duration of leave From:
              <div className="input-wrapper">
                <Calendar size={20} />
                <input
                  type="date"
                  id="dateFrom"
                  name="dateFrom"
                  value={formData.dateFrom}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="dateTo">
              To:
              <div className="input-wrapper">
                <Calendar size={20} />
                <input
                  type="date"
                  id="dateTo"
                  name="dateTo"
                  value={formData.dateTo}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="familyDepartureDate">
              (ii) Date of departure of family:
              <div className="input-wrapper">
                <Calendar size={20} />
                <input
                  type="date"
                  id="familyDepartureDate"
                  name="familyDepartureDate"
                  value={formData.familyDepartureDate}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>

        {/* Nature of Leave and Purpose */}
        <div className="grid-row">
          <div className="grid-col">
            <div className="input-label">
              (c) Nature of Leave
              <div className="input-wrapper">
                <Leaf size={20} />
                <Select
                  id="natureOfLeave"
                  name="natureOfLeave"
                  data={[
                    { value: "Casual", label: "Casual" },
                    { value: "Vacation", label: "Vacation" },
                    { value: "Earned", label: "Earned" },
                    { value: "Commuted Leave", label: "Commuted Leave" },
                    {
                      value: "Special Casual Leave",
                      label: "Special Casual Leave",
                    },
                    {
                      value: "Restricted Holiday",
                      label: "Restricted Holiday",
                    },
                    { value: "Station Leave", label: "Station Leave" },
                  ]}
                  value={formData.natureOfLeave}
                  onChange={(value) =>
                    handleSelectChange(value, "natureOfLeave")
                  }
                  className="input"
                  styles={selectStyles}
                  required
                />
              </div>
            </div>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="purpose">
              (d) Purpose
              <div className="input-wrapper">
                <Tag size={20} />
                <input
                  type="text"
                  id="purpose"
                  name="purpose"
                  value={formData.purpose}
                  placeholder="Enter Purpose of Travel"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>

        {/* Place Selection */}
        <div className="grid-row">
          <div className="grid-col">
            <div className="input-label">
              Whether L.T.C. is desired for going to home town or elsewhere?
              <div className="input-wrapper">
                <Select
                  id="placeSelection"
                  name="placeSelection"
                  data={[
                    { value: "HomeTown", label: "HomeTown" },
                    { value: "ElseWhere", label: "ElseWhere" },
                  ]}
                  value={selectedPlace}
                  onChange={handlePlaceChange}
                  className="input"
                  styles={selectStyles}
                />
              </div>
            </div>
          </div>
          {selectedPlace === "ElseWhere" && (
            <div className="grid-col">
              <label className="input-label" htmlFor="visitingPlace">
                Place where you are visiting:
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="visitingPlace"
                    name="visitingPlace"
                    value={visitingPlace}
                    onChange={handleVisitingPlaceChange}
                    placeholder="Enter the place"
                    className="input"
                    required
                  />
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Mode of Travel and Address */}
        <div className="grid-row">
          <div className="grid-col">
            <div className="input-label">
              Mode of Travel
              <div className="input-wrapper">
                <Airplane size={20} />
                <Select
                  id="modeOfTravel"
                  name="modeOfTravel"
                  data={[
                    { value: "Air", label: "Air" },
                    { value: "Train", label: "Train" },
                    { value: "Car", label: "Car" },
                  ]}
                  value={formData.modeOfTravel}
                  onChange={(value) =>
                    handleSelectChange(value, "modeOfTravel")
                  }
                  className="input"
                  styles={selectStyles}
                  required
                />
              </div>
            </div>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="addressDuringLeave">
              Address During Leave
              <div className="input-wrapper">
                <MapPin size={20} />
                <input
                  type="text"
                  id="addressDuringLeave"
                  name="addressDuringLeave"
                  value={formData.addressDuringLeave}
                  placeholder="Enter Address During Leave"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>

        {/* Family Members */}
        <h3>
          (i) Details of family members for whom L.T.C. for this block has
          already been availed:
        </h3>
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="selfName">
              (a) Self
              <div className="input-wrapper">
                <User size={20} />
                <input
                  type="text"
                  id="selfName"
                  name="selfName"
                  value={formData.selfName}
                  placeholder="Enter Your Name"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="wifeName">
              (b) Wife
              <div className="input-wrapper">
                <User size={20} />
                <input
                  type="text"
                  id="wifeName"
                  name="wifeName"
                  value={formData.wifeName}
                  placeholder="Enter Wife's Name"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="Children">
              (c) Children
              <div className="input-wrapper">
                <User size={20} />
                <input
                  type="text"
                  id="Children"
                  name="Children"
                  value={formData.Children}
                  placeholder="Children"
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>

        {/* Number of Children */}
        <div className="grid-col">
          <div className="input-label">
            (c) Number of Family Members
            <div className="input-wrapper">
              <Users size={20} />
              <Select
                id="numChildren"
                name="numChildren"
                data={["0", "1", "2", "3", "4", "5"].map((v) => ({
                  value: v,
                  label: v,
                }))}
                value={numChildren.toString()}
                onChange={handleChildrenChange}
                className="input"
                styles={selectStyles}
              />
            </div>
          </div>
        </div>

        {numChildren > 0 && (
          <div>
            <h4
              style={{
                marginBottom: "20px",
                fontSize: "1.2rem",
                color: "#2d3748",
              }}
            >
              (ii) Details of family members who will avail L.T.C.
            </h4>
            <table className="family-details-table">
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Name</th>
                  <th>Age</th>
                </tr>
              </thead>
              <tbody>
                {childrenFields.map((child, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={index + 1}
                        readOnly
                        aria-label={`Child ${index + 1} index`}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        aria-label={`Child ${index + 1} name`}
                        value={child.name}
                        onChange={(e) =>
                          handleChildInputChange(index, "name", e.target.value)
                        }
                        placeholder="Enter Name"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        aria-label={`Child ${index + 1} age`}
                        value={child.age}
                        onChange={(e) =>
                          handleChildInputChange(index, "age", e.target.value)
                        }
                        placeholder="Enter Age"
                        required
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dependents */}
        <h3>Dependent Family Members</h3>
        <div className="grid-row">
          <div className="grid-col">
            <div className="input-label">
              Number of Dependents
              <div className="input-wrapper">
                <Users size={20} />
                <Select
                  id="numDependents"
                  name="numDependents"
                  data={["0", "1", "2", "3", "4", "5"].map((v) => ({
                    value: v,
                    label: v,
                  }))}
                  value={numDependents.toString()}
                  onChange={handleDependentsChange}
                  className="input"
                  styles={selectStyles}
                />
              </div>
            </div>
          </div>
        </div>

        {numDependents > 0 && (
          <div>
            <h4
              style={{
                marginBottom: "20px",
                fontSize: "1.2rem",
                color: "#2d3748",
              }}
            >
              (d) Dependent parents, minor brothers, and sisters residing with
              the applicant:
            </h4>
            <table className="family-details-table">
              <thead>
                <tr>
                  <th>Index</th>
                  <th>Full Name</th>
                  <th>Age</th>
                  <th>Reason for Dependency</th>
                </tr>
              </thead>
              <tbody>
                {dependentsFields.map((dependent, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={index + 1}
                        readOnly
                        aria-label={`Dependent ${index + 1} index`}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        aria-label={`Dependent ${index + 1} full name`}
                        value={dependent.fullName}
                        onChange={(e) =>
                          handleDependentInputChange(
                            index,
                            "fullName",
                            e.target.value,
                          )
                        }
                        placeholder="Enter Name"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        aria-label={`Dependent ${index + 1} age`}
                        value={dependent.age}
                        onChange={(e) =>
                          handleDependentInputChange(
                            index,
                            "age",
                            Math.max(0, e.target.value),
                          )
                        }
                        placeholder="Enter Age"
                        min="0"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        aria-label={`Dependent ${index + 1} reason`}
                        value={dependent.reason}
                        onChange={(e) =>
                          handleDependentInputChange(
                            index,
                            "reason",
                            e.target.value,
                          )
                        }
                        placeholder="Enter Reason"
                        required
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Divider />

        {/* Amount and Certification */}
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="amount">
              Amount of advance required, if any:
              <div className="input-wrapper">
                <Money size={20} />
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="certificationDetails">
              (i) Certified that family members for whom the L.T.C. is claimed
              are residing with me and are wholly dependent upon me.
              <div className="input-wrapper">
                <input
                  type="text"
                  id="certificationDetails"
                  name="certificationDetails"
                  value={formData.certificationDetails}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
        </div>

        {/* Date, Previous LTC, Phone */}
        <div className="grid-row">
          <div className="grid-col">
            <label className="input-label" htmlFor="date">
              Date:
              <div className="input-wrapper">
                <Calendar size={20} />
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="previousLTCDate">
              Certified that the previous L.T.C. advance drawn by me on:
              <div className="input-wrapper">
                <Calendar size={20} />
                <input
                  type="date"
                  id="previousLTCDate"
                  name="previousLTCDate"
                  value={formData.previousLTCDate}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>
            </label>
          </div>
          <div className="grid-col">
            <label className="input-label" htmlFor="phoneNumber">
              Phone Number for contact:
              <div className="input-wrapper">
                <Phone size={20} />
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="input"
                  required
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
          >
            <FloppyDisk size={20} /> &nbsp; Submit
          </Button>
        </div>
      </form>
    </div>
  );
}

export default LtcForm;

Divider.propTypes = {
  thickness: PropTypes.string,
  color: PropTypes.string,
  margin: PropTypes.string,
};

LtcForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};
