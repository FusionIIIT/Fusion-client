import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  Title,
  Text,
  Center,
  Loader,
  ScrollArea,
  Container,
  Box,
  Divider,
} from "@mantine/core";
import NavCom from "../NavCom";
import AnnounceNavBar from "./announPath";
import CustomBreadcrumbs from "../../components/common/Breadcrumbs";
import { getAnnouncementsApi } from "../../services/api";

function Record() {
  const [test, StateTest] = useState({ announcements: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const get_announcement = async () => {
      try {
        setLoading(true);
        const response = await getAnnouncementsApi();
        StateTest({ announcements: response.data || [] });
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    get_announcement();
  }, []);

  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <AnnounceNavBar />
      <br />
      <Container size="lg">
        <Paper
          p="xl"
          shadow="lg"
          withBorder
          radius="md"
          style={{ backgroundColor: "white" }}
        >
          <Box mb="md">
            <Title
              order={3}
              align="center"
              style={{ color: "#15abff", fontWeight: 600 }}
            >
              Announcements Record
            </Title>
            <Divider my="md" />
          </Box>

          {loading ? (
            <Center style={{ padding: "4rem" }}>
              <Loader size="lg" color="#15abff" variant="dots" />
            </Center>
          ) : test.announcements.length > 0 ? (
            <ScrollArea h={400}>
              <Table
                striped
                highlightOnHover
                withTableBorder
                withColumnBorders
                verticalSpacing="sm"
                horizontalSpacing="md"
              >
                <Table.Thead style={{ backgroundColor: "#E3F4FF" }}>
                  <Table.Tr>
                    <Table.Th style={{ textAlign: "center", color: "#0a74c0" }}>
                      Announcement Details
                    </Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {test.announcements.map((element, index) => (
                    <Table.Tr key={index}>
                      <Table.Td
                        style={{ textAlign: "center", fontSize: "15px" }}
                      >
                        {element.message}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          ) : (
            <Center style={{ padding: "3rem" }}>
              <Text size="lg" fw={500} color="dimmed">
                No announcements found
              </Text>
            </Center>
          )}
        </Paper>
      </Container>
    </>
  );
}

export default Record;
