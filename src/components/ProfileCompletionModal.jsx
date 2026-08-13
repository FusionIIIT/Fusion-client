import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Center,
  FileInput,
  Grid,
  Group,
  Loader,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IdentificationCard,
  Info,
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
  UsersThree,
} from "@phosphor-icons/react";
import { setMustCompleteProfile } from "../redux/userslice";
import {
  host,
  profileCompletionRoute,
  profileCompletionSubmitRoute,
} from "../routes/globalRoutes";
import { STUDENT_FIELDS_CONFIG } from "../Modules/Program_curriculum/Acad_admin/AdminUpcomingBatchesConstants";
import HindiKeyboard from "../Modules/Program_curriculum/Acad_admin/components/HindiKeyboard";

const HALF = { base: 12, sm: 6 };
const THIRD = { base: 12, sm: 6, md: 4 };

function imgSrc(value) {
  if (!value) return "";
  return value.startsWith("data:") ? value : `${host}${value}`;
}

function Section({ icon, title, children }) {
  return (
    <Paper withBorder radius="md" p="md" shadow="xs">
      <Group gap="xs" mb="md">
        <ThemeIcon variant="light" radius="md" size="lg" color="blue">
          {icon}
        </ThemeIcon>
        <Text fw={600} size="sm">
          {title}
        </Text>
      </Group>
      <Grid gutter="sm">{children}</Grid>
    </Paper>
  );
}

