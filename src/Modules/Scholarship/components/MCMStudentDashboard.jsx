import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  List,
  Paper,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  NumberInput,
  Title,
  ThemeIcon,
  Box,
  LoadingOverlay,
  Modal,
  Accordion,
  Checkbox,
} from "@mantine/core";
import {
  IconDownload,
  IconInfoCircle,
  IconSchool,
  IconUsers,
  IconFileDescription,
  IconCircleCheck,
  IconAlertCircle,
  IconUpload,
  IconSend,
  IconCalendarEvent,
  IconCurrencyRupee,
  IconFileCertificate,
  IconChevronRight,
  IconAt,
} from "@tabler/icons-react";
import {
  getMCMApplications,
  submitMCMLinkApplication,
  updateMCMLinkApplication,
  getSingleParentApplications,
  submitSingleParentApplication,
  updateSingleParentApplication,
  getStudentProfile
} from "../services/scholarshipAPI";
import { STATUS, STATUS_COLORS, STATUS_LABELS, normalizeStatus } from "../constants/status";

// ─── Constants & Configuration ───────────────────────────────────────────────

const FUSION_BLUE = "#15abff";
const DEADLINE = "October 28, 2026";

const scholarshipOptions = [
  { id: "mcm", title: "MCM Scholarship", subtitle: "Merit-cum-Means Portal", icon: IconSchool },
  { id: "single_parent", title: "Single Parent Waiver", subtitle: "Tuition Fee Waiver Portal", icon: IconUsers }
];

const programmeOptions = [
  { value: "B.Tech CSE", label: "B.Tech Computer Science & Engineering" },
  { value: "B.Tech ECE", label: "B.Tech Electronics & Communication Engineering" },
  { value: "B.Tech EE", label: "B.Tech Electrical Engineering" },
  { value: "B.Tech ME", label: "B.Tech Mechanical Engineering" },
  { value: "B.Tech SM", label: "B.Tech Smart Manufacturing" },
  { value: "B.Des", label: "Bachelor of Design" }
];

const categoryOptions = ["GEN", "GEN-EWS", "OBC", "SC", "ST"];
const batchOptions = ["2023", "2024", "2025", "2026"];

const mcmForms = [
  { label: "Form A (Income from Service)", href: "/downloads/Form A.docx" },
  { label: "Form B (Income from Pension)", href: "/downloads/Form B.docx" },
  { label: "Form D (Parental Declaration)", href: "/downloads/Form D.docx" },
  { label: "Questionnaire-cum-Application", href: "/downloads/Questionnaire cum Application form.docx" },
  { label: "Undertaking (Annexure 1)", href: "/downloads/Undertaking_MCM.docx" }
];

const singleParentForms = [
  { label: "Undertaking (Annexure 2)", href: "/downloads/Undertaking_Single_Parent.docx" }
];

// -- Logic Helpers --
const isDriveLink = (value) => {
  if (!value) return false;
  return /^(https?:\/\/)?(drive\.google\.com|docs\.google\.com)\/.+$/.test(value.trim());
};

const sanitize = (val) => (typeof val === "string" ? val.trim() : val);

