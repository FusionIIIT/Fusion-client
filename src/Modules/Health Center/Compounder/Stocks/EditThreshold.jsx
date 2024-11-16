import React from "react";
import { TextInput, Button, Group, Paper } from "@mantine/core";
import { MagnifyingGlass } from "@phosphor-icons/react";

function EditThreshold() {
  return (
    <Paper
      withBorder
      shadow="md"
      radius="md"
      p="lg"
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        width: "100%",
        marginTop: "20px",
        minHeight: "500px",
      }} // Added minHeight for stability
    >
      <form>
        <TextInput
          label="Brand Name"
          id="brand-name"
          placeholder="Brand Name"
          rightSection={
            <Button
              variant="filled"
              size="xs"
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                backgroundColor: "#6D28D9", // Apply custom color
              }}
            >
              <MagnifyingGlass size={20} weight="fill" />
              Search
            </Button>
          }
          mb="sm"
          styles={{ rightSection: { width: "100px" } }} // Adjust width for consistency
        />

        <TextInput
          label="Threshold"
          id="threshold"
          placeholder="Threshold"
          mb="sm"
        />
        <TextInput
          label="Manufacturer Name"
          id="manufacturer-name"
          placeholder="Manufacturer Name"
          mb="sm"
        />
        <TextInput
          label="Pack Size Label"
          id="pack-size-label"
          placeholder="Pack Size"
          mb="sm"
        />

        <Group position="center" mt="lg">
          <Button
            type="submit"
            style={{ backgroundColor: "#6D28D9", color: "white" }} // Apply custom color to submit button
          >
            Edit Threshold
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

export default EditThreshold;
