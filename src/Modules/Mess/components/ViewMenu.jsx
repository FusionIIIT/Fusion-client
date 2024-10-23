import React, { useState } from "react";
import {
  Table,
  Container,
  Paper,
  Title,
  Button,
  Flex,
  Divider,
} from "@mantine/core";

const mess1Rows = [
  {
    day: "Monday",
    breakfast: "Poha Jalebi Sev, Chopped Onion, Lemon, Sprouts.",
    lunch: "Lauki Chana sabji, Plain Roti, Plain Rice, Curd, Arhar dal.",
    dinner: "Veg Kofta, Plain Roti, Dal Makhani, Plain Rice, Boondi.",
  },
  {
    day: "Tuesday",
    breakfast: "Medu Vada, Coconut Chutney, Sambhar, Chana & Sprouts.",
    lunch: "Rajma, Plain Rice, Plain Paratha, Papad, Aalu-Mutter sabji, Curd.",
    dinner: "Mix Veg, Masoor Dal, Jeera Rice, Chapati, Sooji Halwa/Custard.",
  },
  {
    day: "Wednesday",
    breakfast: "Idli, Coconut Chutney, Sambhar, Sprouts, Boiled Egg.",
    lunch: "Chole, Plain Rice, Roti, Palak Paneer, Curd, Papad.",
    dinner: "Aloo Gobi, Dal Tadka, Jeera Rice, Roti, Custard.",
  },
  {
    day: "Thursday",
    breakfast: "Aloo Paratha, Curd, Pickle, Sprouts.",
    lunch: "Mix Veg, Rice, Chapati, Yellow Dal, Papad, Curd.",
    dinner: "Kadhi Pakoda, Plain Rice, Chapati, Boondi Raita.",
  },
  {
    day: "Friday",
    breakfast: "Uttapam, Coconut Chutney, Sambhar, Sprouts.",
    lunch: "Paneer Butter Masala, Rice, Chapati, Curd, Papad.",
    dinner: "Aloo Bengan, Dal Fry, Jeera Rice, Chapati, Kheer.",
  },
  {
    day: "Saturday",
    breakfast: "Pav Bhaji, Chopped Onion, Lemon, Sprouts.",
    lunch: "Chana Dal, Plain Rice, Roti, Aloo Tamatar, Curd.",
    dinner: "Kofta Curry, Dal Makhani, Jeera Rice, Chapati, Rasgulla.",
  },
  {
    day: "Sunday",
    breakfast: "Chole Bhature, Pickle, Sprouts.",
    lunch: "Aloo Capsicum, Dal Fry, Plain Rice, Chapati, Papad, Curd.",
    dinner: "Paneer Tikka Masala, Jeera Rice, Chapati, Ice Cream.",
  },
];

const mess2Rows = [
  {
    day: "Monday",
    breakfast: "Upma, Coconut Chutney, Boiled Egg, Sprouts.",
    lunch: "Bhindi Fry, Roti, Plain Rice, Dal Fry, Curd.",
    dinner: "Shahi Paneer, Plain Roti, Plain Rice, Moong Dal, Kheer.",
  },
  {
    day: "Tuesday",
    breakfast: "Dosa, Coconut Chutney, Sambhar, Sprouts.",
    lunch: "Rajma, Plain Rice, Roti, Papad, Aloo Methi, Curd.",
    dinner: "Paneer Butter Masala, Jeera Rice, Chapati, Gulab Jamun.",
  },
  {
    day: "Wednesday",
    breakfast: "Poha, Jalebi, Sev, Sprouts.",
    lunch: "Aloo Gobi, Chapati, Plain Rice, Yellow Dal, Curd.",
    dinner: "Veg Kofta, Jeera Rice, Roti, Dal Tadka, Custard.",
  },
  {
    day: "Thursday",
    breakfast: "Idli, Coconut Chutney, Sambhar, Sprouts.",
    lunch: "Mix Veg, Roti, Plain Rice, Chana Dal, Curd.",
    dinner: "Kadhi Pakoda, Plain Rice, Roti, Boondi Raita, Rasgulla.",
  },
  {
    day: "Friday",
    breakfast: "Paratha, Pickle, Curd, Sprouts.",
    lunch: "Chole, Roti, Plain Rice, Rajma, Curd.",
    dinner: "Paneer Tikka, Jeera Rice, Chapati, Dal Makhani, Kheer.",
  },
  {
    day: "Saturday",
    breakfast: "Pav Bhaji, Sprouts.",
    lunch: "Aloo Matar, Chapati, Plain Rice, Dal Tadka, Curd.",
    dinner: "Kofta Curry, Plain Rice, Chapati, Masoor Dal, Gulab Jamun.",
  },
  {
    day: "Sunday",
    breakfast: "Chole Bhature, Pickle, Sprouts.",
    lunch: "Aloo Capsicum, Roti, Plain Rice, Moong Dal, Curd.",
    dinner: "Paneer Butter Masala, Jeera Rice, Chapati, Ice Cream.",
  },
];

// Table headers for Mess menu
const tableHeaders = ["Day", "Breakfast", "Lunch", "Dinner"];

// Main component
function ViewMenu() {
  const [currentMess, setCurrentMess] = useState("mess1");
  const rows = currentMess === "mess1" ? mess1Rows : mess2Rows;

  const renderHeader = (titles) => {
    return titles.map((title, index) => (
      <Table.Th key={index}>
        <Flex align="center" justify="center" h="100%">
          {title}
        </Flex>
      </Table.Th>
    ));
  };

  // Function to render table rows
  const renderRows = () =>
    rows.map((item, index) => (
      <Table.Tr key={index} h={60}>
        <Table.Td align="center" p={12}>
          {item.day}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.breakfast}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.lunch}
        </Table.Td>
        <Table.Td align="center" p={12}>
          {item.dinner}
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Container
      size="lg"
      mt={30}
      miw="70rem"
      style={{
        maxWidth: "950px",
        width: "950px",
        marginTop: "25px",
      }}
    >
      <Paper shadow="lg" radius="lg" p="xl" withBorder>
        <Title order={2} align="center" mb="lg" c="#1c7ed6">
          Weekly Mess Menu
        </Title>
        <Divider my="lg" />
        <Flex justify="center" mb="lg" gap="md">
          <Button
            variant={currentMess === "mess1" ? "filled" : "outline"}
            size="md"
            radius="md"
            onClick={() => setCurrentMess("mess1")}
            color={currentMess === "mess1" ? "blue" : "gray"}
            fullWidth
          >
            Mess 1
          </Button>
          <Button
            variant={currentMess === "mess2" ? "filled" : "outline"}
            size="md"
            radius="md"
            onClick={() => setCurrentMess("mess2")}
            color={currentMess === "mess2" ? "blue" : "gray"}
            fullWidth
          >
            Mess 2
          </Button>
        </Flex>

        {/* Table */}
        <Table
          striped
          highlightOnHover
          withColumnBorders
          horizontalSpacing="xl"
        >
          <Table.Thead>
            <Table.Tr>{renderHeader(tableHeaders)}</Table.Tr>
          </Table.Thead>
          <Table.Tbody>{renderRows()}</Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

export default ViewMenu;
