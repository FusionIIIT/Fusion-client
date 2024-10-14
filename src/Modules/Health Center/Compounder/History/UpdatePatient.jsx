import { NavLink } from "react-router-dom";
import { Radio, Table } from "@mantine/core";
import { useState } from "react";
import NavCom from "../NavCom";

function UpdatePatient() {
  const [entries, setEntries] = useState([]);
  const [medicine, setMedicine] = useState("");
  const [quantity, setQuantity] = useState("");
  const [days, setDays] = useState("");
  const [timesPerDay, setTimesPerDay] = useState("");

  const handleAddEntry = () => {
    if (medicine && quantity && days && timesPerDay) {
      const newEntry = {
        medicine,
        quantity,
        days,
        timesPerDay,
      };
      setEntries([...entries, newEntry]);

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
            <Radio
              label="Update Patient Log"
              color="grape"
              variant="outline"
              defaultChecked
            />
          </NavLink>

          <NavLink
            to="/compounder/patient-log/history"
            style={{
              textDecoration: "none",
              color: "black",
              marginLeft: "20px",
            }}
          >
            <Radio label="History" color="grape" variant="outline" />
          </NavLink>
        </div>

        <div>
          <div style={{ display: "flex" }}>
            <div style={{ paddingRight: "100px" }}>
              <p style={{ marginBottom: "2px" }}>Patient</p>
              <input
                type="text"
                placeholder="Patient Id"
                style={{
                  backgroundColor: "#EDE9FE",
                  color: "#4C1D95",
                  border: "none",
                  paddingLeft: "5px",
                  paddingRight: "40%",
                }}
              />
            </div>

            <div>
              <p style={{ marginBottom: "2px" }}>Doctor</p>
              <select
                name="doctor"
                style={{
                  backgroundColor: "#EDE9FE",
                  color: "#4C1D95",
                  border: "none",
                  padding: "1px 40% 1px 5px",
                }}
              >
                <option value="" disabled selected>
                  --Select--
                </option>
                <option value="gs-sandhu">GS Sandhu</option>
                <option value="aditya-shivi">Aditya Shivi</option>
              </select>
            </div>
          </div>

          <div>
            <p style={{ marginBottom: "2px" }}>Details of Disease</p>
            <input
              type="text"
              name="diseaseDetails"
              placeholder="Input Text"
              style={{
                backgroundColor: "#EDE9FE",
                color: "#4C1D95",
                border: "none",
                padding: "1px 40% 1px 5px",
                width: "100%",
              }}
            />
          </div>
        </div>

        <br />
        <div style={{ display: "flex", marginBottom: "1rem" }}>
          <div style={{ marginRight: "5px", flex: 1 }}>
            <Table highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr
                  style={{ backgroundColor: "#6D28D9", color: "white" }}
                >
                  <Table.Th>Medicine</Table.Th>
                  <Table.Th>Quantity</Table.Th>
                  <Table.Th>No. of Days</Table.Th>
                  <Table.Th>Times per Day</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody
                style={{ backgroundColor: "#EDE9FE", color: "#4C1D95" }}
              >
                {entries.map((entry, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>{entry.medicine}</Table.Td>
                    <Table.Td>{entry.quantity}</Table.Td>
                    <Table.Td>{entry.days}</Table.Td>
                    <Table.Td>{entry.timesPerDay}</Table.Td>
                    <Table.Td>
                      <button
                        onClick={() => handleDeleteEntry(index)}
                        style={{
                          backgroundColor: "#FF4D4D",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          padding: "5px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </Table.Td>
                  </Table.Tr>
                ))}
                <Table.Tr>
                  <Table.Td>
                    <select
                      name="medicine"
                      value={medicine}
                      onChange={(e) => setMedicine(e.target.value)}
                      style={{
                        backgroundColor: "#EDE9FE",
                        color: "#4C1D95",
                        border: "none",
                        width: "100%",
                      }}
                    >
                      <option value="" disabled>
                        --Select--
                      </option>
                      <option value="Paracetamol">Paracetamol</option>
                    </select>
                  </Table.Td>
                  <Table.Td>
                    <input
                      type="number"
                      name="quantity"
                      placeholder="Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      style={{
                        backgroundColor: "#EDE9FE",
                        color: "#4C1D95",
                        border: "none",
                        width: "100%",
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <input
                      type="number"
                      name="days"
                      placeholder="No. of Days"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      style={{
                        backgroundColor: "#EDE9FE",
                        color: "#4C1D95",
                        border: "none",
                        width: "100%",
                      }}
                    />
                  </Table.Td>
                  <Table.Td>
                    <input
                      type="number"
                      name="timesPerDay"
                      placeholder="Times per Day"
                      value={timesPerDay}
                      onChange={(e) => setTimesPerDay(e.target.value)}
                      style={{
                        backgroundColor: "#EDE9FE",
                        color: "#4C1D95",
                        border: "none",
                        width: "100%",
                      }}
                    />
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </div>
          <button
            onClick={handleAddEntry}
            style={{
              backgroundColor: "#6D28D9",
              color: "white",
              padding: "5px 20px",
              borderRadius: "0px 100px 100px 0px",
              alignSelf: "flex-end",
            }}
          >
            Add
          </button>
        </div>

        <div>
          <p style={{ marginBottom: "2px" }}>Text Suggested</p>
          <input
            type="text"
            name="textSuggested"
            placeholder="Input Text"
            style={{
              backgroundColor: "#EDE9FE",
              color: "#4C1D95",
              border: "none",
              width: "100%",
            }}
          />
        </div>

        <div>
          <p style={{ marginBottom: "2px" }}>Report</p>
          <input
            type="file"
            name="report"
            style={{
              backgroundColor: "#EDE9FE",
              color: "#4C1D95",
              border: "none",
              width: "100%",
              padding: "10px",
              height: "3rem",
            }}
          />
        </div>

        <br />

        <button
          style={{
            backgroundColor: "#6D28D9",
            color: "white",
            padding: "5px 20px",
          }}
        >
          Submit
        </button>
      </div>
    </>
  );
}

export default UpdatePatient;
