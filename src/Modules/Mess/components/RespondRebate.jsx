import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Flex,
  Group,
  Loader,
  ScrollArea,
  SegmentedControl,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { WarningCircle } from "@phosphor-icons/react";
import { rebateRoute } from "../routes";

const statusMeta = {
  pending: {
    code: "1",
    label: "Pending",
    color: "orange",
  },
  approved: {
    code: "2",
    label: "Approved",
    color: "green",
  },
  declined: {
    code: "0",
    label: "Declined",
    color: "red",
  },
  escalated: {
    code: "3",
    label: "Escalated",
    color: "blue",
  },
};

function RespondToRebateRequest() {
  const [rebateData, setRebateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    const fetchRebateRequests = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(rebateRoute, {
          method: "GET",
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch rebate requests.");
        }

        const data = await response.json();
        setRebateData(
          (data.payload || []).map((item) => ({
            ...item,
            status: item.status || statusMeta.pending.code,
            remark: item.rebate_remark || "",
          })),
        );
      } catch (fetchError) {
        setError(fetchError.message || "Failed to fetch rebate requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRebateRequests();
  }, []);

  const handleRemarkChange = (id, value) => {
    setRebateData((prev) =>
      prev.map((item) => (item.id === id ? { ...item, remark: value } : item)),
    );
  };

  const toggleApproval = async (id, nextStatus) => {
    const authToken = localStorage.getItem("authToken");
    const requestItem = rebateData.find((item) => item.id === id);

    if (!requestItem) return;

    try {
      const payload = {
        id: requestItem.id,
        rebate_remark: requestItem.remark,
        status: nextStatus,
      };
      if (nextStatus === statusMeta.escalated.code) {
        payload.escalation_remark = requestItem.remark;
      }

      const response = await fetch(rebateRoute, {
        method: "PUT",
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to update rebate request.");
      }

      setRebateData((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: nextStatus,
                rebate_remark: requestItem.remark,
                remark: requestItem.remark,
              }
            : item,
        ),
      );
    } catch (updateError) {
      setError(updateError.message || "Failed to update rebate request.");
    }
  };

  const getFilteredRebateData = () =>
    rebateData.filter((item) => item.status === statusMeta[activeTab].code);

  const filteredRebateData = getFilteredRebateData();
  const statusCounts = {
    pending: rebateData.filter(
      (item) => item.status === statusMeta.pending.code,
    ).length,
    approved: rebateData.filter(
      (item) => item.status === statusMeta.approved.code,
    ).length,
    declined: rebateData.filter(
      (item) => item.status === statusMeta.declined.code,
    ).length,
  };

  if (loading) {
    return (
      <Card shadow="sm" radius="xl" p="xl" withBorder>
        <Flex justify="center" align="center" py="xl">
          <Loader />
        </Flex>
      </Card>
    );
  }

  return (
    <Card shadow="sm" radius="xl" p="xl" withBorder>
      <Group justify="space-between" align="flex-start" gap="md" mb="lg">
        <div>
          <Title order={3}>Rebate Review</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Process leave-linked rebate requests, or escalate edge cases for
            warden review with context attached.
          </Text>
        </div>
        <Badge
          size="lg"
          radius="xl"
          color={statusMeta[activeTab].color}
          variant="light"
        >
          {filteredRebateData.length}{" "}
          {statusMeta[activeTab].label.toLowerCase()}
        </Badge>
      </Group>

      {error ? (
        <Alert color="red" icon={<WarningCircle size={18} />} mb="lg">
          {error}
        </Alert>
      ) : null}

      <SegmentedControl
        fullWidth
        radius="xl"
        value={activeTab}
        onChange={setActiveTab}
        data={[
          {
            label: `Pending (${statusCounts.pending})`,
            value: "pending",
          },
          {
            label: `Approved (${statusCounts.approved})`,
            value: "approved",
          },
          {
            label: `Declined (${statusCounts.declined})`,
            value: "declined",
          },
        ]}
      />

      <ScrollArea mt="lg" offsetScrollbars>
        <Table
          striped
          highlightOnHover
          verticalSpacing="md"
          horizontalSpacing="md"
          miw={940}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Date</Table.Th>
              <Table.Th>Student ID</Table.Th>
              <Table.Th>Purpose</Table.Th>
              <Table.Th>From</Table.Th>
              <Table.Th>To</Table.Th>
              <Table.Th>Remark</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredRebateData.length > 0 ? (
              filteredRebateData.map((item) => {
                const itemStatus =
                  Object.values(statusMeta).find(
                    (status) => status.code === item.status,
                  ) || statusMeta.pending;

                return (
                  <Table.Tr key={item.id}>
                    <Table.Td>{item.app_date}</Table.Td>
                    <Table.Td>{item.student_id}</Table.Td>
                    <Table.Td>
                      <Text size="sm" maw={200}>
                        {item.purpose || "No purpose provided"}
                      </Text>
                    </Table.Td>
                    <Table.Td>{item.start_date}</Table.Td>
                    <Table.Td>{item.end_date}</Table.Td>
                    <Table.Td>
                      {item.status === statusMeta.pending.code ? (
                        <TextInput
                          value={item.remark}
                          placeholder="Add remark"
                          onChange={(event) =>
                            handleRemarkChange(
                              item.id,
                              event.currentTarget.value,
                            )
                          }
                        />
                      ) : (
                        <Text size="sm">
                          {item.remark || "No remark added"}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge color={itemStatus.color} variant="light">
                        {itemStatus.label}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {item.status === statusMeta.pending.code ? (
                        <Group gap="xs">
                          <Button
                            size="xs"
                            color="green"
                            variant="light"
                            onClick={() =>
                              toggleApproval(item.id, statusMeta.approved.code)
                            }
                          >
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            variant="light"
                            onClick={() =>
                              toggleApproval(item.id, statusMeta.declined.code)
                            }
                          >
                            Decline
                          </Button>
                          <Button
                            size="xs"
                            color="yellow"
                            variant="light"
                            onClick={() =>
                              toggleApproval(item.id, statusMeta.escalated.code)
                            }
                          >
                            Escalate
                          </Button>
                        </Group>
                      ) : (
                        <Text size="sm" c="dimmed">
                          No further action
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Text ta="center" c="dimmed" py="lg">
                    No {activeTab} rebate requests are available right now.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}

export default RespondToRebateRequest;
