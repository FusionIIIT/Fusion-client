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
import { updateBalanceRequestStatusRoute } from "../routes";

const token = localStorage.getItem("authToken");

const axiosInstance = axios.create({
  baseURL: updateBalanceRequestStatusRoute,
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

function UpdateBalanceRequest() {
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
            bg={item.status === "accept" ? "#40C057" : "transparent"}
            bd={
              item.status === "accept"
                ? "1.5px solid #40C057"
                : item.status === "pending"
                  ? "1.5px solid grey"
                  : "1.5px solid red"
            }
            c={
              item.status === "accept"
                ? "white"
                : item.status === "pending"
                  ? "grey"
                  : "red"
            }
            style={{ borderRadius: "4px" }}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}{" "}
          </Box>
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Container
      size="xl"
      style={{
        width: "100%", // Ensure it takes full width but respects min width
        display: "flex", // Use flexbox to center the content
        justifyContent: "center", // Horizontally centers the content
        marginTop: "25px",
      }}
    >
      <Paper
        shadow="md"
        radius="md"
        p="xl"
        withBorder
        style={{
          minWidth: "75rem", // Set the minimum width to 75rem
          width: "100%", // Ensure it is responsive
          padding: "30px",
          margin: "auto", // Center the Paper component
        }}
      >
        <Title order={2} align="center" mb="lg" style={{ color: "#1c7ed6" }}>
          Update Balance Request
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

export default UpdateBalanceRequest;
