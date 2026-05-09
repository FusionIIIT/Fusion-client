/**
 * ReportsTab.jsx
 * =========================================================================
 * PHC-UC-13: Generate System Reports
 * Displays visualizations and aggregated tables for:
 * 1. Patient Demographics
 * 2. Consultations volume over time
 * 3. Inventory consumption
 * 4. Disease Patterns
 * =========================================================================
 */
import { useState, useEffect } from 'react';
import {
  Stack, Group, Card, Text, Title, Badge, NumberInput, Select,
  Loader, Center, Alert, RingProgress, Table,
  ScrollArea, SimpleGrid, Grid,
  TextInput, Button, Divider
} from '@mantine/core';
import {
  IconChartBar, IconAlertTriangle, IconUser, IconPill,
  IconStethoscope, IconCalendar, IconFilter
} from '@tabler/icons-react';
import * as api from '../api';

export default function ReportsTab() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [data, setData]       = useState(null);

  // Default to past 30 days
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.generateSystemReport(startDate, endDate);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && !data) return <Center py="xl"><Loader /></Center>;
  if (error) return <Alert icon={<IconAlertTriangle />} color="red">{error}</Alert>;
  if (!data) return null;

  // Render Helpers
  const demographicsColors = ['blue', 'teal', 'grape', 'orange', 'cyan', 'pink'];
  const totalDemo = Object.values(data.metrics.demographics).reduce((a, b) => a + b, 0);

  const rings = Object.entries(data.metrics.demographics).map(([key, val], idx) => ({
    value: totalDemo === 0 ? 0 : (val / totalDemo) * 100,
    color: demographicsColors[idx % demographicsColors.length],
    tooltip: `${key}: ${val}`,
    label: key
  }));

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <Stack gap="xs">
          <Title order={3}>System Utilization Reports</Title>
          <Text size="sm" c="dimmed">
            Aggregated metrics for health center engagement and stock consumption.
          </Text>
        </Stack>
        
        <Group>
          <TextInput
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.currentTarget.value)}
          />
          <TextInput
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.currentTarget.value)}
          />
          <Button
            leftSection={<IconFilter size={16} />}
            onClick={generateReport}
            loading={loading}
            style={{ alignSelf: 'flex-end' }}
          >
            Apply Dates
          </Button>
        </Group>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        <Card withBorder p="xl" radius="md">
          <Group gap="sm">
            <IconStethoscope size={30} color="var(--mantine-color-blue-6)" />
            <div>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Total Consultations</Text>
              <Text fw={700} size="xl">{data.metrics.total_visits}</Text>
            </div>
          </Group>
        </Card>
        
        <Card withBorder p="xl" radius="md">
          <Group gap="sm">
            <IconCalendar size={30} color="var(--mantine-color-teal-6)" />
            <div>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Report Period</Text>
              <Text fw={700} size="xl">{data.period.days} Days</Text>
            </div>
          </Group>
        </Card>

        <Card withBorder p="xl" radius="md">
          <Group gap="sm">
            <IconPill size={30} color="var(--mantine-color-orange-6)" />
            <div>
              <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Unique Meds Dispensed</Text>
              <Text fw={700} size="xl">{data.inventory_consumption.length}</Text>
            </div>
          </Group>
        </Card>
      </SimpleGrid>

      <Grid gutter="md">
        {/* Demographics */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Card withBorder h="100%" radius="md">
            <Title order={5} mb="lg">Patient Demographics</Title>
            {totalDemo > 0 ? (
              <Center mt="md">
                <Stack align="center" gap="sm">
                  <RingProgress
                    size={180}
                    thickness={16}
                    roundCaps
                    sections={rings.map(({ value, color, tooltip }) => ({ value, color, tooltip }))}
                    label={
                      <Text c="dimmed" ta="center" size="sm" fw={700}>
                        {totalDemo}<br />Visits
                      </Text>
                    }
                  />
                  <Group justify="center" gap="md" mt="sm">
                    {rings.map((r, i) => (
                      <Badge key={i} color={r.color} variant="dot">
                        {r.label}
                      </Badge>
                    ))}
                  </Group>
                </Stack>
              </Center>
            ) : (
              <Center h={200}><Text c="dimmed">No data for selected period</Text></Center>
            )}
          </Card>
        </Grid.Col>

        {/* Disease Patterns */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Card withBorder h="100%" radius="md">
            <Title order={5} mb="xl">Common Diagnoses</Title>
            {data.disease_patterns.length > 0 ? (
              <ScrollArea><Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Disease / Diagnosis</Table.Th>
                    <Table.Th style={{ textAlign: 'right' }}>Occurrences</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.disease_patterns.map((item, idx) => (
                    <Table.Tr key={idx}>
                      <Table.Td>{item.disease}</Table.Td>
                      <Table.Td style={{ textAlign: 'right' }}>{item.count}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table></ScrollArea>
            ) : (
              <Center h={200}><Text c="dimmed">No diagnosis data</Text></Center>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      {/* Inventory Consumption */}
      <Card withBorder radius="md">
        <Title order={5} mb="xl">Top Inventory Consumption</Title>
        {data.inventory_consumption.length > 0 ? (
          <ScrollArea><Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Medicine Name</Table.Th>
                <Table.Th style={{ textAlign: 'right' }}>Total Units Dispensed</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.inventory_consumption.map((item, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td>
                    <Group gap="xs">
                      <IconPill size={16} color="var(--mantine-color-blue-6)" />
                      <Text fw={500}>{item.medicine_name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Badge size="lg" variant="light" color="blue">
                      {item.total_dispensed}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table></ScrollArea>
        ) : (
          <Center py="xl"><Text c="dimmed">No consumption data for this period.</Text></Center>
        )}
      </Card>
    </Stack>
  );
}
