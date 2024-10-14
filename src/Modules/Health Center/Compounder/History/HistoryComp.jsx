import { NavLink } from "react-router-dom";
import { Radio, Table } from "@mantine/core";
import FaceIcon from "@mui/icons-material/Face";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import NavCom from "../NavCom";

function HistoryCompounder() {
  const elements = [
    {
      id: "22bcs219",
      treated: "GS Sandhu",
      date: "11/09/2024",
      details: "Fever",
      report: "",
      prescription: "View",
    },
    {
      id: "22bcs204",
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
        {element.id}
      </Table.Td>
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
      <NavCom />

      <div style={{ margin: "2rem" }}>
        <div
          style={{
            display: "flex",
            padding: "0.5rem",
            border: "1px solid",
            backgroundColor: "white",
            borderRadius: "9999px",
            width: "18rem",
          }}
        >
          <NavLink
            to="/compounder/patient-log/update"
            style={{
              textDecoration: "none",
              color: "black",
            }}
          >
            <Radio label="Update Patient Log" color="grape" variant="outline" />
          </NavLink>

          <NavLink
            to="/compounder/patient-log/history"
            style={{
              textDecoration: "none",
              color: "black",
              marginLeft: "20px",
            }}
          >
            <Radio
              label="History"
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
                <Table.Th>Patient Id</Table.Th>
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

export default HistoryCompounder;
