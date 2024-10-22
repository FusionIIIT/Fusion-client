import React from "react";
import {
  TextInput,
  Button,
  Group,
  Paper,
  Divider,
  FileInput,
} from "@mantine/core";
import { DownloadSimple } from "@phosphor-icons/react";

function AddMedicineForm() {
  return (
    <Paper
      withBorder
      shadow="md"
      radius="md"
      p="lg"
      style={{ maxWidth: "800px", margin: "20px auto", width: "100%" }} // Full width on small screens
    >
      <form>
        <TextInput
          label="Medicine Name"
          placeholder="Enter medicine name"
          required
          mb="sm"
        />
        <TextInput
          label="Threshold"
          placeholder="Enter threshold value"
          required
          mb="sm"
        />
        <TextInput
          label="Brand Name"
          placeholder="Enter brand name"
          required
          mb="sm"
        />
        <TextInput
          label="Constituents"
          placeholder="Enter constituents"
          required
          mb="sm"
        />
        <TextInput
          label="Manufacturer Name"
          placeholder="Enter manufacturer name"
          required
          mb="sm"
        />
        <TextInput
          label="Pack Size"
          placeholder="Enter pack size"
          required
          mb="sm"
        />

        <Group position="right" mt="lg">
          <Button
            type="submit"
            style={{ backgroundColor: "#6D28D9", color: "white" }} // Apply custom color to submit button
          >
            Submit
          </Button>
        </Group>
      </form>

      <Divider my="lg" label="OR" labelPosition="center" />

      <div
        style={{
          textAlign: "center",
          fontSize: "1.2rem",
          fontWeight: "400",
          marginBottom: "1rem",
        }}
      >
        Insert Data using Excel File
      </div>

      <form>
        <FileInput
          label="Report"
          id="report"
          placeholder="Choose File"
          mb="sm"
        />

        <Group position="center" mt="lg">
          <Button
            type="submit"
            style={{ backgroundColor: "#6D28D9", color: "white" }} // Custom color for submit button
          >
            Submit
          </Button>
          <Button
            variant="outline"
            leftIcon={<DownloadSimple size={20} />}
            style={{
              borderColor: "#6D28D9", // Apply custom border color for outlined button
              color: "#6D28D9", // Custom text color for outlined button
            }}
          >
            Download Example
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

export default AddMedicineForm;
