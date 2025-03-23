import React, { useState, useEffect } from "react";
import {
  TextInput,
  Select,
  Switch,
  Button,
  Group,
  Notification,
  Title,
  List,
  ActionIcon,
} from "@mantine/core";
//import { Trash } from "tabler-icons-react"; // Import trash icon for delete
import { Trash } from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { fetchFieldsSubmitformRoute } from "../../../routes/placementCellRoutes";

function FieldsForm() {
  const [name, setname] = useState("");
  const [type, settype] = useState("");
  const [required, setrequired] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState([]); // State to store the list of fields

  // DOne
  useEffect(() => {
    const fetchFieldslist = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(fetchFieldsSubmitformRoute, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (response.status == 200) {
          // console.log(response.data);
          // setFields(response.data);
          // console.log(fields);
          setFields([]);
          response.data.forEach((element) => {
            // console.log(element);
            const newField = [element.name, element.type, element.required];
            setFields((prevFields) => [...prevFields, newField]);
          });
        } else if (response.status == 406) {
          console.log(`error fetching data: ${response.status}`);
          notifications.show({
            title: "Error fetching data",
            message: `Error fetching data: ${response.status}`,
            color: "red",
          });
        } else {
          console.log(`error fetching data: ${response.status}`);
          notifications.show({
            title: "Error fetching data",
            message: `Error fetching data: ${response.status}`,
            color: "red",
          });
        }
      } catch (error) {
        // setError("Failed to fetch debared students list");
        notifications.show({
          title: "Failed to fetch data",
          message: "Failed to fetch feilds list",
          color: "red",
        });
      }
    };
    fetchFieldslist();
  }, []);

  // done
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name || !type) {
      setError("Please fill all required fields.");
      return;
    }

    // Add the new field to the fields list
    const newField = { name, type, required };

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.post(fetchFieldsSubmitformRoute, newField, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      if (response.status == 200) {
        notifications.show({
          title: "Success",
          message: "Field added!",
          color: "green",
          position: "top-center",
        });
        setFields((prevFields) => [...prevFields, newField]);
      } else {
        notifications.show({
          title: "Failed",
          message: `Failed to add field`,
          color: "red",
          position: "top-center",
        });
      }
    } catch (error) {
      console.error("Error adding fields:", error);
      notifications.show({
        title: "Error",
        message: "Failed to add field.",
        color: "red",
        position: "top-center",
      });
    } finally {
      setname("");
      settype("");
      setrequired(false);
      setError("");
    }

    // Clear the form inputs
    // Clear any error
  };

  const handleDelete = (index) => {
    setFields((prevFields) => prevFields.filter((_, i) => i !== index));
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
          value={name}
          onChange={(e) => setname(e.target.value)}
          required
        />
        <Select
          label="Field Type"
          placeholder="Select field type"
          value={type}
          onChange={(value) => settype(value)}
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
            checked={required}
            onChange={() => {
              setrequired((prev) => !prev);
              console.log(required);
            }}
            label={required ? "Yes" : "No"}
          />
        </Group>
        <Group position="right" mt="md">
          <Button type="submit" label="">
            Add Field
          </Button>
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
                    {/* {console.log(field)} */}
                    <strong>{field[0]}</strong> ({field[1]}) - Required:{" "}
                    {field[2] ? "Yes" : "No"}
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
