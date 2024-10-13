import { Radio, Select, Table } from "@mantine/core";
import { useState } from "react";
import Navigation from "../Navigation";

function Prescription() {
  const [isHovered, setIsHovered] = useState(false);

  const data = {
    rollNumber: "22BCS219",
    doctor: "GS Sandhu",
    diseaseDetails: "Fever",
    prescriptions: [
      {
        followUpDate: "04/09/2024",
        medicines: [
          {
            medicine: "Paracetamol",
            quantity: "10",
            days: "5",
            times: "2",
            date: "31/07/2025",
          },
        ],
      },
      {
        followUpDate: "02/09/2024",
        medicines: [
          {
            medicine: "Dolo 650",
            quantity: "11",
            days: "5",
            times: "2",
            date: "04/07/2026",
          },
        ],
      },
    ],
  };

  const [selectedDate, setSelectedDate] = useState(
    data.prescriptions[0].followUpDate,
  );
  const [printMode, setPrintMode] = useState("latest");

  const head = data.rollNumber;

  const filteredPrescription = data.prescriptions.find(
    (prescription) => prescription.followUpDate === selectedDate,
  );

  const generatePrescriptionTable = (prescription) => (
    <div key={prescription.followUpDate}>
      <p
        style={{
          fontWeight: "bolder",
          marginBottom: "10px",
          textAlign: "center",
        }}
      >
        Revoked Medicine in Follow-up on {prescription.followUpDate}
      </p>
      <Table withTableBorder withColumnBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr style={{ backgroundColor: "#6D28D9", color: "white" }}>
            <Table.Th>Medicine</Table.Th>
            <Table.Th>Quantity</Table.Th>
            <Table.Th>Days</Table.Th>
            <Table.Th>Times</Table.Th>
            <Table.Th>Expiry Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody style={{ backgroundColor: "#EDE9FE", color: "#4C1D95" }}>
          {prescription.medicines.map((medicine) => (
            <Table.Tr key={medicine.medicine}>
              <Table.Td>{medicine.medicine}</Table.Td>
              <Table.Td>{medicine.quantity}</Table.Td>
              <Table.Td>{medicine.days}</Table.Td>
              <Table.Td>{medicine.times}</Table.Td>
              <Table.Td>{medicine.date}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );

  return (
    <>
      <Navigation />
      <div style={{ margin: "2rem" }}>
        <h1>{head}'s Prescription History</h1>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Radio.Group
              name="prescription-options"
              value={printMode}
              onChange={setPrintMode}
              color="#6D28D9"
              style={{ display: "flex", alignItems: "center" }}
            >
              <Radio
                value="latest"
                label="Print Latest Follow-up"
                color="#6D28D9"
              />
              <Radio
                value="whole"
                label="Print Whole Prescription"
                color="#6D28D9"
              />
            </Radio.Group>
          </div>

          <button
            style={{
              backgroundColor: isHovered ? "#6D28D9" : "#DDD6FE",
              color: isHovered ? "white" : "#4C1D95",
              border: "none",
              padding: "4px 8px",
              cursor: "pointer",
            }}
            onClick={() => window.print()}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            Print
          </button>
        </div>

        <br />

        {printMode === "latest" && (
          <div>
            <Select
              value={`Follow-up on ${selectedDate}`}
              onChange={(value) => setSelectedDate(value.split(" on ")[1])}
              data={data.prescriptions
                .map(
                  (prescription) => `Follow-up on ${prescription.followUpDate}`,
                )
                .sort(
                  (a, b) =>
                    new Date(b.split(" on ")[1]) - new Date(a.split(" on ")[1]),
                )}
            />
          </div>
        )}

        <div style={{ display: "flex" }}>
          <div style={{ paddingRight: "100px" }}>
            <p>Doctor</p>
            <p
              style={{
                backgroundColor: "#DDD6FE",
                color: "#4C1D95",
                paddingRight: "100px",
                paddingLeft: "5px",
                marginTop: "-15px",
              }}
            >
              {data.doctor}
            </p>
          </div>
          <div>
            <p>Details of Disease</p>
            <p
              style={{
                backgroundColor: "#DDD6FE",
                color: "#4C1D95",
                paddingRight: "100px",
                paddingLeft: "5px",
                marginTop: "-15px",
              }}
            >
              {data.diseaseDetails}
            </p>
          </div>
        </div>

        <div>
          {printMode === "latest"
            ? generatePrescriptionTable(filteredPrescription)
            : data.prescriptions.map((prescription) =>
                generatePrescriptionTable(prescription),
              )}
        </div>

        <div>
          <p>Text Suggested</p>
          <p
            style={{
              backgroundColor: "#DDD6FE",
              color: "#4C1D95",
              marginTop: "-15px",
              paddingLeft: " 5px",
            }}
          >
            none
          </p>
        </div>

        <button
          style={{
            backgroundColor: "#6D28D9",
            color: "white",
            padding: "5px 20px",
          }}
        >
          View Report
        </button>
      </div>
    </>
  );
}

export default Prescription;
