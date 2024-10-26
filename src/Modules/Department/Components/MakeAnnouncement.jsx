import React, { useState } from "react";
import classes from "../styles/Departmentmodule.module.css";

const styles = {
  formContainer: {
    width: "600px", // Increased width to 600px for a more spacious layout
    margin: "auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
  },
  formGroup: {
    marginBottom: "15px",
  },
  input: {
    width: "100%", // Full width for input elements
    padding: "14px", // More padding for better spacing and ease of use
    margin: "5px 0",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%", // Full width for the textarea
    padding: "14px", // More padding for the textarea
    height: "150px", // Increased height for the textarea to allow more content
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "16px", // Increased padding for a larger, more prominent button
    backgroundColor: "#7b4bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "20px", // Larger font size for the button
  },
  header: {
    textAlign: "left",
    fontSize: "24px", // Increased the font size of the header for better visibility
    fontWeight: "bold",
    marginBottom: "15px",
  },
};

export default function MakeAnnouncement() {
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
    console.log({
      programme,
      batch,
      department,
      announcement,
      file,
    });
  };

  return (
    <div className={`${classes.flex} ${classes.w_full}`}>
      <form onSubmit={handleSubmit} style={styles.formContainer}>
        <h2 style={styles.header}>CREATE ANNOUNCEMENT:</h2>

        <div style={styles.formGroup}>
          <label htmlFor="programmeType">
            Programme Type*
            <select
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
              style={styles.input}
              id="programmeType"
            >
              <option value="">Select Programme</option>
              <option value="Programme 1">M.Tech</option>
              <option value="Programme 2">B.Tech</option>
              <option value="Programme 3">Phd</option>
              <option value="Programme 4">Other</option>
              {/* Add more options as needed */}
            </select>
          </label>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="batch">
            Batch
            <select
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
              style={styles.input}
              id="batch"
            >
              <option value="">Select Batch</option>
              <option value="Batch 1">All</option>
              <option value="Batch 2">Year-1</option>
              <option value="Batch 3">Year-2</option>
              <option value="Batch 4">Year-3</option>
              <option value="Batch 5">Year-4</option>
              {/* Add more options as needed */}
            </select>
          </label>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="department">
            Department*
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              style={styles.input}
              id="department"
            >
              <option value="">Select Department</option>
              <option value="Department 1">All</option>
              <option value="Department 2">CSE</option>
              <option value="Department 3">ECE</option>
              <option value="Department 4">ME</option>
              <option value="Department 5">SM</option>
              {/* Add more options as needed */}
            </select>
          </label>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="announcement">
            Announcement Details
            <textarea
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="What is the Announcement?"
              style={styles.textarea}
              id="announcement"
            />
          </label>
        </div>

        <div style={styles.formGroup}>
          <label htmlFor="attachfiles">
            Attach Files (PDF, JPEG, PNG, JPG)
            <input
              type="file"
              onChange={handleFileChange}
              style={styles.input}
              id="attachfiles"
            />
          </label>
        </div>

        <button type="submit" style={styles.button}>
          Publish
        </button>
      </form>
    </div>
  );
}
