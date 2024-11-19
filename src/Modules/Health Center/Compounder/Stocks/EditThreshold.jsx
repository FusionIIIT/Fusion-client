import React from "react";
import { TextInput, Button, Group, Paper } from "@mantine/core";
import { MagnifyingGlass } from "@phosphor-icons/react";
import NavCom from "../NavCom";
import ManageStock from "./ManageStocksNav";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";

function EditThreshold() {
  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <ManageStock />
      <br />
      <Paper shadow="xl" p="xl" withBorder>
        <form>
          <TextInput
            label="Brand Name"
            id="brand-name"
            placeholder="Brand Name"
            rightSection={
              <Button
                variant="subtle"
                size="xs"
                p={0}
                style={{
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                }}
              >
                <MagnifyingGlass size={20} weight="fill" color="#15ABFF" />
              </Button>
            }
            styles={{ rightSection: { width: "40px", padding: "0" } }}
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
              style={{ backgroundColor: "#15ABFF", color: "white" }} // Apply custom color to submit button
            >
              Edit Threshold
            </Button>
          </Group>
        </form>
      </Paper>
    </>
  );
}

export default EditThreshold;
