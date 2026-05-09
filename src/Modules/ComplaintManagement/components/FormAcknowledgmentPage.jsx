// AcknowledgmentPage.jsx
import React from "react";
import PropTypes from "prop-types";
import { Grid, Paper, Button, Title, Text } from "@mantine/core";

function AcknowledgmentPage({ complaintDetails, onBackToForm }) {
  const complaintType =
    complaintDetails?.complaintType || complaintDetails?.complaint_type || "-";
  const location = complaintDetails?.location || "-";
  const specificLocation =
    complaintDetails?.specificLocation ||
    complaintDetails?.specific_location ||
    "-";
  const details =
    complaintDetails?.complaintDetails || complaintDetails?.details || "-";

  return (
    <Grid
      mt="xl"
      style={{ paddingInline: "49px", width: "100%" }}
      sx={(theme) => ({
        [theme.fn.smallerThan("sm")]: {
          paddingInline: theme.spacing.md,
        },
      })}
    >
      <Paper
        radius="md"
        px="lg"
        pt="sm"
        pb="xl"
        style={{
          borderLeft: "0.6rem solid #15ABFF",
          width: "70vw",
          backgroundColor: "white",
        }}
        withBorder
        sx={(theme) => ({
          [theme.fn.smallerThan("sm")]: {
            width: "90vw",
            padding: theme.spacing.sm,
          },
        })}
      >
        <Title order={3} mb="md">
          Complaint Submitted Successfully!
        </Title>
        <Text mb="md">
          Your complaint has been registered successfully. Here are the details:
        </Text>
        <Text>
          <strong>Complaint Type:</strong> {complaintType}
        </Text>
        <Text>
          <strong>Location:</strong> {location}
        </Text>
        <Text>
          <strong>Specific Location:</strong> {specificLocation}
        </Text>
        <Text>
          <strong>Complaint Details:</strong> {details}
        </Text>
        <Button onClick={onBackToForm} fullWidth mt="lg">
          Back to Form
        </Button>
      </Paper>
    </Grid>
  );
}

// Add PropTypes for validation
AcknowledgmentPage.propTypes = {
  complaintDetails: PropTypes.shape({
    complaintType: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    specificLocation: PropTypes.string.isRequired,
    complaintDetails: PropTypes.string.isRequired,
    file: PropTypes.instanceOf(File), // Use instanceOf(File) for the file prop
  }).isRequired,
  onBackToForm: PropTypes.func.isRequired,
};

export default AcknowledgmentPage;