const formatApiError = (error) => {
  const data = error?.response?.data;
  if (!data) return "Submission failed. Please check your internet connection.";
  if (typeof data === "string") return data;
  if (data.detail) return data.detail;
  if (data.error) return data.error;
  
  const messages = Object.entries(data)
    .map(([key, val]) => {
      const fieldName = key.replace(/_/g, " ").toUpperCase();
      const message = Array.isArray(val) ? val.join(", ") : String(val);
      return `${fieldName}: ${message}`;
    })
    .join(" | ");
  
  return messages || "Invalid data submission. Please review all fields.";
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MCMStudentDashboard() {
  const user = useSelector((state) => state.user);
  
  // -- Core State --
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null });
  const [selectedScholarship, setSelectedScholarship] = useState("mcm");
  const [mcmTab, setMcmTab] = useState("apply");
  const [spTab, setSpTab] = useState("apply");
  const [statusTab, setStatusTab] = useState(STATUS.PENDING);

  const [mcmApps, setMcmApps] = useState([]);
  const [spApps, setSpApps] = useState([]);

  // -- Form States --
  const initialMcm = {
    student_full_name: "", roll_no: "", email: "",
    batch: "", programme: "", mobile_no: "", father_name: "", mother_name: "", category: "",
    annual_income: "", current_cpi: "", current_spi: "", jee_uceed_rank: "",
    postal_address: "", father_income_certificate_link: "", mother_income_certificate_link: "",
    caste_certificate_link: "", jee_uceed_scorecard_link: "", undertaking_form_link: "",
    questionnaire_cum_application_link: "", form_ab_link: "", form_d_link: "", declaration_yes: "Yes"
  };

  const initialSp = {
    student_full_name: "", roll_no: "", email: "",
    batch: "", programme: "", mobile_no: "", father_name: "", mother_name: "", category: "",
    current_cpi: "", postal_address: "", caste_certificate: "", undertaking_form: "",
    death_certificate: "", affidavit_no_earning_member: "", declaration_yes: "Yes"
  };

  const [mcmForm, setMcmForm] = useState(initialMcm);
  const [spForm, setSpForm] = useState(initialSp);
  const [errors, setErrors] = useState({});

  // -- Data Sync --
  const fetchData = async () => {
    setLoading(true);
    try {
      const [mcmRes, spRes, profRes] = await Promise.all([
        getMCMApplications().catch(() => ({ data: [] })),
        getSingleParentApplications().catch(() => ({ data: [] })),
        getStudentProfile().catch(() => ({ data: {} }))
      ]);

      const mData = Array.isArray(mcmRes.data) ? mcmRes.data : mcmRes.data?.results || [];
      const sData = Array.isArray(spRes.data) ? spRes.data : spRes.data?.results || [];
      const pData = profRes.data || {};

      setMcmApps(mData);
      setSpApps(sData);

      const autoData = {
        student_full_name: user?.username || pData.name || "",
        roll_no: user?.roll_no || pData.roll_no || "",
        email: user?.roll_no ? `${user.roll_no}@iiitdmj.ac.in` : (pData.roll_no ? `${pData.roll_no}@iiitdmj.ac.in` : "")
      };

      if (mData.length > 0) {
        const latest = [...mData].sort((a,b) => new Date(b.submitted_at) - new Date(a.submitted_at))[0];
        setMcmForm(prev => ({ ...prev, ...latest, ...autoData }));
      } else {
        setMcmForm(prev => ({ ...prev, ...autoData, batch: pData.batch || "", programme: pData.programme || pData.degree || "", category: pData.category || "" }));
      }

      if (sData.length > 0) {
        const latest = [...sData].sort((a,b) => new Date(b.submitted_at) - new Date(a.submitted_at))[0];
        setSpForm(prev => ({ ...prev, ...latest, ...autoData }));
      } else {
        setSpForm(prev => ({ ...prev, ...autoData, batch: pData.batch || "", programme: pData.programme || pData.degree || "", category: pData.category || "" }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user]);

  // -- Dynamic Validation UX --
  const validateField = (field, value, type = "MCM") => {
    let error = null;
    const isMcm = type === "MCM";
    const batch = isMcm ? mcmForm.batch : spForm.batch;

    switch (field) {
      case "mobile_no":
        if (!/^\d{10}$/.test(value)) error = "Exactly 10 digits required.";
        break;
      case "current_cpi":
      case "current_spi":
        if (value === "" || value === null) error = "Required.";
        else if (value < 0 || value > 10) error = "Range 0-10.";
        break;
      case "annual_income":
        if (value === "" || value === null) error = "Required.";
        else if (value <= 0) error = "Positive number.";
        break;
      case "postal_address":
      case "mother_name":
      case "father_name":
      case "batch":
      case "programme":
        if (!value || (typeof value === "string" && !value.trim())) error = "Required.";
        break;
      case "jee_uceed_rank":
        if (isMcm && String(batch) === "2026") {
          if (!value || value <= 0) error = "Valid rank required.";
        }
        break;
      default:
        const driveFields = [
          "father_income_certificate_link", "mother_income_certificate_link", "caste_certificate_link",
          "undertaking_form_link", "questionnaire_cum_application_link", "form_ab_link", "form_d_link",
          "caste_certificate", "undertaking_form", "death_certificate", "affidavit_no_earning_member"
        ];
        if (driveFields.includes(field)) {
          if (field.includes("caste") && !value) error = null; 
          else if (!isDriveLink(value)) error = "Valid Drive link required.";
        }
        break;
    }

    setErrors(prev => {
      const newErrs = { ...prev };
      delete newErrs[field];
      if (error) newErrs[field] = error;
      return newErrs;
    });
    return !error;
  };

  const handleMcmChange = (field, value) => {
    setMcmForm(prev => ({ ...prev, [field]: value }));
    validateField(field, value, "MCM");
  };

  const handleSpChange = (field, value) => {
    setSpForm(prev => ({ ...prev, [field]: value }));
    validateField(field, value, "SP");
  };

  // -- Submission Handlers --
  const onFinalSubmit = async (type) => {
    setSubmitLoading(true);
    setConfirmModal({ open: false, type: null });
    try {
      if (type === "MCM") {
        const cpi = Number(mcmForm.current_cpi);
        const cat = (mcmForm.category || "").toUpperCase();
        if (String(mcmForm.batch) !== "2026") {
           const minCpi = (cat === "SC" || cat === "ST") ? 7.0 : 8.0;
           if (cpi < minCpi) throw { response: { data: { error: `CPI must be ${minCpi}+ for ${cat} candidates.` } } };
        }
        if (Number(mcmForm.annual_income) > 800000) throw { response: { data: { error: "Income exceeds ₹8,00,000 threshold." } } };

        const payload = Object.keys(mcmForm).reduce((acc, k) => { acc[k] = sanitize(mcmForm[k]); return acc; }, {});
        const req = mcmApps.length > 0 ? updateMCMLinkApplication(mcmApps[0].id, { ...payload, status: STATUS.PENDING, revert_reason: "" }) : submitMCMLinkApplication(payload);
        await req;
        window.alert("MCM Application Sent!");
      } else {
        if (String(spForm.batch) !== "2026" && Number(spForm.current_cpi) < 7.0) throw { response: { data: { error: "Minimum CPI 7.0 required." } } };
        const payload = Object.keys(spForm).reduce((acc, k) => { acc[k] = sanitize(spForm[k]); return acc; }, {});
        const req = spApps.length > 0 ? updateSingleParentApplication(spApps[0].id, { ...payload, status: STATUS.PENDING, revert_reason: "" }) : submitSingleParentApplication(payload);
        await req;
        window.alert("SP Waiver Application Sent!");
      }
      fetchData();
    } catch (e) {
      window.alert(formatApiError(e));
    } finally {
      setSubmitLoading(false);
    }
  };

  const latestMcm = mcmApps[0] || null;
  const latestSp = spApps[0] || null;
  const canEditMcm = !latestMcm || normalizeStatus(latestMcm.status) === STATUS.REVERTED;
  const canEditSp = !latestSp || normalizeStatus(latestSp.status) === STATUS.REVERTED;

  const InputHeader = ({ title, icon: Icon }) => (
    <Group gap="xs" mt="lg" mb="sm">
      <ThemeIcon color="blue" variant="light" size="sm"><Icon size={14} /></ThemeIcon>
      <Text fw={700} size="sm" c="dimmed" tt="uppercase" style={{ letterSpacing: "0.5px" }}>{title}</Text>
    </Group>
  );

  if (loading) return <Box py={100} style={{ position: 'relative' }}><LoadingOverlay visible overlayProps={{ blur: 2 }} /></Box>;

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {scholarshipOptions.map(opt => (
          <Paper
            key={opt.id} withBorder p="xl" radius="md" onClick={() => setSelectedScholarship(opt.id)}
            style={{ 
              cursor: "pointer", transition: "all 0.2s", 
              borderColor: selectedScholarship === opt.id ? FUSION_BLUE : undefined,
              backgroundColor: selectedScholarship === opt.id ? "#15abff08" : "#fff" 
            }}
          >
            <Group>
              <ThemeIcon size={54} radius="md" variant={selectedScholarship === opt.id ? "filled" : "light"}><opt.icon size={28} /></ThemeIcon>
              <Box>
                <Text fw={700} size="lg">{opt.title}</Text>
                <Text size="xs" c="dimmed">{opt.subtitle}</Text>
              </Box>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>

      <Card withBorder radius="md" p={0} shadow="sm">
        <Tabs value={selectedScholarship === "mcm" ? mcmTab : spTab} onChange={v => selectedScholarship === "mcm" ? setMcmTab(v) : setSpTab(v)}>
          <Box px="xl" pt="md" style={{ background: "#f8f9fa" }}>
            <Tabs.List variant="pills">
              <Tabs.Tab value="apply" leftSection={<IconUpload size={16} />}>Apply Now</Tabs.Tab>
              <Tabs.Tab value="forms" leftSection={<IconDownload size={16} />}>Forms</Tabs.Tab>
              <Tabs.Tab value="guidelines" leftSection={<IconInfoCircle size={16} />}>Master Guidelines</Tabs.Tab>
              <Tabs.Tab value="status" leftSection={<IconCircleCheck size={16} />}>Track Status</Tabs.Tab>
            </Tabs.List>
          </Box>
          <Divider />

          <Box p="xl">
            <Tabs.Panel value="apply">
              <Stack gap="md">
                <Box style={{ position: "relative" }}>
                  <LoadingOverlay visible={submitLoading} overlayProps={{ blur: 1 }} />
                  {selectedScholarship === "mcm" ? (
                    <Grid gutter="md">
                      <Grid.Col span={12}><InputHeader title="Automatic Identification" icon={IconUsers} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="Full Name" value={mcmForm.student_full_name} readOnly variant="filled" /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="Roll Number" value={mcmForm.roll_no} readOnly variant="filled" /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="Institute Email" leftSection={<IconAt size={14} />} value={mcmForm.email} readOnly variant="filled" /></Grid.Col>
                      
                      <Grid.Col span={12}><InputHeader title="Personal Information" icon={IconUsers} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Contact Number" placeholder="10 Digits" value={mcmForm.mobile_no} onChange={e => handleMcmChange("mobile_no", e.target.value)} error={errors.mobile_no} required disabled={!canEditMcm} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Father's Name" value={mcmForm.father_name} onChange={e => handleMcmChange("father_name", e.target.value)} error={errors.father_name} required disabled={!canEditMcm} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Mother's Name" value={mcmForm.mother_name} onChange={e => handleMcmChange("mother_name", e.target.value)} error={errors.mother_name} required disabled={!canEditMcm} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><Select label="Batch" data={batchOptions} value={mcmForm.batch} onChange={v => handleMcmChange("batch", v)} error={errors.batch} required disabled={!canEditMcm} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><Select label="Programme" data={programmeOptions} value={mcmForm.programme} onChange={v => handleMcmChange("programme", v)} error={errors.programme} required disabled={!canEditMcm} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><Select label="Category" data={categoryOptions} value={mcmForm.category} onChange={v => handleMcmChange("category", v)} error={errors.category} required disabled={!canEditMcm} /></Grid.Col>
                      <Grid.Col span={12}><TextInput label="Postal Address" value={mcmForm.postal_address} onChange={e => handleMcmChange("postal_address", e.target.value)} error={errors.postal_address} required disabled={!canEditMcm} /></Grid.Col>

                      <Grid.Col span={12}><InputHeader title="Merit & Financials" icon={IconCurrencyRupee} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><NumberInput label="Annual Income (FY 25-26)" prefix="₹" value={mcmForm.annual_income} onChange={v => handleMcmChange("annual_income", v)} error={errors.annual_income} required disabled={!canEditMcm} hideControls /></Grid.Col>
                      {String(mcmForm.batch) === "2026" ? (
                        <Grid.Col span={{ base: 12, md: 6 }}><NumberInput label="JEE Rank" value={mcmForm.jee_uceed_rank} onChange={v => handleMcmChange("jee_uceed_rank", v)} error={errors.jee_uceed_rank} required disabled={!canEditMcm} hideControls /></Grid.Col>
                      ) : (
                        <>
                          <Grid.Col span={{ base: 12, md: 3 }}><NumberInput label="Current CPI" precision={2} value={mcmForm.current_cpi} onChange={v => handleMcmChange("current_cpi", v)} error={errors.current_cpi} required disabled={!canEditMcm} /></Grid.Col>
                          <Grid.Col span={{ base: 12, md: 3 }}><NumberInput label="Current SPI" precision={2} value={mcmForm.current_spi} onChange={v => handleMcmChange("current_spi", v)} error={errors.current_spi} required disabled={!canEditMcm} /></Grid.Col>
                        </>
                      )}

                      <Grid.Col span={12}><InputHeader title="Document Links" icon={IconUpload} /></Grid.Col>
                      {[
                        { label: "Father Income Certificate", key: "father_income_certificate_link" },
                        { label: "Mother Income Certificate", key: "mother_income_certificate_link" },
                        { label: "Form A / B", key: "form_ab_link" },
                        { label: "Form D", key: "form_d_link" },
                        { label: "Questionnaire PDF", key: "questionnaire_cum_application_link" },
                        { label: "Undertaking (Annex 1)", key: "undertaking_form_link" }
                      ].map(field => (
                        <Grid.Col key={field.key} span={{ base: 12, md: 6 }}><TextInput label={field.label} placeholder="Drive Link" value={mcmForm[field.key]} onChange={e => handleMcmChange(field.key, e.target.value)} error={errors[field.key]} required disabled={!canEditMcm} /></Grid.Col>
                      ))}
                    </Grid>
                  ) : (
                    /* SP FORM (ALIGNED WITH MCM) */
                    <Grid gutter="md">
                      <Grid.Col span={12}><InputHeader title="Automatic Identification" icon={IconUsers} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="Full Name" value={spForm.student_full_name} readOnly variant="filled" /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="Roll Number" value={spForm.roll_no} readOnly variant="filled" /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 4 }}><TextInput label="Email" value={spForm.email} readOnly variant="filled" /></Grid.Col>
                      
                      <Grid.Col span={12}><InputHeader title="Candidate Information" icon={IconUsers} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Mobile Number" value={spForm.mobile_no} onChange={e => handleSpChange("mobile_no", e.target.value)} error={errors.mobile_no} required disabled={!canEditSp} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><NumberInput label="Current CPI" value={spForm.current_cpi} precision={2} onChange={v => handleSpChange("current_cpi", v)} error={errors.current_cpi} required disabled={!canEditSp} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Father's Name" value={spForm.father_name} onChange={e => handleSpChange("father_name", e.target.value)} error={errors.father_name} required disabled={!canEditSp} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><TextInput label="Mother's Name" value={spForm.mother_name} onChange={e => handleSpChange("mother_name", e.target.value)} error={errors.mother_name} required disabled={!canEditSp} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><Select label="Batch" data={batchOptions} value={spForm.batch} onChange={v => handleSpChange("batch", v)} error={errors.batch} required disabled={!canEditSp} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}><Select label="Programme" data={programmeOptions} value={spForm.programme} onChange={v => handleSpChange("programme", v)} error={errors.programme} required disabled={!canEditSp} /></Grid.Col>
                      <Grid.Col span={{ base: 12, md: 12 }}><Select label="Category" data={categoryOptions} value={spForm.category} onChange={v => handleSpChange("category", v)} error={errors.category} required disabled={!canEditSp} /></Grid.Col>
                      <Grid.Col span={12}><TextInput label="Postal Address" value={spForm.postal_address} onChange={e => handleSpChange("postal_address", e.target.value)} error={errors.postal_address} required disabled={!canEditSp} /></Grid.Col>
                      
                      <Grid.Col span={12}><InputHeader title="Required Documents" icon={IconUpload} /></Grid.Col>
                      {[
                        { label: "Death Certificate", key: "death_certificate" },
                        { label: "No Earning Member Affidavit", key: "affidavit_no_earning_member" },
                        { label: "Undertaking Form", key: "undertaking_form" },
                        { label: "Caste Certificate", key: "caste_certificate" }
                      ].map(field => (
                        <Grid.Col key={field.key} span={{ base: 12, md: 6 }}>
                          <TextInput label={field.label} value={spForm[field.key]} onChange={e => handleSpChange(field.key, e.target.value)} error={errors[field.key]} required disabled={!canEditSp} />
                        </Grid.Col>
                      ))}
                    </Grid>
                  )}

                  <Paper withBorder p="md" radius="md" mt="xl" bg="blue.0">
                    <Checkbox label="I confirm that all provided details are accurate." checked={selectedScholarship === "mcm" ? mcmForm.declaration_yes === "Yes" : spForm.declaration_yes === "Yes"} onChange={(e) => selectedScholarship === "mcm" ? handleMcmChange("declaration_yes", e.currentTarget.checked ? "Yes" : "No") : handleSpChange("declaration_yes", e.currentTarget.checked ? "Yes" : "No")} disabled={selectedScholarship === "mcm" ? !canEditMcm : !canEditSp} />
                  </Paper>

                  <Button fullWidth size="lg" mt={20} color="blue" leftSection={<IconSend size={20} />} disabled={Object.keys(errors).length > 0 || (selectedScholarship === "mcm" ? !canEditMcm : !canEditSp) || (selectedScholarship === "mcm" ? mcmForm.declaration_yes !== "Yes" : spForm.declaration_yes !== "Yes")} onClick={() => setConfirmModal({ open: true, type: selectedScholarship === "mcm" ? "MCM" : "SP" })}>Submit Secure Application</Button>
                </Box>
              </Stack>
            </Tabs.Panel>
            {/* Rest of components remain unchanged... */}
            <Tabs.Panel value="forms">
              <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="lg">
                {(selectedScholarship === "mcm" ? mcmForms : singleParentForms).map(f => (
                  <Card key={f.label} withBorder radius="md" p="md" shadow="base">
                    <Group justify="space-between" mb="xs">
                      <ThemeIcon variant="light"><IconFileCertificate size={18} /></ThemeIcon>
                      <Badge color="blue" size="sm">Template</Badge>
                    </Group>
                    <Text fw={700} size="sm" mb="sm">{f.label}</Text>
                    <Button component="a" href={f.href} download fullWidth variant="light" leftSection={<IconDownload size={14} />}>Download DOCX</Button>
                  </Card>
                ))}
              </SimpleGrid>
            </Tabs.Panel>

            <Tabs.Panel value="guidelines">
              <Stack gap="xl">
                {selectedScholarship === "mcm" ? (
                  <Accordion variant="separated" radius="md" defaultValue="mcm-scope">
                    <Accordion.Item value="mcm-scope">
                      <Accordion.Control icon={<IconInfoCircle size={18} color={FUSION_BLUE}/>}><Text fw={700}>Scholarship Scope & Availability</Text></Accordion.Control>
                      <Accordion.Panel>
                        <List spacing="sm" icon={<IconChevronRight size={14} />}>
                          <List.Item><b>Target Batches:</b> B.Tech and B.Des students of Batches 2023–2026.</List.Item>
                          <List.Item><b>Quota:</b> MCM is awarded to the top <b>10%</b> of students per branch per batch.</List.Item>
                          <List.Item><b>Merit Rule (1st Year):</b> Awarded based on JEE / UCEED All India Rank.</List.Item>
                        </List>
                      </Accordion.Panel>
                    </Accordion.Item>

                    <Accordion.Item value="mcm-eligibility">
                      <Accordion.Control icon={<IconCircleCheck size={18} color="green"/>}><Text fw={700}>Detailed Eligibility Criteria</Text></Accordion.Control>
                      <Accordion.Panel>
                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                          <Paper p="md" withBorder>
                            <Text fw={700} c="blue" size="sm" mb="xs">Academic Limits</Text>
                            <List size="xs" spacing={4}>
                              <List.Item>GEN/OBC/EWS Candidates: <b>CPI ≥ 8.0</b></List.Item>
                              <List.Item>SC/ST Candidates: <b>CPI ≥ 7.0</b></List.Item>
                              <List.Item>No disciplinary actions recorded in AY 2025–26.</List.Item>
                            </List>
                          </Paper>
                          <Paper p="md" withBorder>
                            <Text fw={700} c="blue" size="sm" mb="xs">Financial Limits</Text>
                            <List size="xs" spacing={4}>
                              <List.Item>Family Annual Income: <b>≤ ₹8,00,000</b></List.Item>
                              <List.Item>Income computed for FY 2025–26 (April 2025 - March 2026).</List.Item>
                            </List>
                          </Paper>
                        </SimpleGrid>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                ) : (
                  <Accordion variant="separated" radius="md" defaultValue="sp-eligibility">
                     <Accordion.Item value="sp-eligibility">
                      <Accordion.Control icon={<IconUsers size={18} color={FUSION_BLUE}/>}><Text fw={700}>Single Parent Waiver Eligibility</Text></Accordion.Control>
                      <Accordion.Panel>
                        <List spacing="sm" icon={<IconCircleCheck size={14} color="teal"/>}>
                          <List.Item><b>Sole Loss:</b> Student must have lost the ONLY earning member after joining IIITDMJ.</List.Item>
                          <List.Item><b>Waiver Start:</b> Semester adjustment/refund starts immediately.</List.Item>
                          <List.Item><b>Academic Limit:</b> Must maintain <b>CPI ≥ 7.0</b>.</List.Item>
                        </List>
                      </Accordion.Panel>
                    </Accordion.Item>
                  </Accordion>
                )}

                <Paper p="xl" withBorder radius="md" bg="red.0" style={{ borderColor: "#f03e3e" }}>
                  <Group justify="space-between">
                    <Stack gap={2}>
                      <Group gap="xs">
                        <IconCalendarEvent color="#f03e3e" size={20} />
                        <Text fw={800} size="lg" style={{ color: "#f03e3e" }}>DEADLINE: {DEADLINE}</Text>
                      </Group>
                    </Stack>
                  </Group>
                </Paper>
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="status">
              <Stack gap="md">
                <Tabs value={statusTab} onChange={v => setStatusTab(v)}>
                  <Tabs.List grow>
                    {["pending", "verified", "reverted", "approved", "rejected"].map(s => (
                      <Tabs.Tab key={s} value={s} tt="capitalize">{s === "verified" ? "Review" : s}</Tabs.Tab>
                    ))}
                  </Tabs.List>
                  
                  <Stack mt="xl">
                    {([...mcmApps, ...spApps].filter(a => normalizeStatus(a.status) === statusTab).length === 0) ? (
                      <Text c="dimmed" size="sm" ta="center">No applications found.</Text>
                    ) : (
                      [...mcmApps, ...spApps].filter(a => normalizeStatus(a.status) === statusTab).map(app => (
                        <Paper key={app.id} withBorder p="lg" radius="md" shadow="xs" style={{ borderLeft: `5px solid ${STATUS_COLORS[normalizeStatus(app.status)]}` }}>
                          <Group justify="space-between">
                            <Box>
                              <Text fw={700} size="lg">{app.annual_income ? "MCM Plan" : "SP Waiver"}</Text>
                              <Text size="xs" c="dimmed">Reference: #{app.id}</Text>
                            </Box>
                            <Badge color={STATUS_COLORS[normalizeStatus(app.status)]} size="lg" variant="light">{STATUS_LABELS[normalizeStatus(app.status)]}</Badge>
                          </Group>
                          {app.revert_reason && <Alert color="orange" mt="md" size="xs">{app.revert_reason}</Alert>}
                        </Paper>
                      ))
                    )}
                  </Stack>
                </Tabs>
              </Stack>
            </Tabs.Panel>
          </Box>
        </Tabs>
      </Card>

      <Modal opened={confirmModal.open} onClose={() => setConfirmModal({ open: false, type: null })} title={<Text fw={900}>Finalize Submission</Text>} centered radius="lg">
        <Stack gap="md">
          <Text size="sm">Please verify all document links are public. Misleading info leads to disqualification.</Text>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" onClick={() => setConfirmModal({ open: false, type: null })}>Back</Button>
            <Button color="blue" onClick={() => onFinalSubmit(confirmModal.type)}>Confirm</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
