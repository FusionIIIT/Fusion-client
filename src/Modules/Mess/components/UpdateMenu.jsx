import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Flex,
  Group,
  Loader,
  SegmentedControl,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import { viewMenuRoute } from "../routes";

const DAYS = [
  { label: "Monday", code: "M" },
  { label: "Tuesday", code: "T" },
  { label: "Wednesday", code: "W" },
  { label: "Thursday", code: "TH" },
  { label: "Friday", code: "F" },
  { label: "Saturday", code: "S" },
  { label: "Sunday", code: "SU" },
];

const MEALS = [
  { label: "Breakfast", code: "B" },
  { label: "Lunch", code: "L" },
  { label: "Dinner", code: "D" },
];

const createEmptyMenu = () =>
  DAYS.reduce((acc, day) => {
    acc[day.label] = { Breakfast: "", Lunch: "", Dinner: "" };
    return acc;
  }, {});

function mapApiMenuToTable(menuData, messOption) {
  const table = createEmptyMenu();
  menuData
    .filter((item) => item.mess_option === messOption)
    .forEach((item) => {
      const dayCode = item.meal_time.slice(0, item.meal_time.length - 1);
      const mealCode = item.meal_time.slice(-1);
      const day = DAYS.find((entry) => entry.code === dayCode)?.label;
      const meal = MEALS.find((entry) => entry.code === mealCode)?.label;
      if (day && meal) {
        table[day][meal] = item.dish;
      }
    });
  return table;
}

function UpdateMenu() {
  const [activeMess, setActiveMess] = useState("mess1");
  const [menuData, setMenuData] = useState([]);
  const [drafts, setDrafts] = useState({
    mess1: createEmptyMenu(),
    mess2: createEmptyMenu(),
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(viewMenuRoute, {
          headers: { Authorization: `Token ${token}` },
        });
        const payload = response.data.payload || [];
        setMenuData(payload);
        setDrafts({
          mess1: mapApiMenuToTable(payload, "mess1"),
          mess2: mapApiMenuToTable(payload, "mess2"),
        });
      } catch (err) {
        setError(
          err.response?.data?.error || "Unable to load the current menu.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const currentDraft = useMemo(() => drafts[activeMess], [drafts, activeMess]);

  const handleChange = (day, meal, value) => {
    setDrafts((prev) => ({
      ...prev,
      [activeMess]: {
        ...prev[activeMess],
        [day]: {
          ...prev[activeMess][day],
          [meal]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      const token = localStorage.getItem("authToken");
      const entries = DAYS.flatMap((day) =>
        MEALS.map((meal) => ({
          meal_time: `${day.code}${meal.code}`,
          dish: drafts[activeMess][day.label][meal.label] || "-",
        })),
      );

      const response = await axios.put(
        viewMenuRoute,
        {
          mess_option: activeMess,
          entries,
        },
        {
          headers: { Authorization: `Token ${token}` },
        },
      );

      setMenuData(response.data.payload || menuData);
      notifications.show({
        title: "Menu Updated",
        message:
          response.data.message || "The weekly menu was saved successfully.",
        color: "green",
        icon: <CheckCircle size={18} />,
      });
    } catch (err) {
      const message =
        err.response?.data?.message || "Unable to save menu changes.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" p="xl">
        <Loader />
      </Flex>
    );
  }

  return (
    <Card shadow="sm" radius="lg" p="xl" withBorder>
      <Flex justify="space-between" align="center" wrap="wrap" gap="md" mb="lg">
        <Box>
          <Title order={3} c="#1c7ed6">
            Update Weekly Menu
          </Title>
          <Text c="dimmed" size="sm">
            Edit dishes for each meal slot and publish them live.
          </Text>
        </Box>
        <SegmentedControl
          value={activeMess}
          onChange={setActiveMess}
          data={[
            { label: "Central Mess 1", value: "mess1" },
            { label: "Central Mess 2", value: "mess2" },
          ]}
        />
      </Flex>

      {error && (
        <Alert color="red" icon={<WarningCircle size={18} />} mb="lg">
          {error}
        </Alert>
      )}

      <div style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Day</Table.Th>
              <Table.Th>Breakfast</Table.Th>
              <Table.Th>Lunch</Table.Th>
              <Table.Th>Dinner</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {DAYS.map((day) => (
              <Table.Tr key={day.label}>
                <Table.Td fw={600}>{day.label}</Table.Td>
                {MEALS.map((meal) => (
                  <Table.Td key={`${day.label}-${meal.label}`}>
                    <TextInput
                      value={currentDraft[day.label][meal.label]}
                      onChange={(event) =>
                        handleChange(
                          day.label,
                          meal.label,
                          event.currentTarget.value,
                        )
                      }
                      placeholder={`Enter ${meal.label.toLowerCase()} dish`}
                    />
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>

      <Group justify="flex-end" mt="lg">
        <Button onClick={handleSave} loading={saving}>
          Save Menu
        </Button>
      </Group>
    </Card>
  );
}

export default UpdateMenu;
