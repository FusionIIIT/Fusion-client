import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  ScrollArea,
  Table,
  Title,
  Text,
  Loader,
  Alert,
} from "@mantine/core";
import { Eye, ArrowsClockwise } from "@phosphor-icons/react";
import PropTypes from "prop-types";
import "../../../style/Director/SubmittedApplications.css";
import { fetchDirectorSubmittedApplications } from "../../../services/directorService";

function SubmittedApplications({ setActiveTab }) {
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
    "Date-Time",
    "Budget",
    "Budget Status",
    "Status",
    "Assigned Attorney",
    "Actions",
  ];

  const fetchApplicationData = async (showRefresh = false) => {
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

      const response = await fetchDirectorSubmittedApplications();

      const formattedData = Object.entries(response.applications).map(
        ([key, app], index) => ({
          id: index + 1,
          applicationId: key,
          tokenNumber: app.application_number || app.token_no,
          title: app.title,
          submitter: app.submitted_by,
          Department: app.department,
          date: new Date(app.forwarded_on).toLocaleString(),
          budgetEstimate: app.budget_estimate || "Not set",
          budgetStatus: app.budget_status || "Not Initiated",
          status: app.current_status,
          attorney: app.assigned_attorney,
        }),
      );

      setApplicationsData(formattedData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch applications");
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
      if (showRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchApplicationData();
  }, [authToken]);

  const handleViewDetails = (application) => {
    localStorage.setItem("selectedApplicationId", application.applicationId);
    localStorage.setItem("selectedApplicationToken", application.tokenNumber);
    setActiveTab("1.1");
  };

  const handleRefresh = () => {
    fetchApplicationData(true);
  };

  const renderApplicationsTable = () => {
    if (loading) {
      return (
        <Box id="pms-director-submitted-loader-container">
          <Loader size="lg" color="blue" />
          <Text mt={10}>Loading applications...</Text>
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
        <Alert color="blue" title="No applications">
          There are no applications forwarded for review at this time.
        </Alert>
      );
    }

    return (
      <ScrollArea id="pms-director-submitted-tableWrapper">
        <Table
          highlightOnHover
          striped
          withBorder
          id="pms-director-submitted-styledTable"
        >
          <thead id="pms-director-submitted-fusionTableHeader">
            <tr>
              {columnNames.map((columnName, index) => (
                <th key={index}>{columnName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {applicationsData.map((application) => (
              <tr
                key={application.applicationId}
                id="pms-director-submitted-tableRow"
              >
                <td>{application.id}</td>
                <td>{application.applicationId}</td>
                <td>{application.tokenNumber}</td>
                <td title={application.title}>{application.title}</td>
                <td>{application.submitter}</td>
                <td>{application.Department}</td>
                <td>{application.date}</td>
                <td>{application.budgetEstimate}</td>
                <td>{application.budgetStatus}</td>
                <td>{application.status}</td>
                <td>{application.attorney}</td>
                <td>
                  <Button
                    variant="outline"
                    color="blue"
                    size="sm"
                    onClick={() => handleViewDetails(application)}
                    id="pms-director-submitted-viewButton"
                  >
                    <Eye size={16} /> <span>View</span>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    );
  };

  return (
    <Box id="pms-director-submitted-director-submitted-apps-container">
      {/* Header with title */}
      <Box id="pms-director-submitted-director-submitted-apps-header">
        <Title
          order={2}
          id="pms-director-submitted-director-submitted-apps-title"
        >
          Applications Pending Director Review
        </Title>
      </Box>

      {/* Description text */}
      <Box id="pms-director-submitted-director-submitted-apps-description">
        {/* Refresh button */}
        <Button
          id="pms-director-submitted-director-submitted-apps-refresh"
          onClick={handleRefresh}
          loading={isRefreshing}
          leftIcon={<ArrowsClockwise size={16} />}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </Box>

      <Box id="pms-director-submitted-director-submitted-apps-outer">
        {renderApplicationsTable()}
      </Box>
    </Box>
  );
}

SubmittedApplications.propTypes = {
  setActiveTab: PropTypes.func.isRequired,
};

export default SubmittedApplications;
