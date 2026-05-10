import React, { useEffect, useState } from "react";
import {
  Box,
  ScrollArea,
  Table,
  Title,
  Text,
  Loader,
  Alert,
  Button,
} from "@mantine/core";
import { ArrowsClockwise } from "@phosphor-icons/react";
import "../../../style/Director/RecentsView.css";
import { fetchDirectorReviewedApplications } from "../../../services/directorService";

function ReviewedApplications() {
  const [applicationsData, setApplicationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const authToken = localStorage.getItem("authToken");

  const columnNames = [
    "S.No.",
    "Application ID",
    "Application No",
    "Patent Title",
    "Submitted By",
    "Department",
    "Arrival Date",
    "Reviewed Date",
    "Budget",
    "Budget Status",
    "Assigned Attorney",
    "Current Status",
  ];

  const fetchReviewedApplications = async (showRefresh = false) => {
    if (!authToken) {
      setError("Authorization token is missing. Please login again.");
      setLoading(false);
      return;
    }

    try {
      if (showRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetchDirectorReviewedApplications();

      const formattedData = Object.entries(response.applications).map(
        ([key, app], index) => ({
          id: index + 1,
          applicationId: key,
          tokenNumber: app.application_number || app.token_no,
          title: app.title,
          submitter: app.submitted_by,
          department: app.department,
          arrivalDate: new Date(app.arrival_date).toLocaleDateString(),
          reviewedDate: app.reviewed_date
            ? new Date(app.reviewed_date).toLocaleDateString()
            : "N/A",
          budgetEstimate: app.budget_estimate || "Not set",
          budgetStatus: app.budget_status || "Not Initiated",
          assignedAttorney: app.assigned_attorney,
          currentStatus: app.current_status,
        }),
      );

      setApplicationsData(formattedData);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch reviewed applications",
      );
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
      if (showRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchReviewedApplications();
  }, [authToken]);

  const handleRefresh = () => {
    fetchReviewedApplications(true);
  };

  const renderApplicationsTable = () => {
    if (loading) {
      return (
        <Box id="pms-reviewed-loader-container">
          <Loader size="lg" color="blue" />
          <Text mt={10}>Loading reviewed applications...</Text>
        </Box>
      );
    }

    if (error) {
      return (
        <Alert color="red" title="Error loading applications">
          {error}
        </Alert>
      );
    }

    if (applicationsData.length === 0) {
      return (
        <Alert color="blue" title="No reviewed applications">
          There are no reviewed applications at this time.
        </Alert>
      );
    }

    return (
      <ScrollArea id="pms-reviewed-tableWrapper">
        <Table
          highlightOnHover
          striped
          withBorder
          id="pms-reviewed-styledTable"
        >
          <thead id="pms-reviewed-fusionTableHeader">
            <tr>
              {columnNames.map((columnName, index) => (
                <th key={index}>{columnName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applicationsData.map((item) => (
              <tr key={item.applicationId} id="pms-reviewed-tableRow">
                <td>{item.id}</td>
                <td>{item.applicationId}</td>
                <td>{item.tokenNumber}</td>
                <td title={item.title}>{item.title}</td>
                <td>{item.submitter}</td>
                <td>{item.department}</td>
                <td>{item.arrivalDate}</td>
                <td>{item.reviewedDate}</td>
                <td>{item.budgetEstimate}</td>
                <td>{item.budgetStatus}</td>
                <td>{item.assignedAttorney}</td>
                <td>
                  <Text
                    id={
                      item.currentStatus === "Patent Granted"
                        ? "pms-status-granted"
                        : item.currentStatus === "Patent Refused"
                          ? "pms-status-refused"
                          : "pms-status-pending"
                    }
                    weight={500}
                    style={{ fontSize: "14px" }}
                  >
                    {item.currentStatus}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    );
  };

  return (
    <Box id="pms-reviewed-apps-container">
      {/* Header with title */}
      <Box id="pms-reviewed-apps-header">
        <Title order={2} id="pms-reviewed-apps-title">
          Reviewed Patent Applications
        </Title>
      </Box>

      {/* Description text */}
      <Box id="pms-reviewed-apps-description">
        {/* Refresh button */}
        <Button
          id="pms-reviewed-apps-refresh"
          onClick={handleRefresh}
          loading={isRefreshing}
          leftIcon={<ArrowsClockwise size={16} />}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>

      <Box id="pms-reviewed-apps-outer">{renderApplicationsTable()}</Box>
    </Box>
  );
}

export default ReviewedApplications;
