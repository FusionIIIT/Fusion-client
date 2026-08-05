import React, { useState, useEffect } from "react";
import {
  Modal,
  Card,
  Stack,
  Text,
  Table,
  Textarea,
  Button,
  Center,
  Loader,
  Select,
  Anchor,
  Space,
  Checkbox,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";

import {
  rpcSeminarDetailRoute,
  rpcSeminarConsentRoute,
  rpcSeminarFinalizeRoute,
} from "../../routes/academicRoutes";
import { host } from "../../routes/globalRoutes";

const QUALITY_OPTIONS = [
  { value: "Excellent", label: "Excellent" },
  { value: "Good", label: "Good" },
  { value: "Sat", label: "Satisfactory" },
  { value: "Unsat", label: "Unsatisfactory" },
];
const QUANTITY_OPTIONS = [
  { value: "Enough", label: "Enough" },
  { value: "Just", label: "Just Sufficient" },
  { value: "Insuff", label: "Insufficient" },
];
const GRADE_OPTIONS = [
  { value: "S", label: "S" },
  { value: "X", label: "X" },
];
const PERIOD_OPTIONS = [
  { value: "1", label: "1 year" },
  { value: "2", label: "2 years" },
  { value: "3", label: "3 years" },
  { value: "4", label: "4 years" },
];
const YES_NO_NA = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
  { value: "NA", label: "Not Applicable" },
];

