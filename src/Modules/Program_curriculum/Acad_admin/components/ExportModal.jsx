import PropTypes from "prop-types";
import { Modal, Stack, Text, Group, Button, Switch, Box, Grid } from "@mantine/core";
import { FileXls, Download } from "@phosphor-icons/react";

// Choose format + fields and export the currently-filtered students.
function ExportModal({
  opened,
  onClose,
  exportFormat,
  setExportFormat,
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
        <Group spacing="sm" align="center">
          <Download size={18} color="#2563eb" />
          <Text size="md" weight={600} color="#1f2937">
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
      <Stack spacing="md">
        <Text size="sm" color="#6b7280">
          Select export format and fields for data analysis.
        </Text>

        <Group spacing="sm">
          <Button
            variant={exportFormat === "excel" ? "filled" : "light"}
            color={exportFormat === "excel" ? "teal" : "gray"}
            onClick={() => setExportFormat("excel")}
            leftSection={<FileXls size={16} />}
            size="sm"
            radius="md"
          >
            Excel
          </Button>
          <Button
            variant={exportFormat === "csv" ? "filled" : "light"}
            color={exportFormat === "csv" ? "blue" : "gray"}
            onClick={() => setExportFormat("csv")}
            leftSection={<Download size={16} />}
            size="sm"
            radius="md"
          >
            CSV
          </Button>
        </Group>

        <Stack spacing="sm">
          <Group justify="space-between" align="center">
            <Text weight={500} size="sm" color="#374151">
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
          <Group spacing="lg">
            <Text size="xs" color="#6b7280">
              <Text component="span" weight={600} color="#1e40af">
                {recordCount}
              </Text>{" "}
              records
            </Text>
            <Text size="xs" color="#6b7280">
              <Text component="span" weight={600} color="#1e40af">
                {selectedCount}
              </Text>{" "}
              fields
            </Text>
            <Text size="xs" color="#6b7280">
              Format:{" "}
              <Text
                component="span"
                weight={600}
                color="#1e40af"
                style={{ textTransform: "uppercase" }}
              >
                {exportFormat}
              </Text>
            </Text>
          </Group>
          <Group spacing="sm">
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
  exportFormat: PropTypes.string.isRequired,
  setExportFormat: PropTypes.func.isRequired,
  selectAllFields: PropTypes.bool,
  onToggleAll: PropTypes.func.isRequired,
  fields: PropTypes.array.isRequired,
  selectedFields: PropTypes.object.isRequired,
  onFieldChange: PropTypes.func.isRequired,
  recordCount: PropTypes.number,
  isExporting: PropTypes.bool,
  onExport: PropTypes.func.isRequired,
};

export default ExportModal;
