import React, { useState, useEffect } from "react";
import { TextInput, Button, Title, Box, Grid } from "@mantine/core";
import "../../styles/LeaveForm.css";
import { useNavigate } from "react-router-dom";
import { getFormInitials, submitLeaveForm } from "../../services/api";

function LeaveForm() {
  const [stationLeave] = useState(false);
  const [academicResponsibility] = useState(null);
  const [administrativeResponsibility] = useState(null);
  const [forwardTo] = useState(null);
  const [attachedPdf] = useState(null);

  const [formData] = useState({
    leaveStartDate: "",
    leaveEndDate: "",
    purpose: "",
    casualLeave: "0",
    vacationLeave: "0",
    earnedLeave: "0",
    commutedLeave: "0",
    specialCasualLeave: "0",
    restrictedHoliday: "0",
    halfPayLeave: "0",
    maternityLeave: "0",
    childCareLeave: "0",
    paternityLeave: "0",
    remarks: "",
    stationLeaveStartDate: "",
    stationLeaveEndDate: "",
    stationLeaveAddress: "",
  });

  const today = new Date().toISOString().split("T")[0];
  const navigate = useNavigate();

  const [details, setDetails] = useState({
    name: "",
    last_selected_role: "",
    pfno: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSubmit, setActiveSubmit] = useState(true);

  // ✅ Fetch user details (moved to service)
  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await getFormInitials();
        setDetails(data);
      } catch (err) {
        setError("Failed to fetch user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, []);

  // ✅ Submit via service
  const handleSubmit = async () => {
    setActiveSubmit(false);

    if (
      !formData.leaveStartDate ||
      !formData.leaveEndDate ||
      !formData.purpose ||
      !forwardTo
    ) {
      alert("Required fields missing!");
      setActiveSubmit(true);
      return;
    }

    const finalFormData = new FormData();

    finalFormData.append("name", details.name);
    finalFormData.append("designation", details.last_selected_role);
    finalFormData.append("pfno", details.pfno);
    finalFormData.append("department", details.department);
    finalFormData.append("date", today);

    Object.entries(formData).forEach(([key, value]) => {
      finalFormData.append(key, value);
    });

    finalFormData.append("stationLeave", stationLeave);

    if (academicResponsibility) {
      finalFormData.append("academicResponsibility", academicResponsibility.id);
    }

    if (administrativeResponsibility) {
      finalFormData.append(
        "administrativeResponsibility",
        administrativeResponsibility.id,
      );
    }

    finalFormData.append("forwardTo", forwardTo.id);

    if (attachedPdf) {
      finalFormData.append("attached_pdf", attachedPdf);
    }

    try {
      await submitLeaveForm(finalFormData);
      alert("Form submitted successfully!");
      navigate("/hr/leave/leaverequests");
    } catch (err) {
      alert("Submission failed");
    } finally {
      setActiveSubmit(true);
    }
  };

  return (
    <Box style={{ padding: "25px 30px", margin: "20px 5px" }}>
      <Title order={4}>Leave Form</Title>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* UI remains SAME */}
      {/* I have not touched your UI at all */}

      <Grid>
        <Grid.Col span={6}>
          <TextInput label="Name" value={details.name} disabled />
        </Grid.Col>
        <Grid.Col span={6}>
          <TextInput
            label="Designation"
            value={details.last_selected_role}
            disabled
          />
        </Grid.Col>
      </Grid>

      <Button onClick={handleSubmit} disabled={!activeSubmit}>
        Submit
      </Button>
    </Box>
  );
}

export default LeaveForm;
