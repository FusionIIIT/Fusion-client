import React, { useState, useEffect } from "react";

import {
  Paper,
  Group,
  Badge,
  Title,
  Text,
  Button,
  Grid,
  Center,
  Loader,
  Flex,
  Divider,
} from "@mantine/core";

import { useSelector } from "react-redux";

import ComplaintDetails from "./ComplaintDetails";
import { getComplaintsByRole } from "../routes/api";
import detailIcon from "../../../assets/detail.png";

import declinedIcon from "../../../assets/declined.png";

import resolvedIcon from "../../../assets/resolved.png";

const TABS = ["pending", "resolved", "declined"];

function ComplaintHistory() {
  const [activeTab, setActiveTab] = useState("pending");
  const [complaints, setComplaints] = useState({
    pending: [],
    resolved: [],
    declined: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const role = useSelector((state) => state.user.role);

  useEffect(() => {
    const fetchComplaints = async () => {
      setIsLoading(true);
      setIsError(false);
      const token = localStorage.getItem("authToken");
      const response = await getComplaintsByRole(role, token);
      if (response.success) {
        const { data } = response;
        setComplaints({
          pending: data.filter((c) => c.status === 0),
          resolved: data.filter((c) => c.status === 2),
          declined: data.filter((c) => c.status === 3),
        });
      } else {
        setIsError(true);
      }
      setIsLoading(false);
    };
    fetchComplaints();
  }, [role]);

  const formatDateTime = (str) => {
    const d = new Date(str);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year}, ${hours}:${minutes}`;
  };

  const getIcon = (tab) =>
    tab === "resolved"
      ? resolvedIcon
      : tab === "declined"
        ? declinedIcon
        : detailIcon;

  const getBadgeColor = (tab) => (tab === "resolved" ? "green" : "blue");

  return (
    <Grid
      mt="xl"
      style={{ width: "100%", paddingInline: "49px" }}
      sx={(theme) => ({
        [theme.fn.smallerThan("sm")]: { paddingInline: theme.spacing.md },
      })}
    >
      <Paper
        radius="md"
        px="lg"
        pt="sm"
        pb="xl"
        style={{
          borderLeft: "0.6rem solid #15ABFF",
          width: showDetails ? "70vw" : "100%",
          backgroundColor: "white",
          overflow: "hidden",
          maxHeight: "65vh",
        }}
        withBorder
        sx={(theme) => ({
          [theme.fn.smallerThan("sm")]: {
            width: showDetails ? "90vw" : "100%",
          },
        })}
      >
        {showDetails ? (
          <ComplaintDetails
            complaintId={selectedComplaintId}
            onBack={() => setShowDetails(false)}
          />
        ) : (
          <>
            <Title
              order={3}
              mb="md"
              sx={(theme) => ({
                fontSize: 24,
                [theme.fn.smallerThan("sm")]: {
                  fontSize: theme.fontSizes.md,
                },
              })}
            >
              Complaint History
            </Title>
            <Group spacing="sm" mb="md">
              {TABS.map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? "filled" : "outline"}
                  onClick={() => setActiveTab(tab)}
                  sx={(theme) => ({
                    backgroundColor:
                      activeTab === tab ? "#15ABFF" : theme.white,
                    color: activeTab === tab ? theme.white : theme.black,
                    padding: "8px 10px",
                    fontSize: theme.fontSizes.md,
                    whiteSpace: "normal",
                    textOverflow: "unset",
                  })}
                >
                  {`${tab.charAt(0).toUpperCase() + tab.slice(1)} Complaints`}
                </Button>
              ))}
            </Group>
            <div
              style={{ maxHeight: "50vh", overflowY: "auto", width: "100%" }}
            >
              {isLoading ? (
                <Center style={{ minHeight: "45vh" }}>
                  <Loader size="xl" variant="bars" />
                </Center>
              ) : isError ? (
                <Center style={{ minHeight: "45vh" }}>
                  <Text color="red" fz="md">
                    Failed to fetch complaints. Please try again.
                  </Text>
                </Center>
              ) : complaints[activeTab].length === 0 ? (
                <Center style={{ minHeight: "45vh" }}>
                  <Text fz="md">No {activeTab} complaints available.</Text>
                </Center>
              ) : (
                complaints[activeTab].map((c, i) => (
                  <Paper
                    key={i}
                    radius="md"
                    px="lg"
                    pt="sm"
                    pb="xl"
                    style={{ width: "100%", margin: "10px 0" }}
                    withBorder
                  >
                    <Flex direction="column" style={{ width: "100%" }}>
                      <Flex direction="row" justify="space-between">
                        <Flex direction="row" gap="xs" align="center">
                          <Text fz="md" weight="bold">
                            Complaint Id: {c.id}
                          </Text>
                          <Badge size="lg" color={getBadgeColor(activeTab)}>
                            {c.complaint_type}
                          </Badge>
                        </Flex>
                        <img
                          src={getIcon(activeTab)}
                          alt={activeTab}
                          style={{
                            width: "35px",
                            borderRadius: "50%",
                            backgroundColor:
                              activeTab === "resolved"
                                ? "#2BB673"
                                : activeTab === "declined"
                                  ? "#FF6B6B"
                                  : "#FF6B6B",
                            padding: "10px",
                          }}
                        />
                      </Flex>
                      <Flex direction="row" justify="space-between" mt="sm">
                        <Flex direction="column" gap="xs">
                          <Text fz="md">
                            <b>Date:</b> {formatDateTime(c.complaint_date)}
                          </Text>
                          <Text fz="md">
                            <b>Location:</b> {c.specific_location}, {c.location}
                          </Text>
                        </Flex>
                      </Flex>
                      <Divider my="md" size="sm" />
                      <Flex
                        direction="row"
                        justify="space-between"
                        align="center"
                      >
                        <Text fz="md">
                          <b>Description:</b> {c.details}
                        </Text>
                        <Button
                          variant="outline"
                          size="xs"
                          sx={(theme) => ({
                            [theme.fn.smallerThan("sm")]: {
                              width: "100%",
                              marginTop: theme.spacing.xs,
                            },
                          })}
                          onClick={() => {
                            setSelectedComplaintId(c.id);
                            setShowDetails(true);
                          }}
                        >
                          Details
                        </Button>
                      </Flex>
                    </Flex>
                  </Paper>
                ))
              )}
            </div>
          </>
        )}
      </Paper>
    </Grid>
  );
}

export default ComplaintHistory;
