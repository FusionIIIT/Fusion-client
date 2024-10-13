import { NavLink } from "react-router-dom";
import { Radio, Table } from "@mantine/core";
import FaceIcon from "@mui/icons-material/Face";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import Navigation from "../Navigation";

function History() {
  const elements = [
    {
      treated: "GS Sandhu",
      date: "11/09/2024",
      details: "Fever",
      report: "",
      prescription: "View",
    },
    {
      treated: "A Shivi",
      date: "12/09/2024",
      details: "Tooth Pain",
      report: "",
      prescription: "View",
    },
  ];

  const rows = elements.map((element) => (
    <Table.Tr key={element.treated}>
      <Table.Td>
        <FaceIcon />
        {element.treated}
      </Table.Td>
      <Table.Td>{element.date}</Table.Td>
      <Table.Td>{element.details}</Table.Td>
      <Table.Td>
        {element.report ? <SystemUpdateAltIcon /> : <SystemUpdateAltIcon />}
      </Table.Td>
      <Table.Td>
        <NavLink
          to="/patient/history/view"
          style={{ textDecoration: "none", color: "#4C1D95" }}
        >
          {element.prescription}
        </NavLink>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Navigation />

      <div style={{ margin: "2rem" }}>
        <div
          style={{
            display: "flex",
            padding: "0.5rem",
            border: "1px solid",
            backgroundColor: "white",
            borderRadius: "9999px",
            width: "9rem",
          }}
        >
          <NavLink
            to="/patient/medical-relief/apply"
            style={{
              textDecoration: "none",
              color: "black",
            }}
          >
            <Radio
              label="Prescription"
              color="grape"
              variant="outline"
              defaultChecked
            />
          </NavLink>
        </div>

        <br />
        <div>
          <Table withTableBorder withColumnBorders highlightOnHover>
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: "#6D28D9", color: "white" }}>
                <Table.Th>Treated By</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Details</Table.Th>
                <Table.Th>Report</Table.Th>
                <Table.Th>View Prescription</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody
              style={{ backgroundColor: "#EDE9FE", color: "#4C1D95" }}
            >
              {rows}
            </Table.Tbody>
          </Table>
        </div>
      </div>
    </>
  );
}

export default History;
