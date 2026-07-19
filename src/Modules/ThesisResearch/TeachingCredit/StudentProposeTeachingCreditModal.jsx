import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Select,
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
  listCoursesForDropdownRoute,
  studentProposeTeachingCreditRoute,
} from "../../../routes/academicRoutes";
import { authHeaders } from "./teachingCreditShared";

export default function StudentProposeTeachingCreditModal({
  onClose,
  refresh,
}) {
  const [courseOpts, setCourseOpts] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [choices, setChoices] = useState(["", "", "", ""]);

  useEffect(() => {
    axios
      .get(listCoursesForDropdownRoute, { headers: authHeaders() })
      .then((res) =>
        setCourseOpts(
          res.data.courses.map((c) => ({
            value: String(c.id),
            label: `${c.code} — ${c.name}`,
          })),
        ),
      )
      .catch(() => {
        showNotification({
          title: "Error",
          message: "Failed to load course list.",
          color: "red",
        });
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  const setChoice = (idx) => (value) => {
    const next = [...choices];
    next[idx] = value || "";
    setChoices(next);
  };

  const handleSubmit = useCallback(async () => {
    if (!choices[0]) {
      showNotification({
        title: "Missing field",
        message: "First choice of course is required.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(
        studentProposeTeachingCreditRoute,
        {
          choice_1: choices[0],
          choice_2: choices[1] || null,
          choice_3: choices[2] || null,
          choice_4: choices[3] || null,
        },
        { headers: authHeaders() },
      );
      showNotification({
        title: "Submitted",
        message: "Sent to HOD for a decision.",
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
      setLoading(false);
    }
  }, [choices, refresh]);

  return (
    <Modal
      opened
      onClose={onClose}
      title="Pre-Registration for Teaching Credit"
      size="60%"
    >
      {loadingOptions ? (
        <Center style={{ height: 150 }}>
          <Loader />
        </Center>
      ) : (
        <Stack spacing="md">
          <Text size="sm" c="dimmed">
            Choose up to 4 courses in order of priority (preferably UG).
          </Text>
          {choices.map((val, idx) => (
            <Select
              key={idx}
              label={`Choice ${idx + 1}${idx === 0 ? " (required)" : " (optional)"}`}
              data={courseOpts}
              value={val || null}
              onChange={setChoice(idx)}
              searchable
              clearable={idx > 0}
              required={idx === 0}
            />
          ))}
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              Submit
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}

StudentProposeTeachingCreditModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
