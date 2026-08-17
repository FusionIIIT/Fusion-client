import PropTypes from "prop-types";
import {
  Modal,
  Stack,
  Text,
  Group,
  Button,
  Switch,
  Box,
  Grid,
} from "@mantine/core";
import { Download } from "@phosphor-icons/react";

// Choose fields and export the currently-filtered students as Excel.
function ExportModal({
  opened,
  onClose,
  selectAllFields,
  onToggleAll,
  fields,
  selectedFields,
  onFieldChange,
  recordCount,
  isExporting,
  onExport,
}) {
  const selectedCount = Object.values(selectedFields).filter(Boolean).length;
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm" align="center">
          <Download size={18} color="#2563eb" />
          <Text size="md" fw={600} c="#1f2937">
            Export Student Data
          </Text>
        </Group>
      }
      size="lg"
      centered
      padding="lg"
      styles={{
        modal: { backgroundColor: "#ffffff", borderRadius: "8px" },
        header: {
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          padding: "16px 20px",
        },
        body: { padding: "20px" },
      }}
    >
      <Stack gap="md">
        <Text size="sm" c="#6b7280">
          Select the fields to include in the Excel (.xlsx) export.
        </Text>

        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text fw={500} size="sm" c="#374151">
              Select Fields
            </Text>
            <Switch
              label="Select All"
              checked={selectAllFields}
              onChange={onToggleAll}
              size="sm"
              color="blue"
              styles={{
                label: { fontSize: "12px", fontWeight: 500, color: "#374151" },
              }}
            />
          </Group>

          <Box
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              padding: "12px",
            }}
          >
            <Grid gutter="xs">
              {fields.map((field) => (
                <Grid.Col span={6} key={field.key}>
                  <Switch
                    label={field.label}
                    checked={selectedFields[field.key] || false}
                    onChange={(event) =>
                      onFieldChange(field.key, event.currentTarget.checked)
                    }
                    size="xs"
                    color="blue"
                    styles={{ label: { fontSize: "12px", fontWeight: 400 } }}
                  />
                </Grid.Col>
              ))}
            </Grid>
          </Box>
        </Stack>

        <Group
          justify="space-between"
          align="center"
          style={{
            backgroundColor: "#f8fafc",
            padding: "12px 16px",
            borderRadius: "6px",
            border: "1px solid #e2e8f0",
          }}
        >
          <Group gap="lg">
            <Text size="xs" c="#6b7280">
              <Text component="span" fw={600} c="#1e40af">
                {recordCount}
              </Text>{" "}
              records
            </Text>
            <Text size="xs" c="#6b7280">
              <Text component="span" fw={600} c="#1e40af">
                {selectedCount}
              </Text>{" "}
              fields
            </Text>
            <Text size="xs" c="#6b7280">
              Format:{" "}
              <Text component="span" fw={600} c="#1e40af">
                Excel (.xlsx)
              </Text>
            </Text>
          </Group>
          <Group gap="sm">
            <Button
              variant="outline"
              color="gray"
              onClick={onClose}
              disabled={isExporting}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              leftSection={<Download size={16} />}
              onClick={onExport}
              loading={isExporting}
              disabled={selectedCount === 0}
              size="sm"
              color="blue"
            >
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Modal>
  );
}

ExportModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  selectAllFields: PropTypes.bool,
  onToggleAll: PropTypes.func.isRequired,
  fields: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  selectedFields: PropTypes.instanceOf(Object).isRequired,
  onFieldChange: PropTypes.func.isRequired,
  recordCount: PropTypes.number,
  isExporting: PropTypes.bool,
  onExport: PropTypes.func.isRequired,
};

export default ExportModal;
