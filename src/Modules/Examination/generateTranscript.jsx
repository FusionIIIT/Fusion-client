import React, { useState, useEffect } from "react";
import {
  Alert,
  Card,
  Paper,
  Select,
  Button,
  Stack,
  Group,
  Box,
  SimpleGrid,
  LoadingOverlay,
} from "@mantine/core";
import axios from "axios";
import { useSelector } from "react-redux";
import Transcript from "./components/transcript.jsx";
import {
  generate_transcript_form,
  generate_result,
} from "./routes/examinationRoutes.jsx";
import { SEMESTER_OPTIONS } from "./constants/semesterOptions.jsx";

export default function GenerateTranscript() {
  const userRole = useSelector((state) => state.user.role);
  const [formData, setFormData] = useState({
    batch: "",
    semester: null,
  });
  const [formOptions, setFormOptions] = useState({
    batches: [],
    semesters: [],
  });
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormOptions = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found!");
        return;
      }
      try {
        setLoading(true);
        const { data } = await axios.get(generate_transcript_form, {
          params: { role: userRole },
          headers: { Authorization: `Token ${token}` },
        });
        const batches = (data.batches || []).slice().sort((a, b) => {
          const yearA = parseInt((a.label || "").match(/(\d{4})/g)?.pop() || 0);
          const yearB = parseInt((b.label || "").match(/(\d{4})/g)?.pop() || 0);
          return yearB - yearA;
        });
        setFormOptions({
          batches: batches.map((batch) => ({
            value: batch.id.toString(),
            label: batch.label,
          })),
          semesters: SEMESTER_OPTIONS,
        });
      } catch (e) {
        setError(`Error fetching form options: ${e.message}`);
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFormOptions();
  }, [userRole]);

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setShowTranscript(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found!");
      return;
    }
    if (!formData.batch) {
      setError("Please select a batch.");
      return;
    }
    if (!formData.semester) {
      setError("Please select a semester.");
      return;
    }
    const { no: semester_no, type: semester_type } = JSON.parse(
      formData.semester,
    );
    try {
      setLoading(true);
      const requestData = {
        Role: userRole,
        ...formData,
        semester: semester_no,
        semester_type,
      };
      const { data } = await axios.post(generate_transcript_form, requestData, {
        headers: { Authorization: `Token ${token}` },
      });
      setTranscriptData(data);
      setShowTranscript(true);
      setError(null);
    } catch (err) {
      setError(`Error generating transcript: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found!");
      return;
    }
    if (!formData.batch) {
      setError("Please select a batch.");
      return;
    }
    if (!formData.semester) {
      setError("Please select a semester.");
      return;
    }
    const { no: semester_no, type: semester_type } = JSON.parse(
      formData.semester,
    );
    try {
      setLoading(true);
      const requestData = {
        Role: userRole,
        batch: formData.batch,
        semester: semester_no,
        semester_type,
      };
      const response = await axios.post(generate_result, requestData, {
        headers: { Authorization: `Token ${token}` },
        responseType: "blob",
      });
      const batchOption = formOptions.batches.find(
        (opt) => opt.value === formData.batch,
      );
      const semesterOption = formOptions.semesters.find(
        (opt) => opt.value === formData.semester,
      );
      const batchLabel = batchOption ? batchOption.label : formData.batch;
      const semesterLabel = semesterOption
        ? semesterOption.label
        : `Semester ${semester_no}`;
      const fileName = `${batchLabel}_${semesterLabel}.xlsx`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setError(null);
    } catch (err) {
      setError(`Error downloading CSV Approval Sheet: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Stack spacing="md" pos="relative">
        <LoadingOverlay visible={loading} />
        {error && (
          <Alert color="red" radius="sm">
            {error}
          </Alert>
        )}
        <Paper shadow="sm" radius="sm" p="md" withBorder>
          <Stack spacing="md">
            <h1>Transcript Details</h1>
            <form onSubmit={handleSubmit}>
              <SimpleGrid cols={2} spacing="md">
                <Box>
                  <Select
                    label="Batch"
                    placeholder="Select or type to search batch"
                    data={formOptions.batches}
                    value={formData.batch?.toString()}
                    onChange={handleChange("batch")}
                    radius="sm"
                    searchable
                    nothingFoundMessage="No matching batch"
                  />
                </Box>
                <Box>
                  <Select
                    label="Semester"
                    placeholder="Select Semester"
                    data={formOptions.semesters}
                    value={formData.semester}
                    onChange={handleChange("semester")}
                    radius="sm"
                  />
                </Box>
              </SimpleGrid>
              <Group position="right" mt="md">
                <Button type="submit" size="md" radius="sm">
                  Generate Transcript
                </Button>
                <Button
                  size="md"
                  radius="sm"
                  color="green"
                  onClick={handleDownloadCSV}
                >
                  Download CSV Approval Sheet
                </Button>
              </Group>
            </form>
          </Stack>
        </Paper>
        {showTranscript && (
          <Paper shadow="sm" radius="sm" p="md" withBorder>
            <Transcript
              data={transcriptData}
              semester={JSON.parse(formData.semester)}
            />
          </Paper>
        )}
      </Stack>
    </Card>
  );
}
