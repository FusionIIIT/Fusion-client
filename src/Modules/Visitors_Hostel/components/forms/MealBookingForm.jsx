/**
 * MealBookingForm
 * Modal component for booking meals for guests during their stay
 * 
 * Features:
 * - UC-VH-010: Meal selection for morning tea, breakfast, lunch, evening tea, dinner
 * - BR-VH-011: Deadline validation (Lunch ≤ 09:00, Dinner ≤ 14:00)
 * - Real-time deadline checking
 * - Multiple meal selection
 * - Cost calculation
 * 
 * Only VhCaretaker and VhIncharge can book meals
 */

import React, { useState, useEffect } from "react";
import {
  Modal,
  Grid,
  Button,
  Group,
  Divider,
  Stack,
  Paper,
  Alert,
  NumberInput,
  Checkbox,
  Badge,
  Title,
} from "@mantine/core";
import { 
  IconCoffee, 
  IconToolsKitchen2, 
  IconClock, 
  IconCalendar,
  IconAlertCircle 
} from "@tabler/icons-react";

const MEAL_TYPES = {
  m_tea: { 
    label: "Morning Tea", 
    icon: <IconCoffee size={16} />, 
    cost: 10,
    deadline: "09:00",
    color: "orange"
  },
  breakfast: { 
    label: "Breakfast", 
    icon: <IconToolsKitchen2 size={16} />, 
    cost: 50,
    deadline: "09:00",
    color: "yellow"
  },
  lunch: { 
    label: "Lunch", 
    icon: <IconToolsKitchen2 size={16} />, 
    cost: 100,
    deadline: "09:00",
    color: "green"
  },
  eve_tea: { 
    label: "Evening Tea", 
    icon: <IconCoffee size={16} />, 
    cost: 10,
    deadline: "14:00",
    color: "orange"
  },
  dinner: { 
    label: "Dinner", 
    icon: <IconToolsKitchen2 size={16} />, 
    cost: 100,
    deadline: "14:00",
    color: "blue"
  }
};

