import { Radio, Button, FileInput, Textarea, Select } from "@mantine/core";
import { NavLink } from "react-router-dom";

import Navigation from "../Navigation";

function Apply() {
  return (
    <>
      <Navigation />

      <div style={{ margin: "2rem" }}>
        <div
          style={{
            display: "flex",
            padding: "0.5rem",
            border: "1px solid",
            backgroundColor: "white",
            borderRadius: "9999px",
            width: "22rem",
          }}
        >
          <NavLink
            to="/patient/medical-relief/apply"
            style={{
              textDecoration: "none",
              color: "black",
            }}
          >
            <Radio
              label="Apply for Medical Relief"
              color="grape"
              variant="outline"
              defaultChecked
            />
          </NavLink>

          <NavLink
            to="/patient/medical-relief/approval"
            style={{
              textDecoration: "none",
              color: "black",
              marginLeft: "20px",
            }}
          >
            <Radio label="Approval Status" color="grape" variant="outline" />
          </NavLink>
        </div>

        <br />

        <div>
          <FileInput
            label="Upload file"
            placeholder="Choose file"
            styles={{
              input: {
                padding: "0.5rem",
                width: "100%",
                fontSize: "0.875rem",
                color: "#6b46c1",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                backgroundColor: "#f9fafb",
              },
            }}
          />
        </div>

        <br />

        <div>
          <Textarea
            label="Description"
            styles={{
              input: {
                padding: "0.625rem",
                width: "100%",
                fontSize: "0.875rem",
                color: "#1f2937",
                backgroundColor: "#f9fafb",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
              },
            }}
            rows={4}
          />
        </div>

        <br />

        <div>
          <Select
            label="Send to"
            defaultValue="Compounder"
            classNames={{
              input:
                "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-purple-500 focus:border-blue-500 block w-full p-2.5",
            }}
            data={[{ value: "Compounder", label: "Compounder" }]}
          />
        </div>

        <br />

        <div>
          <Button
            variant="filled"
            color="violet"
            styles={{
              root: {
                outline: "none",
                color: "white",
                backgroundColor: "#6D28D9",
                "&:hover": { backgroundColor: "#553c9a" },
                padding: "0.625rem 1.25rem",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                marginBottom: "0.5rem",
                "&:focus": {
                  ring: "4px solid #b794f4",
                },
              },
            }}
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  );
}

export default Apply;
