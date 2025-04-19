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
import { FileText, FileArrowDown } from "@phosphor-icons/react";
import axios from "axios";
import Transcript from "./components/transcript.jsx";
import {
  generate_transcript_form,
  generate_result,
} from "./routes/examinationRoutes.jsx";
import { useSelector } from "react-redux";

function GenerateTranscript() {
  const userRole = useSelector((state) => state.user.role);
  const [formData, setFormData] = useState({
    programme: "",
    batch: "",
    semester: "",
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

  // Fetch form options from the API on mount.
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

        // Transform API results into Select option format.
        const uniqueProgramme = [...new Set(data.programmes || [])];
        // Use the full batch objects from the API.
        const batches = data.batches || [];
        const uniqueSpecializations = [
          ...new Set((data.specializations || []).map((spec) => spec.trim())),
        ];

        setFormOptions({
          programme: uniqueProgramme.map((prog) => ({
            value: prog,
            label: prog,
          })),
          batches: batches.map((batch) => ({
            value: batch.id.toString(),
            label: batch.label,
          })),
          // Generate semesters 1 through 8.
          semesters: Array.from({ length: 8 }, (_, i) => ({
            value: (i + 1).toString(),
            label: `Semester ${i + 1}`,
          })),
          specializations: uniqueSpecializations.map((spec) => ({
            value: spec,
            label: spec,
          })),
        });
      } catch (e) {
        setError("Error fetching form options: " + e.message);
        console.error("Error fetching form options:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchFormOptions();
  }, [userRole]);

  const handleChange = (field) => (value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]:
        field === "batch" || field === "semester" ? parseInt(value) : value,
    }));
    // Hide transcript on any change.
    setShowTranscript(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found!");
      return;
    }
    try {
      setLoading(true);
      // Combine role and form values.
      const requestData = { Role: userRole, ...formData };
      const { data } = await axios.post(generate_transcript_form, requestData, {
        headers: { Authorization: `Token ${token}` },
      });
      setTranscriptData(data);
      setShowTranscript(true);
      setError(null);
    } catch (error) {
      setError("Error generating transcript: " + error.message);
      console.error("Error generating transcript:", error);
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
    try {
      setLoading(true);
      const requestData = {
        Role: userRole,
        semester: formData.semester,
        specialization: formData.specialization,
        batch: formData.batch,
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
        `transcript_${formData.batch}_sem${formData.semester}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setError(null);
    } catch (error) {
      setError("Error downloading CSV transcript: " + error.message);
      console.error("Download error:", error);
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
                    value={formData.semester?.toString()}
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
                  loading={loading}
                >
                  Generate Transcript
                </Button>
                <Button
                  size="md"
                  radius="sm"
                  color="green"
                  onClick={handleDownloadCSV}
                  loading={loading}
                >
                  Download CSV Transcript
                </Button>
              </Group>
            </form>
          </Stack>
        </Paper>

        {showTranscript && (
          <Paper shadow="sm" radius="sm" p="md" withBorder>
            <Transcript data={transcriptData} semester={formData.semester} />
          </Paper>
        )}
      </Stack>
    </Card>
  );
}

export default GenerateTranscript;
