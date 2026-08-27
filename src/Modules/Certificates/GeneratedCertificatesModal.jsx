import { useEffect, useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import {
  ActionIcon,
  Center,
  Group,
  Loader,
  Modal,
  Pagination,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { DownloadSimple, Eye, MagnifyingGlass } from "@phosphor-icons/react";
import PropTypes from "prop-types";

import {
  bonafideCertificatePdfRoute,
  bonafideCertificatesRoute,
} from "../../routes/academicRoutes";
import classes from "./GeneratedCertificatesModal.module.css";

const authConfig = () => ({
  headers: {
    Authorization: `Token ${localStorage.getItem("authToken")}`,
  },
});

const responseMessage = async (error) => {
  const payload = error?.response?.data;
  if (payload instanceof Blob) {
    try {
      return JSON.parse(await payload.text()).error;
    } catch {
      return "Unable to open the certificate.";
    }
  }
  return (
    payload?.error ||
    payload?.message ||
    payload?.detail ||
    "Unable to load generated certificates."
  );
};

const filenameFrom = (header, fallback) => {
  const match = header?.match(/filename="?([^";]+)"?/i);
  return match?.[1] || fallback;
};

export default function GeneratedCertificatesModal({ opened, onClose }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search.trim(), 300);
  const [page, setPage] = useState(1);
  const [history, setHistory] = useState({
    results: [],
    count: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [previewingId, setPreviewingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null);

  useEffect(() => {
    if (!opened) return undefined;

    const controller = new AbortController();
    setLoading(true);
    axios
      .get(bonafideCertificatesRoute, {
        ...authConfig(),
        params: {
          page,
          page_size: 20,
          search: debouncedSearch || undefined,
        },
        signal: controller.signal,
      })
      .then(({ data }) => {
        setHistory({
          results: data.results || [],
          count: data.count || 0,
          total_pages: data.total_pages || 1,
        });
        if (data.page && data.page !== page) setPage(data.page);
      })
      .catch(async (error) => {
        if (axios.isCancel(error)) return;
        notifications.show({
          color: "red",
          title: "History unavailable",
          message: await responseMessage(error),
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [debouncedSearch, opened, page]);

  useEffect(
    () => () => {
      if (pdfPreview?.url) URL.revokeObjectURL(pdfPreview.url);
    },
    [pdfPreview],
  );

  const previewCertificate = async (certificate) => {
    setPreviewingId(certificate.id);
    try {
      const response = await axios.get(
        bonafideCertificatePdfRoute(certificate.id),
        { ...authConfig(), responseType: "blob" },
      );
      setPdfPreview({
        url: URL.createObjectURL(response.data),
        title: `${certificate.roll_number} — ${certificate.purpose}`,
      });
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Preview unavailable",
        message: await responseMessage(error),
      });
    } finally {
      setPreviewingId(null);
    }
  };

  const downloadCertificate = async (certificate) => {
    setDownloadingId(certificate.id);
    try {
      const response = await axios.get(
        bonafideCertificatePdfRoute(certificate.id),
        {
          ...authConfig(),
          params: { download: 1 },
          responseType: "blob",
        },
      );
      saveAs(
        response.data,
        filenameFrom(
          response.headers["content-disposition"],
          `${certificate.roll_number}_Bonafide_Certificate_${certificate.serial_number}.pdf`,
        ),
      );
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Download failed",
        message: await responseMessage(error),
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const closeHistory = () => {
    setPdfPreview(null);
    onClose();
  };

  const rows = history.results.map((certificate) => (
    <Table.Tr key={certificate.id}>
      <Table.Td>{certificate.serial_number}</Table.Td>
      <Table.Td>{certificate.roll_number}</Table.Td>
      <Table.Td>{certificate.name}</Table.Td>
      <Table.Td>{certificate.purpose}</Table.Td>
      <Table.Td>{certificate.issued_on}</Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Preview certificate">
            <ActionIcon
              variant="light"
              color="blue"
              aria-label={`Preview certificate for ${certificate.roll_number}`}
              onClick={() => previewCertificate(certificate)}
              disabled={previewingId !== null}
            >
              {previewingId === certificate.id ? (
                <Loader size={16} />
              ) : (
                <Eye size={17} />
              )}
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Download certificate">
            <ActionIcon
              variant="light"
              color="green"
              aria-label={`Download certificate for ${certificate.roll_number}`}
              onClick={() => downloadCertificate(certificate)}
              disabled={downloadingId !== null}
            >
              {downloadingId === certificate.id ? (
                <Loader size={16} />
              ) : (
                <DownloadSimple size={17} />
              )}
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Modal
        opened={opened}
        onClose={closeHistory}
        title="Generated Certificates"
        size="xl"
        centered
      >
        <Stack gap="md">
          <TextInput
            placeholder="Search by S.No., roll number, name, purpose, or date"
            aria-label="Search generated certificates"
            leftSection={<MagnifyingGlass size={18} />}
            value={search}
            onChange={(event) => {
              setSearch(event.currentTarget.value);
              setPage(1);
            }}
          />
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {history.count} certificate{history.count === 1 ? "" : "s"}
            </Text>
            {loading && <Loader size="sm" />}
          </Group>
          <Table.ScrollContainer minWidth={760}>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>S.No.</Table.Th>
                  <Table.Th>Roll No.</Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Purpose</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.length > 0 ? (
                  rows
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={6}>
                      <Center py="xl">
                        <Text c="dimmed">
                          {loading
                            ? "Loading generated certificates..."
                            : "No generated certificates found."}
                        </Text>
                      </Center>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
          {history.total_pages > 1 && (
            <Center>
              <Pagination
                value={page}
                onChange={setPage}
                total={history.total_pages}
              />
            </Center>
          )}
        </Stack>
      </Modal>

      <Modal
        opened={Boolean(pdfPreview)}
        onClose={() => setPdfPreview(null)}
        title={pdfPreview?.title || "Certificate Preview"}
        size="calc(100vw - 4rem)"
        zIndex={300}
        centered
      >
        {pdfPreview && (
          <iframe
            className={classes.pdfPreview}
            src={pdfPreview.url}
            title={pdfPreview.title}
          />
        )}
      </Modal>
    </>
  );
}

GeneratedCertificatesModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
