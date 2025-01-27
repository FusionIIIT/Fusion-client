import {
  Button,
  Flex,
  Paper,
  Radio,
  Select,
  Table,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { useEffect, useState } from "react";
import NavCom from "../NavCom";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";

function CompPrescription() {
  const [prescrip, setPrescrip] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [printMode, setPrintMode] = useState("latest");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = {
          rollNumber: "22bcs219",
          doctor: "Dr. John Doe",
          diseaseDetails: "Chronic Disease Details",
          prescriptions: [
            {
              followUpDate: "2024-11-15",
              medicines: [
                {
                  medicine: "Medicine A",
                  quantity: "2",
                  days: "7",
                  times: "3",
                  date: "2024-11-20",
                },
                {
                  medicine: "Medicine B",
                  quantity: "1",
                  days: "5",
                  times: "2",
                  date: "2024-11-18",
                },
              ],
            },
            {
              followUpDate: "2024-11-10",
              medicines: [
                {
                  medicine: "Medicine C",
                  quantity: "1",
                  days: "3",
                  times: "2",
                  date: "2024-11-14",
                },
              ],
            },
          ],
        };

        setPrescrip(data);
        if (data?.prescriptions?.length > 0) {
          setSelectedDate(data.prescriptions[0].followUpDate);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (!prescrip) {
    return (
      <div>
        <h2>Prescription not available!</h2>
      </div>
    );
  }

  const filteredPrescription = prescrip?.prescriptions?.find(
    (prescription) => prescription.followUpDate === selectedDate,
  );

  const generatePrescriptionTable = (prescription) => (
    <div key={prescription.followUpDate}>
      <Title
        order={5}
        style={{
          textAlign: "center",
          color: "#15abff",
        }}
      >
        Revoked Medicine in Follow-up on {prescription.followUpDate}
      </Title>
      <Table
        withTableBorder
        withColumnBorders
        highlightOnHover
        striped
        style={{ textAlign: "center" }}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ textAlign: "center" }}>Medicine</Table.Th>
            <Table.Th style={{ textAlign: "center" }}>Quantity</Table.Th>
            <Table.Th style={{ textAlign: "center" }}>Days</Table.Th>
            <Table.Th style={{ textAlign: "center" }}>Times</Table.Th>
            <Table.Th style={{ textAlign: "center" }}>Expiry Date</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
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

  const handleFollowup = () => {
    alert("Follow-up added");
  };

  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <br />
      <Paper shadow="xl" p="xl" withBorder>
        <h1 style={{ textAlign: "center", color: "#15abff" }}>
          {prescrip?.rollNumber}'s Prescription History
        </h1>
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
              flexDirection: "row",
            }}
          >
            <Radio.Group
              name="prescription-options"
              value={printMode}
              onChange={setPrintMode}
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
                gap: "1rem",
              }}
            >
              <Radio value="latest" label="Print Latest Follow-up" />
              <Radio value="whole" label="Print Whole Prescription" />
            </Radio.Group>
          </div>

          {printMode === "latest" && prescrip?.prescriptions?.length > 0 && (
            <div style={{ width: "30%" }}>
              <Select
                value={`Follow-up on ${selectedDate}`}
                onChange={(value) => setSelectedDate(value.split(" on ")[1])}
                data={prescrip?.prescriptions?.map(
                  (prescription) => `Follow-up on ${prescription.followUpDate}`,
                )}
                sort={(a, b) => {
                  return (
                    new Date(b.split(" on ")[1]) - new Date(a.split(" on ")[1])
                  );
                }}
              />
            </div>
          )}

          <Button
            style={{
              backgroundColor: "#15abff",
              color: "white",
              padding: "10px 16px",
              cursor: "pointer",
            }}
            onClick={() => window.print()}
          >
            Print
          </Button>
        </div>

        <Flex gap="lg" align="center">
          <div style={{ paddingRight: "100px" }}>
            <Text>Doctor</Text>
            <Text
              style={{
                color: "#15abff",
                textTransform: "capitalize",
                fontWeight: "bold",
              }}
            >
              {prescrip?.doctor}
            </Text>
          </div>

          <div>
            <Text>Details of Disease</Text>
            <Text
              style={{
                color: "#15abff",
                textTransform: "capitalize",
                fontWeight: "bold",
              }}
            >
              {prescrip?.diseaseDetails}
            </Text>
          </div>

          <Button
            style={{
              marginTop: "1.4rem",
              backgroundColor: "#15abff",
            }}
            onClick={handleFollowup}
          >
            Add Follow-up
          </Button>
        </Flex>
        <br />

        <div>
          {printMode === "latest"
            ? generatePrescriptionTable(filteredPrescription)
            : prescrip?.prescriptions?.map((prescription) =>
                generatePrescriptionTable(prescription),
              )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignContent: "center",
            marginTop: "1rem",
          }}
        >
          <Textarea
            label="Text Suggested"
            placeholder="Write Here"
            style={{ width: "100%" }}
          >
            dummy data
          </Textarea>
        </div>
        <Button
          style={{
            backgroundColor: "#15abff",
            color: "white",
            padding: "5px 30px",
            marginTop: "1rem",
            marginLeft: "auto",
            marginRight: "auto",
            display: "block",
          }}
        >
          View Report
        </Button>
      </Paper>
    </>
  );
}

export default CompPrescription;