export default function RPCReviewModal({ seminarId, onClose }) {
  const [data, setData] = useState(null);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("authToken");

  useEffect(() => {
    axios
      .get(rpcSeminarDetailRoute(seminarId), {
        headers: { Authorization: `Token ${token}` },
      })
      .then((r) => setData(r.data))
      .catch(() => {
        showNotification({
          title: "Error",
          message: "Failed to load seminar",
          color: "red",
        });
        onClose();
      });
  }, [seminarId, token, onClose]);

  if (!data) {
    return (
      <Center style={{ height: 200 }}>
        <Loader />
      </Center>
    );
  }

  const {
    semester_no,
    studentName,
    rollNumber,
    discipline,
    thesisTitle,
    date,
    time,
    venue,
    prev,
    curr,
    future,
    doc_url,
    pub_published_or_accepted,
    pub_presented_unpublished,
    pub_submitted_under_review,
    committee,
    committeeSize,
    consentedCount,
    quality,
    quantity,
    overall_grade,
    expected_period,
    rec_assist,
    rec_enhance,
    rec_repeat,
    rec_open,
    comments,
    status,
    myComment,
    isConsented,
    programme_category: programmeCategory,
  } = data;

  const isPg = programmeCategory === "PG";
  const approved = status === "rpc_approved";
  const iHaveConsented = isConsented;

  const updateField = (field, value) => {
    setData((d) => ({
      ...d,
      [field]: value,
      isConsented: false,
    }));
  };

  const saveConsent = () => {
    setSaving(true);
    axios
      .post(
        rpcSeminarConsentRoute(seminarId),
        {
          quality,
          quantity,
          overall_grade,
          expected_period,
          rec_assist,
          rec_enhance,
          rec_repeat,
          rec_open,
          comment: myComment || "",
        },
        {
          headers: { Authorization: `Token ${token}` },
        },
      )
      .then(() =>
        axios.get(rpcSeminarDetailRoute(seminarId), {
          headers: { Authorization: `Token ${token}` },
        }),
      )
      .then((r) => {
        setData(r.data);
        showNotification({
          title: "Saved",
          message: "Consent recorded",
          color: "green",
        });
      })
      .catch(() => {
        showNotification({
          title: "Error",
          message: "Consent failed",
          color: "red",
        });
      })
      .finally(() => setSaving(false));
  };

  const finalize = () => {
    axios
      .post(
        rpcSeminarFinalizeRoute(seminarId),
        {},
        {
          headers: { Authorization: `Token ${token}` },
        },
      )
      .then((r) => {
        setData((d) => ({ ...d, status: "rpc_approved" }));
        showNotification({
          title: "Success",
          message: r.data.message,
          color: "green",
        });
      })
      .catch(() => {
        showNotification({
          title: "Error",
          message: "Finalize failed",
          color: "red",
        });
      });
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title={`Review Progress Seminar${semester_no ? ` — Semester ${semester_no}` : ""}`}
      size="90%"
    >
      <Card shadow="sm" padding="lg">
        <Stack gap="md">
          <Table verticalSpacing="sm" fontSize="sm">
            <tbody>
              <tr>
                <td>
                  <b>Student Name</b>
                </td>
                <td>{studentName}</td>
                <td>
                  <b>Roll No.</b>
                </td>
                <td>{rollNumber}</td>
              </tr>
              <tr>
                <td>
                  <b>Discipline</b>
                </td>
                <td>{discipline}</td>
                <td>
                  <b>Thesis Title</b>
                </td>
                <td>{thesisTitle}</td>
              </tr>
            </tbody>
          </Table>
          <Space h="md" />

          {/* Logistics & Summaries Table */}
          <Table verticalSpacing="sm" fontSize="sm">
            <tbody>
              <tr>
                <td>
                  <b>Date</b>
                </td>
                <td>{date}</td>
                <td>
                  <b>Time</b>
                </td>
                <td>{time}</td>
              </tr>
              <tr>
                <td>
                  <b>Venue</b>
                </td>
                <td>{venue}</td>
                <td>
                  <b>Prev Sem Work</b>
                </td>
                <td>{prev}</td>
              </tr>
              <tr>
                <td>
                  <b>Current Contrib</b>
                </td>
                <td>{curr}</td>
                <td>
                  <b>Future Plan</b>
                </td>
                <td>{future}</td>
              </tr>
            </tbody>
          </Table>
          <Space h="md" />

          {/* Download PDF link */}
          {doc_url && (
            <Anchor
              href={
                doc_url.startsWith("http")
                  ? doc_url
                  : `${host}${doc_url.startsWith("/") ? "" : "/"}${doc_url}`
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Submission PDF
            </Anchor>
          )}
          <Space h="md" />

          {/* Publications */}
          <Table verticalSpacing="sm" fontSize="sm">
            <tbody>
              <tr>
                <td>
                  <b>Published/accepted (journals or conference proceedings)</b>
                </td>
                <td>{pub_published_or_accepted}</td>
              </tr>
              <tr>
                <td>
                  <b>Presented in conferences/workshops (unpublished)</b>
                </td>
                <td>{pub_presented_unpublished}</td>
              </tr>
              <tr>
                <td>
                  <b>Submitted (under review)</b>
                </td>
                <td>{pub_submitted_under_review}</td>
              </tr>
            </tbody>
          </Table>
          <Space h="md" />

          {/* Committee Consent Status */}
          <Text weight={500}>
            Committee Consent ({consentedCount}/{committeeSize})
          </Text>
          <Table striped>
            <thead>
              <tr>
                <th>Name</th>
                <th>Discipline</th>
                <th>Consented?</th>
              </tr>
            </thead>
            <tbody>
              {committee.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.discipline}</td>
                  <td>
                    <Checkbox checked={m.consented} readOnly />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Space h="md" />

          {/* Panel Fields (explicitly declared) */}
          <Select
            label="Quality of work done"
            data={QUALITY_OPTIONS}
            value={quality}
            onChange={(v) => updateField("quality", v)}
            disabled={approved || iHaveConsented}
          />
          <Select
            label="Quantity of work done"
            data={QUANTITY_OPTIONS}
            value={quantity}
            onChange={(v) => updateField("quantity", v)}
            disabled={approved || iHaveConsented}
          />
          <Select
            label="Overall grade"
            data={GRADE_OPTIONS}
            value={overall_grade}
            onChange={(v) => updateField("overall_grade", v)}
            disabled={approved || iHaveConsented}
          />
          {isPg ? (
            <Select
              label="Panel's Report / Recommendations"
              data={[
                {
                  value: "Yes",
                  label: "Must give Annual Progress Seminar again",
                },
                {
                  value: "NA",
                  label:
                    "Not Applicable (in case not satisfied by the performance)",
                },
              ]}
              value={rec_repeat}
              onChange={(v) => updateField("rec_repeat", v)}
              disabled={approved || iHaveConsented}
            />
          ) : (
            <>
              <Select
                label="Expected period"
                data={PERIOD_OPTIONS}
                value={expected_period}
                onChange={(v) => updateField("expected_period", v)}
                disabled={approved || iHaveConsented}
              />
              <Select
                label="Continue assistantship?"
                data={YES_NO_NA}
                value={rec_assist}
                onChange={(v) => updateField("rec_assist", v)}
                disabled={approved || iHaveConsented}
              />
              <Select
                label="Enhancement after 2 years?"
                data={YES_NO_NA}
                value={rec_enhance}
                onChange={(v) => updateField("rec_enhance", v)}
                disabled={approved || iHaveConsented}
              />
              <Select
                label="Must repeat seminar?"
                data={[
                  { value: "Yes", label: "Yes" },
                  { value: "NA", label: "Not Applicable" },
                ]}
                value={rec_repeat}
                onChange={(v) => updateField("rec_repeat", v)}
                disabled={approved || iHaveConsented}
              />
              <Select
                label="Recommend open seminar?"
                data={[
                  { value: "Yes", label: "Yes" },
                  { value: "No", label: "No" },
                ]}
                value={rec_open}
                onChange={(v) => updateField("rec_open", v)}
                disabled={approved || iHaveConsented}
              />
            </>
          )}
          <Space h="md" />

          {/* Comments Table */}
          <Text weight={500}>Committee Comments</Text>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Member</th>
                <th>Timestamp</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {comments.map((c, idx) => (
                <tr key={idx}>
                  <td>{c.member}</td>
                  <td>{new Date(c.timestamp).toLocaleString()}</td>
                  <td>{c.text}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Space h="md" />

          {/* Your Comment */}
          <Textarea
            label="Your Comment"
            placeholder="Enter your suggestions"
            value={myComment}
            onChange={(e) => updateField("myComment", e.currentTarget.value)}
            disabled={approved || iHaveConsented}
          />
          <Space h="md" />

          {/* Save & Consent */}
          {!approved && (
            <Button
              fullWidth
              onClick={saveConsent}
              loading={saving}
              disabled={approved || iHaveConsented}
            >
              {iHaveConsented ? "Already Consented" : "Save & Consent"}
            </Button>
          )}

          {/* Finalize Approval */}
          {consentedCount >= committeeSize && !approved && (
            <Button color="green" fullWidth onClick={finalize}>
              Finalize Approval
            </Button>
          )}
        </Stack>
      </Card>
    </Modal>
  );
}

RPCReviewModal.propTypes = {
  seminarId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  onClose: PropTypes.func.isRequired,
};
