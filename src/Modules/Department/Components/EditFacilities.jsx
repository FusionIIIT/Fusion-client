import React, { useState } from "react";
import axios from "axios"; // Import axios
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

const EditFacilities = ({ setIsEditing, branch }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [facilitiesDescription, setFacilitiesDescription] = useState("");
  const [loading, setLoading] = useState(false); // To manage loading state
  const [errorMessage, setErrorMessage] = useState(""); // To handle errors
  const [isSuccess, setIsSuccess] = useState(false); // To handle success message

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    const token = localStorage.getItem("authToken"); // Get token from local storage

    // Construct the data to be sent, matching your sample JSON
    const data = {
      phone_number: phoneNumber,
      email: email,
      facilites: facilitiesDescription, // Ensure the spelling matches your API's expectations
      department: branch, // Include the branch in the request
    };

    try {
      // Make the API request using PUT method
      const response = await axios.put(
        "http://127.0.0.1:8000/dep/api/information/update-create/",
        data,
        {
          headers: {
            Authorization: `Token ${token}`, // Include the token in the headers
          },
        },
      );

      console.log("Form Data Updated:", response.data); // Log the response
      setIsSuccess(true); // Set success state

      // Reset the form fields
      setPhoneNumber("");
      setEmail("");
      setFacilitiesDescription("");
    } catch (error) {
      const errorResponse = error.response?.data || error.message;
      setErrorMessage(
        errorResponse.detail || "Error updating data. Please try again.",
      );
      console.error("Error updating data:", errorResponse);
    } finally {
      setLoading(false); // Stop loading
    }
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
          Edit Information for {branch} Department
        </Title>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
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
          <Button
            type="submit"
            style={{ backgroundColor: "indigo" }}
            loading={loading}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
          {isSuccess && (
            <p style={{ color: "green" }}>Data updated successfully!</p>
          )}
        </form>
      </Container>
    </div>
  );
};

export default EditFacilities;
