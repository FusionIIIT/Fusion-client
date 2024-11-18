import React, { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Title,
  Space,
  Box,
  Table,
  Flex,
} from "@mantine/core";
import axios from "axios";
import { host } from "../../../routes/globalRoutes";
import { fetchUpdateBalanceRequestStatusRoute } from "../routes";

const token = localStorage.getItem("authToken");

const axiosInstance = axios.create({
  baseURL: fetchUpdateBalanceRequestStatusRoute,
  headers: {
    Authorization: `Token ${token}`,
  },
});

export const fetchUpdateBalanceRequestsStatus = async () => {
  try {
    const response = await axiosInstance.get("/");
    return response.data.payload;
  } catch (error) {
    console.error("Error fetching update payment request status:", error);
    throw error;
  }
};

function UpdateBalanceRequestStatus() {
  const [balanceRequests, setBalanceRequests] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchUpdateBalanceRequestsStatus();
        setBalanceRequests(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const renderHeader = () => (
    <Table.Tr>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Transaction Number
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Image
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Amount
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Remark
        </Flex>
      </Table.Th>
      <Table.Th>
        <Flex align="center" justify="center" h="100%">
          Status
        </Flex>
      </Table.Th>
    </Table.Tr>
  );

  const renderRows = () =>
    balanceRequests.map((item, index) => (
      <Table.Tr key={index} style={{ height: "60px" }}>
        {" "}
        {/* Increase row height */}
        <Table.Td align="center" p={12}>
          {" "}
          {/* Increase cell padding */}
          {item.Txn_no}
        </Table.Td>
        <Table.Td align="center" p={12}>
          <a
            href={`${host}${item.img}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Image
          </a>
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.amount}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.update_remark}
        </Table.Td>
        <Table.Td align="center" p={12}>
          <Box
            display="inline-block"
            p={8}
            fz={14}
            fw={600}
            bg={item.status === "Accepted" ? "#40C057" : "transparent"}
            bd={
              item.status === "Accepted"
                ? "1.5px solid #40C057"
                : item.status === "Pending"
                  ? "1.5px solid grey"
                  : "1.5px solid red"
            }
            c={
              item.status === "Accepted"
                ? "white"
                : item.status === "Pending"
                  ? "grey"
                  : "red"
            }
            style={{ borderRadius: "4px" }}
          >
            {item.status}
          </Box>
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Container size="lg" style={{ marginTop: "25px" }}>
      <Paper shadow="md" radius="md" p="lg" withBorder>
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Request Status
        </Title>

        {/* FusionTable */}
        <Table striped highlightOnHover withBorder withColumnBorders>
          <Table.Thead>{renderHeader()}</Table.Thead>
          <Table.Tbody>{renderRows()}</Table.Tbody>
        </Table>
      </Paper>
      <Space h="xl" />
    </Container>
  );
}

export default UpdateBalanceRequestStatus;
