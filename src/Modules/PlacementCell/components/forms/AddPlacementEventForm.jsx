import React, { useState, useEffect } from "react";
import {
  TextInput,
  Button,
  Select,
  Textarea,
  Card,
  Title,
  Grid,
  MultiSelect,
  NumberInput,
  Text,
  Divider,
} from "@mantine/core";
import PropTypes from "prop-types";
import { notifications } from "@mantine/notifications";
import { placementApi } from "../../services/api";
import { showApiError } from "../../utils/authorization";

function AddPlacementEventForm({ onClose = undefined, onSuccess = undefined }) {
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [ctc, setCtc] = useState("");
  const [placementType, setPlacementType] = useState("");
  const [description, setDescription] = useState("");
  const [jobrole, setRole] = useState("");
  const [passoutYear, setPassoutYear] = useState("");
  const [gender, setGender] = useState("");
  const [cpi, setCpi] = useState("");
  const [branches, setBranches] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [tpoFields, setTpoFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCompanyId = (companyName) => {
    const company = companies.find((c) => c.companyName === companyName);
    return company ? company.id : null;
  };

  useEffect(() => {
    const fetchRegistrationData = async () => {
      try {
        const response = await placementApi.getRegistrationList();
        if (response.status === 200) {
          const uniqueCompanies = [];
          const companyNames = new Set();
          response.data.forEach((comp) => {
            if (!companyNames.has(comp.companyName)) {
              companyNames.add(comp.companyName);
              uniqueCompanies.push(comp);
            }
          });
          setCompanies(uniqueCompanies);
        }
      } catch (error) {
        showApiError({
          error,
          title: "Failed to fetch data",
          fallback: "Failed to fetch companies list",
          authorizationFallback:
            "Only placement officer users can load company registrations.",
        });
      }
    };
    fetchRegistrationData();
  }, []);

  useEffect(() => {
    const fetchFieldsData = async () => {
      try {
        const response = await placementApi.getFields();
        if (response.status === 200) {
          setTpoFields(
            response.data.map((field) => ({
              value: field.name,
              label: field.name,
              id: field.id,
            })),
          );
        }
      } catch (error) {
        showApiError({
          error,
          title: "Failed to fetch fields data",
          fallback: "Failed to fetch fields list",
          authorizationFallback:
            "Only placement officer users can manage placement fields.",
        });
      }
    };
    fetchFieldsData();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await placementApi.getBranches();
        if (Array.isArray(response.data)) {
          setBranchOptions(response.data);
        }
      } catch (error) {
        showApiError({
          error,
          title: "Failed to fetch branches",
          fallback: "Failed to fetch the list of branches.",
        });
      }
    };
    fetchBranches();
  }, []);

  // Build a human-readable eligibility summary shown to students on the drive.
  const buildEligibilitySummary = () => {
    const parts = [];
    if (cpi) parts.push(`CPI ≥ ${cpi}`);
    if (passoutYear) parts.push(`Passout ${passoutYear}`);
    if (gender) parts.push(`${gender} only`);
    if (branches.length) parts.push(`Branch: ${branches.join("/")}`);
    return parts.join(", ");
  };

  const handleSubmit = async () => {
    if (!localStorage.getItem("authToken")) {
      notifications.show({
        title: "Unauthorized",
        message: "You must log in to perform this action.",
        color: "red",
        position: "top-center",
      });
      return;
    }
    if (
      !selectedCompany ||
      !date ||
      !location ||
      !ctc ||
      !placementType ||
      !jobrole
    ) {
      notifications.show({
        title: "Missing details",
        message:
          "Company, start date, location, CTC, placement type, and role are required.",
        color: "red",
        position: "top-center",
      });
      return;
    }

    const companyId = getCompanyId(selectedCompany);
    const matchingIds = selectedFields
      .map((value) => {
        const field = tpoFields.find((f) => f.value === value);
        return field ? field.id : null;
      })
      .filter((id) => id !== null);

    const formData = new FormData();
    formData.append(
      "placement_type",
      placementType === "Internship" ? "PBI" : "PLACEMENT",
    );
    formData.append("company_name", selectedCompany);
    if (companyId) {
      formData.append("company_id", companyId);
    }
    formData.append("ctc", ctc);
    formData.append("description", description);
    formData.append("title", selectedCompany);
    formData.append("location", location);
    formData.append("role", jobrole);
    formData.append("eligibility", buildEligibilitySummary());
    if (passoutYear) {
      formData.append("passoutyr", passoutYear);
    }
    if (gender) {
      formData.append("gender", gender);
    }
    if (cpi) {
      formData.append("cpi", cpi);
    }
    if (branches.length) {
      formData.append("branch", branches.join(", "));
    }
    // datetime-local gives "YYYY-MM-DDTHH:MM"; the backend wants a space and a
    // plain date for placement_date.
    formData.append("schedule_at", date.replace("T", " "));
    matchingIds.forEach((id) => formData.append("fields", String(id)));
    formData.append("placement_date", date.split("T")[0]);

    if (endDate) {
      formData.append("end_date", endDate.split("T")[0]);
      formData.append("end_datetime", endDate.replace("T", " "));
    }

    setIsSubmitting(true);
    try {
      await placementApi.createPlacementEvent(formData);
      if (onSuccess) {
        await onSuccess();
      } else if (onClose) {
        onClose();
      }
      notifications.show({
        title: "Event Added",
        message: "Placement event has been added successfully.",
        color: "green",
        position: "top-center",
      });
    } catch (error) {
      const responseData = error.response?.data;
      const errorMessage =
        responseData?.error ||
        responseData?.detail ||
        (responseData && typeof responseData === "object"
          ? Object.entries(responseData)
              .map(
                ([key, value]) =>
                  `${key}: ${Array.isArray(value) ? value.join(", ") : value}`,
              )
              .join(" | ")
          : error.message);
      showApiError({
        error,
        fallback: `Failed to add placement event: ${errorMessage}`,
        authorizationFallback:
          "Only placement officer users can create placement schedules.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Title order={3} align="center" style={{ marginBottom: "20px" }}>
        Add Placement Event
      </Title>

      <Grid gutter="lg">
        <Grid.Col span={4}>
          <Select
            label="Select Company"
            placeholder="Select a company"
            data={companies.map((company) => company.companyName)}
            value={selectedCompany}
            onChange={setSelectedCompany}
            searchable
            required
          />
        </Grid.Col>

        <Grid.Col span={4}>
          <TextInput
            type="datetime-local"
            label="Start Date and Time"
            value={date}
            onChange={(e) => setDate(e.currentTarget.value)}
            required
          />
        </Grid.Col>

        <Grid.Col span={4}>
          <TextInput
            type="datetime-local"
            label="End Date and Time"
            value={endDate}
            min={date || undefined}
            onChange={(e) => setEndDate(e.currentTarget.value)}
          />
        </Grid.Col>

        <Grid.Col span={4}>
          <TextInput
            label="Location"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </Grid.Col>

        <Grid.Col span={4}>
          <NumberInput
            label="CTC (LPA)"
            placeholder="Enter CTC"
            value={ctc}
            onChange={setCtc}
            min={0}
            decimalScale={2}
            required
          />
        </Grid.Col>

        <Grid.Col span={4}>
          <Select
            label="Placement Type"
            placeholder="Select placement type"
            data={["Placement", "Internship"]}
            value={placementType}
            onChange={setPlacementType}
            required
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <TextInput
            label="Role Offered"
            placeholder="e.g. Software Engineer"
            value={jobrole}
            onChange={(e) => setRole(e.target.value)}
            required
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Textarea
            label="Description"
            placeholder="Enter a description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            minRows={3}
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Divider
            my="xs"
            label="Eligibility Criteria (optional)"
            labelPosition="left"
          />
          <Text size="xs" c="dimmed" mb="sm">
            Leave a field blank to place no restriction on it. Students who do
            not meet a set criterion will see the drive marked as ineligible.
          </Text>
          <Grid gutter="md">
            <Grid.Col span={3}>
              <NumberInput
                label="Minimum CPI"
                placeholder="e.g. 7.0"
                value={cpi}
                onChange={setCpi}
                min={0}
                max={10}
                decimalScale={2}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <TextInput
                label="Passout Year"
                placeholder="e.g. 2026"
                value={passoutYear}
                onChange={(e) => setPassoutYear(e.target.value)}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Select
                label="Gender"
                placeholder="Any"
                data={["Male", "Female"]}
                value={gender}
                onChange={(value) => setGender(value || "")}
                clearable
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <MultiSelect
                label="Branches"
                placeholder="Any"
                data={branchOptions}
                value={branches}
                onChange={setBranches}
                searchable
                clearable
              />
            </Grid.Col>
          </Grid>
        </Grid.Col>

        <Grid.Col span={12}>
          <MultiSelect
            label="Application fields"
            description="Extra details each student must fill in when applying to this drive (e.g. cover letter, preferred location). Manage the available fields in the Fields tab. Optional."
            placeholder="Select application fields"
            data={tpoFields}
            value={selectedFields}
            onChange={setSelectedFields}
            searchable
            clearable
          />
        </Grid.Col>

        <Grid.Col span={12}>
          <Button onClick={handleSubmit} loading={isSubmitting} fullWidth>
            Submit
          </Button>
        </Grid.Col>
      </Grid>
    </Card>
  );
}

AddPlacementEventForm.propTypes = {
  onClose: PropTypes.func,
  onSuccess: PropTypes.func,
};

export default AddPlacementEventForm;
