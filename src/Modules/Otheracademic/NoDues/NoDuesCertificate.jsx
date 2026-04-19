import { useState } from "react";
import { Container, Paper, Stack, Text, Alert, Button } from "@mantine/core";
import { Warning, Download } from "@phosphor-icons/react";
import axios from "axios";
import { NoDues_Certificate } from "../../../routes/otheracademicRoutes";

function NoDuesCertificate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const authToken = localStorage.getItem("authToken");

  const downloadCertificate = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(NoDues_Certificate, {
        headers: { Authorization: `Token ${authToken}` },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "no-dues-certificate.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to download certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container size="sm" py="xl">
      <Paper p="lg" radius="lg" withBorder shadow="sm">
        <Stack spacing="md">
          <Text fw={700} size="lg">
            No-Dues Certificate
          </Text>
          <Text c="dimmed" size="sm">
            Download your certificate once all approvals are complete.
          </Text>

          {error && (
            <Alert icon={<Warning size={16} />} color="red" title="Error">
              {error}
            </Alert>
          )}

          <Button
            leftSection={<Download size={18} />}
            onClick={downloadCertificate}
            loading={loading}
          >
            Download Certificate
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

export default NoDuesCertificate;
