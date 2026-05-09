import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Container,
  Title,
  Flex,
  Loader,
  Alert,
  SegmentedControl,
  Text,
  Badge,
  Card,
  Group,
  Box,
} from "@mantine/core";
import {
  CalendarBlank,
  Coffee,
  Hamburger,
  BowlFood,
  WarningCircle,
} from "@phosphor-icons/react";
import { viewMenuRoute } from "../routes";

function ViewMenu() {
  const [currentMess, setCurrentMess] = useState("mess1");
  const [menuData, setMenuData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch menu data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("Authentication token not found.");
          return;
        }

        const response = await axios.get(viewMenuRoute, {
          headers: {
            Authorization: `Token ${token}`, // Pass the token in the Authorization header
          },
        });

        console.log("API Response Data:", response.data); // Debugging log to check data
        setMenuData(response.data.payload); // Assuming your response data is wrapped in "payload"
      } catch (errors) {
        setError("Error fetching menu data.");
        console.error("Error fetching menu data:", errors);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Empty array to run once when component mounts

  const parseMealTime = (mealTime) => {
    const mealMapping = {
      B: "Breakfast",
      L: "Lunch",
      D: "Dinner",
    };

    const dayMapping = {
      M: "Monday",
      T: "Tuesday",
      W: "Wednesday",
      TH: "Thursday",
      F: "Friday",
      S: "Saturday",
      SU: "Sunday",
    };

    const dayCode = mealTime.slice(0, mealTime.length - 1);
    const mealCode = mealTime[mealTime.length - 1];
    const day = dayMapping[dayCode];
    const meal = mealMapping[mealCode];

    return { day, meal };
  };

  // Filter menu data by current mess option and group meals by day
  const filterMenuData = (messOption) => {
    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const groupedMenuData = {};

    // Initialize the structure with all days and meals
    daysOfWeek.forEach((day) => {
      groupedMenuData[day] = {
        Breakfast: "N/A",
        Lunch: "N/A",
        Dinner: "N/A",
      };
    });

    // Populate the grouped data based on the API response
    menuData.forEach((item) => {
      if (item.mess_option === messOption) {
        const { day, meal } = parseMealTime(item.meal_time);
        if (day && meal && groupedMenuData[day]) {
          groupedMenuData[day][meal] = item.dish;
        }
      }
    });

    // Convert grouped data into an array for rendering
    return daysOfWeek.map((day) => ({
      day,
      breakfast: groupedMenuData[day].Breakfast,
      lunch: groupedMenuData[day].Lunch,
      dinner: groupedMenuData[day].Dinner,
    }));
  };

  const rows = filterMenuData(currentMess);

  // Render table headers
  const renderHeader = () => {
    return (
      <Table.Tr>
        <Table.Th
          style={{
            textAlign: "left",
            padding: "16px",
            backgroundColor: "#f8f9fa",
            borderTopLeftRadius: "12px",
          }}
        >
          <Group gap="xs">
            <CalendarBlank size={20} color="#1A2980" weight="duotone" />
            <Text fw={700} c="#1A2980">
              Day
            </Text>
          </Group>
        </Table.Th>
        <Table.Th
          style={{
            textAlign: "center",
            padding: "16px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Group gap="xs" justify="center">
            <Coffee size={20} color="#e67e22" weight="duotone" />
            <Text fw={700} c="#e67e22">
              Breakfast
            </Text>
          </Group>
        </Table.Th>
        <Table.Th
          style={{
            textAlign: "center",
            padding: "16px",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Group gap="xs" justify="center">
            <Hamburger size={20} color="#d35400" weight="duotone" />
            <Text fw={700} c="#d35400">
              Lunch
            </Text>
          </Group>
        </Table.Th>
        <Table.Th
          style={{
            textAlign: "center",
            padding: "16px",
            backgroundColor: "#f8f9fa",
            borderTopRightRadius: "12px",
          }}
        >
          <Group gap="xs" justify="center">
            <BowlFood size={20} color="#c0392b" weight="duotone" />
            <Text fw={700} c="#c0392b">
              Dinner
            </Text>
          </Group>
        </Table.Th>
      </Table.Tr>
    );
  };

  const getDayColor = (day) => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    return day === today ? "blue" : "gray";
  };

  // Render table rows
  const renderRows = () =>
    rows.map((item, index) => (
      <Table.Tr
        key={index}
        style={{
          borderBottom: "1px solid #f1f3f5",
          transition: "background-color 0.2s",
        }}
      >
        <Table.Td p={16}>
          <Badge
            variant={getDayColor(item.day) === "blue" ? "filled" : "light"}
            color={getDayColor(item.day)}
            size="lg"
            radius="md"
          >
            {item.day}
          </Badge>
        </Table.Td>
        <Table.Td align="center" p={16}>
          <Text
            size="sm"
            fw={500}
            color={item.breakfast === "N/A" ? "dimmed" : "dark"}
          >
            {item.breakfast}
          </Text>
        </Table.Td>
        <Table.Td align="center" p={16}>
          <Text
            size="sm"
            fw={500}
            color={item.lunch === "N/A" ? "dimmed" : "dark"}
          >
            {item.lunch}
          </Text>
        </Table.Td>
        <Table.Td align="center" p={16}>
          <Text
            size="sm"
            fw={500}
            color={item.dinner === "N/A" ? "dimmed" : "dark"}
          >
            {item.dinner}
          </Text>
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Container fluid px={0}>
      {/* Error and Loading State */}
      {loading ? (
        <Flex justify="center" align="center" style={{ minHeight: "300px" }}>
          <Loader size="xl" variant="bars" color="blue" />
        </Flex>
      ) : error ? (
        <Alert
          icon={<WarningCircle size={24} />}
          color="red"
          title="Oops, something went wrong"
          variant="filled"
          radius="md"
        >
          {error}
        </Alert>
      ) : (
        <Card
          shadow="sm"
          radius="lg"
          p="0"
          withBorder
          style={{ overflow: "hidden" }}
        >
          <Box p="xl" style={{ backgroundColor: "#ffffff" }}>
            <Flex
              direction={{ base: "column", sm: "row" }}
              justify="space-between"
              align="center"
              mb="lg"
            >
              <Box>
                <Title order={3} fw={800} style={{ color: "#1A2980" }}>
                  Weekly Mess Menu
                </Title>
                <Text size="sm" c="dimmed" mt={4}>
                  View the meal schedule assigned for the ongoing week
                </Text>
              </Box>

              <SegmentedControl
                value={currentMess}
                onChange={setCurrentMess}
                data={[
                  { label: "Central Mess 1", value: "mess1" },
                  { label: "Central Mess 2", value: "mess2" },
                ]}
                size="md"
                radius="xl"
                color="blue"
                bg="gray.1"
                mt={{ base: "md", sm: 0 }}
                styles={{
                  label: { padding: "8px 24px", fontWeight: 600 },
                }}
              />
            </Flex>

            <Box style={{ overflowX: "auto" }}>
              <Table
                verticalSpacing="md"
                horizontalSpacing="xl"
                style={{ minWidth: "800px" }}
              >
                <Table.Thead>{renderHeader()}</Table.Thead>
                <Table.Tbody>{renderRows()}</Table.Tbody>
              </Table>
            </Box>
          </Box>
        </Card>
      )}
    </Container>
  );
}

export default ViewMenu;
