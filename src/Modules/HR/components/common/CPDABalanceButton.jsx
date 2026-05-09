import React, { useState, useEffect } from "react";
import { Modal, Button, ScrollArea, Loader, Text, Group } from "@mantine/core";
import { Wallet } from "@phosphor-icons/react";
import { getLeaveBalance } from "../../services/api";

function CPDABalanceButton() {
  const [opened, setOpened] = useState(false);
  const [cpdaBalance, setCpdaBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCpdaBalance = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getLeaveBalance(); // Backend returns both leave and cpda balance
      setCpdaBalance(data.cpda_balance);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch CPDA balance.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (opened) {
      fetchCpdaBalance();
    }
  }, [opened]);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "-50px",
          position: "relative",
          top: "50px",
          zIndex: 10
        }}
      >
        <Button
          onClick={() => setOpened(true)}
          leftSection={<Wallet size={20} />}
          color="green"
          variant="light"
        >
          Check CPDA Balance
        </Button>
      </div>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={
          <span style={{ fontWeight: "bold", fontSize: "20px" }}>
            Cumulative Professional Development Allowance (CPDA)
          </span>
        }
        centered
        size="md"
      >
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <Loader size="lg" />
          </div>
        ) : error ? (
          <Text color="red" ta="center" fw={700} p="md">{error}</Text>
        ) : cpdaBalance ? (
          <div style={{ padding: "10px" }}>
             <Group position="apart" mb="md">
                <Text fw={500}>Total Allotted:</Text>
                <Text fw={700} color="blue">Rs. {cpdaBalance.allotted.toLocaleString()}</Text>
             </Group>
             <Group position="apart" mb="md">
                <Text fw={500}>Total Used:</Text>
                <Text fw={700} color="orange">Rs. {cpdaBalance.taken.toLocaleString()}</Text>
             </Group>
             <Group position="apart" pt="md" style={{ borderTop: "2px solid #eee" }}>
                <Text fw={700} size="lg">Current Balance:</Text>
                <Text fw={800} size="xl" color={cpdaBalance.balance > 0 ? "green" : "red"}>
                  Rs. {cpdaBalance.balance.toLocaleString()}
                </Text>
             </Group>
             <Text size="xs" color="dimmed" mt="xl" ta="center">
               *This balance represents your cumulative eligibility for the current block period.
             </Text>
          </div>
        ) : (
          <Text ta="center" fw={500} p="md">No CPDA balance data available.</Text>
        )}
      </Modal>
    </>
  );
}

export default CPDABalanceButton;
