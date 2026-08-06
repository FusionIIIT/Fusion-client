import React, { useState } from "react";
import {
  Card,
  TextInput,
  Textarea,
  FileInput,
  NumberInput,
  Button,
  Title,
  Text,
  Divider,
  Grid,
  Stack,
  Space,
  Modal,
  Group,
  Table,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import { studentSeminarCreateRoute } from "../../routes/academicRoutes";

export default function StudentSeminarForm({ thesisId, thesis, onSuccess }) {
  const [form, setForm] = useState({
    date: "",
    time: "",
    venue: "",
    prev: "",
    curr: "",
    future: "",
    pubPublishedOrAccepted: 0,
    pubPresentedUnpublished: 0,
    pubSubmittedUnderReview: 0,
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    const data = new FormData();
    ["date", "time", "venue", "prev", "curr", "future"].forEach((f) =>
      data.append(f, form[f] || ""),
    );
    data.append("pub_published_or_accepted", form.pubPublishedOrAccepted || 0);
    data.append("pub_presented_unpublished", form.pubPresentedUnpublished || 0);
    data.append(
      "pub_submitted_under_review",
      form.pubSubmittedUnderReview || 0,
    );
    if (file) data.append("doc", file);

    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const res = await axios.post(
        studentSeminarCreateRoute(thesisId),
        data,
        config,
      );

      showNotification({
        title: "Success",
        message: res.data.message || "Seminar submitted successfully.",
        color: "green",
      });

      setSubmitted(true);
      setPreviewOpen(false);
      if (onSuccess) onSuccess(res.data.id);
    } catch (e) {
      const message =
        e.response?.data?.error || e.message || "Submission failed";
      showNotification({
        title: "Error",
        message,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg">
      <Title order={3}>Progress Seminar Report</Title>
      <Space h="md" />

      {/* Items 1-4: identity — auto-filled from the student's approved thesis, read-only */}
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="1. Discipline"
            value={thesis?.student_discipline || ""}
            readOnly
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="2. Name of Research Scholar"
            value={thesis?.student_name || ""}
            readOnly
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="3. Roll No."
            value={thesis?.student_roll || ""}
            readOnly
          />
        </Grid.Col>
      </Grid>
      <Space h="sm" />
      <Textarea
        label="4. Theme of Doctoral Work"
        value={thesis?.research_theme || ""}
        readOnly
        minRows={2}
      />

      <Divider my="md" />

      {/* Item 5: seminar logistics */}
      <Text fw={500} size="sm" mb="xs">
        5. Current Seminar
      </Text>
      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <TextInput
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => set("date")(e.target.value)}
            disabled={submitted}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <TextInput
            label="Time"
            type="time"
            value={form.time}
            onChange={(e) => set("time")(e.target.value)}
            disabled={submitted}
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <TextInput
            label="Place"
            value={form.venue}
            onChange={(e) => set("venue")(e.target.value)}
            disabled={submitted}
          />
        </Grid.Col>
      </Grid>

      <Divider my="md" />

      {/* Items 6-8: summaries */}
      <Stack gap="md">
        <Textarea
          label="6. Work done till the previous semester (summarize here briefly)"
          value={form.prev}
          onChange={(e) => set("prev")(e.target.value)}
          disabled={submitted}
          minRows={3}
        />
        <Textarea
          label="7. Specific contribution in the current semester (summarize here briefly)"
          value={form.curr}
          onChange={(e) => set("curr")(e.target.value)}
          disabled={submitted}
          minRows={3}
        />
        <Textarea
          label="8. Future plan for the work to be carried out (summarize here briefly)"
          value={form.future}
          onChange={(e) => set("future")(e.target.value)}
          disabled={submitted}
          minRows={3}
        />
      </Stack>
      <Text size="xs" c="dimmed" mt="xs">
        (You are required to submit a brief write-up limited to 5-6 pages giving
        more details on points 6, 7 &amp; 8 to the committee members at least
        two days prior to the progress seminar.)
      </Text>

      <Divider my="md" />

      {/* Item 9: attachment */}
      <FileInput
        label="9. Publications/Papers presented/submitted — attach a separate sheet giving details"
        value={file}
        onChange={setFile}
        disabled={submitted}
      />

      <Space h="md" />

      {/* Items 10-12: publication counts, one plain number each */}
      <Stack gap="md">
        <NumberInput
          label="10. Number of papers published/accepted in journals/conference proceedings"
          min={0}
          value={form.pubPublishedOrAccepted}
          onChange={set("pubPublishedOrAccepted")}
          disabled={submitted}
        />
        <NumberInput
          label="11. Number of papers presented in conferences/meetings/workshops (unpublished)"
          min={0}
          value={form.pubPresentedUnpublished}
          onChange={set("pubPresentedUnpublished")}
          disabled={submitted}
        />
        <NumberInput
          label="12. Number of papers submitted (under review)"
          min={0}
          value={form.pubSubmittedUnderReview}
          onChange={set("pubSubmittedUnderReview")}
          disabled={submitted}
        />
      </Stack>

      <Space h="md" />
      <Button
        fullWidth
        onClick={() => setPreviewOpen(true)}
        disabled={submitted}
      >
        Review &amp; Submit
      </Button>

      <Modal
        opened={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Review Progress Seminar Report"
        size="xl"
      >
        <Stack gap="md">
          <Table withTableBorder>
            <Table.Tbody>
              {[
                { label: "Date", value: form.date || "—" },
                { label: "Time", value: form.time || "—" },
                { label: "Place", value: form.venue || "—" },
                {
                  label: "Work done till previous semester",
                  value: form.prev || "—",
                },
                {
                  label: "Contribution this semester",
                  value: form.curr || "—",
                },
                { label: "Future plan", value: form.future || "—" },
                { label: "Attachment", value: file ? file.name : "None" },
                {
                  label: "Published/accepted papers",
                  value: form.pubPublishedOrAccepted || 0,
                },
                {
                  label: "Presented (unpublished) papers",
                  value: form.pubPresentedUnpublished || 0,
                },
                {
                  label: "Submitted (under review) papers",
                  value: form.pubSubmittedUnderReview || 0,
                },
              ].map((row) => (
                <Table.Tr key={row.label}>
                  <Table.Th style={{ whiteSpace: "nowrap", width: "1%" }}>
                    {row.label}
                  </Table.Th>
                  <Table.Td>{row.value}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Group grow>
            <Button variant="default" onClick={() => setPreviewOpen(false)}>
              Back to Edit
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
              Confirm &amp; Submit
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Card>
  );
}

StudentSeminarForm.propTypes = {
  thesisId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  thesis: PropTypes.shape({
    student_discipline: PropTypes.string,
    student_name: PropTypes.string,
    student_roll: PropTypes.string,
    research_theme: PropTypes.string,
  }),
  onSuccess: PropTypes.func,
};

StudentSeminarForm.defaultProps = {
  thesis: null,
  onSuccess: null,
};
