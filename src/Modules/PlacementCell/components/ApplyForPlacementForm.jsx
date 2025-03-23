import React, { useState,useEffect } from "react";
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
  NumberInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { fetchFormFieldsRoute ,ApplyForPlacementRoute } from "../../../routes/placementCellRoutes";
import axios from "axios";
import { DateInput, TimeInput } from "@mantine/dates";

function ApplyToPlacementForm({ jobID,prefilledFields, additionalFields, onSubmit }) {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchFieldslist = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(fetchFormFieldsRoute, {
          headers: { Authorization: `Token ${token}` },
          params: { jobId: jobID }, 
        });
    
        if (response.status === 200) {
          setFields(response.data);
          
         
          const initialFormData = response.data.reduce((acc, field) => {
            acc[field.field_id] = { value: "", name: field.name };
            return acc;
          }, {});
  
          setFormData(initialFormData);
        } else {
          notifications.show({
            title: "Error fetching fields",
            message: `Error: ${response.status}`,
            color: "red",
          });
        }
      } catch (error) {
        notifications.show({
          title: "Failed to fetch data",
          message: "Failed to fetch fields list",
          color: "red",
        });
      }
    };
    

    fetchFieldslist();
  }, [fetchFormFieldsRoute]);

  const handleChange = (field_id, value) => {
    setFormData((prev) => ({
      ...prev,
      [field_id]: { ...prev[field_id], value: value ?? ""},
    }));
  };

  const validateFields = () => {
    const newErrors = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required.`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateFields()) {
      notifications.show({
        title: "Validation Failed",
        message: "Please fill all required fields.",
        color: "red",
      });
      return;
    }
  
    try {
      const token = localStorage.getItem("authToken");
  
      const responses = Object.entries(formData)
        .filter(([field_id, data]) => data?.value !== undefined) 
        .map(([field_id, data]) => ({
          field_id, 
          value: data.value,
        }));
  
      console.log(responses);
  
      const response = await axios.post(
        ApplyForPlacementRoute,
        { jobId: jobID, responses },
        { headers: { Authorization: `Token ${token}` } }
      );
  
      if (response.status === 200) {
        notifications.show({
          title: "Success",
          message: "Form submitted successfully!",
          color: "green",
        });
      } else {
        notifications.show({
          title: "Error",
          message: `Submission failed: ${response.status}`,
          color: "red",
        });
      }
    } catch (error) {
      notifications.show({
        title: "Submission Failed",
        message: error.message || "Something went wrong.",
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
          {/* {Object.keys(prefilledFields).map((field) => (
            <Grid.Col span={6} key={field}>
              <TextInput
                label={field.replace(/_/g, " ").toUpperCase()}
                value={formData[field]}
                disabled
              />
            </Grid.Col>
          ))} */}

          {fields.map((field) => (
            <Grid.Col span={6} key={field.name}>
              {field.type === "text" && (
                <TextInput
                  label={field.name.replace(/_/g, " ").toUpperCase()}
                  placeholder={`Enter ${field.name}`}
                  value={formData[field.field_id]?.value || ""}
                  onChange={(e) => handleChange(field.field_id, e.target.value)}
                  error={errors[field.name]}
                  required={field.required}
                />
              )}
              {field.type === "number" && (
                <NumberInput
                  label={field.name.replace(/_/g, " ").toUpperCase()}
                  placeholder={`Enter ${field.name}`}
                  value={formData[field.field_id]?.value || ""}
                  onChange={(value) => handleChange(field.field_id, value)}
                  error={errors[field.name]}
                  required={field.required}
                />
              )}
              {field.type === "decimal" && (
                <NumberInput
                  label={field.name.replace(/_/g, " ").toUpperCase()}
                  placeholder={`Enter ${field.name}`}
                  value={formData[field.field_id]?.value || ""}
                  precision={2}
                  step={0.01}
                  onChange={(value) => handleChange(field.field_id, value)}
                  error={errors[field.name]}
                  required={field.required}
                />
              )}
              {field.type === "date" && (
                <DateInput
                  label={field.name.replace(/_/g, " ").toUpperCase()}
                  placeholder={`Select ${field.name}`}
                  value={formData[field.field_id]?.value || ""}
                  onChange={(e) => handleChange(field.field_id, e.target.value)}
                  error={errors[field.name]}
                  required={field.required}
                />
              )}
              {field.type === "time" && (
                <TimeInput
                  label={field.name.replace(/_/g, " ").toUpperCase()}
                  placeholder={`Select ${field.name}`}
                  value={formData[field.field_id]?.value || ""}
                  onChange={(e) => handleChange(field.field_id, e.target.value)}
                  error={errors[field.name]}
                  required={field.required}
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
