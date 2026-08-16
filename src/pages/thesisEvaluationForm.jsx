import { useEffect, useState, useCallback } from "react";
import {
  Container, Card, Title, Text, Divider, Stack, Group, Grid,
  TextInput, Textarea, SegmentedControl, Radio, Button, Loader,
  Center, Alert, Stepper, Anchor, Badge,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconX, IconAlertCircle, IconExternalLink } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { reviewDetailRoute } from "../routes/academicRoutes";
import InstitutePublicHeader from "../components/InstitutePublicHeader";

const RECOMMENDATION_OPTIONS = [
  {
    value: "accept",
    label: "The thesis is acceptable in the present form for the award of the Ph.D. Degree.",
  },
  {
    value: "accept_with_corrections",
    label:
      "The thesis is acceptable and the corrections, modifications and improvement suggested by me be incorporated in the thesis.",
  },
  {
    value: "needs_improvement",
    label:
      "The thesis needs technical improvement/modifications which must be carried out to my satisfaction. The student's written response should be sent to me and I will reply within two weeks of its receipt, before I recommend the thesis for acceptance.",
  },
  {
    value: "reject",
    label: "The thesis does not contain any novel work and is outright rejected for the award of the degree.",
  },
];

const RECOMMENDATION_LABEL = RECOMMENDATION_OPTIONS.reduce((acc, opt) => {
  acc[opt.value] = opt.label;
  return acc;
}, {});

const EMPTY_BANK_DETAILS = {
  beneficiary_name: "",
  bank_name: "",
  bank_address: "",
  account_no: "",
  ifsc_code: "",
  pan_no: "",
  iban_no: "",
  swift_code: "",
};

function DocumentPreview({ title, url }) {
  return (
    <div style={{ marginTop: 16 }}>
      <Group justify="space-between" mb={4}>
        <Text size="sm" fw={500}>{title}</Text>
        <Anchor href={url} target="_blank" rel="noopener noreferrer" size="xs">
          <Group gap={4}>
            Open in new tab <IconExternalLink size={12} />
          </Group>
        </Anchor>
      </Group>
      <iframe
        src={url}
        width="100%"
        height={title.startsWith("Synopsis") ? 300 : 400}
        style={{ border: "1px solid #dee2e6", borderRadius: 6 }}
        title={title}
      />
    </div>
  );
}

DocumentPreview.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

