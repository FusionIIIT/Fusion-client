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

  // States for the Edit Labs form
  const [labName, setLabName] = useState("");
  const [labCapacity, setLabCapacity] = useState("");
  const [labLocation, setLabLocation] = useState("");
  const [labLoading, setLabLoading] = useState(false); // To manage loading state for labs
  const [labErrorMessage, setLabErrorMessage] = useState(""); // To handle errors for labs
  const [labIsSuccess, setLabIsSuccess] = useState(false); // To handle success message for labs

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    const token = localStorage.getItem("authToken"); // Get token from local storage

    // Construct the data to be sent for facilities
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

  const handleLabSubmit = async (e) => {
    e.preventDefault();
    setLabLoading(true); // Start loading for lab submission

    const token = localStorage.getItem("authToken"); // Get token from local storage

    // Construct the data to be sent for lab
    const labData = {
      name: labName,
      capacity: labCapacity,
      location: labLocation,
      department: branch, // Include the branch in the request
    };

    try {
      // Make the API request using POST method
      const response = await axios.post(
        "http://127.0.0.1:8000/dep/api/labsadd/",
        labData,
        {
          headers: {
            Authorization: `Token ${token}`, // Include the token in the headers
          },
        },
      );

      console.log("Lab Data Submitted:", response.data); // Log the response
      setLabIsSuccess(true); // Set success state for lab submission

      // Reset the form fields
      setLabName("");
      setLabCapacity("");
      setLabLocation("");
    } catch (error) {
      const errorResponse = error.response?.data || error.message;
      setLabErrorMessage(
        errorResponse.detail || "Error adding lab. Please try again.",
      );
      console.error("Error adding lab:", errorResponse);
    } finally {
      setLabLoading(false); // Stop loading for lab submission
    }
  };

  return (
    <div>
      <GoBackButton setIsEditing={setIsEditing} />
      <Container
        style={{
          padding: "20px",
          borderRadius: "8px",
          // Removed border from Container
          display: "flex",
          flexDirection: "column", // Set to column for the GoBackButton and Title
        }}
      >
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

        {/* Flex container for horizontal layout */}
        <div style={{ display: "flex", gap: "20px" }}>
          {/* Facilities Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              flex: "1",
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <Title order={6} style={{ marginBottom: "20px" }}>
              Information
            </Title>
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

          {/* Edit Labs Form */}
          <form
            onSubmit={handleLabSubmit}
            style={{
              flex: "1",
              border: "1px solid #ccc",
              padding: "20px",
              borderRadius: "8px",
            }}
          >
            <Title order={6} style={{ marginBottom: "20px" }}>
              Labs
            </Title>
            <TextInput
              label="Name"
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              style={{ marginBottom: "15px" }}
            />
            <TextInput
              label="Capacity"
              value={labCapacity}
              onChange={(e) => setLabCapacity(e.target.value)}
              style={{ marginBottom: "15px" }}
            />
            <TextInput
              label="Location"
              value={labLocation}
              onChange={(e) => setLabLocation(e.target.value)}
              style={{ marginBottom: "20px" }}
            />
            <Button
              type="submit"
              style={{ backgroundColor: "indigo", marginTop: "20px" }}
              loading={labLoading} // Manage loading state for labs
            >
              {labLoading ? "Adding..." : "Add"}
            </Button>
            {labIsSuccess && (
              <p style={{ color: "green" }}>Lab added successfully!</p>
            )}
            {labErrorMessage && (
              <p style={{ color: "red" }}>{labErrorMessage}</p>
            )}
          </form>
        </div>
      </Container>
    </div>
  );
};

export default EditFacilities;