function MealBookingForm({ opened, onClose, bookingData, onMealBooking }) {
  const [mealForm, setMealForm] = useState({
    m_tea: 0,
    breakfast: 0,
    lunch: 0,
    eve_tea: 0,
    dinner: 0,
    meal_type: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [deadlineWarnings, setDeadlineWarnings] = useState([]);

  const primaryVisitor = bookingData?.visitors?.[0] || {};

  // Update current time every minute for deadline checking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Check deadlines when form changes
  useEffect(() => {
    checkDeadlines();
  }, [mealForm, currentTime]);

  // Reset form when modal opens
  useEffect(() => {
    if (opened) {
      setMealForm({
        m_tea: 0,
        breakfast: 0,
        lunch: 0,
        eve_tea: 0,
        dinner: 0,
        meal_type: ""
      });
      setDeadlineWarnings([]);
    }
  }, [opened]);

  const checkDeadlines = () => {
    const warnings = [];
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTimeDecimal = currentHour + currentMinute / 60;

    // BR-VH-011: Check meal booking deadlines
    Object.keys(MEAL_TYPES).forEach(mealType => {
      if (mealForm[mealType] > 0) {
        const meal = MEAL_TYPES[mealType];
        const [deadlineHour, deadlineMinute] = meal.deadline.split(':').map(Number);
        const deadlineDecimal = deadlineHour + deadlineMinute / 60;

        if (currentTimeDecimal > deadlineDecimal) {
          warnings.push({
            meal: meal.label,
            deadline: meal.deadline,
            current: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
          });
        }
      }
    });

    setDeadlineWarnings(warnings);
  };

  const handleMealChange = (mealType, value) => {
    setMealForm(prev => ({
      ...prev,
      [mealType]: Math.max(0, Number(value || 0))
    }));
  };

  const handleQuickSelect = (mealType) => {
    // Quick select: toggle between 0 and number of visitors
    const visitorCount = bookingData?.visitors?.length || 1;
    const currentValue = mealForm[mealType];
    const newValue = currentValue === 0 ? visitorCount : 0;
    
    handleMealChange(mealType, newValue);
  };

  const calculateTotalCost = () => {
    return Object.keys(MEAL_TYPES).reduce((total, mealType) => {
      return total + (mealForm[mealType] * MEAL_TYPES[mealType].cost);
    }, 0);
  };

  const getTotalMeals = () => {
    return Object.keys(MEAL_TYPES).reduce((total, mealType) => {
      return total + mealForm[mealType];
    }, 0);
  };

  const handleSubmit = async () => {
    // Check if any meals are selected
    if (getTotalMeals() === 0) {
      return;
    }

    // Check for deadline violations
    if (deadlineWarnings.length > 0) {
      // Don't proceed if there are deadline violations
      return;
    }

    setIsProcessing(true);
    try {
      if (onMealBooking) {
        await onMealBooking({
          bookingId: bookingData.id,
          visitorId: primaryVisitor.id,
          ...mealForm
        });
        onClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingData) {
    return (
      <Modal opened={opened} onClose={onClose} title="Book Meals" size="lg">
        <Alert color="blue" icon={<IconAlertCircle size={16} />}>
          No booking data available
        </Alert>
      </Modal>
    );
  }

  const totalCost = calculateTotalCost();
  const totalMeals = getTotalMeals();
  const hasDeadlineViolations = deadlineWarnings.length > 0;

  return (
    <Modal opened={opened} onClose={onClose} title="Book Meals" size="lg" centered>
      <Stack spacing="md">
        {/* Header with Booking Info */}
        <Paper p="md" style={{ backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
          <Group position="apart" mb="sm">
            <div>
              <Title order={4}>Meal Booking</Title>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Booking #{bookingData.id} - {bookingData.intender_name}
              </div>
            </div>
            <Badge
              size="lg"
              color="green"
              variant="light"
              leftSection={<IconCalendar size={14} />}
            >
              {new Date().toLocaleDateString()}
            </Badge>
          </Group>
          
          <Group spacing="md">
            <div style={{ fontSize: '12px', color: '#666' }}>
              <IconClock size={12} style={{ marginRight: 4 }} />
              Current Time: {currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Visitors: {bookingData?.visitors?.length || 1}
            </div>
          </Group>
        </Paper>

        {/* BR-VH-011: Deadline Warnings */}
        {hasDeadlineViolations && (
          <Alert color="red" icon={<IconAlertCircle size={16} />} title="Deadline Violation">
            <Stack spacing="xs">
              {deadlineWarnings.map((warning, idx) => (
                <div key={idx} size="sm">
                  <strong>{warning.meal}</strong> deadline is {warning.deadline}, current time is {warning.current}
                </div>
              ))}
              <div size="sm" mt="xs" style={{ fontStyle: 'italic' }}>
                Please remove these meals or wait for the next booking window.
              </div>
            </Stack>
          </Alert>
        )}

        {/* Meal Selection */}
        <div>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>
            Select Meals (UC-VH-010)
          </div>
          
          <Grid gutter="md">
            {Object.keys(MEAL_TYPES).map((mealType) => {
              const meal = MEAL_TYPES[mealType];
              const isDeadlinePassed = deadlineWarnings.some(w => 
                w.meal === meal.label
              );
              
              return (
                <Grid.Col span={6} key={mealType}>
                  <Paper 
                    p="md" 
                    style={{ 
                      border: `1px solid ${isDeadlinePassed ? '#fa5252' : '#e9ecef'}`,
                      backgroundColor: isDeadlinePassed ? '#fff5f5' : 'white'
                    }}
                  >
                    <Group position="apart" mb="xs">
                      <Group spacing="xs">
                        {meal.icon}
                        <div style={{ fontWeight: 500, fontSize: '14px' }}>{meal.label}</div>
                      </Group>
                      <Badge size="xs" color={meal.color} variant="light">
                        ₹{meal.cost}
                      </Badge>
                    </Group>
                    
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                      Deadline: {meal.deadline} | 
                      <span 
                        style={{ 
                          marginLeft: '4px',
                          color: isDeadlinePassed ? '#fa5252' : '#51cf66',
                          fontSize: '12px'
                        }}
                      >
                        {isDeadlinePassed ? 'Deadline passed' : 'Available'}
                      </span>
                    </div>
                    
                    <Group spacing="xs">
                      <NumberInput
                        size="sm"
                        min={0}
                        max={10}
                        value={mealForm[mealType]}
                        onChange={(val) => handleMealChange(mealType, val)}
                        disabled={isProcessing || isDeadlinePassed}
                        style={{ flex: 1 }}
                        placeholder="Qty"
                      />
                      <Button
                        size="xs"
                        variant="light"
                        color={meal.color}
                        onClick={() => handleQuickSelect(mealType)}
                        disabled={isProcessing || isDeadlinePassed}
                      >
                        All
                      </Button>
                    </Group>
                    
                    {mealForm[mealType] > 0 && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                        Subtotal: ₹{mealForm[mealType] * meal.cost}
                      </div>
                    )}
                  </Paper>
                </Grid.Col>
              );
            })}
          </Grid>
        </div>

        {/* Cost Summary */}
        {totalMeals > 0 && (
          <>
            <Divider />
            <Paper p="md" style={{ backgroundColor: "#e7f5ff", borderRadius: "4px" }}>
              <Group position="apart">
                <div>
                  <div style={{ fontWeight: 600 }}>Order Summary</div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {totalMeals} meal(s) selected
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '18px', color: '#228be6' }}>
                    ₹{totalCost}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Total Amount
                  </div>
                </div>
              </Group>
            </Paper>
          </>
        )}

        {/* Deadline Info */}
        <Alert color="blue" icon={<IconClock size={16} />} title="BR-VH-011: Meal Booking Deadlines">
          <div style={{ fontSize: '14px' }}>
            • <strong>Breakfast & Lunch:</strong> Must be booked before 09:00 AM
          </div>
          <div style={{ fontSize: '14px' }}>
            • <strong>Dinner & Evening Tea:</strong> Must be booked before 2:00 PM
          </div>
          <div style={{ fontSize: '14px' }}>
            • <strong>Morning Tea:</strong> Must be booked before 09:00 AM
          </div>
        </Alert>

        {/* Actions */}
        <Group position="right" mt="xl">
          <Button 
            variant="default" 
            onClick={onClose} 
            disabled={isProcessing}
          >
            Cancel
          </Button>
          
          <Button
            color="blue"
            onClick={handleSubmit}
            disabled={totalMeals === 0 || hasDeadlineViolations}
            loading={isProcessing}
            leftIcon={<IconToolsKitchen2 size={16} />}
          >
            Book Meals (₹{totalCost})
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default MealBookingForm;