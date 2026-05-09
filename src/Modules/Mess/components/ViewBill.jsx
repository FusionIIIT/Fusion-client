import React, { useEffect, useState } from "react";
import {
  Table,
  Text,
  Button,
  Group,
  Container,
  Paper,
  Flex,
  Loader,
  Alert,
} from "@mantine/core";
import { DownloadSimple, WarningCircle } from "@phosphor-icons/react";
import { viewBillsRoute, getMessStatusRoute } from "../routes";

function MessBilling() {
  const [billData, setBillData] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [messStatus, setMessStatus] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const authToken = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [billResponse, statusResponse] = await Promise.all([
          fetch(viewBillsRoute, {
            method: "GET",
            headers: {
              Authorization: `Token ${authToken}`,
              "Content-Type": "application/json",
            },
          }),
          fetch(getMessStatusRoute, {
            method: "GET",
            headers: {
              Authorization: `Token ${authToken}`,
              "Content-Type": "application/json",
            },
          }),
        ]);

        const billJson = await billResponse.json();
        const statusJson = await statusResponse.json();

        if (!billResponse.ok) {
          throw new Error(billJson.error || "Unable to load bill data.");
        }

        setBillData(
          (billJson.payload || []).map((bill) => ({
            id: bill.id,
            month: `${bill.month} ${bill.year}`,
            baseAmount: bill.amount,
            rebateCount: bill.rebate_count,
            rebateAmount: bill.rebate_amount,
            monthlyBill: bill.total_bill,
          })),
        );
        setMessStatus(statusJson?.payload?.current_mess_status || "Not Found");
        setTotalBalance(statusJson?.payload?.current_rem_balance || 0);
      } catch (err) {
        setError(err.message || "Error fetching billing data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]);

  const handleDownload = () => {
    const rows = [
      ["Month", "Base Amount", "Rebate Count", "Rebate Amount", "Final Bill"],
      ...billData.map((row) => [
        row.month,
        row.baseAmount,
        row.rebateCount,
        row.rebateAmount,
        row.monthlyBill,
      ]),
    ];
    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mess-billing-statement.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Flex justify="center" p="xl">
        <Loader />
      </Flex>
    );
  }

  if (error) {
    return (
      <Alert color="red" icon={<WarningCircle size={18} />}>
        {error}
      </Alert>
    );
  }

  return (
    <Container fluid px={0}>
      <Group mb="xl" grow align="flex-start">
        <Paper
          shadow="sm"
          radius="md"
          p="xl"
          withBorder
          style={{ backgroundColor: "#1A2980", color: "white", flex: 1 }}
        >
          <Text size="sm" tt="uppercase" fw={700} opacity={0.8}>
            Current Mess Status
          </Text>
          <Text size="xl" fw={800} mt="xs">
            {messStatus}
          </Text>
        </Paper>
        <Paper
          shadow="sm"
          radius="md"
          p="xl"
          withBorder
          style={{
            backgroundColor: "#e6fcf5",
            border: "1px solid #c3fae8",
            flex: 1,
          }}
        >
          <Text size="sm" tt="uppercase" fw={700} c="green.8">
            Remaining Balance
          </Text>
          <Text size="xl" fw={800} c="green.9" mt="xs">
            Rs. {totalBalance}
          </Text>
        </Paper>
      </Group>

      <Paper shadow="xs" radius="lg" withBorder style={{ overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr style={{ backgroundColor: "#f8f9fa" }}>
                <Table.Th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    color: "#1A2980",
                  }}
                >
                  Month
                </Table.Th>
                <Table.Th
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    color: "#1A2980",
                  }}
                >
                  Base (Rs.)
                </Table.Th>
                <Table.Th
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    color: "#1A2980",
                  }}
                >
                  Rebate Days
                </Table.Th>
                <Table.Th
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    color: "#1A2980",
                  }}
                >
                  Rebate (Rs.)
                </Table.Th>
                <Table.Th
                  style={{
                    padding: "16px",
                    textAlign: "center",
                    color: "#1A2980",
                  }}
                >
                  Final Bill (Rs.)
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {billData.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td p={16} fw={600}>
                    {row.month}
                  </Table.Td>
                  <Table.Td align="center" p={16}>
                    {row.baseAmount}
                  </Table.Td>
                  <Table.Td align="center" p={16}>
                    {row.rebateCount}
                  </Table.Td>
                  <Table.Td
                    align="center"
                    p={16}
                    style={{ color: "#2b8a3e", fontWeight: 500 }}
                  >
                    - {row.rebateAmount}
                  </Table.Td>
                  <Table.Td align="center" p={16} fw={700}>
                    {row.monthlyBill}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {billData.length === 0 && (
            <Flex justify="center" p="xl">
              <Text c="dimmed">No billing data available yet.</Text>
            </Flex>
          )}
        </div>

        <Group
          justify="flex-end"
          p="md"
          style={{ backgroundColor: "#f8f9fa", borderTop: "1px solid #f1f3f5" }}
        >
          <Button
            variant="light"
            color="blue"
            leftSection={<DownloadSimple size={16} />}
            radius="md"
            onClick={handleDownload}
            disabled={billData.length === 0}
          >
            Download Statement
          </Button>
        </Group>
      </Paper>
    </Container>
  );
}

export default MessBilling;
