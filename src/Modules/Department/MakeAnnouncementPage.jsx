import React, { useState } from "react";
import { CaretDown } from "phosphor-react";
import "./MakeAnnouncementPage.css";

const MakeAnnouncementPage = () => {
  const [programme, setProgramme] = useState("");
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit logic here
  };

  return (
    <div className="announcement-container">
      <form className="announcement-form" onSubmit={handleSubmit}>
        <h2 className="form-title">CREATE:</h2>

        <div className="input-row">
          <div className="form-group">
            <label>Programme Type*</label>
            <div className="custom-dropdown">
              <select
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
              >
                <option>Select Programme</option>
                <option>B.Tech</option>
                <option>M.Tech</option>
              </select>
              <CaretDown className="dropdown-icon" />
            </div>
          </div>

          <div className="form-group">
            <label>Batch</label>
            <div className="custom-dropdown">
              <select value={batch} onChange={(e) => setBatch(e.target.value)}>
                <option>Select Batch</option>
                <option>2020</option>
                <option>2021</option>
              </select>
              <CaretDown className="dropdown-icon" />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label>Department*</label>
          <div
            className="custom-dropdown"
            style={{
              width: "30%",
            }}
          >
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option>Select Department</option>
              <option>CSE</option>
              <option>ECE</option>
              <option>ME</option>
            </select>
            <CaretDown className="dropdown-icon" />
          </div>
        </div>

        <div className="form-group">
          <label>Announcement Details</label>
          <textarea
            placeholder="What is the Announcement?"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            style={{
              width: "80%",
              height: "50px",
              borderRadius: "50px",
            }}
          />
        </div>

        <div className="form-group">
          <label>Attach Files (PDF, JPEG, PNG, JPG)</label>
          <div className="file-upload">
            <label htmlFor="file-upload" className="file-label">
              {file ? file.name : "Choose File"}
            </label>
            <input id="file-upload" type="file" onChange={handleFileChange} />
          </div>
        </div>

        <button type="submit" className="publish-btn">
          Publish
        </button>
      </form>
    </div>
  );
};

export default MakeAnnouncementPage;
