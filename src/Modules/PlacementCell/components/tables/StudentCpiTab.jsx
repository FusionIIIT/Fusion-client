import React, { useEffect, useState } from "react";
import { Button, Container, Group, Select, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { DownloadSimple } from "@phosphor-icons/react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { placementApi } from "../../services/api";
import { showApiError } from "../../utils/authorization";
import { downloadBlobFile } from "../../utils/helpers";

const columns = [
  { accessorKey: "roll_no", header: "Roll No" },
  { accessorKey: "student_name", header: "Student" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "cpi", header: "Published CPI" },
  {
    accessorKey: "off_campus",
    header: "Off-Campus",
    Cell: ({ cell }) => (cell.getValue() || []).join(", "),
  },
];

function StudentCpiTab() {
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await placementApi.getCpiBatches();
        setBatches(response.data);
      } catch (error) {
        showApiError({
          error,
          title: "Failed to fetch batches",
          fallback: "Failed to fetch batches with published results.",
          authorizationFallback:
            "Only placement officer and chairman users can view published CPI data.",
        });
      }
    };
    fetchBatches();
  }, []);

  useEffect(() => {
    if (!selectedBatch) {
      setStudents([]);
      return;
    }
    const fetchStudents = async () => {
      setIsLoading(true);
      try {
        const response = await placementApi.getCpiStudents(selectedBatch);
        setStudents(response.data);
        setIsError(false);
      } catch (error) {
        setIsError(true);
        showApiError({
          error,
          title: "Failed to fetch students",
          fallback: "Failed to fetch published CPI data.",
          authorizationFallback:
            "Only placement officer and chairman users can view published CPI data.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedBatch]);

  const handleExport = async () => {
    if (!selectedBatch) {
      notifications.show({
        title: "Select a batch",
        message: "Choose a batch before exporting.",
        color: "red",
      });
      return;
    }
    setIsExporting(true);
    try {
      const response = await placementApi.exportCpiStudents(selectedBatch);
      downloadBlobFile(
        response.data,
        `published_cpi_batch_${selectedBatch}.xls`,
        "application/vnd.ms-excel",
      );
    } catch (error) {
      showApiError({
        error,
        fallback: "Failed to export published CPI data.",
        authorizationFallback:
          "Only placement officer and chairman users can export published CPI data.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const table = useMantineReactTable({
    columns,
    data: students,
    enableEditing: false,
    getRowId: (row) => row.roll_no,
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
        <Title order={2}>Student CPI</Title>
        <Button
          variant="outline"
          leftSection={<DownloadSimple size={18} />}
          onClick={handleExport}
          loading={isExporting}
          disabled={!selectedBatch}
        >
          Export to Excel
        </Button>
      </Group>

      <Select
        label="Batch"
        placeholder="Select a batch with published results"
        data={batches.map((batch) => ({
          value: String(batch.id),
          label: batch.label,
        }))}
        value={selectedBatch}
        onChange={setSelectedBatch}
        searchable
        clearable
        mb={16}
        maw={420}
      />

      {!selectedBatch ? (
        <Text c="dimmed">
          Select a batch to view students with published CPI.
        </Text>
      ) : (
        <MantineReactTable table={table} />
      )}
    </Container>
  );
}

export default StudentCpiTab;
