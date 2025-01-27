import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Paper, Table, Title } from "@mantine/core";
import { Download } from "@phosphor-icons/react";
import NavCom from "../Navigation";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";

function HistoryPatient() {
  const [history, setHistory] = useState([]);

  const fetchHistory = () => {
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
    setHistory(elements);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const rows = history.map((element) => (
    <tr key={element.id}>
      <td>{element.treated}</td>

      <td>{element.date}</td>
      <td>{element.details}</td>
      <td>
        {element.report ? (
          <Download size={20} color="#15abff" />
        ) : (
          <Download size={20} color="black" />
        )}
      </td>
      <td style={{ textAlign: "center" }}>
        <NavLink
          to="/healthcenter/student/prescription/:id"
          style={{
            textDecoration: "none",
            color: "#15abff",
            fontWeight: "bold",
          }}
        >
          {element.prescription}
        </NavLink>
      </td>
    </tr>
  ));

  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <br />
      <Paper shadow="xl" p="xl" withBorder>
        <Title
          order={5}
          style={{
            textAlign: "center",
            margin: "0 auto",
            color: "#15abff",
            fontWeight: "bold",
            fontSize: "24px",
          }}
        >
          Prescription
        </Title>
        <br />
        <Table
          withTableBorder
          withColumnBorders
          highlightOnHover
          striped
          horizontalSpacing="sm"
          verticalSpacing="sm"
          style={{ borderCollapse: "collapse", border: "1px solid #ccc" }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ textAlign: "center" }}>Treated By</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Date</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Details</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>Report</Table.Th>
              <Table.Th style={{ textAlign: "center" }}>
                View Prescription
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody
            style={{
              textAlign: "center",
              fontSize: "16px",
            }}
          >
            {rows}
          </Table.Tbody>
        </Table>
      </Paper>
    </>
  );
}

export default HistoryPatient;
