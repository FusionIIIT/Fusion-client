import React, { useState } from "react";
import { useForm } from "@mantine/form";
import { Card, Title, FileInput, Button, Alert, Progress, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX, IconUpload } from '@tabler/icons-react';
import axios from "axios";
import { thesisSubmitRoute } from "../../../routes/academicRoutes";

const MAX_SYNOPSIS_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_THESIS_SIZE = 25 * 1024 * 1024; // 25MB

export default function StudentThesisSubmissionUploadForm() {
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const form = useForm({
    initialValues: { synopsis: null, thesis_report: null },
    validate: {
      synopsis: (value) => {
        if (!value) return 'Synopsis is required';
        if (value.size > MAX_SYNOPSIS_SIZE) return 'Synopsis must be ≤ 5MB';
        if (value.type !== 'application/pdf') return 'Synopsis must be a PDF';
        return null;
      },
      thesis_report: (value) => {
        if (!value) return 'Thesis report is required';
        if (value.size > MAX_THESIS_SIZE) return 'Thesis report must be ≤ 25MB';
        if (value.type !== 'application/pdf') return 'Thesis report must be a PDF';
        return null;
      },
    },
  });

  const handleSubmit = async (values) => {
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      showNotification({ 
        message: "Authentication required. Please log in.", 
        color: "red", 
        icon: <IconX /> 
      });
      return;
    }

    const data = new FormData();
    data.append("synopsis", values.synopsis);
    data.append("thesis_report", values.thesis_report);

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 min timeout for large files

      await axios.post(thesisSubmitRoute, data, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      clearTimeout(timeoutId);
      showNotification({ 
        message: "Thesis submitted successfully", 
        color: "teal", 
        icon: <IconCheck /> 
      });
      form.reset();
      setUploadProgress(0);
    } catch (e) {
      if (axios.isCancel(e)) {
        showNotification({ 
          message: "Upload timeout. Please try again.", 
          color: "red", 
          icon: <IconX /> 
        });
      } else {
        showNotification({ 
          message: e.response?.data?.detail || e.message || "Submission failed", 
          color: "red", 
          icon: <IconX /> 
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card shadow="sm" p="lg" withBorder>
      <Title order={3} mb="md">Submit Your Thesis</Title>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <FileInput
          label="Synopsis (PDF, ≤5MB)"
          accept="application/pdf"
          required
          icon={<IconUpload size={14} />}
          {...form.getInputProps("synopsis")}
          mt="md"
          disabled={submitting}
        />
        {form.errors.synopsis && (
          <Text size="sm" color="red" mt={4}>{form.errors.synopsis}</Text>
        )}
        
        <FileInput
          label="Thesis Report (PDF, ≤25MB)"
          accept="application/pdf"
          required
          icon={<IconUpload size={14} />}
          {...form.getInputProps("thesis_report")}
          mt="md"
          disabled={submitting}
        />
        {form.errors.thesis_report && (
          <Text size="sm" color="red" mt={4}>{form.errors.thesis_report}</Text>
        )}

        {submitting && uploadProgress > 0 && (
          <Progress 
            value={uploadProgress} 
            label={`${uploadProgress}%`} 
            size="xl" 
            mt="md"
            animate
          />
        )}

        <Button 
          fullWidth 
          mt="lg" 
          type="submit"
          loading={submitting}
          disabled={!form.values.synopsis || !form.values.thesis_report}
        >
          Upload Thesis
        </Button>
      </form>
    </Card>
  );
}
