/**
 * MealBookingHistory
 * Component to display meal booking history for a specific booking
 * 
 * Features:
 * - Shows all meal records with dates
 * - Displays meal breakdown (breakfast, lunch, dinner, etc.)
 * - Shows cost calculation
 * - Organized by date and visitor
 * - Visual meal type indicators
 */

import React from "react";
import {
  Paper,
  Stack,
  Group,
  Badge,
  Divider,
  Card,
  Grid,
  Alert,
  Table,
} from "@mantine/core";
import {
  IconToolsKitchen2,
  IconCoffee,
  IconCalendar,
  IconUser,
  IconCurrencyRupee,
  IconInfoCircle
} from "@tabler/icons-react";

const MEAL_TYPES = {
  morning_tea: { label: "Morning Tea", icon: <IconCoffee size={14} />, cost: 10, color: "orange" },
  breakfast: { label: "Breakfast", icon: <IconToolsKitchen2 size={14} />, cost: 50, color: "yellow" },
  lunch: { label: "Lunch", icon: <IconToolsKitchen2 size={14} />, cost: 100, color: "green" },
  eve_tea: { label: "Evening Tea", icon: <IconCoffee size={14} />, cost: 10, color: "orange" },
  dinner: { label: "Dinner", icon: <IconToolsKitchen2 size={14} />, cost: 100, color: "blue" }
};

function MealBookingHistory({ mealBookings = [], totalMealsCost = 0 }) {
  if (!mealBookings || mealBookings.length === 0) {
    return (
      <Alert 
        icon={<IconInfoCircle size={16} />} 
        color="blue"
        title="No Meal Bookings"
      >
        No meals have been booked for this reservation yet. Use the "Book Meals" button to add meal bookings.
      </Alert>
    );
  }

  // Group meal bookings by date
  const mealsByDate = mealBookings.reduce((acc, booking) => {
    const date = booking.meal_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {});

  const sortedDates = Object.keys(mealsByDate).sort();

  return (
    <Stack spacing="md">
      {/* Header */}
      <Group position="apart" mb="md">
        <div>
          <div style={{ fontWeight: 600, fontSize: '18px' }}>Meal Booking History</div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            All meals booked for this reservation
          </div>
        </div>
        <Group spacing="xs">
          <IconCurrencyRupee size={16} />
          <div style={{ fontWeight: 600, color: '#51cf66' }}>
            ₹{totalMealsCost}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Total</div>
        </Group>
      </Group>

      {/* Meal Records by Date */}
      {sortedDates.map((date) => (
        <Card key={date} p="md" withBorder>
          <Group mb="md" position="apart">
            <Group spacing="xs">
              <IconCalendar size={16} />
              <div style={{ fontWeight: 600 }}>{new Date(date).toLocaleDateString()}</div>
            </Group>
            <Badge variant="light" color="blue">
              {mealsByDate[date].reduce((total, booking) => total + booking.total_meals, 0)} meals
            </Badge>
          </Group>

          <Stack spacing="md">
            {mealsByDate[date].map((booking) => (
              <Paper key={booking.id} p="md" style={{ backgroundColor: "#f8f9fa" }}>
                <Group position="apart" mb="sm">
                  <Group spacing="xs">
                    <IconUser size={14} />
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{booking.visitor_name}</div>
                  </Group>
                  <Group spacing="xs">
                    <IconCurrencyRupee size={14} />
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#51cf66' }}>₹{booking.meal_cost}</div>
                  </Group>
                </Group>

                {/* Meal Breakdown */}
                <Grid gutter="xs">
                  {Object.keys(MEAL_TYPES).map((mealType) => {
                    const quantity = booking.meals[mealType];
                    if (quantity === 0) return null;

                    const meal = MEAL_TYPES[mealType];
                    return (
                      <Grid.Col span={6} key={mealType}>
                        <Group spacing="xs" position="apart">
                          <Group spacing="xs">
                            {meal.icon}
                            <div style={{ fontSize: '12px' }}>{meal.label}</div>
                          </Group>
                          <Group spacing="xs">
                            <Badge size="xs" color={meal.color} variant="light">
                              {quantity}x
                            </Badge>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              ₹{quantity * meal.cost}
                            </div>
                          </Group>
                        </Group>
                      </Grid.Col>
                    );
                  })}
                </Grid>
              </Paper>
            ))}
          </Stack>
        </Card>
      ))}

      {/* Summary */}
      <Paper p="md" style={{ backgroundColor: "#e7f5ff", border: "1px solid #339af0" }}>
        <Group position="apart">
          <div>
            <div style={{ fontWeight: 600, color: '#228be6' }}>Summary</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {mealBookings.length} meal record(s) across {sortedDates.length} day(s)
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 700, fontSize: '18px', color: '#228be6' }}>
              ₹{totalMealsCost}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Total Meal Cost
            </div>
          </div>
        </Group>
      </Paper>

      {/* Detailed Table View */}
      <details>
        <summary style={{ cursor: "pointer", padding: "8px 0" }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>
            View Detailed Breakdown
          </span>
        </summary>
        <Table striped highlightOnHover mt="md">
          <thead>
            <tr>
              <th>Date</th>
              <th>Visitor</th>
              <th>Morning Tea</th>
              <th>Breakfast</th>
              <th>Lunch</th>
              <th>Evening Tea</th>
              <th>Dinner</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {mealBookings.map((booking) => (
              <tr key={booking.id}>
                <td>{new Date(booking.meal_date).toLocaleDateString()}</td>
                <td>{booking.visitor_name}</td>
                <td>{booking.meals.morning_tea || "-"}</td>
                <td>{booking.meals.breakfast || "-"}</td>
                <td>{booking.meals.lunch || "-"}</td>
                <td>{booking.meals.eve_tea || "-"}</td>
                <td>{booking.meals.dinner || "-"}</td>
                <td>₹{booking.meal_cost}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </details>
    </Stack>
  );
}

export default MealBookingHistory;