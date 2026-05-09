import React, { useState, useEffect } from "react";
import {
  Card,
  Text,
  Button,
  Group,
  FileInput,
  TextInput,
  Textarea,
  Modal,
  Badge,
  Box,
  Grid,
  Loader,
  Alert,
  ActionIcon,
  Tooltip,
  Select,
  Timeline,
} from "@mantine/core";
import {
  Upload,
  FileText,
  Download,
  Eye,
  History,
  File,
  Plus,
} from "@phosphor-icons/react";
import axios from "axios";
import { host } from "../../../../../routes/globalRoutes/index.jsx";

const API_BASE_URL = `${host}/patentsystem`;

const DocumentVersionControl = ({ applicationId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [documentHistory, setDocumentHistory] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    document_type: "",
    title: "",
    file: null,
    description: "",
  });

  const documentTypes = [
    { value: "POC Details", label: "POC Details" },
    { value: "Source Agreement", label: "Source Agreement" },
    { value: "MOU File", label: "MOU File" },
    { value: "Form III", label: "Form III" },
    { value: "Supporting Document", label: "Supporting Document" },
    { value: "Research Paper", label: "Research Paper" },
    { value: "Technical Drawing", label: "Technical Drawing" },
    { value: "Patent Draft", label: "Patent Draft" },
    { value: "Legal Document", label: "Legal Document" },
    { value: "Other", label: "Other" },
  ];

  useEffect(() => {
    if (applicationId) {
      fetchDocuments();
    }
  }, [applicationId]);

  const fetchDocuments = async () => {
    const token = localStorage.getItem("authToken");
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/documents/?current_only=true`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setDocuments(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentHistory = async (documentType) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/documents/?document_type=${documentType}`,
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      setDocumentHistory(response.data);
      setSelectedDocType(documentType);
      setHistoryModalOpen(true);
    } catch (err) {
      console.error("Error fetching document history:", err);
      setError("Failed to fetch document history");
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.title || !uploadForm.document_type) {
      setError("Please fill in all required fields");
      return;
    }

    const token = localStorage.getItem("authToken");
    const formData = new FormData();
    formData.append("file", uploadForm.file);
    formData.append("document_type", uploadForm.document_type);
    formData.append("title", uploadForm.title);
    formData.append("description", uploadForm.description);

    try {
      setUploading(true);
      await axios.post(
        `${API_BASE_URL}/pccAdmin/applications/${applicationId}/documents/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadModalOpen(false);
      setUploadForm({
        document_type: "",
        title: "",
        file: null,
        description: "",
      });
      fetchDocuments();
      setError(null);
    } catch (err) {
      console.error("Error uploading document:", err);
      setError(err.response?.data?.error || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <File size={20} />;
    const ext = fileUrl.split('.').pop()?.toLowerCase();
    const color = ext === 'pdf' ? 'red' : ext === 'doc' || ext === 'docx' ? 'blue' : ext === 'jpg' || ext === 'png' ? 'green' : 'gray';
    return <FileText size={20} color={color} />;
  };

  const formatFileSize = (url) => {
    // This is a placeholder - in real implementation, you'd get file size from backend
    return "Unknown size";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card p="lg" withBorder>
        <Group position="center">
          <Loader size="md" />
          <Text>Loading documents...</Text>
        </Group>
      </Card>
    );
  }

  return (
    <Box>
      {error && (
        <Alert color="red" mb="md" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      )}

      <Card p="lg" withBorder>
        <Group position="apart" mb="md">
          <Text size="lg" weight={600}>
            <FileText size={20} style={{ marginRight: "8px", verticalAlign: "middle" }} />
            Document Version Control
          </Text>
          <Button
            leftSection={<Plus size={16} />}
            onClick={() => setUploadModalOpen(true)}
          >
            Upload New Document
          </Button>
        </Group>

        {documents.length === 0 ? (
          <Box ta="center" py="xl">
            <FileText size={48} color="gray" />
            <Text mt="md" color="dimmed">
              No documents uploaded yet
            </Text>
            <Button
              mt="md"
              leftSection={<Upload size={16} />}
              onClick={() => setUploadModalOpen(true)}
            >
              Upload First Document
            </Button>
          </Box>
        ) : (
          <Grid>
            {documents.map((doc, index) => (
              <Grid.Col key={index} span={12} md={6} lg={4}>
                <Card p="md" withBorder>
                  <Group position="apart" mb="xs">
                    <Group>
                      {getFileIcon(doc.file_url)}
                      <Text size="sm" weight={500}>
                        v{doc.version}
                      </Text>
                    </Group>
                    <Badge size="sm" color="blue">
                      Current
                    </Badge>
                  </Group>

                  <Text weight={600} mb="xs" lineClamp={2}>
                    {doc.title}
                  </Text>

                  <Text size="sm" color="dimmed" mb="xs">
                    Type: {doc.document_type}
                  </Text>

                  {doc.description && (
                    <Text size="xs" color="dimmed" mb="sm" lineClamp={2}>
                      {doc.description}
                    </Text>
                  )}

                  <Box mb="sm">
                    <Text size="xs" color="dimmed">
                      Uploaded by: {doc.uploaded_by_name || "Unknown"}
                    </Text>
                    <Text size="xs" color="dimmed">
                      Date: {formatDate(doc.created_at)}
                    </Text>
                  </Box>

                  <Group>
                    <Tooltip label="Download">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        component="a"
                        href={doc.file_url}
                        download
                      >
                        <Download size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="View History">
                      <ActionIcon
                        variant="light"
                        color="gray"
                        onClick={() => fetchDocumentHistory(doc.document_type)}
                      >
                        <History size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        )}
      </Card>

      {/* Upload Modal */}
      <Modal
        opened={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload New Document Version"
        size="md"
      >
        <Box>
          <Select
            label="Document Type"
            placeholder="Select document type"
            value={uploadForm.document_type}
            onChange={(value) =>
              setUploadForm({ ...uploadForm, document_type: value })
            }
            data={documentTypes}
            required
            mb="md"
          />

          <TextInput
            label="Document Title"
            placeholder="Enter document title"
            value={uploadForm.title}
            onChange={(e) =>
              setUploadForm({ ...uploadForm, title: e.target.value })
            }
            required
            mb="md"
          />

          <FileInput
            label="Select File"
            placeholder="Choose file to upload"
            value={uploadForm.file}
            onChange={(file) => setUploadForm({ ...uploadForm, file })}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            required
            mb="md"
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Enter document description"
            value={uploadForm.description}
            onChange={(e) =>
              setUploadForm({ ...uploadForm, description: e.target.value })
            }
            minRows={2}
            mb="md"
          />

          <Group position="right">
            <Button
              variant="outline"
              onClick={() => setUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              loading={uploading}
              leftSection={<Upload size={16} />}
            >
              Upload Document
            </Button>
          </Group>
        </Box>
      </Modal>

      {/* History Modal */}
      <Modal
        opened={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Version History - ${selectedDocType}`}
        size="lg"
      >
        <Timeline active={documentHistory.length} bulletSize={24} lineWidth={2}>
          {documentHistory.map((doc, index) => (
            <Timeline.Item
              key={index}
              bullet={<FileText size={12} />}
              title={
                <Group>
                  <Text weight={500}>v{doc.version}</Text>
                  {doc.is_current && (
                    <Badge size="xs" color="green">
                      Current
                    </Badge>
                  )}
                </Group>
              }
            >
              <Text size="sm" weight={500} mb="xs">
                {doc.title}
              </Text>
              {doc.description && (
                <Text size="xs" color="dimmed" mb="xs">
                  {doc.description}
                </Text>
              )}
              <Group>
                <Text size="xs" color="dimmed">
                  Uploaded: {formatDate(doc.created_at)}
                </Text>
                <Text size="xs" color="dimmed">
                  By: {doc.uploaded_by_name}
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<Download size={12} />}
                  component="a"
                  href={doc.file_url}
                  download
                >
                  Download
                </Button>
              </Group>
            </Timeline.Item>
          ))}
        </Timeline>
      </Modal>
    </Box>
  );
};

export default DocumentVersionControl;