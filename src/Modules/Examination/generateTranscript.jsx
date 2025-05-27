import React, { useState, useEffect } from "react";
import {
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
import Transcript from "./components/transcript.jsx";
import {
  generate_transcript_form,
  generate_result,
} from "./routes/examinationRoutes.jsx";
import { useSelector } from "react-redux";

export default function GenerateTranscript() {
  const userRole = useSelector((state) => state.user.role);
  const [formData, setFormData] = useState({
    programme: "",
    batch: "",
    semester: null,         // now stores JSON string e.g. '{"no":1,"type":"Odd Semester"}'
    specialization: "",
  });
  const [formOptions, setFormOptions] = useState({
    programme: [],
    batches: [],
    semesters: [],
    specializations: [],
  });
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // same semesterOptions as in CheckResult
  const semesterOptions = [
    { value: JSON.stringify({ no: 1, type: "Odd Semester" }), label: "Semester 1" },
    { value: JSON.stringify({ no: 2, type: "Even Semester" }), label: "Semester 2" },
    { value: JSON.stringify({ no: 2, type: "Summer Semester" }), label: "Summer 1" },
    { value: JSON.stringify({ no: 3, type: "Odd Semester" }), label: "Semester 3" },
    { value: JSON.stringify({ no: 4, type: "Even Semester" }), label: "Semester 4" },
    { value: JSON.stringify({ no: 4, type: "Summer Semester" }), label: "Summer 2" },
    { value: JSON.stringify({ no: 5, type: "Odd Semester" }), label: "Semester 5" },
    { value: JSON.stringify({ no: 6, type: "Even Semester" }), label: "Semester 6" },
    { value: JSON.stringify({ no: 6, type: "Summer Semester" }), label: "Summer 3" },
    { value: JSON.stringify({ no: 7, type: "Odd Semester" }), label: "Semester 7" },
    { value: JSON.stringify({ no: 8, type: "Even Semester" }), label: "Semester 8" },
    { value: JSON.stringify({ no: 9, type: "Summer Semester" }), label: "Summer 4" },
  ];

  // Fetch form options
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

        const uniqueProgramme = [...new Set(data.programmes || [])];
        const batches = data.batches || [];
        const uniqueSpecializations = [
          ...new Set((data.specializations || []).map((spec) => spec.trim())),
        ];

        setFormOptions({
          programme: uniqueProgramme.map((prog) => ({ value: prog, label: prog })),
          batches: batches.map((batch) => ({ value: batch.id.toString(), label: batch.label })),
          semesters: semesterOptions,
          specializations: uniqueSpecializations.map((spec) => ({ value: spec, label: spec })),
        });
      } catch (e) {
        setError("Error fetching form options: " + e.message);
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
    if (!formData.semester) {
      setError("Please select a semester.");
      return;
    }

    const { no: semester_no, type: semester_type } = JSON.parse(formData.semester);

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
      setError("Error generating transcript: " + err.message);
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
    if (!formData.semester) {
      setError("Please select a semester.");
      return;
    }

    const { no: semester_no, type: semester_type } = JSON.parse(formData.semester);

    try {
      setLoading(true);
      const requestData = {
        Role: userRole,
        batch: formData.batch,
        semester: semester_no,
        semester_type,
        specialization: formData.specialization,
      };
      const response = await axios.post(generate_result, requestData, {
        headers: { Authorization: `Token ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `transcript_${formData.batch}_sem${semester_no}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setError(null);
    } catch (err) {
      setError("Error downloading CSV transcript: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Stack spacing="md" pos="relative">
        <LoadingOverlay visible={loading}/>

        {error && (
          <Paper p="sm" color="red" radius="sm" withBorder>
            {error}
          </Paper>
        )}

        <Paper shadow="sm" radius="sm" p="md" withBorder>
          <Stack spacing="md">
            <h1>Transcript Details</h1>
            <form onSubmit={handleSubmit}>
              <SimpleGrid cols={4} spacing="md">
                <Box>
                  <Select
                    label="Program"
                    placeholder="Select Program"
                    data={formOptions.programme}
                    value={formData.programme}
                    onChange={handleChange("programme")}
                    radius="sm"
                  />
                </Box>
                <Box>
                  <Select
                    label="Batch"
                    placeholder="Select Batch"
                    data={formOptions.batches}
                    value={formData.batch?.toString()}
                    onChange={handleChange("batch")}
                    radius="sm"
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
                <Box>
                  <Select
                    label="Specialization"
                    placeholder="Select Specialization"
                    data={formOptions.specializations}
                    value={formData.specialization}
                    onChange={handleChange("specialization")}
                    radius="sm"
                  />
                </Box>
              </SimpleGrid>
              <Group position="right" mt="md">
                <Button
                  type="submit"
                  size="md"
                  radius="sm"
                >
                  Generate Transcript
                </Button>
                <Button
                  size="md"
                  radius="sm"
                  color="green"
                  onClick={handleDownloadCSV}
                >
                  Download CSV Transcript
                </Button>
              </Group>
            </form>
          </Stack>
        </Paper>

        {showTranscript && (
          <Paper shadow="sm" radius="sm" p="md" withBorder>
            <Transcript data={transcriptData} semester={(JSON.parse(formData.semester))} />
          </Paper>
        )}
      </Stack>
    </Card>
  );
}
