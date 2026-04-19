import React from "react";
import PropTypes from "prop-types";
import { Text, Box, Button, Badge, Card, Group } from "@mantine/core";
import {
  EnvelopeSimple,
  PaperPlaneTilt,
  UserCircle,
  CaretLeft,
  Calendar,
  Paperclip,
  ShieldCheck,
} from "phosphor-react";
import "../../../style/Pcc_Admin/AttorneyForm.css";

function CommunicationLogDetail({ log, onBack }) {
  if (!log) {
    return <Text>Communication log not found</Text>;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div id="pms-pcc-attorney-details-container">
      {/* Header with Back Button */}
      <div id="pms-pcc-top-nav-container">
        <Button
          variant="subtle"
          leftIcon={<CaretLeft size={20} weight="bold" />}
          onClick={onBack}
          id="pms-pcc-attorney-back-btn"
        >
          Back
        </Button>
        <Badge
          size="lg"
          color={log.direction === "OUTGOING" ? "blue" : "green"}
          variant="light"
        >
          {log.direction === "OUTGOING" ? "Outgoing" : "Incoming"}
        </Badge>
        <Badge
          size="lg"
          color={
            log.confidentiality_level === "Attorney-Client Privileged"
              ? "red"
              : log.confidentiality_level === "Confidential"
                ? "orange"
                : log.confidentiality_level === "Public"
                  ? "green"
                  : "blue"
          }
          variant="light"
        >
          {log.confidentiality_level || "Internal"}
        </Badge>
      </div>

      {/* Communication Details */}
      <Box id="pms-pcc-attorney-details-grid">
        <Card p="md" radius="sm" withBorder mb="md">
          <Group mb="sm">
            <PaperPlaneTilt size={20} />
            <Text weight={600} size="lg">
              {log.subject || "No Subject"}
            </Text>
          </Group>

          <div style={{ marginBottom: "16px" }}>
            <Text id="pms-pcc-attorney-detail">
              <Calendar size={20} id="pms-pcc-icon" />
              <strong>Date:</strong> {formatDate(log.created_at)}
            </Text>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Text id="pms-pcc-attorney-detail">
              <UserCircle size={20} id="pms-pcc-icon" />
              <strong>External Party:</strong>{" "}
              {log.external_party_name || "Not specified"}
            </Text>
          </div>

          {log.external_party_email && (
            <div style={{ marginBottom: "16px" }}>
              <Text id="pms-pcc-attorney-detail">
                <EnvelopeSimple size={20} id="pms-pcc-icon" />
                <strong>Email:</strong> {log.external_party_email}
              </Text>
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <Text id="pms-pcc-attorney-detail">
              <UserCircle size={20} id="pms-pcc-icon" />
              <strong>Logged By:</strong> {log.logged_by_name || "PCC Admin"}
            </Text>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <Text id="pms-pcc-attorney-detail">
              <ShieldCheck size={20} id="pms-pcc-icon" />
              <strong>Confidentiality:</strong>{" "}
              {log.confidentiality_level || "Internal"}
            </Text>
          </div>
        </Card>

        {/* Body / Details */}
        <Card p="md" radius="sm" withBorder mb="md">
          <Text weight={600} size="md" mb="sm">
            Communication Details
          </Text>
          <Text
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: 1.6,
              backgroundColor: "#f8f9fa",
              padding: "12px",
              borderRadius: "8px",
            }}
          >
            {log.body || "No details provided."}
          </Text>
        </Card>

        {/* Attachment */}
        {log.attachment && (
          <Card p="md" radius="sm" withBorder mb="md">
            <Text weight={600} size="md" mb="sm">
              Attachment
            </Text>
            <Button
              component="a"
              href={log.attachment}
              target="_blank"
              download
              variant="outline"
              color="blue"
              leftIcon={<Paperclip size={18} />}
            >
              Download Attachment
            </Button>
          </Card>
        )}
      </Box>
    </div>
  );
}

CommunicationLogDetail.propTypes = {
  log: PropTypes.shape({
    id: PropTypes.number,
    direction: PropTypes.string,
    subject: PropTypes.string,
    body: PropTypes.string,
    external_party_name: PropTypes.string,
    external_party_email: PropTypes.string,
    logged_by_name: PropTypes.string,
    created_at: PropTypes.string,
    attachment: PropTypes.string,
    confidentiality_level: PropTypes.string,
  }),
  onBack: PropTypes.func.isRequired,
};

export default CommunicationLogDetail;
