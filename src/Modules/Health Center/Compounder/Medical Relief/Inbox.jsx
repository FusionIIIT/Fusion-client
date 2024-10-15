import { Radio, Table } from "@mantine/core";
import { NavLink, useNavigate } from "react-router-dom";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import FaceIcon from "@mui/icons-material/Face";
import NavCom from "../NavCom";

function Inbox() {
  const navigate = useNavigate();

  const elements = [
    {
      id: "Atul",
      date: "11/09/2024",
      description: "Application",
      file: "",
      status: "View",
    },
    {
      id: "Prateek",
      date: "11/09/2024",
      description: "Testing PHC",
      file: "",
      status: "Approved",
    },
    {
      id: "Sahil",
      date: "12/09/2024",
      description: "Fever",
      file: "",
      status: "Approved",
    },
  ];

  const handleStatusClick = (status) => {
    if (status === "View") {
      navigate("/compounder/medical-relief/application");
    }
  };

  const rows = elements.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td>
        <FaceIcon /> {element.id}
      </Table.Td>
      <Table.Td>{element.date}</Table.Td>
      <Table.Td>{element.description}</Table.Td>
      <Table.Td>
        <SystemUpdateAltIcon /> {element.file}
      </Table.Td>
      <Table.Td
        onClick={() => handleStatusClick(element.status)}
        style={{
          cursor: element.status === "View" ? "pointer" : "default",
          color: element.status === "View" ? "blue" : "inherit",
        }}
      >
        {element.status}
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
            width: "6rem",
          }}
        >
          <NavLink
            to="/compounder/medical-relief/inbox"
            style={{
              textDecoration: "none",
              color: "black",
            }}
          >
            <Radio
              label="Inbox"
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
                <Table.Th>Uploaded ID</Table.Th>
                <Table.Th>Uploaded Date</Table.Th>
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

export default Inbox;
