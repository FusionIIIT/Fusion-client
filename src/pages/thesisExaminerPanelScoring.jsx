import { useEffect, useState, useCallback } from "react";
import {
  Container,
  Card,
  Title,
  Text,
  Table,
  Badge,
  NumberInput,
  Button,
  Loader,
  Center,
  Alert,
  Group,
  Stack,
  Anchor,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useDocumentTitle } from "@mantine/hooks";
import {
  examinerPanelBatchDetailRoute,
  examinerPanelSubmitScoreRoute,
} from "../routes/academicRoutes";
import { dynamicApiHost } from "../routes/globalRoutes";
import InstitutePublicHeader from "../components/InstitutePublicHeader";
import { pageTitle } from "../lib/pageTitle";

const fileUrl = (url) =>
  url.startsWith("http")
    ? url
    : `${dynamicApiHost}${url.startsWith("/") ? "" : "/"}${url}`;

// Public page reached from an emailed scoring link, once the examiner has
// accepted. No Fusion account exists for the examiner -- the token in the
// URL is the sole credential. Unlike the single-thesis review form, this
// lists EVERY student in the batch, since one examiner covers the whole
// batch, not one thesis.
export default function ThesisExaminerPanelScoring() {
  useDocumentTitle(pageTitle("Examiner Scoring"));
  const { token } = useParams();
  const [batchName, setBatchName] = useState("");
  const [examinerName, setExaminerName] = useState("");
  const [students, setStudents] = useState([]);
  const [scoreDrafts, setScoreDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(examinerPanelBatchDetailRoute(token));
      setBatchName(res.data.batch_name);
      setExaminerName(res.data.examiner_name);
      setStudents(res.data.students || []);
    } catch (e) {
      setError(
        e.response?.data?.error ||
          e.message ||
          "This link is invalid or has expired.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleSubmit = async (evaluationId) => {
    const score = scoreDrafts[evaluationId];
    if (score === undefined || score === "") return;
    setSubmittingId(evaluationId);
    try {
      await axios.post(examinerPanelSubmitScoreRoute(token), {
        evaluation_id: evaluationId,
        score,
      });
      showNotification({
        title: "Score recorded",
        message: "Thank you.",
        color: "green",
      });
      fetchDetail();
    } catch (e) {
      showNotification({
        title: "Submit failed",
        message: e.response?.data?.error || e.message,
        color: "red",
      });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <>
      <InstitutePublicHeader />
      <Container size="md" mt="xl" mb="xl">
        <Card shadow="sm" p="xl" radius="md" withBorder>
          {loading && (
            <Center py="xl">
              <Loader aria-label="Loading" />
            </Center>
          )}

          {!loading && error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              title="Unable to load this page"
            >
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <>
              <Title order={3} mb="xs">
                Thesis Scoring — {batchName}
              </Title>
              <Text c="dimmed" mb="lg">
                Dear {examinerName}, please score each student&apos;s thesis out
                of 100.
              </Text>

              {students.length === 0 ? (
                <Text size="sm" c="dimmed">
                  No students found for this batch.
                </Text>
              ) : (
                <Table highlightOnHover withTableBorder>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Credits</th>
                      <th>Documents</th>
                      <th>Your Score</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => {
                      const alreadyScored = s.examiner_score !== null;
                      const hasSubmission =
                        s.synopsis_url && s.thesis_report_url;
                      return (
                        <tr key={s.evaluation_id}>
                          <td>
                            {s.student_name} ({s.student_roll})
                          </td>
                          <td>{s.credits}</td>
                          <td>
                            {hasSubmission ? (
                              <Stack gap={4}>
                                <Anchor
                                  size="xs"
                                  href={fileUrl(s.synopsis_url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Synopsis
                                </Anchor>
                                <Anchor
                                  size="xs"
                                  href={fileUrl(s.thesis_report_url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Thesis Report
                                </Anchor>
                              </Stack>
                            ) : (
                              <Badge color="yellow" variant="light">
                                Not submitted
                              </Badge>
                            )}
                          </td>
                          <td style={{ minWidth: 140 }}>
                            {alreadyScored ? (
                              <Badge color="green" variant="light">
                                {s.examiner_score}
                              </Badge>
                            ) : !hasSubmission ? (
                              <Text size="xs" c="dimmed">
                                Awaiting thesis submission
                              </Text>
                            ) : (
                              <NumberInput
                                aria-label={`Score for ${s.student_name}`}
                                min={0}
                                max={100}
                                decimalScale={1}
                                placeholder="0-100"
                                value={scoreDrafts[s.evaluation_id] ?? ""}
                                onChange={(val) =>
                                  setScoreDrafts((prev) => ({
                                    ...prev,
                                    [s.evaluation_id]: val,
                                  }))
                                }
                              />
                            )}
                          </td>
                          <td>
                            {!alreadyScored && hasSubmission && (
                              <Group justify="flex-end">
                                <Button
                                  size="xs"
                                  loading={submittingId === s.evaluation_id}
                                  disabled={
                                    scoreDrafts[s.evaluation_id] ===
                                      undefined ||
                                    scoreDrafts[s.evaluation_id] === ""
                                  }
                                  onClick={() => handleSubmit(s.evaluation_id)}
                                >
                                  Submit
                                </Button>
                              </Group>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </>
          )}
        </Card>
      </Container>
    </>
  );
}
