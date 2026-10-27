import React, { useState, useEffect } from "react";
import {
  Modal,
  Select,
  TextInput,
  Textarea,
  Button,
  Text,
  Stack,
  Group,
  Center,
  Loader,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import {
  facultyListRoute,
  studentThesisChangeRequestCreateRoute,
} from "../../routes/academicRoutes";

export default function RequestThesisChangeModal({ thesis, onClose, refresh }) {
  const [facOpts, setFacOpts] = useState([]);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    new_category: "",
    new_broad_area: "",
    new_research_theme: "",
    new_supervisor_id: null,
    new_co_supervisor_id: null,
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    axios
      .get(facultyListRoute, { headers: { Authorization: `Token ${token}` } })
      .then((res) =>
        setFacOpts(res.data.map((f) => ({ value: f.id, label: f.name }))),
      )
      .catch(() => {})
      .finally(() => setLoadingInfo(false));
  }, []);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    const token = localStorage.getItem("authToken");
    try {
      await axios.post(studentThesisChangeRequestCreateRoute, form, {
        headers: { Authorization: `Token ${token}` },
      });
      showNotification({
        title: "Change Requested",
        message: "Your thesis change request has been sent for consent.",
        color: "green",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Submission failed",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title="Request Thesis Topic Change"
      size="60%"
    >
      {loadingInfo ? (
        <Center style={{ height: 100 }}>
          <Loader />
        </Center>
      ) : (
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Leave a field blank/unchanged if you don&apos;t want to change it.
            The current supervisor
            {thesis.co_supervisor ? " and co-supervisor" : ""} must consent, and
            if you propose a new supervisor or co-supervisor they must consent
            too, before this goes to HOD and Dean Academic.
          </Text>

          <Select
            label="Category"
            placeholder={`Current: ${thesis.category}`}
            data={[
              { value: "Regular", label: "Regular" },
              { value: "Sponsored", label: "Sponsored" },
              { value: "External", label: "External" },
            ]}
            value={form.new_category || null}
            onChange={set("new_category")}
            clearable
          />
          <TextInput
            label="Broad Area"
            placeholder={`Current: ${thesis.broad_area}`}
            value={form.new_broad_area}
            onChange={(e) => set("new_broad_area")(e.target.value)}
          />
          <Textarea
            label="Research Theme"
            placeholder={`Current: ${thesis.research_theme}`}
            minRows={3}
            value={form.new_research_theme}
            onChange={(e) => set("new_research_theme")(e.target.value)}
          />
          <Select
            label="New Supervisor"
            placeholder={`Current: ${thesis.supervisor.name}`}
            data={facOpts.filter((f) => f.value !== form.new_co_supervisor_id)}
            value={form.new_supervisor_id}
            onChange={set("new_supervisor_id")}
            searchable
            clearable
          />
          <Select
            label="New Co-Supervisor"
            placeholder={`Current: ${thesis.co_supervisor?.name || "—"}`}
            data={facOpts.filter((f) => f.value !== form.new_supervisor_id)}
            value={form.new_co_supervisor_id}
            onChange={set("new_co_supervisor_id")}
            searchable
            clearable
          />

          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              Submit Request
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

RequestThesisChangeModal.propTypes = {
  thesis: PropTypes.shape({
    category: PropTypes.string,
    broad_area: PropTypes.string,
    research_theme: PropTypes.string,
    supervisor: PropTypes.shape({ name: PropTypes.string }),
    co_supervisor: PropTypes.shape({ name: PropTypes.string }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
