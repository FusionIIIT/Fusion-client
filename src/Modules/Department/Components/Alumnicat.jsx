import { Button, Typography, Card, CardContent, Collapse } from "@mui/material";
import { Grid } from "@mantine/core"; // Assuming you're using Mantine Grid
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import React, { useState } from "react";
import SpecialTable from "./SpecialTable";
import studentData from "./Data/Data";

const columns = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "year",
    header: "Year",
  },
];

function Alumnicat() {
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Toggle category dropdown
  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  // Function to render the student table
  const renderStudentTable = (category) => {
    const data = studentData[category];
    return (
      <SpecialTable
        title="Student"
        columns={columns}
        data={data}
        rowOptions={["3", "4", "6"]}
      />
    );
  };

  return (
    <div style={{ margin: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Student Categories
      </Typography>

      {/* Adjust spacing between grid items */}
      <Grid container spacing={8}>
        {" "}
        {/* Increased spacing to 8 */}
        {/* PhD Students */}
        <Grid item xs={12} sm={4}>
          <Card
            onClick={() => toggleCategory("phd")}
            style={{ margin: "10px" }} // Added margin around each card
          >
            <CardContent
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="h6">PhD Students</Typography>
              {/* Toggle between expand and collapse icons */}
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
                  onClick={() => setSelectedCategory("phd")}
                  style={{ marginBottom: "5px" }}
                >
                  PhD Students
                </Button>
              </div>
            </Collapse>
          </Card>
        </Grid>
        {/* MTech Students */}
        <Grid item xs={12} sm={4}>
          <Card
            onClick={() => toggleCategory("mtech")}
            style={{ margin: "10px" }} // Added margin around each card
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
                  M.Tech Students
                </Button>
              </div>
            </Collapse>
          </Card>
        </Grid>
        {/* BTech Students */}
        <Grid item xs={12} sm={4}>
          <Card
            onClick={() => toggleCategory("btech")}
            style={{ margin: "10px" }} // Added margin around each card
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
                  onClick={() => setSelectedCategory("btech1")}
                  style={{ marginBottom: "5px" }}
                >
                  B.Tech Students
                </Button>
              </div>
            </Collapse>
          </Card>
        </Grid>
      </Grid>

      {/* Render Student Table Based on Selected Category */}
      <div style={{ marginTop: "20px" }}>
        {selectedCategory && renderStudentTable(selectedCategory)}
      </div>
    </div>
  );
}

export default Alumnicat;
