import { useState, useEffect } from "react";
import {
  Table,
  Text,
  Button,
  Flex,
  Divider,
  TextInput,
  Center,
  Loader,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { studentBankDetailsRoute } from "../../../routes/dashboardRoutes";

const FIELDS = [
  { key: "account_holder_name", label: "Account Holder Name" },
  { key: "bank_name", label: "Bank Name" },
  { key: "branch_name", label: "Branch Name" },
  { key: "account_number", label: "Account Number" },
  { key: "ifsc_code", label: "IFSC Code" },
];

function BankDetailsComponent() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    account_holder_name: "",
    bank_name: "",
    branch_name: "",
    account_number: "",
    ifsc_code: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }
    axios
      .get(studentBankDetailsRoute, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => {
        if (res.data && Object.keys(res.data).length > 0) {
          setBankDetails((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {
        notifications.show({
          message: "Error fetching bank details.",
          color: "red",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setBankDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditClick = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      notifications.show({
        message: "Authentication required. Please log in again.",
        color: "red",
      });
      return;
    }
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await axios.post(studentBankDetailsRoute, bankDetails, {
        headers: { Authorization: `Token ${token}` },
      });
      setBankDetails((prev) => ({ ...prev, ...res.data }));
      notifications.show({
        message: "Bank details updated successfully!",
        color: "green",
      });
      setIsEditing(false);
    } catch {
      notifications.show({
        message: "Error updating bank details. Please try again.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Center style={{ height: 150 }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Flex
      w={{ base: "100%", sm: "60%" }}
      p="md"
      gap="md"
      style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      direction="column"
      justify="space-evenly"
    >
      <Flex
        w="100%"
        p="md"
        direction="column"
        style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      >
        <Flex w="100%" justify="space-between" align="center">
          <Text fw={500} size="1.2rem">
            Bank Account Details
          </Text>
          <Button
            onClick={handleEditClick}
            color={isEditing ? "green" : "red"}
            loading={submitting}
          >
            {isEditing ? "Save" : "Edit"}
          </Button>
        </Flex>
        <Divider my="sm" />
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Tbody>
            {FIELDS.map(({ key, label }) => (
              <Table.Tr key={key}>
                <Table.Td fw={500}>{label}</Table.Td>
                <Table.Td>
                  {isEditing ? (
                    <TextInput
                      value={bankDetails[key] || ""}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  ) : (
                    bankDetails[key] || "—"
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Flex>
    </Flex>
  );
}

export default BankDetailsComponent;
