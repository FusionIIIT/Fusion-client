import { NavLink } from "react-router-dom";
import { Radio, Table } from "@mantine/core";
import { Smiley, Download } from "@phosphor-icons/react";
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
    <tr key={element.treated}>
      <td>
        <Smiley size={24} />
        {element.id}
      </td>
      <td>
        <Smiley size={24} />
        {element.treated}
      </td>
      <td>{element.date}</td>
      <td>{element.details}</td>
      <td>
        {element.report ? <Download size={20} /> : <Download size={20} />}
      </td>
      <td>
        <NavLink
          to="/patient/history/view"
          style={{ textDecoration: "none", color: "#4C1D95" }}
        >
          {element.prescription}
        </NavLink>
      </td>
    </tr>
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
            <thead>
              <tr style={{ backgroundColor: "#6D28D9", color: "white" }}>
                <th>Patient Id</th>
                <th>Treated By</th>
                <th>Date</th>
                <th>Details</th>
                <th>Report</th>
                <th>View Prescription</th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: "#EDE9FE", color: "#4C1D95" }}>
              {rows}
            </tbody>
          </Table>
        </div>
      </div>
    </>
  );
}

export default HistoryCompounder;
