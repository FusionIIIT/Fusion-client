
import React, { useState } from "react";
import { TextInput, Select, Switch, Button, Group, Notification, Title, List, ActionIcon } from "@mantine/core";
//import { Trash } from "tabler-icons-react"; // Import trash icon for delete
import {Trash } from "@phosphor-icons/react";


function FieldsForm() {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState([]); // State to store the list of fields

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!fieldName || !fieldType) {
      setError("Please fill all required fields.");
      return;
    }

    // Add the new field to the fields list
    const newField = { fieldName, fieldType, isRequired };
    setFields((prevFields) => [...prevFields, newField]);

    // Clear the form inputs
    setFieldName("");
    setFieldType("");
    setIsRequired(false);
    setError(""); // Clear any error
  };

  const handleDelete = (index) => {
    setFields((prevFields) => prevFields.filter((_, i) => i !== index)); // Remove field by index
  };

  return (
    <div>
      <Title order={2} mb="xl">
        Add Field
      </Title>
      {error && (
        <Notification color="red" onClose={() => setError("")}>
          {error}
        </Notification>
      )}
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Field Name"
          placeholder="Enter field name"
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          required
        />
        <Select
          label="Field Type"
          placeholder="Select field type"
          value={fieldType}
          onChange={(value) => setFieldType(value)}
          data={[
            { value: "text", label: "Text" },
            { value: "number", label: "Number" },
            { value: "decimal", label: "Decimal" },
            { value: "date", label: "Date" },
            { value: "time", label: "Time" },
          ]}
          required
        />
        <Group position="left" mt="md">
          <label>Required</label>
          <Switch
            checked={isRequired}
            onChange={() => setIsRequired((prev) => !prev)}
            label={isRequired ? "Yes" : "No"}
          />
        </Group>
        <Group position="right" mt="md">
          <Button type="submit" label="">Add Field</Button>
        </Group>
      </form>

      {/* Display list of added fields */}
      {fields.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <Title order={3}>Added Fields</Title>
          <List spacing="sm">
            {fields.map((field, index) => (
              <List.Item key={index}>
                <Group position="apart">
                  <div>
                    <strong>{field.fieldName}</strong> ({field.fieldType}) - Required: {field.isRequired ? "Yes" : "No"}
                  </div>
                  <ActionIcon color="red" onClick={() => handleDelete(index)}>
                    <Trash />
                  </ActionIcon>
                </Group>
              </List.Item>
            ))}
          </List>
        </div>
      )}
    </div>
  );
}

export default FieldsForm;
