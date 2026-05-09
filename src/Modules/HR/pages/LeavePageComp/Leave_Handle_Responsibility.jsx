import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  Button,
  Title,
  Box,
  Grid,
  Text,
  Badge,
  Divider,
  Group,
} from "@mantine/core";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import HrBreadcrumbs from "../../components/common/HrBreadcrumbs";
import LoadingComponent from "../../components/common/Loading";
import { EmptyTable } from "../../components/tables/EmptyTable";

import {
  getLeaveFormById,
  handleLeaveResponsibility,
} from "../../services/api";

function LeaveHandleResponsibility() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const [fetchedformData, setFetchedFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);

  const responsibilityType = searchParams.get("query");

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "Leave", path: "/hr/leave" },
    {
      title: "Handle Responsibility",
      path: `/hr/leave/handle/${id}?query=${responsibilityType}`,
    },
  ];

  // ✅ FETCH FORM (REFactored)
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const data = await getLeaveFormById(id);
        setFetchedFormData(data.leave_form);
      } catch (err) {
        setError("Failed to fetch form data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [id]);

  // ✅ HANDLE ACTION (REFactored)
  const handleAction = async (action) => {
    try {
      const result = await handleLeaveResponsibility(
        id,
        action,
        responsibilityType,
      );

      setActionStatus(result.message);

      setFetchedFormData((prev) => ({
        ...prev,
        [`${responsibilityType}ResponsibilityStatus`]:
          action === "accept" ? "Accepted" : "Rejected",
        status: action === "reject" ? "Rejected" : prev.status,
      }));
    } catch (err) {
      console.error("Error handling responsibility:", err);
      setError("Failed to handle responsibility.");
    }
  };

  if (loading) return <LoadingComponent />;

  if (!fetchedformData) {
    return (
      <>
        <HrBreadcrumbs items={exampleItems} />
        <EmptyTable message="No leave form data found." />
      </>
    );
  }

  return (
    <>
      <HrBreadcrumbs items={exampleItems} />

      <Box
        style={{
          padding: "25px 30px",
          margin: "20px 5px",
          border: "1px solid #e0e0e0",
          borderRadius: "8px",
        }}
      >
        <Title order={2}>
          Handle{" "}
          {responsibilityType === "academic" ? "Academic" : "Administrative"}{" "}
          Responsibility
        </Title>

        <Grid>
          <Grid.Col span={6}>
            <Text>
              <strong>Status:</strong> <Badge>{fetchedformData.status}</Badge>
            </Text>
          </Grid.Col>
        </Grid>

        <Divider my="sm" />

        <Group position="center">
          <Button
            leftIcon={<CheckCircle size={20} />}
            onClick={() => handleAction("accept")}
            disabled={
              fetchedformData[`${responsibilityType}ResponsibilityStatus`] !==
              "Pending"
            }
          >
            Accept
          </Button>

          <Button
            leftIcon={<XCircle size={20} />}
            onClick={() => handleAction("reject")}
            disabled={
              fetchedformData[`${responsibilityType}ResponsibilityStatus`] !==
              "Pending"
            }
          >
            Reject
          </Button>
        </Group>

        {actionStatus && (
          <Text align="center" mt="md" color="green">
            {actionStatus}
          </Text>
        )}

        {error && (
          <Text align="center" mt="md" color="red">
            {error}
          </Text>
        )}
      </Box>
    </>
  );
}

export default LeaveHandleResponsibility;
