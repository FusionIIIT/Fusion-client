import React, { useState } from "react";
import { TextInput, Textarea, Title, Button, FileInput, Group, Notification } from "@mantine/core";

function CompanyRegistrationForm() {
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!companyName || !description || !address || !website) {
      setError("Please fill all required fields.");
      return;
    }

    // Handle form submission (e.g., send to backend)
    console.log({ companyName, description, address, website, logo });
    setError(""); // Clear error if form is valid
    alert("Company Registered Successfully!");
  };

  return (
    <div>
        <Title order={2}mb="xl">
                Company Registration
        </Title>
      {error && (
        <Notification color="red" onClose={() => setError("")}>
          {error}
        </Notification>
      )}
      
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Company Name"
          placeholder="Enter company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />
        <Textarea
          label="Company Description"
          placeholder="Enter a brief description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <TextInput
          label="Company Address"
          placeholder="Enter company address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />
        <TextInput
          label="Website URL"
          placeholder="Enter website URL"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          required
        />
        <FileInput
          label="Company Logo"
          value={logo}
          onChange={setLogo}
          placeholder="Upload logo"
          accept="image/*"
        />
        <Group position="right" mt="md">
          <Button type="submit">Register Company</Button>
        </Group>
      </form>
    </div>
  );
}

export default CompanyRegistrationForm;
