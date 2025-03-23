import {
  Paper,
  Button,
  Title,
  Grid,
  Stack,
  Box,
  Text,
  Group,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
} from "@mantine/core";
import { CloudArrowUp, CloudArrowDown, Plus, X } from "@phosphor-icons/react";
import { useState } from "react";
import axios from "axios";
import { download_hostel_allotment } from "../../../../routes/hostelManagementRoutes";

export default function AssignRoomsComponent() {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const [currentBatch, setCurrentBatch] = useState("");
  const [batchError, setBatchError] = useState("");

  const handleFileSelect = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFile = event.target.files[0];
      setCurrentFile(newFile);
      setCurrentBatch("");
      setBatchError("");
      setModalOpen(true);

      // Reset the input value so the same file can be selected again if removed
      event.target.value = null;
    }
  };

  const handleBatchConfirm = () => {
    if (!currentBatch) {
      setBatchError("Please enter a batch year");
      return;
    }

    setFiles((currentFiles) => [
      ...currentFiles,
      { file: currentFile, batch: currentBatch },
    ]);

    console.log("Added file:", currentFile, "for batch:", currentBatch);

    setModalOpen(false);
    setCurrentFile(null);
    setCurrentBatch("");
  };

  const removeFile = (indexToRemove) => {
    setFiles((currentFiles) =>
      currentFiles.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleDownload = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(download_hostel_allotment, {
        headers: { Authorization: `Token ${token}` },
      });

      if (
        !response ||
        !response.data.files ||
        response.data.files.length === 0
      ) {
        alert("No files available for download.");
        return;
      }

      // Loop through each file URL and trigger download
      response.data.files.forEach(async (fileUrl, index) => {
        try {
          // Fetch the actual file as a blob
          const fileResponse = await axios.get(fileUrl, {
            responseType: "blob",
          });

          // Create a blob URL
          const blob = new Blob([fileResponse.data], {
            type: fileResponse.headers["content-type"],
          });
          const url = window.URL.createObjectURL(blob);

          // Create an <a> element and trigger download
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `Hostel_Allotment_${index + 1}`);
          document.body.appendChild(link);
          link.click();

          // Clean up
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (err) {
          console.error(`Failed to download file ${index + 1}:`, err);
        }
      });
    } catch (error) {
      console.error("Error fetching file list:", error);
      alert("Failed to fetch files. Please try again.");
    }
  };

  const uploadAllFiles = () => {
    if (files.length === 0) {
      alert("Please select at least one file to upload");
      return;
    }

    setUploading(true);
    console.log("Uploading all files with batch information:", files);

    // Here you would implement the actual API call to upload the files
    // For example with FormData:
    // const formData = new FormData();
    // files.forEach((fileObj, index) => {
    //   formData.append(`file${index}`, fileObj.file);
    //   formData.append(`batch${index}`, fileObj.batch);
    // });

    // Simulate upload completion after 2 seconds
    setTimeout(() => {
      setUploading(false);
      setFiles([]);
      alert("All files uploaded successfully!");
    }, 2000);
  };

  // Helper function to get file type icon/color
  const getFileTypeInfo = (fileName) => {
    const extension = fileName.split(".").pop().toLowerCase();

    if (["xls", "xlsx", "csv"].includes(extension)) {
      return { color: "green", label: "Excel" };
    }
    if (["pdf"].includes(extension)) {
      return { color: "red", label: "PDF" };
    }
    if (["doc", "docx"].includes(extension)) {
      return { color: "blue", label: "Word" };
    }
    if (["ppt", "pptx"].includes(extension)) {
      return { color: "orange", label: "PowerPoint" };
    }
    if (["txt"].includes(extension)) {
      return { color: "gray", label: "Text" };
    }

    return { color: "dark", label: extension.toUpperCase() };
  };

  return (
    <Box p="md">
      <Title order={2} mb="xl" weight={500}>
        Assign Rooms
      </Title>

      <Grid gutter="lg">
        {/* Upload Card */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper
            p="xl"
            radius="md"
            sx={{
              backgroundColor: "#f0f0f0",
              minHeight: "280px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stack spacing="lg" align="center" style={{ width: "100%" }}>
              <CloudArrowUp size={64} weight="thin" />
              <Title order={3} weight={400} size="h4">
                Upload batch sheet
              </Title>

              <input
                type="file"
                id="batchSheet"
                style={{ display: "none" }}
                onChange={handleFileSelect}
                accept=".xlsx,.xls,.csv,.pdf,.doc,.docx,.ppt,.pptx,.txt"
              />

              <Group position="center" mb="md">
                <Button
                  component="label"
                  htmlFor="batchSheet"
                  variant="outline"
                  size="md"
                  leftIcon={<Plus size={20} />}
                  styles={(theme) => ({
                    root: {
                      borderColor: theme.colors.cyan[4],
                      color: theme.colors.cyan[4],
                      "&:hover": {
                        backgroundColor: theme.colors.cyan[0],
                      },
                      minWidth: "120px",
                      borderRadius: "4px",
                    },
                  })}
                >
                  Add File
                </Button>
              </Group>

              {/* Selected Files List */}
              {files.length > 0 && (
                <Box
                  sx={{ width: "100%", maxHeight: "200px", overflowY: "auto" }}
                  mb="md"
                >
                  <Text weight={500} mb="xs">
                    Selected Files:
                  </Text>
                  <Stack spacing="xs">
                    {files.map((fileObj, index) => {
                      const fileTypeInfo = getFileTypeInfo(fileObj.file.name);
                      return (
                        <Group
                          key={index}
                          position="apart"
                          p="xs"
                          sx={{ backgroundColor: "#fff", borderRadius: "4px" }}
                        >
                          <Group>
                            <Badge color={fileTypeInfo.color} variant="light">
                              {fileTypeInfo.label}
                            </Badge>
                            <Text
                              size="sm"
                              style={{
                                maxWidth: "150px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {fileObj.file.name}
                            </Text>
                            <Badge color="blue">Batch: {fileObj.batch}</Badge>
                          </Group>
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            onClick={() => removeFile(index)}
                          >
                            <X size={16} />
                          </ActionIcon>
                        </Group>
                      );
                    })}
                  </Stack>
                </Box>
              )}

              {files.length > 0 && (
                <Button
                  variant="filled"
                  size="md"
                  onClick={uploadAllFiles}
                  loading={uploading}
                  styles={(theme) => ({
                    root: {
                      backgroundColor: theme.colors.cyan[4],
                      "&:hover": {
                        backgroundColor: theme.colors.cyan[5],
                      },
                      minWidth: "150px",
                      borderRadius: "4px",
                    },
                  })}
                >
                  Upload All Files
                </Button>
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Download Card */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper
            p="xl"
            radius="md"
            sx={{
              backgroundColor: "#f0f0f0",
              minHeight: "280px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stack spacing="lg" align="center">
              <CloudArrowDown size={64} weight="thin" />
              <Title order={3} weight={400} size="h4">
                Download batch sheet
              </Title>

              <Button
                variant="filled"
                size="md"
                onClick={handleDownload}
                styles={(theme) => ({
                  root: {
                    backgroundColor: theme.colors.cyan[4],
                    "&:hover": {
                      backgroundColor: theme.colors.cyan[5],
                    },
                    minWidth: "120px",
                    borderRadius: "4px",
                  },
                })}
              >
                Download
              </Button>
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Batch Selection Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Select Batch"
        centered
        styles={{
          title: { fontWeight: 600, fontSize: "1.2rem" },
        }}
      >
        <Stack spacing="md">
          {currentFile && (
            <Group>
              <Text weight={500}>File:</Text>
              <Text>{currentFile.name}</Text>
            </Group>
          )}

          <TextInput
            label="Enter Batch Year"
            placeholder="e.g., 2023"
            value={currentBatch}
            onChange={(event) => {
              setCurrentBatch(event.currentTarget.value);
              setBatchError("");
            }}
            required
            error={batchError}
          />

          <Group position="right" mt="md">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBatchConfirm}>Confirm</Button>
          </Group>
        </Stack>
      </Modal>
    </Box>
  );
}
