// StudentCategory.js
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import SpecialTable from "./SpecialTable";
import studentData from "./data";

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

function Studentcat() {
  const [selectedCategory, setSelectedCategory] = useState(null);

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

      {/* PhD Students */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="phd-content"
          id="phd-header"
        >
          <Typography>PhD Students</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSelectedCategory("phd")}
            style={{ margin: "5px" }}
          >
            PhD CSE Students
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* MTech Students */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="mtech-content"
          id="mtech-header"
        >
          <Typography>MTech Students</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSelectedCategory("mtech1")}
            style={{ margin: "5px" }}
          >
            M.Tech First Year
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSelectedCategory("mtech2")}
            style={{ margin: "5px" }}
          >
            M.Tech Second Year
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* BTech Students */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="btech-content"
          id="btech-header"
        >
          <Typography>BTech Students</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSelectedCategory("btech1")}
            style={{ margin: "5px" }}
          >
            B.Tech First Year
          </Button>
          <Button variant="outlined" color="primary" style={{ margin: "5px" }}>
            B.Tech Second Year
          </Button>
          <Button variant="outlined" color="primary" style={{ margin: "5px" }}>
            B.Tech Third Year
          </Button>
          <Button variant="outlined" color="primary" style={{ margin: "5px" }}>
            B.Tech Final Year
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Render Student Table Based on Selected Category */}
      <div style={{ marginTop: "20px" }}>
        {selectedCategory && renderStudentTable(selectedCategory)}
      </div>
    </div>
  );
}

export default Studentcat;
