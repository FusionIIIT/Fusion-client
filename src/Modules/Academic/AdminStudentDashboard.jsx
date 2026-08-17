import React, { useState } from "react";
import {
  Card,
  TextInput,
  Button,
  Group,
  Loader,
  Notification,
  Space,
  Text,
} from "@mantine/core";
import axios from "axios";
import DetailList from "../../components/DetailList";
import { StudentSearchRoute } from "../../routes/academicRoutes";

export default function AdminStudentDashboard() {
  const [rollNo, setRollNo] = useState("");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    setLoading(true);
    setError("");
    setInfo(null);
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.post(
        StudentSearchRoute,
        { rollno: rollNo },
        { headers: { Authorization: `Token ${token}` } },
      );
      setInfo(data);
    } catch (err) {
      setError(err.response?.data?.error || "Student not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Group align="flex-end" gap="sm" wrap="wrap">
        <TextInput
          label="Roll Number"
          placeholder="Enter roll number"
          value={rollNo}
          onChange={(e) => setRollNo(e.currentTarget.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && rollNo && !loading && search()}
          style={{ flex: 1, minWidth: 200 }}
        />
        <Button onClick={search} disabled={!rollNo || loading}>
          {loading ? <Loader size="xs" /> : "Search Student"}
        </Button>
      </Group>
      {error && (
        <>
          <Space h="sm" />
          <Notification color="red">{error}</Notification>
        </>
      )}
      {info && (
        <>
          <Space h="lg" />
          <Text fw={600} mb="sm">
            Student Details
          </Text>
          <DetailList
            ariaLabel="Student details"
            items={Object.entries(info).map(([k, v]) => ({
              label: k.replace(/_/g, " "),
              value: v,
            }))}
          />
        </>
      )}
    </Card>
  );
}
