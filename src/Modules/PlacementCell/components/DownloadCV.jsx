import React, { useState } from "react";
import { Button, Checkbox, Group, Text, Title } from "@mantine/core";
import axios from "axios";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

const csrfToken = getCookie('csrftoken');

const DownloadCV = () => {
  const [fields, setFields] = useState({
    achievements: true,
    education: true,
    skills: true,
    references: true,
    conferences: true,
    patents: true,
    publications: true,
    experience: true,
    projects: true,
    extracurriculars: true,
    courses: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("authToken"); 
    console.log("Auth Token:", token);
    try {
        const response = await axios.post(
            "http://127.0.0.1:8000/placement/api/generate-cv/",
            fields,
            {
                headers: {
                    'Authorization': `Token ${token}`,
                    'X-CSRFToken': getCookie('csrftoken'), 
                },
                responseType: "blob",
            }
        );
        const blob = new Blob([response.data], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "student_cv.pdf";
        link.click();
    } catch (error) {
        console.error("Error downloading CV:", error.response ? error.response.data : error.message);
        setError("Error downloading CV. Please try again.");
    } finally {
        setLoading(false);
    }
};



  return (
    <div style={{ padding: "20px" }}>
      <Title order={2}>Download your CV</Title>
      <Text>Select the fields to be added</Text>
      <Group mt="md">
        {Object.keys(fields).map((field) => (
          <Checkbox
            key={field}
            label={field.charAt(0).toUpperCase() + field.slice(1)}
            checked={fields[field]}
            onChange={(event) =>
              setFields({ ...fields, [field]: event.currentTarget.checked })
            }
          />
        ))}
      </Group>
      <Button mt="md" onClick={handleDownload} loading={loading} disabled={loading}>
        {loading ? "Downloading..." : "Download"}
      </Button>
      {error && <Text color="red">{error}</Text>}
    </div>
  );
};

export default DownloadCV;
