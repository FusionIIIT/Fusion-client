import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Paper, Table, Title } from "@mantine/core";
import { Download } from "@phosphor-icons/react";
import NavCom from "../NavCom";
import HistoryNavBar from "./historyPath";

function HistoryCompounder() {
  const [history, setHistory] = useState([]);

  const fetchHistory = () => {
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
    setHistory(elements);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const rows = history.map((element) => (
    <tr key={element.treated}>
      <td style={{ textAlign: "center" }}>{element.id}</td>
      <td style={{ textAlign: "center" }}>{element.treated}</td>
      <td style={{ textAlign: "center" }}>{element.date}</td>
      <td style={{ textAlign: "center" }}>{element.details}</td>
      <td style={{ textAlign: "center" }}>
        {element.report ? (
          <Download size={20} color="#4C1D95" />
        ) : (
          <Download size={20} color="#4C1D95" />
        )}
      </td>
      <td style={{ textAlign: "center" }}>
        <NavLink
          to="/patient/history/view"
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
      <NavCom />
      <HistoryNavBar />
      <br />
      <Paper shadow="xl" p="xl" withBorder>
        <Title
          order={5}
          style={{
            textAlign: "center",
            margin: "0 auto",
            color: "#15abff",
          }}
        >
          History
        </Title>
        <br />
        <Table
          withTableBorder
          withColumnBorders
          highlightOnHover
          striped
          horizontalSpacing="md"
          verticalSpacing="sm"
          style={{ overflowX: "auto" }}
        >
          <thead>
            <tr style={{ backgroundColor: "#E0F2FE", textAlign: "center" }}>
              <th>Patient Id</th>
              <th>Treated By</th>
              <th>Date</th>
              <th>Details</th>
              <th>Report</th>
              <th>View Prescription</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Paper>
    </>
  );
}

export default HistoryCompounder;
