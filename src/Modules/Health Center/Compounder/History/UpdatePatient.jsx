import {
  Button,
  Flex,
  Input,
  Paper,
  Radio,
  Select,
  Table,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import NavCom from "../NavCom";
import HistoryNavBar from "./historyPath";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";

function getDummyData(medicineName) {
  const dummyDatabase = {
    dolo: {
      manufacturerName: "Sahil",
      packSize: 2,
      stock: 100,
      expiryDate: "2025-01-01",
      stockQuantity: 450,
    },
    paracetamol: {
      manufacturerName: "ABC Pharma",
      packSize: 10,
      stock: 200,
      expiryDate: "2024-12-01",
      stockQuantity: 1000,
    },
  };

  return dummyDatabase[medicineName.toLowerCase()] || null;
}

function UpdatePatient() {
  const [entries, setEntries] = useState([]);
  const [medicine, setMedicine] = useState("");
  const [quantity, setQuantity] = useState("");
  const [days, setDays] = useState("");
  const [timesPerDay, setTimesPerDay] = useState("");
  const [selectedOption, setSelectedOption] = useState("self");
  const [dummyData, setDummyData] = useState(null);

  const handleAddEntry = () => {
    if (medicine && quantity && days && timesPerDay) {
      const newEntry = {
        medicine,
        quantity,
        days,
        timesPerDay,
      };
      setEntries([...entries, newEntry]);

      const data = getDummyData(medicine);
      setDummyData(data);

      setMedicine("");
      setQuantity("");
      setDays("");
      setTimesPerDay("");
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleDeleteEntry = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <HistoryNavBar />
      <br />
      <Paper shadow="xl" p="xl" withBorder>
        <div>
          <div style={{ display: "flex" }}>
            <div style={{ paddingRight: "100px" }}>
              <p style={{ marginBottom: "2px" }}>Patient</p>
              <Input type="text" placeholder="Patient Id" />
            </div>

            <div style={{ display: "flex", gap: "2rem" }}>
              <div>
                <p style={{ marginBottom: "2px" }}>Doctor</p>
                <Select
                  name="doctor"
                  placeholder="--Select--"
                  data={["GS Sandhu"]}
                />
              </div>

              <div>
                <p style={{ marginBottom: "2px" }}>Details of Disease</p>
                <Input
                  type="text"
                  name="diseaseDetails"
                  placeholder="Input Text"
                />
              </div>
            </div>
          </div>
        </div>
        <br />
        <div style={{ display: "flex", gap: "1rem" }}>
          <Radio
            label="Self"
            value="self"
            checked={selectedOption === "self"}
            onChange={() => setSelectedOption("self")}
          />
          <Radio
            label="Dependent"
            value="dependent"
            checked={selectedOption === "dependent"}
            onChange={() => setSelectedOption("dependent")}
          />
        </div>

        {selectedOption === "dependent" && (
          <Flex
            direction="row"
            gap="1rem"
            style={{ maxWidth: "400px", display: "flex", marginTop: "1rem" }}
          >
            <TextInput label="Dependent Name" placeholder="Write Here" />
            <TextInput label="Relation" placeholder="Write Relation" />
          </Flex>
        )}

        <br />
        <div style={{ display: "flex", marginBottom: "1rem" }}>
          <div style={{ marginRight: "5px", flex: 1 }}>
            <Title
              order={5}
              style={{
                textAlign: "center",
                margin: "0 auto",
                color: "#15abff",
              }}
            >
              Recommend Medicine
            </Title>

            <Table highlightOnHover withTableBorder withColumnBorders striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Medicine</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>No. of Days</Table.Th>
                  <Table.Th>Times per Day</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {entries.map((entry, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{entry.medicine}</Table.Td>
                    <Table.Td>{entry.quantity}</Table.Td>
                    <Table.Td>{entry.days}</Table.Td>
                    <Table.Td>{entry.timesPerDay}</Table.Td>
                    <Table.Td>
                      <Button
                        onClick={() => handleDeleteEntry(index)}
                        style={{
                          backgroundColor: "#FF4D4D",
                          color: "white",

                          padding: "5px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
                <Table.Tr>
                  <Table.Td>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <Input
                        name="medicine"
                        value={medicine}
                        onChange={(e) => setMedicine(e.target.value)}
                        placeholder="Write Medicine Name"
                      />
                      <MagnifyingGlass
                        size={32}
                        style={{
                          backgroundColor: "#15abff",
                          color: "white",
                          padding: "0.2rem",
                          cursor: "pointer",
                        }}
                      />
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <Input
                      type="number"
                      name="quantity"
                      placeholder="Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Input
                      type="number"
                      name="days"
                      placeholder="No. of Days"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Input
                      type="number"
                      name="timesPerDay"
                      placeholder="Times per Day"
                      value={timesPerDay}
                      onChange={(e) => setTimesPerDay(e.target.value)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Button
                      onClick={handleAddEntry}
                      style={{
                        backgroundColor: "#15abff",
                        color: "white",
                        padding: "5px 18px",
                        cursor: "pointer",
                      }}
                    >
                      Add
                    </Button>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </div>
        </div>

        {dummyData && (
          <div style={{ marginTop: "2rem" }}>
            <Title
              order={5}
              style={{
                textAlign: "center",
                color: "#15abff",
              }}
            >
              Medicine's Details
            </Title>
            <Table highlightOnHover withTableBorder withColumnBorders striped>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Manufacturer Name</Table.Th>
                  <Table.Th>Pack Size</Table.Th>
                  <Table.Th>Stock</Table.Th>
                  <Table.Th>Expiry Date</Table.Th>
                  <Table.Th>Stock Quantity</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>{dummyData.manufacturerName}</Table.Td>
                  <Table.Td>{dummyData.packSize}</Table.Td>
                  <Table.Td>{dummyData.stock}</Table.Td>
                  <Table.Td>{dummyData.expiryDate}</Table.Td>
                  <Table.Td>{dummyData.stockQuantity}</Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </div>
        )}

        <div style={{ display: "flex", gap: "2rem" }}>
          <div
            style={{ display: "flex", flexDirection: "column", width: "30%" }}
          >
            <Input.Label style={{ marginBottom: "0.5rem" }}>
              Text Suggested
            </Input.Label>
            <Textarea
              type="text"
              name="textSuggested"
              placeholder="Input Text"
              style={{
                width: "100%",
              }}
            />
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", width: "30%" }}
          >
            <Input.Label style={{ marginBottom: "0.5rem" }}>Report</Input.Label>
            <Input
              type="file"
              name="report"
              style={{
                width: "100%",
              }}
            />
          </div>
        </div>

        <br />

        <Button
          style={{
            backgroundColor: "#15abff",
            color: "white",
            padding: "5px 20px",
            width: "20%",
          }}
        >
          Submit
        </Button>
      </Paper>
    </>
  );
}

export default UpdatePatient;
