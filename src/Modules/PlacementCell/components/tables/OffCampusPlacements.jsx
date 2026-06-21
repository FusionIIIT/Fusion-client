import React, { useEffect, useState } from "react";
import {
  ActionIcon,
  Button,
  Container,
  Grid,
  Group,
  Modal,
  NumberInput,
  Select,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Trash } from "@phosphor-icons/react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { placementApi } from "../../services/api";
import { showApiError } from "../../utils/authorization";

const columns = [
  { accessorKey: "roll_no", header: "Roll No" },
  { accessorKey: "student_name", header: "Student" },
  { accessorKey: "company_name", header: "Company" },
  { accessorKey: "role", header: "Role" },
  { accessorKey: "offer_type", header: "Type" },
  { accessorKey: "ctc", header: "CTC (LPA)" },
  { accessorKey: "stipend", header: "Stipend" },
  { accessorKey: "offer_date", header: "Offer Date" },
];

const emptyForm = {
  rollNo: "",
  companyName: "",
  role: "",
  offerType: "placement",
  ctc: "",
  stipend: "",
  offerDate: "",
  notes: "",
};

function OffCampusPlacements() {
  const [placements, setPlacements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlacements = async () => {
    setIsLoading(true);
    try {
      const response = await placementApi.getOffCampusPlacements();
      setPlacements(response.data);
      setIsError(false);
    } catch (error) {
      setIsError(true);
      showApiError({
        error,
        title: "Failed to fetch off-campus placements",
        fallback: "Failed to fetch off-campus placements.",
        authorizationFallback:
          "Only placement officer users can manage off-campus placements.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => setForm(emptyForm);

  const handleSubmit = async () => {
    if (!form.rollNo.trim() || !form.companyName.trim() || !form.role.trim()) {
      notifications.show({
        title: "Missing fields",
        message: "Roll number, company and role are required.",
        color: "red",
      });
      return;
    }
    if (!form.offerDate) {
      notifications.show({
        title: "Missing fields",
        message: "An offer date is required.",
        color: "red",
      });
      return;
    }

    const payload = {
      roll_no: form.rollNo.trim(),
      company_name: form.companyName.trim(),
      role: form.role.trim(),
      offer_type: form.offerType,
      offer_date: form.offerDate,
      notes: form.notes.trim(),
    };
    if (form.ctc !== "" && form.ctc !== null) payload.ctc = form.ctc;
    if (form.stipend !== "" && form.stipend !== null)
      payload.stipend = form.stipend;

    setIsSubmitting(true);
    try {
      const response = await placementApi.createOffCampusPlacement(payload);
      setPlacements([response.data, ...placements]);
      notifications.show({
        title: "Success",
        message: "Off-campus placement recorded successfully!",
        color: "green",
      });
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      showApiError({
        error,
        fallback: "Failed to record off-campus placement.",
        authorizationFallback:
          "Only placement officer users can manage off-campus placements.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (placementId) => {
    try {
      await placementApi.deleteOffCampusPlacement(placementId);
      setPlacements(placements.filter((p) => p.id !== placementId));
      notifications.show({
        title: "Success",
        message: "Record deleted successfully!",
        color: "green",
      });
    } catch (error) {
      showApiError({
        error,
        fallback: "Failed to delete off-campus placement.",
        authorizationFallback:
          "Only placement officer users can manage off-campus placements.",
      });
    }
  };

  const table = useMantineReactTable({
    columns,
    data: placements,
    enableEditing: false,
    getRowId: (row) => row.id,
    enableRowActions: true,
    positionActionsColumn: "last",
    displayColumnDefOptions: {
      "mrt-row-actions": { header: "Actions" },
    },
    renderRowActions: ({ row }) => (
      <ActionIcon
        color="red"
        onClick={() => handleDelete(row.original.id)}
        title="Delete record"
      >
        <Trash size={18} />
      </ActionIcon>
    ),
    mantineToolbarAlertBannerProps: isError
      ? { color: "red", children: "Error loading data" }
      : undefined,
    state: {
      isLoading,
      showAlertBanner: isError,
    },
  });

  return (
    <Container fluid mt={32}>
      <Group justify="space-between" mb={16}>
        <Title order={2}>Off-Campus Placements</Title>
        <Button
          variant="outline"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          Add Off-Campus Offer
        </Button>
      </Group>

      <MantineReactTable table={table} />

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Off-Campus Offer"
        centered
        size="lg"
      >
        <Grid gutter="md">
          <Grid.Col span={6}>
            <TextInput
              label="Roll Number"
              placeholder="Student roll number"
              value={form.rollNo}
              onChange={(e) => updateField("rollNo", e.target.value)}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="Offer Type"
              data={[
                { value: "placement", label: "Placement" },
                { value: "internship", label: "Internship" },
              ]}
              value={form.offerType}
              onChange={(value) => updateField("offerType", value)}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Company"
              placeholder="Company name"
              value={form.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Role"
              placeholder="Job role"
              value={form.role}
              onChange={(e) => updateField("role", e.target.value)}
              required
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="CTC (LPA)"
              placeholder="Optional"
              value={form.ctc}
              onChange={(value) => updateField("ctc", value)}
              min={0}
              decimalScale={2}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <NumberInput
              label="Stipend"
              placeholder="Optional"
              value={form.stipend}
              onChange={(value) => updateField("stipend", value)}
              min={0}
              decimalScale={2}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              type="date"
              label="Offer Date"
              value={form.offerDate}
              onChange={(e) => updateField("offerDate", e.currentTarget.value)}
              required
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label="Notes"
              placeholder="Optional notes"
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              autosize
              minRows={2}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={isSubmitting}>
                Save
              </Button>
            </Group>
          </Grid.Col>
        </Grid>
      </Modal>
    </Container>
  );
}

export default OffCampusPlacements;
