import React, { useState } from "react";
import {
  Button,
  FileInput,
  Textarea,
  Select,
  Paper,
  Flex,
} from "@mantine/core";
import Navigation from "../Navigation";
import MedicalNavBar from "./medicalPath";
import CustomBreadcrumbs from "../../../../components/Breadcrumbs";

function Apply() {
  const [file, setFile] = useState(null);
  const [recipient, setRecipient] = useState("Compounder");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("recipient", recipient);
    formData.append("description", description);
  };

  return (
    <>
      <CustomBreadcrumbs />
      <Navigation />
      <MedicalNavBar />
      <br />
      <Paper shadow="xl" p="xl" withBorder>
        <form onSubmit={handleSubmit}>
          <Flex gap="xl" wrap="wrap">
            <FileInput
              label="Upload file"
              placeholder="Choose file"
              value={file}
              onChange={setFile}
              error={errors.file}
            />

            <Select
              label="Send to"
              data={[{ value: "Compounder", label: "Compounder" }]}
              value={recipient}
              onChange={setRecipient}
              error={errors.recipient}
            />

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              rows={4}
              autosize
            />

            <Button type="submit" variant="filled" color="#15abff" mt="lg">
              Submit
            </Button>
          </Flex>
        </form>
      </Paper>
    </>
  );
}

export default Apply;
