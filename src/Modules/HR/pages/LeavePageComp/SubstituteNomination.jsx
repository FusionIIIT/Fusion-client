import React, { useState, useCallback } from "react";
import {
  TextInput,
  Button,
  Text,
  Box,
  Badge,
  Group,
  Select,
  ActionIcon,
  Paper,
  Loader,
  Alert,
} from "@mantine/core";
import { MagnifyingGlass, X, UserPlus } from "@phosphor-icons/react";
import { searchEmployees } from "../../services/api";

/**
 * SubstituteNomination — structured substitute picker for leave forms.
 *
 * Replaces the old free-text academicResponsibility / addministrativeResponsibiltyAssigned
 * fields with a searchable employee picker + responsibility type selector.
 *
 * Props:
 *   nominations: array of { username, name, department, responsibility_type }
 *   onNominationsChange: (newList) => void
 *   currentUsername: string (logged-in user, to prevent self-nomination)
 *   disabled: boolean
 */
function SubstituteNomination({
  nominations = [],
  onNominationsChange,
  currentUsername = "",
  disabled = false,
}) {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [responsibilityType, setResponsibilityType] = useState("academic");
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async () => {
    if (!searchText || searchText.length < 3) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const results = await searchEmployees(searchText);
      // Filter out self and already-nominated users (for same type)
      const filtered = results.filter(
        (emp) => emp.username !== currentUsername
      );
      setSearchResults(filtered);
    } catch (err) {
      setError("Search failed. Please try again.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchText, currentUsername]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setSearchResults([]);
    setSearchText(emp.name || emp.username);
  };

  const handleAdd = () => {
    if (!selectedEmployee) {
      setError("Select an employee from search results first.");
      return;
    }

    // Check for duplicate
    const isDuplicate = nominations.some(
      (n) =>
        n.username === selectedEmployee.username &&
        n.responsibility_type === responsibilityType
    );
    if (isDuplicate) {
      setError(
        `${selectedEmployee.name || selectedEmployee.username} is already nominated as ${responsibilityType} substitute.`
      );
      return;
    }

    // Check self-nomination
    if (selectedEmployee.username === currentUsername) {
      setError("You cannot nominate yourself as a substitute.");
      return;
    }

    const newNomination = {
      username: selectedEmployee.username,
      name: selectedEmployee.name || selectedEmployee.username,
      department: selectedEmployee.department || "",
      responsibility_type: responsibilityType,
    };

    onNominationsChange([...nominations, newNomination]);
    setSelectedEmployee(null);
    setSearchText("");
    setError(null);
  };

  const handleRemove = (index) => {
    const updated = nominations.filter((_, i) => i !== index);
    onNominationsChange(updated);
  };

  const responsibilityBadgeColor = (type) =>
    type === "academic" ? "blue" : "grape";

  return (
    <Box
      style={{
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        padding: "16px",
        marginTop: "8px",
      }}
    >
      <Text fw={600} size="sm" mb="xs">
        Substitute Nomination
      </Text>
      <Text size="xs" c="dimmed" mb="sm">
        Search and nominate colleague(s) to cover your responsibilities during
        leave. Each substitute will receive a consent request.
      </Text>

      {error && (
        <Alert color="red" mb="xs" variant="light" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!disabled && (
        <>
          <Group align="flex-end" mb="xs" grow>
            <TextInput
              label="Search employee"
              placeholder="Type name or username (min 3 chars)"
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                setSelectedEmployee(null);
              }}
              onKeyDown={handleKeyDown}
              rightSection={
                searching ? (
                  <Loader size="xs" />
                ) : (
                  <ActionIcon
                    variant="subtle"
                    onClick={handleSearch}
                    size="sm"
                  >
                    <MagnifyingGlass size={16} />
                  </ActionIcon>
                )
              }
              style={{ flex: 2 }}
            />
            <Select
              label="Type"
              data={[
                { value: "academic", label: "Academic" },
                { value: "administrative", label: "Administrative" },
              ]}
              value={responsibilityType}
              onChange={(v) => setResponsibilityType(v || "academic")}
              style={{ flex: 1 }}
            />
            <Button
              leftSection={<UserPlus size={16} />}
              onClick={handleAdd}
              disabled={!selectedEmployee}
              size="sm"
              style={{ flex: 0 }}
            >
              Add
            </Button>
          </Group>

          {/* Search results dropdown */}
          {searchResults.length > 0 && (
            <Paper
              shadow="sm"
              p="xs"
              mb="sm"
              style={{
                maxHeight: "180px",
                overflowY: "auto",
                border: "1px solid #dee2e6",
              }}
            >
              {searchResults.map((emp) => (
                <Group
                  key={emp.username}
                  style={{
                    padding: "6px 8px",
                    cursor: "pointer",
                    borderRadius: "4px",
                    backgroundColor:
                      selectedEmployee?.username === emp.username
                        ? "#e7f5ff"
                        : "transparent",
                  }}
                  onClick={() => handleSelectEmployee(emp)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f1f3f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      selectedEmployee?.username === emp.username
                        ? "#e7f5ff"
                        : "transparent";
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500}>
                      {emp.name || emp.username}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {emp.username}
                      {emp.department ? ` · ${emp.department}` : ""}
                      {emp.designation ? ` · ${emp.designation}` : ""}
                    </Text>
                  </div>
                </Group>
              ))}
            </Paper>
          )}
        </>
      )}

      {/* Nominated substitutes list */}
      {nominations.length > 0 ? (
        <Box mt="xs">
          <Text size="xs" fw={600} mb={4}>
            Nominated substitutes ({nominations.length}):
          </Text>
          {nominations.map((nom, idx) => (
            <Paper
              key={`${nom.username}-${nom.responsibility_type}-${idx}`}
              p="xs"
              mb={4}
              withBorder
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Group gap="xs">
                <Badge
                  color={responsibilityBadgeColor(nom.responsibility_type)}
                  variant="light"
                  size="sm"
                >
                  {nom.responsibility_type}
                </Badge>
                <div>
                  <Text size="sm" fw={500}>
                    {nom.name || nom.username}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {nom.username}
                    {nom.department ? ` · ${nom.department}` : ""}
                  </Text>
                </div>
              </Group>
              {!disabled && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleRemove(idx)}
                  size="sm"
                >
                  <X size={14} />
                </ActionIcon>
              )}
            </Paper>
          ))}
        </Box>
      ) : (
        <Text size="xs" c="dimmed" mt="xs" fs="italic">
          No substitutes nominated yet. You can submit without nominating — the
          leave will go directly to your HOD.
        </Text>
      )}
    </Box>
  );
}

export default SubstituteNomination;