Section.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function ProfileCompletionModal() {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    axios
      .get(profileCompletionRoute, {
        headers: { Authorization: `Token ${token}` },
      })
      .then(({ data }) => setForm(data.data))
      .catch(() =>
        notifications.show({
          title: "Could not load profile",
          message: "Please refresh and try again.",
          color: "red",
        }),
      )
      .finally(() => setLoading(false));
  }, []);

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleImage = (file, field, maxKB) => {
    if (!file) {
      set(field, "");
      return;
    }
    const okType =
      ["image/png", "image/jpeg", "image/jpg"].includes(file.type) ||
      /\.(png|jpe?g)$/i.test(file.name);
    if (!okType) {
      notifications.show({
        title: "Invalid file type",
        message: "Only PNG, JPG, or JPEG images are allowed.",
        color: "red",
      });
      return;
    }
    if (file.size > maxKB * 1024) {
      notifications.show({
        title: "File too large",
        message: `Must be ≤ ${maxKB} KB (selected ${Math.round(file.size / 1024)} KB).`,
        color: "red",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set(field, reader.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    const req = [
      ["aadhar_number", "Aadhaar number"],
      ["hindi_name", "Name (Hindi)"],
      ["phone_number", "Mobile number"],
      ["blood_group", "Blood group"],
      ["country", "Country"],
      ["nationality", "Nationality"],
      ["income_group", "Income group"],
      ["income", "Income"],
      ["state", "State"],
      ["address", "Address"],
    ];
    req.forEach(([f, label]) => {
      if (!String(form[f] || "").trim()) e[f] = `${label} is required`;
    });
    if (form.aadhar_number && !/^\d{12}$/.test(form.aadhar_number))
      e.aadhar_number = "Aadhaar number must be exactly 12 digits";
    if (!form.photo) e.photo = "Passport photo is required";
    if (!form.signature) e.signature = "Signature is required";
    const father = String(form.father_mobile || "").trim();
    const mother = String(form.mother_mobile || "").trim();
    if (!father && !mother)
      e.father_mobile =
        "At least one of father's or mother's mobile is required";
    const phone = String(form.phone_number || "").trim();
    if (phone && (phone === father || phone === mother))
      e.phone_number = "Your mobile must not match a parent's mobile";
    if (form.income && Number.isNaN(Number(form.income)))
      e.income = "Income must be a valid number";
    if (
      form.blood_group === "Other" &&
      !String(form.blood_group_remarks || "").trim()
    )
      e.blood_group_remarks = "Please specify the blood group";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      notifications.show({
        title: "Incomplete",
        message: "Please fix the highlighted fields.",
        color: "orange",
      });
      return;
    }
    setSaving(true);
    try {
      const token = sessionStorage.getItem("authToken");
      const payload = {
        aadhar_number: form.aadhar_number,
        hindi_name: form.hindi_name,
        photo: form.photo,
        signature: form.signature,
        phone_number: form.phone_number,
        parent_email: form.parent_email,
        father_occupation: form.father_occupation,
        mother_occupation: form.mother_occupation,
        father_mobile: form.father_mobile,
        mother_mobile: form.mother_mobile,
        minority: form.minority,
        blood_group: form.blood_group,
        blood_group_remarks: form.blood_group_remarks,
        country: form.country,
        nationality: form.nationality,
        income_group: form.income_group,
        income: form.income,
        state: form.state,
        address: form.address,
      };
      const { data } = await axios.post(profileCompletionSubmitRoute, payload, {
        headers: { Authorization: `Token ${token}` },
      });
      if (data.success) {
        notifications.show({
          title: "Profile completed",
          message: "Thank you! You can now use the portal.",
          color: "green",
        });
        dispatch(setMustCompleteProfile(false));
      }
    } catch (error) {
      if (error.response?.data?.errors) setErrors(error.response.data.errors);
      notifications.show({
        title: "Submission failed",
        message: error.response?.data?.message || "Please try again.",
        color: "red",
      });
    } finally {
      setSaving(false);
    }
  };

  const frozen = (label, value) => (
    <Grid.Col span={THIRD}>
      <TextInput
        label={label}
        value={value || "—"}
        readOnly
        variant="filled"
        styles={{ input: { cursor: "default", color: "#495057" } }}
      />
    </Grid.Col>
  );

  const imgPreview = (value, h) =>
    value && (
      <Box
        mt={8}
        style={{
          width: "fit-content",
          padding: 4,
          borderRadius: 8,
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        <img
          src={imgSrc(value)}
          alt="preview"
          style={{ height: h, borderRadius: 4, display: "block" }}
        />
      </Box>
    );

  return (
    <Modal
      opened
      onClose={() => {}}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      fullScreen={isMobile}
      size="62rem"
      centered
      radius="lg"
      padding={0}
      overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
      scrollAreaComponent={undefined}
      styles={{ body: { padding: 0 } }}
    >
      {loading || !form ? (
        <Center py={80}>
          <Loader />
        </Center>
      ) : (
        <Box>
          {/* Header band */}
          <Box
            p="lg"
            style={{
              background: "linear-gradient(135deg,#2563eb,#1e3a8a)",
              color: "white",
            }}
          >
            <Group gap="sm" wrap="nowrap">
              <ThemeIcon size={44} radius="md" variant="white" color="blue">
                <IdentificationCard size={26} />
              </ThemeIcon>
              <div>
                <Text fw={700} size="xl">
                  Complete your profile
                </Text>
                <Text size="sm" c="blue.1">
                  One-time setup — verify your details and fill the required
                  fields to access the portal.
                </Text>
              </div>
            </Group>
          </Box>

          <Stack gap="md" p="lg">
            <Alert
              variant="light"
              color="blue"
              icon={<Info size={18} />}
              radius="md"
            >
              Fields marked with{" "}
              <Text span c="red" fw={700}>
                *
              </Text>{" "}
              are required. Your existing details are pre-filled where
              available.
            </Alert>

            <Section
              icon={<ShieldCheck size={18} />}
              title="Verified details (read-only)"
            >
              {frozen("Roll Number", form.roll_number)}
              {frozen("Name", form.name)}
              {frozen("Discipline", form.discipline)}
              {form.programme_type === "pg" &&
                frozen("Specialization", form.specialization)}
              {frozen("Gender", form.gender)}
              {frozen("Category", form.category)}
              {frozen("Father's Name", form.father_name)}
              {frozen("Mother's Name", form.mother_name)}
              {frozen("Date of Birth", form.date_of_birth)}
              {frozen("Admission Mode", form.admission_mode)}
            </Section>

            <Section
              icon={<IdentificationCard size={18} />}
              title="Identity & documents"
            >
              <Grid.Col span={HALF}>
                <TextInput
                  label="Aadhaar No."
                  placeholder="12-digit Aadhaar number"
                  value={form.aadhar_number || ""}
                  onChange={(e) =>
                    set(
                      "aadhar_number",
                      e.target.value.replace(/\D/g, "").slice(0, 12),
                    )
                  }
                  maxLength={12}
                  required
                  error={errors.aadhar_number}
                />
              </Grid.Col>
              <Grid.Col span={HALF}>
                <TextInput
                  label="Name (Hindi)"
                  placeholder="पूरा नाम"
                  value={form.hindi_name || ""}
                  onChange={(e) => set("hindi_name", e.target.value)}
                  rightSection={
                    <HindiKeyboard
                      value={form.hindi_name || ""}
                      onChange={(v) => set("hindi_name", v)}
                    />
                  }
                  required
                  error={errors.hindi_name}
                />
              </Grid.Col>
              <Grid.Col span={HALF}>
                <FileInput
                  label="Passport Photo"
                  description="PNG, JPG or JPEG • up to 200 KB"
                  placeholder="Upload passport photo"
                  accept="image/png,image/jpeg"
                  clearable
                  leftSection={<Upload size={16} />}
                  onChange={(file) => handleImage(file, "photo", 200)}
                  required
                  error={errors.photo}
                />
                {imgPreview(form.photo, 84)}
              </Grid.Col>
              <Grid.Col span={HALF}>
                <FileInput
                  label="Signature"
                  description="PNG, JPG or JPEG • up to 30 KB"
                  placeholder="Upload signature"
                  accept="image/png,image/jpeg"
                  clearable
                  leftSection={<Upload size={16} />}
                  onChange={(file) => handleImage(file, "signature", 30)}
                  required
                  error={errors.signature}
                />
                {imgPreview(form.signature, 44)}
              </Grid.Col>
            </Section>

            <Section icon={<Phone size={18} />} title="Contact">
              <Grid.Col span={THIRD}>
                <TextInput
                  label="Mobile No."
                  value={form.phone_number || ""}
                  onChange={(e) => set("phone_number", e.target.value)}
                  required
                  error={errors.phone_number}
                />
              </Grid.Col>
              <Grid.Col span={THIRD}>
                <TextInput
                  label="Father's Mobile"
                  description="At least one parent mobile"
                  value={form.father_mobile || ""}
                  onChange={(e) => set("father_mobile", e.target.value)}
                  error={errors.father_mobile}
                />
              </Grid.Col>
              <Grid.Col span={THIRD}>
                <TextInput
                  label="Mother's Mobile"
                  value={form.mother_mobile || ""}
                  onChange={(e) => set("mother_mobile", e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={HALF}>
                <TextInput
                  label="Parent's Email ID"
                  placeholder="Optional"
                  value={form.parent_email || ""}
                  onChange={(e) => set("parent_email", e.target.value)}
                  error={errors.parent_email}
                />
              </Grid.Col>
            </Section>

            <Section
              icon={<UsersThree size={18} />}
              title="Family & background"
            >
              <Grid.Col span={HALF}>
                <TextInput
                  label="Father's Job"
                  placeholder="Optional"
                  value={form.father_occupation || ""}
                  onChange={(e) => set("father_occupation", e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={HALF}>
                <TextInput
                  label="Mother's Job"
                  placeholder="Optional"
                  value={form.mother_occupation || ""}
                  onChange={(e) => set("mother_occupation", e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={HALF}>
                <TextInput
                  label="Minority"
                  placeholder="Optional"
                  value={form.minority || ""}
                  onChange={(e) => set("minority", e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={form.blood_group === "Other" ? THIRD : HALF}>
                <Select
                  label="Blood Group"
                  placeholder="Select"
                  data={STUDENT_FIELDS_CONFIG.bloodGroup.options}
                  value={form.blood_group || ""}
                  onChange={(v) => set("blood_group", v)}
                  required
                  searchable
                  error={errors.blood_group}
                />
              </Grid.Col>
              {form.blood_group === "Other" && (
                <Grid.Col span={THIRD}>
                  <TextInput
                    label="Blood Group (specify)"
                    value={form.blood_group_remarks || ""}
                    onChange={(e) => set("blood_group_remarks", e.target.value)}
                    required
                    error={errors.blood_group_remarks}
                  />
                </Grid.Col>
              )}
            </Section>

            <Section icon={<MapPin size={18} />} title="Address & financial">
              <Grid.Col span={THIRD}>
                <Select
                  label="State"
                  placeholder="Select state"
                  data={STUDENT_FIELDS_CONFIG.state.options}
                  value={form.state || ""}
                  onChange={(v) => set("state", v)}
                  required
                  searchable
                  error={errors.state}
                />
              </Grid.Col>
              <Grid.Col span={THIRD}>
                <TextInput
                  label="Country"
                  value={form.country || ""}
                  onChange={(e) => set("country", e.target.value)}
                  required
                  error={errors.country}
                />
              </Grid.Col>
              <Grid.Col span={THIRD}>
                <TextInput
                  label="Nationality"
                  value={form.nationality || ""}
                  onChange={(e) => set("nationality", e.target.value)}
                  required
                  error={errors.nationality}
                />
              </Grid.Col>
              <Grid.Col span={HALF}>
                <Select
                  label="Income Group"
                  placeholder="Select"
                  data={STUDENT_FIELDS_CONFIG.incomeGroup.options}
                  value={form.income_group || ""}
                  onChange={(v) => set("income_group", v)}
                  required
                  error={errors.income_group}
                />
              </Grid.Col>
              <Grid.Col span={HALF}>
                <TextInput
                  label="Income"
                  placeholder="Annual family income"
                  value={form.income || ""}
                  onChange={(e) =>
                    set("income", e.target.value.replace(/[^\d.]/g, ""))
                  }
                  required
                  error={errors.income}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Address"
                  minRows={2}
                  autosize
                  value={form.address || ""}
                  onChange={(e) => set("address", e.target.value)}
                  required
                  error={errors.address}
                />
              </Grid.Col>
            </Section>
          </Stack>

          {/* Sticky submit bar */}
          <Box
            p="md"
            style={{
              position: "sticky",
              bottom: 0,
              background: "white",
              borderTop: "1px solid #e9ecef",
            }}
          >
            <Group justify="flex-end">
              <Button
                onClick={handleSubmit}
                loading={saving}
                size="md"
                fullWidth={isMobile}
              >
                Submit &amp; Continue
              </Button>
            </Group>
          </Box>
        </Box>
      )}
    </Modal>
  );
}

export default ProfileCompletionModal;
