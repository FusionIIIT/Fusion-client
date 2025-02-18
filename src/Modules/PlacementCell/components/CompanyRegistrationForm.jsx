import React, { useState } from "react";
import { TextInput, Textarea, Title, Button, FileInput, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { fetchRegistrationRoute } from "../../../routes/placementCellRoutes";
import axios from "axios";

function CompanyRegistrationForm() {
  const [companyName, setCompanyName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!companyName || !description || !address || !website) {
      setError("Please fill all required fields.");
      return;
    }
    const newRegistration = { companyName, description, address, website, logo };
    try {
      const token = localStorage.getItem("authToken");
      console.log(newRegistration);
      const response = await axios.post(
        fetchRegistrationRoute,
        newRegistration,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.status == 200) {
        notifications.show({
          title: "Success",
          message: "successfully added!",
          color: "green",
          position: "top-center",
        });
      } else {
        notifications.show({
          title: "Failed",
          message: `Failed to add`,
          color: "red",
          position: "top-center",
        });
      }
    }
    catch (error) {
      console.error("Error adding restriction:", error);
      notifications.show({
        title: "Error",
        message: "Failed to add restriction.",
        color: "red",
        position: "top-center",
      });
    }
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
