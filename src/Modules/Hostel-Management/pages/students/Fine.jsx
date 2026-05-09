import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  Stack,
  ScrollArea,
  Loader,
  Alert,
  Container,
  Divider,
  Button,
  Group,
} from "@mantine/core";
import FineCard from "../../components/cards/FineCard";
import { studentService } from "../../services";
import { getApiErrorMessage } from "../../utils";

export default function Fines() {
  const [fines, setFines] = useState([]);
  const [activeView, setActiveView] = useState("unpaid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestRef = useRef(0);

  const normalizeStatus = (status) => {
    const current = String(status || "")
      .trim()
      .toLowerCase();
    return current === "paid" ? "Paid" : "Unpaid";
  };

  const isPaidFine = (fine) => normalizeStatus(fine.status) === "Paid";

  const fetchFines = async () => {
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getStudentFines();

      if (requestId !== requestRef.current) return;

      if (response.data.student_fines) {
        setFines(
          response.data.student_fines.map((fine) => ({
            ...fine,
            status: normalizeStatus(fine.status),
          })),
        );
      } else if (response.data.message === "There is no fine imposed on you.") {
        setFines([]);
      } else {
        setError("Unexpected response from the server.");
        setFines([]);
      }
    } catch (err) {
      if (requestId !== requestRef.current) return;
      setError(
        getApiErrorMessage(
          err,
          "Failed to fetch fines. Please try again later.",
        ),
      );
      setFines([]);
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const filteredFines = fines.filter((fine) =>
    activeView === "paid" ? isPaidFine(fine) : !isPaidFine(fine),
  );

  const handlePayUIOnly = (fineId) => {
    setFines((prev) =>
      prev.map((fine) =>
        fine.fine_id === fineId ? { ...fine, status: "Paid" } : fine,
      ),
    );
  };

  return (
    <Container>
      <Stack>
        <Text size="xl" weight={700} align="center">
          My Fines
        </Text>
        <Divider my="sm" />
        <Stack spacing="xs">
          <Group grow>
            <Button
              variant={activeView === "unpaid" ? "filled" : "light"}
              onClick={() => setActiveView("unpaid")}
            >
              Unpaid Fines
            </Button>
            <Button
              variant={activeView === "paid" ? "filled" : "light"}
              onClick={() => setActiveView("paid")}
            >
              Paid Fines
            </Button>
          </Group>
        </Stack>
        {error && (
          <Alert title="Error" color="red">
            {error}
          </Alert>
        )}
        <Button variant="light" onClick={fetchFines} disabled={loading}>
          Refresh Fines
        </Button>
        {loading ? (
          <Loader size="lg" />
        ) : (
          <ScrollArea>
            {filteredFines.length > 0 ? (
              filteredFines.map((fine) => (
                <FineCard
                  key={fine.fine_id}
                  fineId={fine.fine_id}
                  studentName={fine.student_name}
                  hall={fine.hall_id ? `Hall ${fine.hall_id}` : undefined}
                  amount={fine.amount}
                  reason={fine.reason}
                  status={fine.status}
                  onPay={handlePayUIOnly}
                />
              ))
            ) : (
              <Text align="center">
                {activeView === "paid" ? "No paid fines." : "No unpaid fines."}
              </Text>
            )}
          </ScrollArea>
        )}
      </Stack>
    </Container>
  );
}
