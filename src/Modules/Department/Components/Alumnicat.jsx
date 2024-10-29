import { Button, Typography, Card, CardContent, Collapse } from "@mui/material";
import { Grid } from "@mantine/core";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import React, { useState, Suspense, lazy } from "react";
import studentData from "./Data/Data";

// Lazy load the SpecialTable component
const SpecialTable = lazy(() => import("./SpecialTable"));

const columns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "year", header: "Year" },
];

function Alumnicat() {
  const [openCategory, setOpenCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const toggleCategory = (category) => {
    setOpenCategory(openCategory === category ? null : category);
  };

  const renderStudentTable = (category) => {
    const data = studentData[category];
    return (
      <Suspense fallback={<Typography>Loading table...</Typography>}>
        <SpecialTable
          title="Student"
          columns={columns}
          data={data}
          rowOptions={["3", "4", "6"]}
        />
      </Suspense>
    );
  };

  return (
    <div style={{ margin: "20px" }}>
      <Typography variant="h4" gutterBottom>
        Student Categories
      </Typography>
      <Grid container spacing={8}>
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
                  onClick={() => setSelectedCategory("phd")}
                  style={{ marginBottom: "5px" }}
                >
                  PhD Students
                </Button>
              </div>
            </Collapse>
          </Card>
        </Grid>

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
                  M.Tech Students
                </Button>
              </div>
            </Collapse>
          </Card>
        </Grid>

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

      <div style={{ marginTop: "20px" }}>
        {selectedCategory && renderStudentTable(selectedCategory)}
      </div>
    </div>
  );
}

export default Alumnicat;
