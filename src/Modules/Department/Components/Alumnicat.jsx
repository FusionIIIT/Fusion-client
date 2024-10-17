import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
  const [selectedCategory, setSelectedCategory] = useState(null);
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
        Alumni Student Categories
      </Typography>

      {/* PhD Students */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>PhD Students</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSelectedCategory("phdalumni")}
            style={{ margin: "5px" }}
          >
            PhD Students
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* MTech Students */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2a-content"
          id="panel2a-header"
        >
          <Typography>MTech Students</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSelectedCategory("mtechalumni")}
            style={{ margin: "5px" }}
          >
            M.Tech Students
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* BTech Students */}
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3a-content"
          id="panel3a-header"
        >
          <Typography>BTech Students</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setSelectedCategory("btechalumni")}
            style={{ margin: "5px" }}
          >
            B.Tech Students
          </Button>
        </AccordionDetails>
      </Accordion>
      <div style={{ marginTop: "20px" }}>
        {selectedCategory && renderStudentTable(selectedCategory)}
      </div>
    </div>
  );
}

export default Alumnicat;
