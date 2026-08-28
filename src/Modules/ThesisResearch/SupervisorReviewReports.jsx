import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Text,
  Badge,
  Center,
  Loader,
  Notification,
  Stack,
  Group,
  Divider,
  Button,
  Anchor,
  List,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  supervisorReviewReportsRoute,
  supervisorReportsDecisionRoute,
  supervisorFinalizeRevisionRoute,
} from "../../routes/academicRoutes";

const RECOMMENDATION_LABEL = {
  accept: "Accept as-is",
  accept_with_corrections: "Accept with corrections",
  needs_improvement: "Needs improvement",
  reject: "Reject",
};

const RECOMMENDATION_COLOR = {
  accept: "teal",
  accept_with_corrections: "yellow",
  needs_improvement: "orange",
  reject: "red",
};

const CATEGORY_COLOR = {
  indian: "grape",
  foreign: "cyan",
};

export function ReviewCard({ review }) {
  return (
    <Card
      withBorder
      radius="md"
      p="md"
      bg={`${CATEGORY_COLOR[review.examiner_type]}.0`}
    >
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          <Badge color={CATEGORY_COLOR[review.examiner_type]} size="lg">
            {review.examiner_type === "indian"
              ? "Indian Examiner"
              : "Foreign Examiner"}
          </Badge>
          <Text size="sm" fw={500}>
            {review.examiner_name}
          </Text>
        </Group>
        <Badge
          color={RECOMMENDATION_COLOR[review.recommendation] || "gray"}
          variant="filled"
        >
          {RECOMMENDATION_LABEL[review.recommendation] || review.recommendation}
        </Badge>
      </Group>
      <Stack gap={4}>
        <Text size="sm">
          <b>Originality &amp; Presentation:</b>{" "}
          {review.originality_presentation || "-"}
        </Text>
        <Text size="sm">
          <b>Comparable to other universities:</b>{" "}
          {review.quality_comparable === null
            ? "N/A"
            : review.quality_comparable
              ? "Yes"
              : "No"}
        </Text>
        <Text size="sm">
          <b>New ideas with original thought:</b>{" "}
          {review.new_ideas_original === null
            ? "N/A"
            : review.new_ideas_original
              ? "Yes"
              : "No"}
        </Text>
        <Text size="sm">
          <b>Corrections needed:</b> {review.correction_severity || "-"}
        </Text>
        <Text size="sm">
          <b>Technical content:</b> {review.technical_content || "-"}
        </Text>
        <Text size="sm">
          <b>Highlights / strong-weak points:</b> {review.highlights || "-"}
        </Text>
        <Text size="sm">
          <b>Suggestions:</b> {review.suggestions || "-"}
        </Text>
        <Text size="sm">
          <b>Defense questions:</b> {review.defense_questions || "-"}
        </Text>
        <Text size="xs" c="dimmed" mt={4}>
          Submitted{" "}
          {review.submitted_at
            ? new Date(review.submitted_at).toLocaleString()
            : "N/A"}
        </Text>
      </Stack>
    </Card>
  );
}

ReviewCard.propTypes = {
  review: PropTypes.shape({
    examiner_type: PropTypes.oneOf(["indian", "foreign"]).isRequired,
    examiner_name: PropTypes.string,
    examiner_email: PropTypes.string,
    recommendation: PropTypes.string,
    originality_presentation: PropTypes.string,
    quality_comparable: PropTypes.bool,
    new_ideas_original: PropTypes.bool,
    correction_severity: PropTypes.string,
    technical_content: PropTypes.string,
    highlights: PropTypes.string,
    suggestions: PropTypes.string,
    defense_questions: PropTypes.string,
    submitted_at: PropTypes.string,
  }).isRequired,
};

export function RevisionRoundStatus({ round }) {
  if (!round) return null;
  return (
    <Card withBorder radius="md" p="sm" mt="md" bg="gray.0">
      <Text size="sm" fw={500} mb={4}>
        Revision round {round.round_number}
      </Text>
      {round.revised_thesis_url ? (
        <Anchor
          size="sm"
          href={round.revised_thesis_url}
          target="_blank"
          rel="noreferrer"
        >
          View revised thesis
        </Anchor>
      ) : (
        <Text size="sm" c="dimmed">
          Waiting for the student to upload the revised thesis.
        </Text>
      )}
      {round.committee_size > 0 && (
        <>
          <Text size="sm" mt="xs">
            RPC consent: {round.consented_count} / {round.committee_size}
          </Text>
          <List size="sm" spacing={2}>
            {round.committee.map((m) => (
              <List.Item key={m.member_name}>
                {m.member_name} &middot; {m.consented ? "Consented" : "Pending"}
              </List.Item>
            ))}
          </List>
        </>
      )}
    </Card>
  );
}

