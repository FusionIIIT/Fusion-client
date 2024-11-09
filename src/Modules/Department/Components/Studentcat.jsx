import { Button, Typography, Card, CardContent, Collapse } from "@mui/material";
import { Grid } from "@mantine/core";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import React, { useState, useEffect, lazy } from "react";
import PropTypes from "prop-types";

const SpecialTable = lazy(() => import("./SpecialTable.jsx"));

const columns = [
  {
    accessorKey: "id",
    header: "Roll",
  },
  {
    accessorKey: "specialization",
    header: "Department",
  },
  {
    accessorKey: "programme",
    header: "Programme",
  },
  {
    accessorKey: "batch",
    header: "Batch",
  },
  {
    accessorKey: "cpi",
    header: "CPI",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
];
let year = 2022;
function checkYear() {
  const now = new Date(); // Get the current date and time
  const currentMonth = now.getMonth(); // Get the current month (0 = January, 7 = August)

  // If the month is September (8) or later, increment the year
  if (currentMonth >= 8) {
    // August is month index 7
    year = now.getFullYear(); // Update to the current year if it's past August
  }
}

function Studentcat({ branch }) {
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const specialization = branch;
  const isDS = branch === "DS";
  let programme = "";
  if (
    selectedCategory === "btech1" ||
    selectedCategory === "btech2" ||
    selectedCategory === "btech3" ||
    selectedCategory === "btech4"
  )
    programme = "B.Tech";
  else if (
    selectedCategory === "bdes1" ||
    selectedCategory === "bdes2" ||
    selectedCategory === "bdes3"
  )
    programme = "B.Des";
  else if (selectedCategory === "mtech1" || selectedCategory === "mtech2")
    programme = "M.Tech";
  else if (selectedCategory === "phd1") programme = "Phd";

  checkYear();
  console.log(year);
  if (selectedCategory)
    year =
      year - parseInt(selectedCategory[selectedCategory.length - 1], 10) + 1;
  // Toggle category dropdown
  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };
  console.log(programme, branch, year, selectedCategory);

  // Fetch data from the Django API when selectedCategory changes
  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      setStudentData([]); // Clear previous data to avoid stale data display

      const fetchUrl = `http://127.0.0.1:8000/dep/api/all-students/${selectedCategory + specialization}/`;

      fetch(fetchUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("authToken")}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          setStudentData(data[programme][year][branch]);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching student data:", error);
          setLoading(false);
        });
    }
  }, [selectedCategory, branch]); // Ensure this updates on both selectedCategory and branch changes

  // Function to render the student table
  const renderStudentTable = () => {
    return (
      <SpecialTable
        title="Student"
        columns={columns}
        data={studentData}
        // branch={branch}
        rowOptions={["50", "60", "70"]}
      />
    );
  };

  return (
    <div style={{ margin: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Student Categories
      </Typography>

      <Grid container spacing={8}>
        {/* PhD Students */}
        <Grid item xs={12} sm={4}>
          <Card
            onClick={() => toggleCategory("phd")}
            style={{ margin: "10px" }}
          >
            <CardContent
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">PhD Students</Typography>
              {openCategory === "phd" ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </CardContent>
            <Collapse in={openCategory === "phd"}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "10px",
                  padding: "0 16px",
                }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setSelectedCategory("phd1")}
                  style={{ marginBottom: "5px" }}
                >
                  PhD {branch} Students
                </Button>
              </div>
            </Collapse>
          </Card>
        </Grid>

        {/* MTech Students */}
        <Grid item xs={12} sm={4}>
          <Card
            onClick={() => toggleCategory("mtech")}
            style={{ margin: "10px" }}
          >
            <CardContent
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">MTech Students</Typography>
              {openCategory === "mtech" ? (
                <ExpandLessIcon />
              ) : (
                <ExpandMoreIcon />
              )}
            </CardContent>
            <Collapse in={openCategory === "mtech"}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "10px",
                  padding: "0 16px",
                }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setSelectedCategory("mtech1")}
                  style={{ marginBottom: "5px" }}
                >
                  M.Tech First Year
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setSelectedCategory("mtech2")}
                  style={{ marginBottom: "5px" }}
                >
                  M.Tech Second Year
                </Button>
              </div>
            </Collapse>
          </Card>
        </Grid>

        {/* BTech Students */}
        <Grid item xs={12} sm={4}>
          <Card
            onClick={() => toggleCategory("btech")}
            style={{ margin: "10px" }}
          >
            <CardContent
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">BTech Students</Typography>
              {openCategory === "btech" ? (
                <ExpandLessIcon />
              ) : (
                <ExpandMoreIcon />
              )}
            </CardContent>
            <Collapse in={openCategory === "btech"}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "10px",
                  padding: "0 16px",
                }}
              >
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setSelectedCategory(isDS ? "bdes1" : "btech1")}
                  style={{ marginBottom: "5px" }}
                >
                  {isDS ? "B.Des First Year" : "B.Tech First Year"}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setSelectedCategory(isDS ? "bdes2" : "btech2")}
                  style={{ marginBottom: "5px" }}
                >
                  {isDS ? "B.Des Second Year" : "B.Tech Second Year"}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setSelectedCategory(isDS ? "bdes3" : "btech3")}
                  style={{ marginBottom: "5px" }}
                >
                  {isDS ? "B.Des Third Year" : "B.Tech Third Year"}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => setSelectedCategory(isDS ? "bdes4" : "btech4")}
                  style={{ marginBottom: "5px" }}
                >
                  {isDS ? "B.Des Final Year" : "B.Tech Final Year"}
                </Button>
              </div>
            </Collapse>
          </Card>
        </Grid>
      </Grid>

      {/* Render Student Table Based on Selected Category */}
      <div style={{ marginTop: "20px" }}>
        {loading ? (
          <Typography>Loading data...</Typography>
        ) : (
          selectedCategory && renderStudentTable()
        )}
      </div>
    </div>
  );
}

export default Studentcat;

Studentcat.propTypes = {
  branch: PropTypes.string.isRequired,
};
