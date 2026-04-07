import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  LoadingOverlay,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";

import {
  createMedicalProfileApi,
  getMedicalProfileApi,
  updateMedicalProfileApi,
} from "../../services/api";

const emptyProfile = {
  id: null,
  blood_group: "",
  allergies: "",
  chronic_conditions: "",
  emergency_contact: "",
};

const extractErrorMessage = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    const flattened = Object.values(value).flat().filter(Boolean);
    if (flattened.length > 0) {
      return flattened.join(", ");
    }
  }

  return "Failed to save medical profile";
};

const MedicalProfileForm = () => {
  const [formData, setFormData] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await getMedicalProfileApi();
      const profileData =
        response.data && Object.keys(response.data).length > 0
          ? { ...emptyProfile, ...response.data }
          : emptyProfile;

      setFormData(profileData);
    } catch (err) {
      setError(extractErrorMessage(err?.response?.data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (formData.id) {
        await updateMedicalProfileApi(formData);
      } else {
        await createMedicalProfileApi(formData);
      }
      await loadProfile();
    } catch (err) {
      setError(extractErrorMessage(err?.response?.data));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card withBorder radius="xl" shadow="sm" p="xl" style={{ position: "relative" }}>
      <LoadingOverlay visible={loading} overlayBlur={1} />

      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <div>
            <Badge variant="light" color="blue" mb="sm">
              HealthCare Center
            </Badge>
            <Title order={2}>Medical Profile</Title>
            <Text c="dimmed" size="sm" mt={6}>
              Keep allergy, emergency, and long-term health details current so
              the health center can assist you faster.
            </Text>
          </div>
          <Badge variant="outline" color={formData.id ? "teal" : "gray"}>
            {formData.id ? "Profile saved" : "New profile"}
          </Badge>
        </Group>

        {error ? (
          <Alert color="red" variant="light" title="Could not save profile">
            {error}
          </Alert>
        ) : null}

        <Card withBorder radius="lg" p="lg" bg="gray.0">
          <Group justify="space-between" align="flex-start">
            <div>
              <Text fw={700} size="sm">
                Profile snapshot
              </Text>
              <Text size="sm" c="dimmed">
                This information is used by the health center team during
                consultations and emergencies.
              </Text>
            </div>
            <Badge variant="light" color="blue">
              Student Record
            </Badge>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt="md">
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                Blood group
              </Text>
              <Text fw={600}>{formData.blood_group || "Not provided"}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                Emergency contact
              </Text>
              <Text fw={600}>
                {formData.emergency_contact || "Not provided"}
              </Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                Chronic conditions
              </Text>
              <Text fw={600}>{formData.chronic_conditions || "None"}</Text>
            </Stack>
          </SimpleGrid>
        </Card>

        <Divider />

        <form onSubmit={onSubmit}>
          <Stack gap="lg">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
              <TextInput
                label="Blood group"
                name="blood_group"
                value={formData.blood_group || ""}
                onChange={onChange}
                placeholder="Example: O+"
                size="md"
              />
              <TextInput
                label="Emergency contact"
                name="emergency_contact"
                value={formData.emergency_contact || ""}
                onChange={onChange}
                placeholder="Phone number or relation"
                size="md"
              />
            </SimpleGrid>

            <Textarea
              label="Allergies"
              name="allergies"
              value={formData.allergies || ""}
              onChange={onChange}
              placeholder="Mention medicines, food, or environmental allergies"
              minRows={4}
              autosize
              size="md"
            />

            <Textarea
              label="Chronic conditions"
              name="chronic_conditions"
              value={formData.chronic_conditions || ""}
              onChange={onChange}
              placeholder="Mention any ongoing medical conditions"
              minRows={4}
              autosize
              size="md"
            />

            <Group justify="flex-end">
              <Button type="submit" loading={saving} size="md">
                {formData.id ? "Update Profile" : "Save Profile"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
};

export default MedicalProfileForm;
