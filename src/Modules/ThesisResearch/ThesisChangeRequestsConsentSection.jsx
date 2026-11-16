import React, { useState, useEffect, useCallback } from "react";
import { Text, Table, Button, Center, Loader } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { facultyThesisChangeRequestsPendingConsentRoute } from "../../routes/academicRoutes";
import ThesisChangeConsentModal from "./ThesisChangeConsentModal";

const ROLE_LABEL = {
  current_supervisor: "Current Supervisor",
  current_co_supervisor: "Current Co-Supervisor",
  new_supervisor: "Proposed New Supervisor",
  new_co_supervisor: "Proposed New Co-Supervisor",
};

/**
 * Self-contained "thesis change requests needing my consent" block -- covers
 * a newly-proposed supervisor/co-supervisor too, who wouldn't otherwise see
 * this thesis anywhere else (they aren't the supervisor of record yet).
 */
export default function ThesisChangeRequestsConsentSection() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(
        facultyThesisChangeRequestsPendingConsentRoute,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      setPending(res.data.pending || []);
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to load change requests.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleRefresh = () => {
    setSelected(null);
    fetchPending();
  };

  if (loading) {
    return (
      <Center style={{ height: 100 }}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (pending.length === 0) return null;

  return (
    <>
      <Text fw={500} mb="xs" mt="md">
        Thesis Change Requests Needing Your Consent
      </Text>
      <Table striped highlightOnHover mb="md">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Student</Table.Th>
            <Table.Th>Your Role</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {pending.map((cr) => (
            <Table.Tr key={cr.id}>
              <Table.Td>
                {cr.student_name} ({cr.student_roll})
              </Table.Td>
              <Table.Td>{ROLE_LABEL[cr.my_role] || cr.my_role}</Table.Td>
              <Table.Td>
                <Button size="xs" onClick={() => setSelected(cr)}>
                  Review
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {selected && (
        <ThesisChangeConsentModal
          request={selected}
          onClose={() => setSelected(null)}
          refresh={handleRefresh}
        />
      )}
    </>
  );
}
