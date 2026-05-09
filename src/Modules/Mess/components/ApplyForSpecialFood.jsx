import React, { useState } from "react";
import axios from "axios";
import {
  Alert,
  Button,
  Select,
  Container,
  FileInput,
  Paper,
  Title,
  Group,
  Flex,
  Textarea,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import "@mantine/dates/styles.css";
import "dayjs/locale/en";
import { Calendar } from "@phosphor-icons/react";
import { specialFoodRequestRoute } from "../routes";

function ApplyForSpecialFood() {
  const [food, setFood] = useState("");
  const [timing, setTiming] = useState("");
  const [requestType, setRequestType] = useState("event");
  const [medicalProof, setMedicalProof] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [purpose, setPurpose] = useState("");
  const [error, setError] = useState("");
  const authToken = localStorage.getItem("authToken");
  const today = new Date();
  const minstartdate = new Date();
  minstartdate.setDate(today.getDate() + 3);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!fromDate || !toDate) {
      setError("Select both the start and end dates.");
      return;
    }

    if (requestType === "medical" && !medicalProof) {
      setError("Upload medical proof for illness-based requests.");
      return;
    }

    const requestData = new FormData();
    requestData.append("start_date", fromDate.toISOString().split("T")[0]);
    requestData.append("end_date", toDate.toISOString().split("T")[0]);
    requestData.append("status", "1");
    requestData.append("app_date", new Date().toISOString().split("T")[0]);
    requestData.append("request", purpose);
    requestData.append("item1", food);
    requestData.append("item2", timing);
    requestData.append("request_type", requestType);
    if (medicalProof) {
      requestData.append("supporting_document", medicalProof);
    }

    try {
      const response = await axios.post(specialFoodRequestRoute, requestData, {
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        alert("Special food request submitted successfully!");
        setFood("");
        setTiming("");
        setRequestType("event");
        setMedicalProof(null);
        setFromDate(null);
        setToDate(null);
        setPurpose("");
      } else {
        console.error("Failed to submit request:", response.data);
        setError(response.data.message || "Submission failed.");
      }
    } catch (submitError) {
      console.error("Error submitting request:", submitError);
      setError(submitError.response?.data?.message || submitError.message);
    }
  };

  return (
    <Container
      size="lg"
      style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}
    >
      <Paper
        shadow="md"
        radius="md"
        p="xl"
        withBorder
        style={{ width: "100%", minWidth: "70rem", padding: "2rem" }}
      >
        <Title
          order={2}
          align="center"
          mb="lg"
          style={{ color: "#1c7ed6", fontWeight: 600 }}
        >
          Apply for Special Food
        </Title>

        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="md">
            {error ? (
              <Alert color="red" variant="light">
                {error}
              </Alert>
            ) : null}

            <Select
              label="Select Food"
              placeholder="Choose food"
              data={["Dal Chawal", "Paneer Butter Masala", "Chicken Curry"]}
              value={food}
              onChange={setFood}
              required
            />

            <Select
              label="Select Food Timing"
              placeholder="Choose timing"
              data={["Breakfast", "Lunch", "Dinner"]}
              value={timing}
              onChange={setTiming}
              required
            />

            <Select
              label="Request Type"
              placeholder="Choose the reason category"
              data={[
                { value: "event", label: "Event" },
                { value: "medical", label: "Illness / Medical" },
              ]}
              value={requestType}
              onChange={(value) => setRequestType(value || "event")}
              required
            />

            <DateInput
              label="From"
              placeholder="Select start date"
              value={fromDate}
              minDate={minstartdate}
              onChange={setFromDate}
              icon={<Calendar />}
              required
            />

            <DateInput
              label="To"
              placeholder="Select end date"
              value={toDate}
              minDate={fromDate}
              onChange={setToDate}
              icon={<Calendar />}
              required
            />

            <Textarea
              label="Purpose"
              placeholder="Enter purpose"
              value={purpose}
              onChange={(event) => setPurpose(event.currentTarget.value)}
              required
            />

            <FileInput
              label="Supporting Document"
              description={
                requestType === "medical"
                  ? "Medical proof is required for illness-based requests."
                  : "Attach proof if your event request needs supporting approval."
              }
              placeholder="Upload a document"
              value={medicalProof}
              onChange={setMedicalProof}
              clearable
              required={requestType === "medical"}
            />
          </Flex>

          <Group position="right" mt="lg">
            <Button type="submit" color="blue" size="md">
              Submit
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
}

export default ApplyForSpecialFood;