// Public page reached from an emailed review link, once the examiner has
// accepted. No Fusion account exists for the examiner -- the token in the
// URL is the sole credential, so this page must never attach an
// Authorization header.
export default function ThesisEvaluationForm() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [step, setStep] = useState(0);

  const [originalityPresentation, setOriginalityPresentation] = useState("");
  const [qualityComparable, setQualityComparable] = useState(null);
  const [newIdeasOriginal, setNewIdeasOriginal] = useState(null);
  const [correctionSeverity, setCorrectionSeverity] = useState("none");
  const [technicalContent, setTechnicalContent] = useState("");
  const [highlights, setHighlights] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [defenseQuestions, setDefenseQuestions] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [bankDetails, setBankDetails] = useState(EMPTY_BANK_DETAILS);

  useEffect(() => {
    if (!token) {
      setLoadError("Invalid review link.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await axios.get(reviewDetailRoute(token));
        setData(res.data);
        setBankDetails((b) => ({ ...b, beneficiary_name: res.data?.examiner?.name || "" }));
      } catch (e) {
        setLoadError(e.response?.data?.error || e.message || "Failed to load this review.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const updateBankField = useCallback(
    (field, value) => setBankDetails((b) => ({ ...b, [field]: value })),
    [],
  );

  const goToNextStep = () => {
    if (step === 0 && !recommendation) {
      showNotification({
        title: "Validation",
        message: "Please select a specific recommendation (Section E) before continuing.",
        color: "red",
        icon: <IconX />,
      });
      return;
    }
    setStep((s) => Math.min(s + 1, 2));
  };

  const goToPrevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await axios.post(reviewDetailRoute(token), {
        originality_presentation: originalityPresentation,
        quality_comparable: qualityComparable,
        new_ideas_original: newIdeasOriginal,
        correction_severity: correctionSeverity,
        technical_content: technicalContent,
        highlights,
        suggestions,
        defense_questions: defenseQuestions,
        recommendation,
        bank_details: bankDetails,
      });
      setDone(true);
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || e.message || "Failed to submit review",
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <InstitutePublicHeader />
        <Center h="60vh">
          <Loader aria-label="Loading thesis review" />
        </Center>
      </>
    );
  }

  if (loadError) {
    return (
      <>
        <InstitutePublicHeader />
        <Container size="sm" mt="xl">
          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Unable to load this review">
            {loadError}
          </Alert>
        </Container>
      </>
    );
  }

  if (done) {
    return (
      <>
        <InstitutePublicHeader />
        <Container size="sm" mt="xl">
          <Card shadow="sm" p="xl" radius="md" withBorder>
            <Center mb="sm">
              <IconCheck size={40} color="var(--mantine-color-teal-6)" />
            </Center>
            <Title order={3} ta="center" mb="xs">
              Thank you for your evaluation
            </Title>
            <Text ta="center" c="dimmed">
              Your review has been recorded and submitted to the institute.
            </Text>
          </Card>
        </Container>
      </>
    );
  }

  const isForeign = data.examiner_type === "foreign";

  return (
    <>
      <InstitutePublicHeader />
      <Container size="md" my="xl">
        <Title order={3} ta="center" mb={4}>
          Examination Report of PhD Student
        </Title>
        <Text ta="center" c="dimmed" size="sm" mb="lg">
          {data.student_name} &middot; {data.student_roll} &middot; {data.thesis_title}
        </Text>

        <Stepper active={step} onStepClick={setStep} allowNextStepsSelect={false} mb="xl">
          <Stepper.Step label="Evaluate Thesis" description="Sections A-E">
            <Card shadow="sm" p="xl" radius="md" withBorder mt="md">
              <Divider mb="md" label="Details of Candidate" labelPosition="center" />
              <Grid>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">Name of Student</Text>
                  <Text fw={500}>{data.student_name}</Text>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="sm" c="dimmed">Roll No.</Text>
                  <Text fw={500}>{data.student_roll}</Text>
                </Grid.Col>
                <Grid.Col span={3}>
                  <Text size="sm" c="dimmed">Discipline</Text>
                  <Text fw={500}>{data.student_discipline || "N/A"}</Text>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Text size="sm" c="dimmed">Title of the Thesis</Text>
                  <Text fw={500}>{data.thesis_title}</Text>
                </Grid.Col>
              </Grid>

              {data.synopsis_url && <DocumentPreview title="Synopsis" url={data.synopsis_url} />}
              {data.report_url && <DocumentPreview title="Thesis Report" url={data.report_url} />}
            </Card>

            <Card shadow="sm" p="xl" radius="md" withBorder mt="md">
              <Title order={4} mb="sm">A. General features of Thesis</Title>
              <Stack gap="md">
                <Textarea
                  label="1. Originality &amp; Presentation"
                  minRows={2}
                  value={originalityPresentation}
                  onChange={(e) => setOriginalityPresentation(e.target.value)}
                />
                <div>
                  <Text size="sm" fw={500} mb={4}>
                    2. Whether quality of work comparable to other universities of repute?
                  </Text>
                  <SegmentedControl
                    data={[{ label: "Yes", value: "yes" }, { label: "No", value: "no" }]}
                    value={qualityComparable === null ? "" : (qualityComparable ? "yes" : "no")}
                    onChange={(v) => setQualityComparable(v === "yes")}
                  />
                </div>
                <div>
                  <Text size="sm" fw={500} mb={4}>
                    3. Whether the thesis has embodied any new ideas with original thought?
                  </Text>
                  <SegmentedControl
                    data={[{ label: "Yes", value: "yes" }, { label: "No", value: "no" }]}
                    value={newIdeasOriginal === null ? "" : (newIdeasOriginal ? "yes" : "no")}
                    onChange={(v) => setNewIdeasOriginal(v === "yes")}
                  />
                </div>
              </Stack>
            </Card>

            <Card shadow="sm" p="xl" radius="md" withBorder mt="md">
              <Title order={4} mb="sm">B. Comments</Title>
              <Stack gap="md">
                <div>
                  <Text size="sm" fw={500} mb={4}>
                    4. Corrections for punctuation, grammar, spelling, typographical errors or language
                  </Text>
                  <SegmentedControl
                    data={[
                      { label: "None", value: "none" },
                      { label: "Minor", value: "minor" },
                      { label: "Major", value: "major" },
                    ]}
                    value={correctionSeverity}
                    onChange={setCorrectionSeverity}
                  />
                </div>
                <Textarea
                  label="5. Technical content of the thesis"
                  description="Originality and unique contribution, integration into a coherent product, whether research questions are clearly formulated and results/conclusions clearly presented, research skills of the candidate."
                  minRows={4}
                  value={technicalContent}
                  onChange={(e) => setTechnicalContent(e.target.value)}
                />
                <Textarea
                  label="6. Highlights and strong/weak points in the thesis"
                  minRows={4}
                  value={highlights}
                  onChange={(e) => setHighlights(e.target.value)}
                />
              </Stack>
            </Card>

            <Card shadow="sm" p="xl" radius="md" withBorder mt="md">
              <Title order={4} mb="sm">C. Suggestions</Title>
              <Textarea minRows={4} value={suggestions} onChange={(e) => setSuggestions(e.target.value)} />
            </Card>

            <Card shadow="sm" p="xl" radius="md" withBorder mt="md">
              <Title order={4} mb="sm">D. Questions to be asked during the defense, if any</Title>
              <Textarea minRows={4} value={defenseQuestions} onChange={(e) => setDefenseQuestions(e.target.value)} />
            </Card>

            <Card shadow="sm" p="xl" radius="md" withBorder mt="md">
              <Title order={4} mb="sm">E. Specific Recommendation</Title>
              <Radio.Group value={recommendation} onChange={setRecommendation}>
                <Stack gap="sm">
                  {RECOMMENDATION_OPTIONS.map((opt) => (
                    <Radio key={opt.value} value={opt.value} label={opt.label} />
                  ))}
                </Stack>
              </Radio.Group>
            </Card>
          </Stepper.Step>

          <Stepper.Step label="Bank Details" description="For honorarium">
            <Card shadow="sm" p="xl" radius="md" withBorder mt="md">
              <Title order={4} mb="sm">Examiner Details</Title>
              <Grid mb="md">
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">Name</Text>
                  <Text fw={500}>{data.examiner?.name}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">E-mail</Text>
                  <Text fw={500}>{data.examiner?.email}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">Designation</Text>
                  <Text fw={500}>{data.examiner?.position || "N/A"}</Text>
                </Grid.Col>
                <Grid.Col span={6}>
                  <Text size="sm" c="dimmed">Address</Text>
                  <Text fw={500}>{data.examiner?.address || "N/A"}</Text>
                </Grid.Col>
              </Grid>

              <Divider my="md" label="Bank Account Details (for honorarium)" labelPosition="center" />
              <Grid>
                <Grid.Col span={6}>
                  <TextInput
                    label="Beneficiary's Name"
                    value={bankDetails.beneficiary_name}
                    onChange={(e) => updateBankField("beneficiary_name", e.target.value)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Name of Bank"
                    value={bankDetails.bank_name}
                    onChange={(e) => updateBankField("bank_name", e.target.value)}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <Textarea
                    label="Address of Bank"
                    minRows={2}
                    value={bankDetails.bank_address}
                    onChange={(e) => updateBankField("bank_address", e.target.value)}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <TextInput
                    label="Account No."
                    value={bankDetails.account_no}
                    onChange={(e) => updateBankField("account_no", e.target.value)}
                  />
                </Grid.Col>
                {isForeign ? (
                  <>
                    <Grid.Col span={3}>
                      <TextInput
                        label="IBAN No."
                        value={bankDetails.iban_no}
                        onChange={(e) => updateBankField("iban_no", e.target.value)}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <TextInput
                        label="Swift Code"
                        value={bankDetails.swift_code}
                        onChange={(e) => updateBankField("swift_code", e.target.value)}
                      />
                    </Grid.Col>
                  </>
                ) : (
                  <>
                    <Grid.Col span={3}>
                      <TextInput
                        label="IFSC Code"
                        value={bankDetails.ifsc_code}
                        onChange={(e) => updateBankField("ifsc_code", e.target.value)}
                      />
                    </Grid.Col>
                    <Grid.Col span={3}>
                      <TextInput
                        label="PAN No."
                        value={bankDetails.pan_no}
                        onChange={(e) => updateBankField("pan_no", e.target.value)}
                      />
                    </Grid.Col>
                  </>
                )}
              </Grid>
            </Card>
          </Stepper.Step>

          <Stepper.Step label="Review & Submit" description="Confirm and send">
            <Card shadow="sm" p="xl" radius="md" withBorder mt="md">
              <Title order={4} mb="sm">Your Recommendation</Title>
              <Badge size="lg" color="blue" variant="light" mb="xs">
                {RECOMMENDATION_LABEL[recommendation] ? "Selected" : "Not selected"}
              </Badge>
              <Text>{RECOMMENDATION_LABEL[recommendation]}</Text>
            </Card>

            <Card shadow="sm" p="xl" radius="md" withBorder mt="md">
              <Title order={4} mb="sm">Evaluation Summary</Title>
              <Stack gap="sm">
                <Text size="sm"><b>Originality &amp; Presentation:</b> {originalityPresentation || "-"}</Text>
                <Text size="sm">
                  <b>Comparable to other universities of repute:</b>{" "}
                  {qualityComparable === null ? "Not answered" : (qualityComparable ? "Yes" : "No")}
                </Text>
                <Text size="sm">
                  <b>Embodies new ideas with original thought:</b>{" "}
                  {newIdeasOriginal === null ? "Not answered" : (newIdeasOriginal ? "Yes" : "No")}
                </Text>
                <Text size="sm"><b>Corrections needed:</b> {correctionSeverity}</Text>
                <Text size="sm"><b>Technical content:</b> {technicalContent || "-"}</Text>
                <Text size="sm"><b>Highlights / strong-weak points:</b> {highlights || "-"}</Text>
                <Text size="sm"><b>Suggestions:</b> {suggestions || "-"}</Text>
                <Text size="sm"><b>Defense questions:</b> {defenseQuestions || "-"}</Text>
              </Stack>
            </Card>

            <Card shadow="sm" p="xl" radius="md" withBorder mt="md">
              <Title order={4} mb="sm">Bank Details</Title>
              <Text size="sm"><b>Beneficiary:</b> {bankDetails.beneficiary_name || "-"}</Text>
              <Text size="sm"><b>Bank:</b> {bankDetails.bank_name || "-"}</Text>
              <Text size="sm"><b>Account No.:</b> {bankDetails.account_no || "-"}</Text>
              {isForeign ? (
                <Text size="sm"><b>IBAN / Swift:</b> {bankDetails.iban_no || "-"} / {bankDetails.swift_code || "-"}</Text>
              ) : (
                <Text size="sm"><b>IFSC / PAN:</b> {bankDetails.ifsc_code || "-"} / {bankDetails.pan_no || "-"}</Text>
              )}
            </Card>
          </Stepper.Step>
        </Stepper>

        <Group justify="flex-end" mb="xl">
          {step > 0 && (
            <Button variant="default" onClick={goToPrevStep} disabled={submitting}>
              Back
            </Button>
          )}
          {step < 2 && (
            <Button onClick={goToNextStep}>
              Next
            </Button>
          )}
          {step === 2 && (
            <Button size="md" onClick={handleSubmit} loading={submitting}>
              Submit Evaluation
            </Button>
          )}
        </Group>
      </Container>
    </>
  );
}
