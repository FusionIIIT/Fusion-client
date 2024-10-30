import React, { useState } from "react";
import { TextInput, Textarea, Button, Container, Title } from "@mantine/core";

const GoBackButton = ({ setIsEditing }) => (
  <button
    onClick={() => setIsEditing(false)} // Set editing to false to go back
    style={{
      padding: "5px 10px",
      backgroundColor: "indigo",
      color: "#fff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
      marginBottom: "20px",
    }}
  >
    Go Back
  </button>
);

const EditFacilities = ({ setIsEditing }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [facilitiesDescription, setFacilitiesDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", {
      phoneNumber,
      email,
      facilitiesDescription,
    });
    setPhoneNumber("");
    setEmail("");
    setFacilitiesDescription("");
  };

  return (
    <div>
      <GoBackButton setIsEditing={setIsEditing} />
      <Container
        style={{
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      >
        <Title order={2} style={{ marginBottom: "20px" }}>
          Edit Information
        </Title>
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ marginBottom: "15px" }}
          />
          <TextInput
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: "15px" }}
          />
          <Textarea
            label="Facilities Description"
            value={facilitiesDescription}
            onChange={(e) => setFacilitiesDescription(e.target.value)}
            style={{ marginBottom: "20px" }}
          />
          <Button type="submit" style={{ backgroundColor: "indigo" }}>
            Submit
          </Button>
        </form>
      </Container>
    </div>
  );
};

export default EditFacilities;
