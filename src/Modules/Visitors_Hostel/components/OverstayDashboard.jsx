/**
 * OverstayDashboard
 * BR-VH-018: Complete Overstay Management Dashboard
 * 
 * Integration example showing how to use all BR-VH-018 components together.
 * This demonstrates the complete overstay detection and alert system.
 */

import React, { useState } from "react";
import {
  Tabs,
  Box,
  Badge,
  Alert,
  Group,
  ActionIcon,
  Tooltip,
  Paper,
} from "@mantine/core";
import { IconAlertTriangle, IconSettings, IconEye } from "@tabler/icons-react";
import { useSelector } from "react-redux";
import OverstayDetectionTable from "./tables/OverstayDetectionTable";
import OverstayMonitor from "./OverstayMonitor";

function OverstayDashboard() {
  const [activeTab, setActiveTab] = useState("monitor");
  const [showFullTable, setShowFullTable] = useState(false);

  const role = useSelector((state) => state.user?.role);
  const isIncharge = role === "VhIncharge";
  const isStaff = role === "VhIncharge" || role === "VhCaretaker";

  if (!isStaff) {
    return (
      <Box p="md">
        <Alert color="orange">
          Access denied. Only VhIncharge and VhCaretaker can access overstay management.
        </Alert>
      </Box>
    );
  }

  const viewOverstayDetails = () => {
    setActiveTab("detection");
    setShowFullTable(true);
  };

  return (
    <Box p="md">
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="monitor">
            🔍 Overstay Monitor
          </Tabs.Tab>
          <Tabs.Tab value="detection">
            ⚠️ Detection & Alerts
            <Badge size="xs" color="red" ml="xs">BR-VH-018</Badge>
          </Tabs.Tab>
          {isIncharge && (
            <Tabs.Tab value="settings">
              ⚙️ Settings
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="monitor" pt="md">
          {/* BR-VH-018 Authority Notice */}
          <Alert color="blue" mb="md" icon={<IconAlertTriangle size={16} />}>
            <strong>BR-VH-018:</strong> Overstay alerts MUST be generated when checkout time is exceeded. 
            This monitor automatically checks for overstays and enables quick alert generation.
          </Alert>

          <OverstayMonitor 
            onViewOverstays={viewOverstayDetails}
            compact={false}
            autoStart={true}
          />

          {/* Quick Actions Panel */}
          <Paper withBorder p="md" mt="md">
            <Group justify="space-between">
              <div>
                <strong>Quick Actions:</strong>
              </div>
              <Group spacing="xs">
                <Tooltip label="View Detailed Overstay Table">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    onClick={() => setActiveTab("detection")}
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                </Tooltip>
                {isIncharge && (
                  <Tooltip label="Configure Settings">
                    <ActionIcon
                      variant="light"
                      onClick={() => setActiveTab("settings")}
                    >
                      <IconSettings size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Group>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="detection" pt="md">
          <OverstayDetectionTable />
        </Tabs.Panel>

        {isIncharge && (
          <Tabs.Panel value="settings" pt="md">
            <Alert color="blue" mb="md">
              <strong>BR-VH-018 Configuration:</strong> As VhIncharge, you can configure 
              overstay detection settings and alert preferences.
            </Alert>

            <Paper withBorder p="md">
              <div style={{ color: "#666", fontStyle: "italic" }}>
                <strong>Overstay Detection Rules (BR-VH-018):</strong>
                <ul style={{ margin: "10px 0", paddingLeft: "20px" }}>
                  <li>
                    <strong>Trigger Condition:</strong> current_time &gt; approved_checkout
                  </li>
                  <li>
                    <strong>Default Checkout Time:</strong> 11:00 AM (if not specified)
                  </li>
                  <li>
                    <strong>Critical Overstay:</strong> More than 1 day past checkout
                  </li>
                  <li>
                    <strong>Alert Recipients:</strong> VhIncharge and VhCaretaker
                  </li>
                  <li>
                    <strong>Effect:</strong> Prevents unauthorized extended stays
                  </li>
                </ul>

                <strong>Automatic Monitoring:</strong>
                <ul style={{ margin: "10px 0", paddingLeft: "20px" }}>
                  <li>Real-time overstay detection based on booking checkout times</li>
                  <li>Configurable monitoring intervals (5-60 minutes)</li>
                  <li>Automatic alert generation for critical overstays</li>
                  <li>Dashboard notifications and badges</li>
                </ul>

                <strong>Manual Operations:</strong>
                <ul style={{ margin: "10px 0", paddingLeft: "20px" }}>
                  <li>On-demand overstay checks</li>
                  <li>Manual alert triggering for specific overstays</li>
                  <li>Detailed overstay information viewing</li>
                  <li>Visitor and intender contact information access</li>
                </ul>
              </div>
            </Paper>
          </Tabs.Panel>
        )}
      </Tabs>
    </Box>
  );
}

export default OverstayDashboard;