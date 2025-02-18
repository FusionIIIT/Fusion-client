import React, { useState } from "react";
import {
  TextInput,
  Button,
  Group,
  Select,
  Textarea,
  Card,
  Title,
  Grid,
  FileInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";

function ApplyToPlacementForm({ prefilledFields, additionalFields, onSubmit }) {
  const [formData, setFormData] = useState({
    ...prefilledFields,
    ...additionalFields.reduce(
      (acc, field) => ({ ...acc, [field.name]: field.defaultValue || "" }),
      {},
    ),
  });

  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateFields = () => {
    const newErrors = {};
    additionalFields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required.`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     if (!validateFields()) return;

  //     try {
  //       const response = await axios.post(submitUrl, formData, {
  //         headers: {
  //           Authorization: `Token ${localStorage.getItem("authToken")}`,
  //         },
  //       });
  //       notifications.show({
  //         title: "Application Submitted",
  //         message: "Your application has been submitted successfully.",
  //         color: "green",
  //       });
  //     } catch (error) {
  //       const errorMessage = error.response?.data?.error || error.message;
  //       notifications.show({
  //         title: "Submission Failed",
  //         message: errorMessage,
  //         color: "red",
  //       });
  //     }
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateFields()) {
      return;
    }

    try {
      await onSubmit(formData); // Pass the form data to the custom onSubmit handler
      notifications.show({
        title: "Application Submitted",
        message: "Your application has been submitted successfully.",
        color: "green",
      });
    } catch (error) {
      const errorMessage = error.message || "Something went wrong.";
      notifications.show({
        title: "Submission Failed",
        message: errorMessage,
        color: "red",
      });
    }
  };

  return (
    <Card style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Title order={3} align="center" style={{ marginBottom: "20px" }}>
        Apply to Placement Event
      </Title>

      <form onSubmit={handleSubmit}>
        <Grid gutter="lg">
          {Object.keys(prefilledFields).map((field) => (
            <Grid.Col span={6} key={field}>
              <TextInput
                label={field.replace(/_/g, " ").toUpperCase()}
                value={formData[field]}
                disabled
              />
            </Grid.Col>
          ))}

          {additionalFields.map((field) => (
            <Grid.Col span={field.gridSpan || 6} key={field.name}>
              {field.type === "text" && (
                <TextInput
                  label={field.label}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  error={errors[field.name]}
                />
              )}
              {field.type === "textarea" && (
                <Textarea
                  label={field.label}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  minRows={3}
                  error={errors[field.name]}
                />
              )}
              {field.type === "select" && (
                <Select
                  label={field.label}
                  placeholder={field.placeholder}
                  data={field.options || []}
                  value={formData[field.name]}
                  onChange={(value) => handleChange(field.name, value)}
                  error={errors[field.name]}
                />
              )}
              {field.type === "file" && (
                <FileInput
                  label={field.label}
                  placeholder={field.placeholder}
                  onChange={(file) => handleChange(field.name, file)}
                  error={errors[field.name]}
                />
              )}
            </Grid.Col>
          ))}
        </Grid>

        <Group position="right" style={{ marginTop: "20px" }}>
          <Button type="submit" onClick={()=>{handleSubmit}}>Submit Application</Button>
        </Group>
      </form>
    </Card>
  );
}

export default ApplyToPlacementForm;
