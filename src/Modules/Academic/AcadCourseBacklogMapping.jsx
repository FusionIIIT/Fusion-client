import React, { useState } from 'react';
import { Button, FileInput, Paper, Title, Alert, List, Card } from '@mantine/core';
import axios from 'axios';

import {
  replacement_excel
} from "../../routes/academicRoutes";

const AcadCourseBacklogMapping = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an Excel file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const token = localStorage.getItem("authToken");
    if (!token) {
      setError(new Error("No token found"));
      setUploading(false);
      return;
    }

    try {
      setUploading(true);
      setResult(null);
      setError(null);

      const response = await axios.post(replacement_excel, formData, {
        headers: { Authorization: `Token ${token}`,"Content-Type": "multipart/form-data" },
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card size="sm" mt="lg">
      <Paper shadow="md" p="lg" radius="md">
        <Title order={3} mb="sm">Upload Course Replacement Excel</Title>

        <FileInput
          label="Select Excel File"
          placeholder="Choose .xlsx file"
          accept=".xlsx"
          value={file}
          onChange={setFile}
          required
        />

        <Button mt="md" fullWidth onClick={handleUpload} loading={uploading}>
          Upload and Process
        </Button>

        {error && (
          <Alert color="red" mt="md">
            {error}
          </Alert>
        )}

        {result && (
          <>
            <Alert color="green" mt="md">
              ✅ {result.message}
            </Alert>

            {result.failed_rows?.length > 0 && (
              <>
                <Title order={5} mt="lg">❌ Failed Rows</Title>
                <List withPadding spacing="xs" size="sm" mt="xs">
                  {result.failed_rows.map((msg, idx) => (
                    <List.Item key={idx}>{msg}</List.Item>
                  ))}
                </List>
              </>
            )}
          </>
        )}
      </Paper>
    </Card>
  );
};

export default AcadCourseBacklogMapping;

