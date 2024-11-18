import React from "react";
import {
  TextInput,
  Button,
  Group,
  Paper,
  Divider,
  FileInput,
  Grid,
} from "@mantine/core";
import { DownloadSimple } from "@phosphor-icons/react";
import NavCom from "../NavCom";
import ManageStock from "./ManageStocksNav";

function AddMedicine() {
  return (
    <>
      <NavCom />
      <ManageStock />
      <Paper
        withBorder
        shadow="md"
        radius="md"
        p="lg"
        style={{ maxWidth: "2000px", margin: "20px auto", width: "100%" }}
      >
        {/* Insert Data using Excel Section */}
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
              style={{ backgroundColor: "#15ABFF", color: "white" }}
            >
              Submit
            </Button>
            <Button
              variant="outline"
              leftIcon={<DownloadSimple size={20} />}
              style={{
                borderColor: "#15ABFF",
                color: "#15ABFF",
              }}
            >
              Download Example
            </Button>
          </Group>
        </form>

        <Divider my="lg" label="OR" labelPosition="center" />

        {/* Medicine Details Form */}
        <form>
          <Grid gutter="sm">
            <Grid.Col span={6}>
              <TextInput
                label="Medicine Name"
                placeholder="Enter medicine name"
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Threshold"
                placeholder="Enter threshold value"
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Brand Name"
                placeholder="Enter brand name"
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Constituents"
                placeholder="Enter constituents"
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Manufacturer Name"
                placeholder="Enter manufacturer name"
                required
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Pack Size"
                placeholder="Enter pack size"
                required
              />
            </Grid.Col>
          </Grid>

          <Group position="right" mt="lg">
            <Button
              type="submit"
              style={{ backgroundColor: "#15ABFF", color: "white" }}
            >
              Submit
            </Button>
          </Group>
        </form>
      </Paper>
    </>
  );
}

export default AddMedicine;