RevisionRoundStatus.propTypes = {
  round: PropTypes.shape({
    round_number: PropTypes.number,
    revised_thesis_url: PropTypes.string,
    committee_size: PropTypes.number,
    consented_count: PropTypes.number,
    committee: PropTypes.arrayOf(
      PropTypes.shape({
        member_name: PropTypes.string,
        consented: PropTypes.bool,
      }),
    ),
  }),
};

RevisionRoundStatus.defaultProps = {
  round: null,
};

export default function SupervisorReviewReports() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(supervisorReviewReportsRoute, {
        headers: { Authorization: `Token ${token}` },
      });
      setSubmissions(res.data || []);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const authConfig = () => ({
    headers: { Authorization: `Token ${localStorage.getItem("authToken")}` },
  });

  const handleReportsDecision = async (submissionId, action) => {
    setSubmittingId(submissionId);
    try {
      const res = await axios.post(
        supervisorReportsDecisionRoute,
        { submission_id: submissionId, action },
        authConfig(),
      );
      showNotification({
        title: "Success",
        message: res.data.detail,
        color: "teal",
        icon: <IconCheck />,
      });
      fetchData();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || e.message,
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const handleFinalizeRevision = async (submissionId) => {
    setSubmittingId(submissionId);
    try {
      const res = await axios.post(
        supervisorFinalizeRevisionRoute,
        { submission_id: submissionId },
        authConfig(),
      );
      showNotification({
        title: "Success",
        message: res.data.detail,
        color: "teal",
        icon: <IconCheck />,
      });
      fetchData();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || e.message,
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <Center style={{ height: 200 }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error) {
    return <Notification color="red">Error: {error.message}</Notification>;
  }

  if (submissions.length === 0) {
    return (
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Text c="dimmed" ta="center">
          No examiner reports have been submitted yet.
        </Text>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {submissions.map((sub) => (
        <Card key={sub.id} shadow="sm" p="lg" radius="md" withBorder>
          <Group justify="space-between" mb={4}>
            <Title order={4}>{sub.title}</Title>
            {sub.status_label && (
              <Badge color="blue" variant="light">
                {sub.status_label}
              </Badge>
            )}
          </Group>
          <Text size="sm" c="dimmed" mb="md">
            {sub.student_name} &middot; Roll No: {sub.student_roll}
          </Text>
          <Divider mb="md" />
          <Stack gap="md">
            {sub.reviews.map((review) => (
              <ReviewCard
                key={`${sub.id}-${review.examiner_type}-${review.examiner_email}`}
                review={review}
              />
            ))}
          </Stack>

          {sub.status === "supervisor_reports_review" && (
            <Group justify="flex-end" mt="md">
              <Button
                color="orange"
                loading={submittingId === sub.id}
                onClick={() =>
                  handleReportsDecision(sub.id, "forward_to_student")
                }
              >
                Forward to Student for Revision
              </Button>
              <Button
                color="teal"
                loading={submittingId === sub.id}
                onClick={() =>
                  handleReportsDecision(sub.id, "no_revision_needed")
                }
              >
                No Revision Needed
              </Button>
            </Group>
          )}

          {(sub.status === "student_revision_pending" ||
            sub.status === "supervisor_revision_review") && (
            <>
              <RevisionRoundStatus round={sub.current_round} />
              {sub.status === "supervisor_revision_review" && (
                <Group justify="flex-end" mt="md">
                  <Button
                    color="teal"
                    loading={submittingId === sub.id}
                    disabled={
                      !sub.current_round ||
                      sub.current_round.consented_count <
                        sub.current_round.committee_size
                    }
                    onClick={() => handleFinalizeRevision(sub.id)}
                  >
                    Forward to Dean
                  </Button>
                </Group>
              )}
            </>
          )}
        </Card>
      ))}
    </Stack>
  );
}
