import React, { useState } from "react";
import { Button, Container, Grid } from "@mantine/core";
import CustomBreadcrumbs from "../../../components/Breadcrumbs.jsx";
import classes from "../styles/Departmentmodule.module.css";

const styles = {
  formContainer: {
    width: "600px",
    margin: "auto",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#f9f9f9",
    marginTop: "20px", // Added marginTop for spacing
  },
  formGroup: {
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "14px",
    margin: "5px 0",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  textarea: {
    width: "100%",
    padding: "14px",
    height: "150px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#7b4bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "20px",
  },
  header: {
    textAlign: "left",
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "15px",
  },
  departmentsContainer: {
    position: "relative",
  },
  hiddenMenu: {
    display: "none",
    position: "absolute",
    top: "0",
    left: "100%", // Place it next to the button
    whiteSpace: "nowrap", // Prevent line breaks
    zIndex: 1, // Ensure it appears above other elements
  },
  visibleMenu: {
    display: "block",
    position: "absolute",
    top: "0",
    left: "100%", // Place it next to the button
    whiteSpace: "nowrap", // Prevent line breaks
    zIndex: 1, // Ensure it appears above other elements
  },
};

export default function Dash() {
  const [programme, setProgramme] = useState("");
  const [batch, setBatch] = useState("");
  const [department, setDepartment] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [file, setFile] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Make Announcement");
  const [showDepartments, setShowDepartments] = useState(false);

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
    <>
      <div style={{ paddingBottom: "50px" }}>
        <CustomBreadcrumbs />
      </div>

      <Container
        className={`${classes.flex} ${classes.w_full}`}
        style={{ marginBottom: "20px" }}
      >
        <Grid gutter={150}>
          <Grid.Col span={5}>
            {/* Sidebar Menu */}
            <div
              style={{
                marginTop: "20px",
                border: "1px solid #ccc", // Changed border color to a darker shade
                borderRadius: "8px",
                padding: "15px",
                fontSize: "16px",
              }}
            >
              <Button
                fullWidth
                variant={
                  activeMenu === "Make Announcement" ? "filled" : "subtle"
                }
                color={activeMenu === "Make Announcement" ? "blue" : "dark"}
                style={{ marginBottom: "10px", marginTop: "20px" }} // Space above this button
                onClick={() => setActiveMenu("Make Announcement")}
              >
                Make Announcement
              </Button>
              <Button
                fullWidth
                variant={
                  activeMenu === "Browse Announcement" ? "filled" : "subtle"
                }
                color={activeMenu === "Browse Announcement" ? "blue" : "dark"}
                style={{ marginBottom: "10px" }}
                onClick={() => setActiveMenu("Browse Announcement")}
              >
                Browse Announcement
              </Button>
              <Button
                fullWidth
                variant={activeMenu === "CSE Department" ? "filled" : "subtle"}
                color={activeMenu === "CSE Department" ? "blue" : "dark"}
                style={{ marginBottom: "10px" }}
                onClick={() => setActiveMenu("CSE Department")}
              >
                CSE Department
              </Button>

              {/* Hover to Show Other Departments */}
              <div
                style={styles.departmentsContainer}
                onMouseEnter={() => setShowDepartments(true)}
                onMouseLeave={() => setShowDepartments(false)}
              >
                <Button
                  fullWidth
                  variant={
                    activeMenu === "Other Departments" ? "filled" : "subtle"
                  }
                  color={activeMenu === "Other Departments" ? "blue" : "dark"}
                >
                  Other Departments
                </Button>

                {/* Conditionally render the other departments */}
                <div
                  style={
                    showDepartments ? styles.visibleMenu : styles.hiddenMenu
                  }
                >
                  <Button
                    fullWidth
                    variant={
                      activeMenu === "ECE Department" ? "filled" : "subtle"
                    }
                    color={activeMenu === "ECE Department" ? "blue" : "dark"}
                    style={{ marginBottom: "10px" }}
                    onClick={() => setActiveMenu("ECE Department")}
                  >
                    ECE Department
                  </Button>
                  <Button
                    fullWidth
                    variant={
                      activeMenu === "ME Department" ? "filled" : "subtle"
                    }
                    color={activeMenu === "ME Department" ? "blue" : "dark"}
                    style={{ marginBottom: "10px" }}
                    onClick={() => setActiveMenu("ME Department")}
                  >
                    ME Department
                  </Button>
                  <Button
                    fullWidth
                    variant={
                      activeMenu === "CIVIL Department" ? "filled" : "subtle"
                    }
                    color={activeMenu === "CIVIL Department" ? "blue" : "dark"}
                    onClick={() => setActiveMenu("CIVIL Department")}
                  >
                    CIVIL Department
                  </Button>
                </div>
              </div>
            </div>
          </Grid.Col>

          {/* Announcement Form Section */}
          <Grid.Col span={6}>
            <form onSubmit={handleSubmit} style={styles.formContainer}>
              <h2 style={styles.header}>CREATE:</h2>

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
                <label htmlFor="file">
                  Attach a file
                  <input
                    type="file"
                    onChange={handleFileChange}
                    style={styles.input}
                    id="file"
                  />
                </label>
              </div>

              <Button type="submit" style={styles.button}>
                Submit Announcement
              </Button>
            </form>
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
}
