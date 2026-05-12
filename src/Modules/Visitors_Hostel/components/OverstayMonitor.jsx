/**
 * OverstayMonitor
 * BR-VH-018: Automated Overstay Detection & Alert Component
 * 
 * This component provides automated monitoring for overstays and can be
 * embedded in dashboard or as a standalone monitoring service.
 * 
 * Features:
 * - Automatic periodic overstay checks
 * - Real-time notification badges
 * - Quick action buttons for staff
 * - Configurable monitoring intervals
 */

import React, { useState, useEffect } from "react";
import {
  Badge,
  Group,
  ActionIcon,
  Tooltip,
  Alert,
  Text,
  Button,
  Stack,
  Card,
  Indicator,
  Switch,
  NumberInput,
} from "@mantine/core";
import { 
  IconBell, 
  IconAlertTriangle, 
  IconSettings,
  IconRefresh,
  IconClock,
  IconEye,
  IconBellRinging
} from "@tabler/icons-react";
import { useSelector } from "react-redux";
import { bookingsAPI } from "../services/visitorHostelApi";

function OverstayMonitor({ onViewOverstays, compact = false, autoStart = true }) {
  const [overstayData, setOverstayData] = useState({ 
    overstayCount: 0, 
    criticalOverstays: 0,
    lastCheck: null 
  });
  const [isMonitoring, setIsMonitoring] = useState(autoStart);
  const [checkInterval, setCheckInterval] = useState(15); // minutes
  const [loading, setLoading] = useState(false);
  const [alertResults, setAlertResults] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const role = useSelector((state) => state.user?.role);
  const isStaff = role === "VhIncharge" || role === "VhCaretaker";

  useEffect(() => {
    let intervalId;
    
    if (isMonitoring && isStaff) {
      // Initial check
      checkOverstays();
      
      // Set up periodic monitoring
      intervalId = setInterval(checkOverstays, checkInterval * 60 * 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isMonitoring, checkInterval, isStaff]);

  const checkOverstays = async () => {
    if (!isStaff) return;
    
    try {
      const response = await bookingsAPI.detectOverstays();
      if (response.success) {
        setOverstayData({
          overstayCount: response.overstay_count || 0,
          criticalOverstays: response.critical_overstays || 0,
          lastCheck: new Date().toLocaleTimeString(),
          overstays: response.overstays || []
        });
      }
    } catch (err) {
      console.error("Failed to check overstays:", err);
    }
  };

  const triggerAlerts = async () => {
    if (!isStaff) return;
    
    setLoading(true);
    try {
      const response = await bookingsAPI.triggerOverstayAlerts();
      if (response.success) {
        setAlertResults({
          alertsSent: response.alerts_sent,
          message: response.message
        });
        // Refresh overstay data
        await checkOverstays();
      }
    } catch (err) {
      console.error("Failed to trigger alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isStaff) {
    return null; // Hidden for non-staff users
  }

  if (compact) {
    // Compact version for dashboard/navbar
    return (
      <Group spacing="xs">
        <Indicator
          color="red"
          disabled={overstayData.overstayCount === 0}
          size={16}
          label={overstayData.overstayCount}
        >
          <ActionIcon
            variant="light"
            color={overstayData.criticalOverstays > 0 ? "red" : overstayData.overstayCount > 0 ? "orange" : "blue"}
            onClick={onViewOverstays}
          >
            <IconAlertTriangle size={16} />
          </ActionIcon>
        </Indicator>
        
        {overstayData.overstayCount > 0 && (
          <Tooltip label="Trigger Overstay Alerts">
            <ActionIcon
              variant="light"
              color="red"
              onClick={triggerAlerts}
              loading={loading}
            >
              <IconBellRinging size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    );
  }

  // Full monitoring panel
  return (
    <Card withBorder padding="md">
      <Stack spacing="md">
        {/* Header */}
        <Group justify="space-between">
          <Group spacing="xs">
            <IconClock size={20} />
            <Text fw={500}>Overstay Monitor</Text>
            <Badge size="xs" color="blue">BR-VH-018</Badge>
          </Group>
          <ActionIcon 
            variant="light" 
            onClick={() => setShowSettings(!showSettings)}
          >
            <IconSettings size={16} />
          </ActionIcon>
        </Group>

        {/* Settings Panel */}
        {showSettings && (
          <Alert color="blue">
            <Stack spacing="xs">
              <Group justify="space-between">
                <Text size="sm">Auto-monitoring:</Text>
                <Switch
                  checked={isMonitoring}
                  onChange={(event) => setIsMonitoring(event.currentTarget.checked)}
                />
              </Group>
              <Group justify="space-between">
                <Text size="sm">Check interval (minutes):</Text>
                <NumberInput
                  size="xs"
                  style={{ width: 80 }}
                  value={checkInterval}
                  onChange={setCheckInterval}
                  min={5}
                  max={60}
                />
              </Group>
            </Stack>
          </Alert>
        )}

        {/* Status Display */}
        <Group justify="space-between">
          <Group spacing="md">
            <div>
              <Text size="xs" color="dimmed">Total Overstays</Text>
              <Badge 
                size="lg" 
                color={overstayData.overstayCount > 0 ? "orange" : "green"}
              >
                {overstayData.overstayCount}
              </Badge>
            </div>
            <div>
              <Text size="xs" color="dimmed">Critical (1 day)</Text>
              <Badge 
                size="lg" 
                color={overstayData.criticalOverstays > 0 ? "red" : "green"}
                variant={overstayData.criticalOverstays > 0 ? "filled" : "light"}
              >
                {overstayData.criticalOverstays}
              </Badge>
            </div>
          </Group>
          
          {overstayData.lastCheck && (
            <Text size="xs" color="dimmed">
              Last check: {overstayData.lastCheck}
            </Text>
          )}
        </Group>

        {/* Alert Results */}
        {alertResults && (
          <Alert color="green" icon={<IconBell size={16} />}>
            <Text size="sm">{alertResults.message}</Text>
          </Alert>
        )}

        {/* Action Buttons */}
        <Group spacing="xs">
          <Button
            leftSection={<IconRefresh size={16} />}
            variant="light"
            size="xs"
            onClick={checkOverstays}
          >
            Check Now
          </Button>
          
          {overstayData.overstayCount > 0 && (
            <>
              <Button
                leftSection={<IconEye size={16} />}
                variant="light"
                color="blue"
                size="xs"
                onClick={onViewOverstays}
              >
                View Details
              </Button>
              
              <Button
                leftSection={<IconBellRinging size={16} />}
                color="red"
                size="xs"
                onClick={triggerAlerts}
                loading={loading}
              >
                Send Alerts
              </Button>
            </>
          )}
        </Group>

        {/* BR-VH-018 Notice */}
        <Text size="xs" color="dimmed" style={{ fontStyle: "italic" }}>
          BR-VH-018: Automated overstay detection monitors checkout times and generates alerts 
          when checkout time is exceeded. Default checkout time is 11:00 AM.
        </Text>
      </Stack>
    </Card>
  );
}

export default OverstayMonitor;