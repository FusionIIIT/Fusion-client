import { Radio, Table } from "@mantine/core";
import { NavLink } from "react-router-dom";
import NavCom from "../NavCom";

function Record() {
  const elements = [
    {
      annDetails: "New PHC Doctor",
    },
    {
      annDetails: "New PHC Doctor",
    },
  ];

  const rows = elements.map((element) => (
    <Table.Tr key={element.annDetails}>
      <Table.Td>{element.annDetails}</Table.Td>
    </Table.Tr>
  ));
  return (
    <div>
      <NavCom />
      <div style={{ margin: "2rem" }}>
        <div
          style={{
            display: "flex",
            padding: "0.5rem",
            border: "1px solid",
            backgroundColor: "white",
            borderRadius: "9999px",
            width: "22rem",
            gap: "1rem",
          }}
        >
          <NavLink
            to="/compounder/announcement"
            style={{
              textDecoration: "none",
              color: "black",
            }}
          >
            <Radio label="Announcements" color="grape" variant="outline" />
          </NavLink>

          <NavLink
            to="/compounder/announcement/record"
            style={{
              textDecoration: "none",
              color: "black",
            }}
          >
            <Radio
              label="Announcements Record"
              color="grape"
              variant="outline"
              defaultChecked
            />
          </NavLink>
        </div>

        <br />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "50%",
            margin: "0 auto",
          }}
        >
          <Table
            withTableBorder
            withColumnBorders
            highlightOnHover
            style={{ width: "100%" }}
          >
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: "#6D28D9", color: "white" }}>
                <Table.Th style={{ textAlign: "center" }}>
                  Announcements Details
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody
              style={{
                backgroundColor: "#EDE9FE",
                color: "#4C1D95",
                textAlign: "center",
              }}
            >
              {rows}
            </Table.Tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Record;
