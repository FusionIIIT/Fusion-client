import { Loader, Tabs, Text, Card, Box, Title } from "@mantine/core";
import { Receipt, ClockCounterClockwise } from "@phosphor-icons/react";
import { useState } from "react";
import ViewBill from "./ViewBill";
import PaymentHistory from "./PaymentHistory";

function ViewBillAndPayments() {
  const [activeTab, setActiveTab] = useState("0");

  const tabItems = [
    { title: "Current Bill", icon: <Receipt size={18} /> },
    { title: "Payment History", icon: <ClockCounterClockwise size={18} /> },
  ];

  // Function to render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "0":
        return <ViewBill />;
      case "1":
        return <PaymentHistory />;
      default:
        return <Loader />;
    }
  };

  return (
    <Card
      shadow="sm"
      radius="lg"
      p="xl"
      withBorder
      style={{ backgroundColor: "#ffffff" }}
    >
      <Box mb="xl">
        <Title order={3} fw={800} style={{ color: "#1A2980" }}>
          Billing & Payments
        </Title>
        <Text size="sm" c="dimmed" mt={4}>
          View your active bills and past transaction records
        </Text>
      </Box>

      {/* Modern Tabs */}
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        variant="outline"
        radius="md"
        color="blue"
      >
        <Tabs.List style={{ marginBottom: "20px" }}>
          {tabItems.map((item, index) => (
            <Tabs.Tab
              value={`${index}`}
              key={index}
              leftSection={item.icon}
              style={{
                padding: "12px 24px",
                fontWeight: activeTab === `${index}` ? 600 : 500,
                fontSize: "15px",
                transition: "all 0.2s ease",
              }}
            >
              {item.title}
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      {/* Main content */}
      <Box mt="md" style={{ animation: "fadeIn 0.4s ease" }}>
        {renderTabContent()}
      </Box>
    </Card>
  );
}

export default ViewBillAndPayments;
