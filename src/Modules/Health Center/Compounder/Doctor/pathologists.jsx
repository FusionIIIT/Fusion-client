import { useEffect, useState } from "react";
import { Button, Flex, Paper, Table, Text, Title } from "@mantine/core";
import axios from "axios";
import NavCom from "../NavCom";
import Changenav from "./changenav";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";
import { compounderRoute } from "../../../../routes/health_center";

export default function PathDoc() {
  const handlePrint = () => {
    window.print();
  };

  // eslint-disable-next-line no-unused-vars
  const [pathologists, setPathologists] = useState([]);
  const fetchPathologists = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.post(
        compounderRoute,
        { get_pathologists: 1 },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      console.log(response);
      setPathologists(response.data.pathologists);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPathologists();
  }, []);

  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <Changenav />
      <br />
      <Paper shadow="xl" p="xl" withBorder>
        <Flex display="flex" justify="space-between">
          <Title order={4} style={{ color: "#15abff" }}>
            Pathologist's List
          </Title>
          <Button
            onClick={handlePrint}
            style={{ float: "right", backgroundColor: "#15abff" }}
          >
            Download
          </Button>
        </Flex>

        {pathologists.map((element, index) => (
          <Table mt="lg" mb="lg" key={index} withBorder withColumnBorders>
            <Table.Tr>
              <Table.Td style={{ backgroundColor: "#f0f0f0" }}>
                <Text fw={700}>Pathologist</Text>
              </Table.Td>
              <Table.Td>
                <Text>{element.pathologist_name}</Text>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td style={{ backgroundColor: "#f0f0f0" }}>
                <Text fw={700}>Specialization</Text>
              </Table.Td>
              <Table.Td>
                <Text>{element.specialization}</Text>
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td style={{ backgroundColor: "#f0f0f0" }}>
                <Text fw={700}>Phone Number</Text>
              </Table.Td>
              <Table.Td>
                <Text>{element.pathologist_phone}</Text>
              </Table.Td>
            </Table.Tr>
          </Table>
        ))}
      </Paper>
    </>
  );
}
