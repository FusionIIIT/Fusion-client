import { Radio, Table } from "@mantine/core";
import { NavLink } from "react-router-dom";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import FaceIcon from "@mui/icons-material/Face";
import Navigation from "../Navigation";

export function Approval() {
  const elements = [
    {
      uploaded: "09/09/2024",
      approval: "11/09/2024",
      description: "Testing PHC",
      file: "",
      status: "Approved",
    },
    {
      uploaded: "12/09/2024",
      approval: "12/09/2024",
      description: "Fever",
      file: "",
      status: "Approved",
    },
  ];

  const rows = elements.map((element) => (
    <Table.Tr key={element.uploaded}>
      <Table.Td>
        <FaceIcon /> {element.uploaded}
      </Table.Td>
      <Table.Td>{element.approval}</Table.Td>
      <Table.Td>{element.description}</Table.Td>
      <Table.Td>
        <SystemUpdateAltIcon /> {element.file}
      </Table.Td>
      <Table.Td>{element.status}</Table.Td>
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
            width: "22rem",
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
              label="Apply for Medical Relief"
              color="grape"
              variant="outline"
            />
          </NavLink>

          <NavLink
            to="/patient/medical-relief/approval"
            style={{
              textDecoration: "none",
              color: "black",
              marginLeft: "20px",
            }}
          >
            <Radio
              label="Approval Status"
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
                <Table.Th>Uploaded Date</Table.Th>
                <Table.Th>Approval Date</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>File</Table.Th>
                <Table.Th>Status</Table.Th>
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
