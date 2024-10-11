import {
  Checkbox,
  Container,
  Divider,
  Group,
  Button,
  Select,
  TextInput,
  Stack,
  Title,
} from "@mantine/core";
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import ArrowCircleLeftOutlinedIcon from "@mui/icons-material/ArrowCircleLeftOutlined";
import ArrowCircleRightOutlinedIcon from "@mui/icons-material/ArrowCircleRightOutlined";

const handlePrint = () => {
  window.print();
};

function ViewHistory() {
  const [selectedFollowUp, setSelectedFollowUp] = useState("04/09/2024");
  const [printLatestFollowUp, setPrintLatestFollowUp] = useState(true);
  const [printWholePrescription, setPrintWholePrescription] = useState(false);

  const followUpData = {
    "04/09/2024": {
      doctor: "GS Sandhu",
      disease: "Fever",
      medicines: [
        {
          name: "Paracetamol",
          quantity: 10,
          days: 5,
          times: 2,
          expiry: "31/07/2025",
        },
        {
          name: "Dolo 650",
          quantity: 11,
          days: 5,
          times: 2,
          expiry: "04/07/2026",
        },
      ],
    },
    "02/09/2024": {
      doctor: "GS Sandhu",
      disease: "Fever",
      medicines: [
        {
          name: "Ibuprofen",
          quantity: 12,
          days: 6,
          times: 2,
          expiry: "30/12/2025",
        },
        {
          name: "Cetirizine",
          quantity: 8,
          days: 4,
          times: 1,
          expiry: "01/01/2026",
        },
      ],
    },
  };

  const handleCheckboxChange = (checkbox) => {
    if (checkbox === "latest") {
      setPrintLatestFollowUp(true);
      setPrintWholePrescription(false);
    } else {
      setPrintLatestFollowUp(false);
      setPrintWholePrescription(true);
    }
  };

  const renderPrescriptionTable = (data) => (
    <table className="w-full text-sm text-left text-black">
      <caption className="text-lg font-bold">
        Revoked Medicine in this Follow-up
      </caption>
      <thead className="text-xs text-purple-700 uppercase bg-purple-50">
        <tr>
          <th className="px-6 py-3">Medicine</th>
          <th className="px-6 py-3">Quantity</th>
          <th className="px-6 py-3">Days</th>
          <th className="px-6 py-3">Times</th>
          <th className="px-6 py-3">Expiry Date</th>
        </tr>
      </thead>
      <tbody>
        {data.medicines.map((medicine, index) => (
          <tr className="bg-white border-b" key={index}>
            <th className="px-6 py-4 font-medium text-black">
              {medicine.name}
            </th>
            <td className="px-6 py-4">{medicine.quantity}</td>
            <td className="px-6 py-4">{medicine.days}</td>
            <td className="px-6 py-4">{medicine.times}</td>
            <td className="px-6 py-4">{medicine.expiry}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <Container>
        <Group position="center" spacing="xl" p="md">
          <ArrowCircleLeftOutlinedIcon fontSize="large" />
          <NavLink
            to="/history"
            style={({ isActive }) => ({
              textDecoration: "none",
              fontSize: "1.25rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "black" : "black",
            })}
          >
            History
          </NavLink>
          <Divider orientation="vertical" />
          <NavLink
            to="/feedback"
            style={({ isActive }) => ({
              textDecoration: "none",
              fontSize: "1.25rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "black" : "black",
            })}
          >
            Feedback
          </NavLink>
          <Divider orientation="vertical" />
          <NavLink
            to="/schedule"
            style={({ isActive }) => ({
              textDecoration: "none",
              fontSize: "1.25rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "black" : "black",
            })}
          >
            Schedule
          </NavLink>
          <Divider orientation="vertical" />
          <NavLink
            to="/announcements"
            style={({ isActive }) => ({
              textDecoration: "none",
              fontSize: "1.25rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "black" : "black",
            })}
          >
            Announcements
          </NavLink>
          <Divider orientation="vertical" />
          <NavLink
            to="/medical-relief/prescription"
            style={({ isActive }) => ({
              textDecoration: "none",
              fontSize: "1.25rem",
              fontWeight: isActive ? "bold" : "normal",
              color: isActive ? "black" : "black",
            })}
          >
            Medical Relief
          </NavLink>
          <ArrowCircleRightOutlinedIcon fontSize="large" />
        </Group>
      </Container>

      <div>
        <div style={{ fontSize: "2rem", fontWeight: "bold" }}>
          22BCS219's Prescription History
        </div>
        <br />
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <Checkbox
            p="Print Latest Follow-up"
            checked={printLatestFollowUp}
            onChange={() => handleCheckboxChange("latest")}
            color="purple"
          />
          <Checkbox
            p="Print Whole Prescription"
            checked={printWholePrescription}
            onChange={() => handleCheckboxChange("whole")}
            color="purple"
          />
          <Button
            onClick={handlePrint}
            style={{ backgroundColor: "#DDD6FE", color: "#6A0DAD" }}
          >
            Print
          </Button>
        </div>

        {!printWholePrescription && (
          <div>
            <Select
              value={selectedFollowUp}
              onChange={(value) => setSelectedFollowUp(value)}
              data={[
                {
                  value: "04/09/2024",
                  p: "Follow-up on September 04, 2024",
                },
                {
                  value: "02/09/2024",
                  p: "Follow-up on September 02, 2024",
                },
              ]}
            />
          </div>
        )}
        <br />

        {printLatestFollowUp && (
          <div>
            <div style={{ display: "flex" }}>
              <div style={{ flexDirection: "column" }}>
                <p>Doctor</p>
                <div
                  style={{
                    backgroundColor: "#E6E6FA",
                    color: "#6A0DAD",
                    padding: "0.5rem",
                    width: "8rem",
                  }}
                >
                  {followUpData[selectedFollowUp].doctor}
                </div>
              </div>
              <div style={{ flexDirection: "column", marginLeft: "2rem" }}>
                <p>Detail of Disease</p>
                <div
                  style={{
                    backgroundColor: "#E6E6FA",
                    color: "#6A0DAD",
                    padding: "0.5rem",
                  }}
                >
                  {followUpData[selectedFollowUp].disease}
                </div>
              </div>
            </div>
            {renderPrescriptionTable(followUpData[selectedFollowUp])}
          </div>
        )}

        {printWholePrescription && (
          <div>
            <div style={{ display: "flex" }}>
              <div style={{ flexDirection: "column" }}>
                <p>Doctor</p>
                <div
                  style={{
                    backgroundColor: "#E6E6FA",
                    color: "#6A0DAD",
                    padding: "0.5rem",
                    width: "8rem",
                  }}
                >
                  {followUpData["04/09/2024"].doctor}
                </div>
              </div>
              <div style={{ flexDirection: "column", marginLeft: "2rem" }}>
                <p>Detail of Disease</p>
                <div
                  style={{
                    backgroundColor: "#E6E6FA",
                    color: "#6A0DAD",
                    padding: "0.5rem",
                  }}
                >
                  {followUpData["04/09/2024"].disease}
                </div>
              </div>
            </div>
            {renderPrescriptionTable(followUpData["04/09/2024"])}

            <br />

            <div style={{ display: "flex" }}>
              <div style={{ flexDirection: "column" }}>
                <p>Doctor</p>
                <div
                  style={{
                    backgroundColor: "#E6E6FA",
                    color: "#6A0DAD",
                    padding: "0.5rem",
                    width: "8rem",
                  }}
                >
                  {followUpData["02/09/2024"].doctor}
                </div>
              </div>
              <div style={{ flexDirection: "column", marginLeft: "2rem" }}>
                <p>Detail of Disease</p>
                <div
                  style={{
                    backgroundColor: "#E6E6FA",
                    color: "#6A0DAD",
                    padding: "0.5rem",
                  }}
                >
                  {followUpData["02/09/2024"].disease}
                </div>
              </div>
            </div>
            {renderPrescriptionTable(followUpData["02/09/2024"])}
          </div>
        )}

        <Stack>
          <Title order={5}>Text Suggested</Title>
          <TextInput
            placeholder="none"
            styles={{
              root: { marginBottom: "1rem" },
              input: {
                backgroundColor: "#E9D8FD",
                color: "#4B0082",
                padding: "0.5rem",
              },
            }}
          />
          <Button
            className="bg-purple-500" // Mantine already applies a default style
            style={{
              backgroundColor: "#6B5B9A", // Custom color for the button
              color: "white",
              marginTop: "1.25rem", // Equivalent to 'my-5'
              padding: "0.5rem 1rem", // Equivalent to 'px-5 py-2'
            }}
          >
            View Report
          </Button>
        </Stack>
      </div>
    </>
  );
}

export default ViewHistory;
