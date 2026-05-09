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
  Table,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { WarningCircle } from "@phosphor-icons/react";
import axios from "axios";
import { specialFoodRequestRoute, host } from "../routes";

function ViewSpecialFoodRequest() {
  const [foodRequestData, setFoodRequestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("authToken");
      const response = await axios.get(specialFoodRequestRoute, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      const filteredData = (response.data.payload || [])
        .filter((item) => parseInt(item.status, 10) === 1)
        .map((item) => ({
          ...item,
          remark: item.special_request_remark || "",
        }));
      setFoodRequestData(filteredData);
    } catch (fetchError) {
      setError("Unable to load special-food requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRemarkChange = (id, value) => {
    setFoodRequestData((prevData) =>
      prevData.map((item) =>
        item.id === id ? { ...item, remark: value } : item,
      ),
    );
  };

  const updateApprovalStatus = async (status, requestData, index) => {
    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        id: requestData.id,
        status,
        special_request_remark: requestData.remark,
      };
      if (status === 3) {
        payload.escalation_remark = requestData.remark;
      }
      await axios.put(specialFoodRequestRoute, payload, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setFoodRequestData((prevData) =>
        prevData.filter((_, itemIndex) => itemIndex !== index),
      );
    } catch (updateError) {
      setError("Failed to update the request status.");
    }
  };

  return (
    <Card shadow="sm" radius="xl" p="xl" withBorder>
      <Group justify="space-between" align="flex-start" gap="md" mb="lg">
        <div>
          <Title order={3}>Special Food Requests</Title>
          <Text c="dimmed" size="sm" mt={4}>
            Review pending meal exceptions and act on them quickly.
          </Text>
        </div>
        <Group gap="sm">
          <Badge size="lg" radius="xl" color="pink" variant="light">
            {foodRequestData.length} pending
          </Badge>
          <Button variant="light" onClick={fetchData}>
            Refresh
          </Button>
        </Group>
      </Group>

      {loading ? (
        <Flex justify="center" align="center" py="xl">
          <Loader />
        </Flex>
      ) : error ? (
        <Alert color="red" icon={<WarningCircle size={18} />}>
          {error}
        </Alert>
      ) : (
        <ScrollArea offsetScrollbars>
          <Table
            striped
            highlightOnHover
            verticalSpacing="md"
            horizontalSpacing="md"
            miw={860}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Student ID</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Food</Table.Th>
                <Table.Th>Reason</Table.Th>
                <Table.Th>Document</Table.Th>
                <Table.Th>From</Table.Th>
                <Table.Th>To</Table.Th>
                <Table.Th>Remark</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {foodRequestData.length > 0 ? (
                foodRequestData.map((item, index) => (
                  <Table.Tr key={item.id || index}>
                    <Table.Td>{item.app_date}</Table.Td>
                    <Table.Td>{item.student_id}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={item.request_type === "medical" ? "red" : "blue"}
                        variant="light"
                      >
                        {item.request_type === "medical" ? "Medical" : "Event"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{item.item1}</Table.Td>
                    <Table.Td>
                      <Text size="sm" maw={220}>
                        {item.request}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {item.supporting_document ? (
                        <Button
                          component="a"
                          href={
                            item.supporting_document.startsWith("http")
                              ? item.supporting_document
                              : `${host}/${item.supporting_document.replace(/^\/+/, "")}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          size="xs"
                          variant="subtle"
                        >
                          View
                        </Button>
                      ) : (
                        <Text size="sm" c="dimmed">
                          Not attached
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>{item.start_date}</Table.Td>
                    <Table.Td>{item.end_date}</Table.Td>
                    <Table.Td>
                      <Textarea
                        value={item.remark}
                        placeholder="Add context for the decision"
                        onChange={(event) =>
                          handleRemarkChange(item.id, event.currentTarget.value)
                        }
                        minRows={1}
                        autosize
                      />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          color="green"
                          variant="light"
                          onClick={() => updateApprovalStatus(2, item, index)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          variant="light"
                          onClick={() => updateApprovalStatus(0, item, index)}
                        >
                          Reject
                        </Button>
                        <Button
                          size="xs"
                          color="yellow"
                          variant="light"
                          onClick={() => updateApprovalStatus(3, item, index)}
                        >
                          Escalate
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={10}>
                    <Text ta="center" c="dimmed" py="lg">
                      No pending special-food requests right now.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}
    </Card>
  );
}

export default ViewSpecialFoodRequest;
