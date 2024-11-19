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
import { MagnifyingGlass, DownloadSimple } from "@phosphor-icons/react";
import NavCom from "../NavCom";
import ManageStock from "./ManageStocksNav";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";

function AddStock() {
  return (
    <>
      <CustomBreadcrumbs />
      <NavCom />
      <ManageStock />
      <br />
      <Paper shadow="xl" p="xl" withBorder>
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
            <Button type="submit" style={{ backgroundColor: "#15ABFF" }}>
              Submit
            </Button>
            <Button
              variant="outline"
              leftIcon={<DownloadSimple size={20} />}
              style={{ borderColor: "#15ABFF", color: "#15ABFF" }}
            >
              Download Example
            </Button>
          </Group>
        </form>

        <Divider my="lg" label="OR" labelPosition="center" />

        <form>
          <Grid gutter="sm">
            <Grid.Col span={6}>
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
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Quantity"
                id="quantity"
                placeholder="Quantity"
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Supplier"
                id="supplier"
                placeholder="Supplier"
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput label="Expiry Date" id="expiry-date" type="date" />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Medicine Name"
                id="medicine-name"
                placeholder="Medicine Name"
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Constituents"
                id="constituents"
                placeholder="Constituents"
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Manufacturer Name"
                id="manufacturer-name"
                placeholder="Manufacturer Name"
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <TextInput
                label="Pack Size Label"
                id="pack-size"
                placeholder="Pack Size"
              />
            </Grid.Col>
          </Grid>

          <Group position="center" mt="lg">
            <Button type="submit" style={{ backgroundColor: "#15ABFF" }}>
              Submit
            </Button>
          </Group>
        </form>
      </Paper>
    </>
  );
}

export default AddStock;
