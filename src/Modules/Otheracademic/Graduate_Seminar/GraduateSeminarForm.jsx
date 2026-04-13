import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  TextInput,
  Textarea,
  Button,
  Grid,
  Title,
  Paper,
  Select,
  Group,
  NumberInput,
  TimeInput,
  DateInput,
} from "@mantine/core";
import axios from "axios";
import "./GraduateSeminarForm.css";

function GraduateSeminarForm({ setTab }) {
  const authToken = localStorage.getItem("authToken");
  
  const [formValues, setFormValues] = useState({
    semester: "",
    date_of_seminar: null,
    theme_of_work: "",
    place: "",
    time: null,
    work_done_till_previous_sem: "",
    specific_contri_in_cur_sem: "",
    future_plan: "",
    quality_of_work: "",
    quantity_of_work: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    setError(""); // Clear error when user types
  };

  const validateForm = () => {
    if (!formValues.semester) return "Semester is required";
    if (!formValues.date_of_seminar) return "Date of seminar is required";
    if (!formValues.theme_of_work.trim()) return "Theme of work is required";
    if (!formValues.place.trim()) return "Place is required";
    if (!formValues.time) return "Time is required";
    if (!formValues.work_done_till_previous_sem.trim())
      return "Work done till previous semester is required";
    if (!formValues.specific_contri_in_cur_sem.trim())
      return "Specific contribution in current semester is required";
    if (!formValues.future_plan.trim()) return "Future plan is required";
    if (!formValues.quality_of_work) return "Quality of work is required";
    if (!formValues.quantity_of_work) return "Quantity of work is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!authToken) {
      setError("No authentication token found");
      return;
    }

    setLoading(true);

    const formData = {
      semester: formValues.semester,
      date_of_seminar: formValues.date_of_seminar
        ? formValues.date_of_seminar.toISOString().split("T")[0]
        : null,
      theme_of_work: formValues.theme_of_work,
      place: formValues.place,
      time: formValues.time ? formValues.time.toTimeString().slice(0, 5) : null,
      work_done_till_previous_sem: formValues.work_done_till_previous_sem,
      specific_contri_in_cur_sem: formValues.specific_contri_in_cur_sem,
      future_plan: formValues.future_plan,
      quality_of_work: formValues.quality_of_work,
      quantity_of_work: formValues.quantity_of_work,
    };

    try {
      const response = await axios.post(
        "/api/otheracademic/graduate-form-submit/",
        formData,
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setSuccess("Graduate seminar form submitted successfully!");
      // Reset form
      setFormValues({
        semester: "",
        date_of_seminar: null,
        theme_of_work: "",
        place: "",
        time: null,
        work_done_till_previous_sem: "",
        specific_contri_in_cur_sem: "",
        future_plan: "",
        quality_of_work: "",
        quantity_of_work: "",
      });

      // Switch to status tab after successful submission
      if (setTab) {
        setTimeout(() => setTab(1), 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Error submitting the form. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "50px", marginBottom: "50px" }}>
      <Paper padding="md" shadow="xs">
        <Title order={2} align="center" mb="lg">
          Graduate Seminar Submission Form
        </Title>

        {error && (
          <Paper p="md" style={{ backgroundColor: "#ffe3e3", marginBottom: "1rem" }}>
            <p style={{ color: "#d32f2f" }}>{error}</p>
          </Paper>
        )}

        {success && (
          <Paper p="md" style={{ backgroundColor: "#d3f9d8", marginBottom: "1rem" }}>
            <p style={{ color: "#2f7e3b" }}>{success}</p>
          </Paper>
        )}

        <form onSubmit={handleSubmit}>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label="Semester"
                placeholder="Select semester"
                data={[
                  { value: "1", label: "1st Semester" },
                  { value: "2", label: "2nd Semester" },
                  { value: "3", label: "3rd Semester" },
                  { value: "4", label: "4th Semester" },
                ]}
                value={formValues.semester}
                onChange={(value) => handleChange("semester", value)}
                required
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label="Date of Seminar"
                placeholder="Select date"
                value={formValues.date_of_seminar}
                onChange={(value) => handleChange("date_of_seminar", value)}
                required
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TextInput
                label="Place"
                placeholder="Enter place/venue"
                value={formValues.place}
                onChange={(e) => handleChange("place", e.currentTarget.value)}
                required
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <TimeInput
                label="Time"
                placeholder="Select time"
                value={formValues.time}
                onChange={(value) => handleChange("time", value)}
                required
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <TextInput
                label="Theme of Work"
                placeholder="Enter theme/title of your work"
                value={formValues.theme_of_work}
                onChange={(e) => handleChange("theme_of_work", e.currentTarget.value)}
                required
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Work Done Till Previous Semester"
                placeholder="Describe work completed in previous semesters"
                value={formValues.work_done_till_previous_sem}
                onChange={(e) =>
                  handleChange("work_done_till_previous_sem", e.currentTarget.value)
                }
                minRows={3}
                required
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Specific Contribution in Current Semester"
                placeholder="Describe your specific contributions in the current semester"
                value={formValues.specific_contri_in_cur_sem}
                onChange={(e) =>
                  handleChange("specific_contri_in_cur_sem", e.currentTarget.value)
                }
                minRows={3}
                required
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="Future Plan"
                placeholder="Describe your future plans for this work"
                value={formValues.future_plan}
                onChange={(e) => handleChange("future_plan", e.currentTarget.value)}
                minRows={3}
                required
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Quality of Work (1-10)"
                placeholder="Rate quality"
                value={formValues.quality_of_work}
                onChange={(value) => handleChange("quality_of_work", value)}
                min={1}
                max={10}
                required
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <NumberInput
                label="Quantity of Work (1-10)"
                placeholder="Rate quantity"
                value={formValues.quantity_of_work}
                onChange={(value) => handleChange("quantity_of_work", value)}
                min={1}
                max={10}
                required
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Group justify="center">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  Submit Form
                </Button>
              </Group>
            </Grid.Col>
          </Grid>
        </form>
      </Paper>
    </div>
  );
}

GraduateSeminarForm.propTypes = {
  setTab: PropTypes.func,
};

export default GraduateSeminarForm;
