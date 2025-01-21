import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Flex,
  Paper,
  TextInput,
  Textarea,
  FileInput,
  Select,
  Button,
  Grid,
  Title,
  Text,
} from "@mantine/core";
import { lodgeComplaint } from "../routes/api"; // Import the utility function

function ComplaintForm() {
  const role = useSelector((state) => state.user.role);
  const [complaintType, setComplaintType] = useState("");
  const [location, setLocation] = useState("");
  const [specificLocation, setSpecificLocation] = useState("");
  const [complaintDetails, setComplaintDetails] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [key, setKey] = useState(0);

  const resetFormFields = () => {
    setComplaintType("");
    setLocation("");
    setSpecificLocation("");
    setComplaintDetails("");
    setFile(null);
    setIsSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setIsSuccess(false);

    const token = localStorage.getItem("authToken");

    // Prepare form data
    const formData = new FormData();
    formData.append("complaint_type", complaintType);
    formData.append("location", location);
    formData.append("specific_location", specificLocation);
    formData.append("details", complaintDetails);
    if (file) {
      formData.append("upload_complaint", file);
    }

    const response = await lodgeComplaint(role, formData, token);

    if (response.success) {
      setIsSuccess(true);
      console.log("Complaint registered:", response.data);

      setTimeout(() => {
        resetFormFields();
        setKey((prevKey) => prevKey + 1);
      }, 2000);
    } else {
      setErrorMessage(
        response.error.detail ||
          "Error registering complaint. Please try again.",
      );
      console.error("Error registering complaint:", response.error);
    }

    setLoading(false);
  };

  return (
    <Grid
      mt="xl"
      // Original container styling retained
      style={{ paddingInline: "49px", width: "100%" }}
      sx={(theme) => ({
        [theme.fn.smallerThan("sm")]: {
          paddingInline: theme.spacing.md, // Gentler padding on small devices
        },
      })}
    >
      <Paper
        key={key}
        radius="md"
        px="lg"
        pt="sm"
        pb="xl"
        style={{
          borderLeft: "0.6rem solid #15ABFF",
          backgroundColor: "white",
          minHeight: "45vh",
          maxHeight: "70vh",
          width: "70vw",
        }}
        withBorder
        sx={(theme) => ({
          [theme.fn.smallerThan("sm")]: {
            width: "90vw", // Expand slightly for small devices
          },
        })}
      >
        <Title
          order={3}
          mb="md"
          sx={(theme) => ({
            fontSize: 24, // Keep your desktop size
            [theme.fn.smallerThan("sm")]: {
              fontSize: theme.fontSizes.md, // ~16px on smaller screens
            },
          })}
        >
          Add a new Complaint
        </Title>

        {errorMessage && (
          <Text color="red" mb="md" fz="md">
            {errorMessage}
          </Text>
        )}

        <form onSubmit={handleSubmit}>
          <Grid>
            <Grid.Col xs={12} md={6}>
              <Select
                label="Complaint Type"
                placeholder="Select Complaint Type"
                value={complaintType}
                onChange={setComplaintType}
                data={[
                  "Electricity",
                  "carpenter",
                  "plumber",
                  "garbage",
                  "dustbin",
                  "internet",
                  "other",
                ]}
                required
                mb="md"
                labelProps={{ fz: "md" }}
                styles={(theme) => ({
                  input: {
                    fontSize: theme.fontSizes.md,
                  },
                })}
              />
            </Grid.Col>
            <Grid.Col xs={12} md={6}>
              <Select
                label="Location"
                placeholder="Select Location"
                value={location}
                onChange={setLocation}
                data={[
                  "hall-1",
                  "hall-3",
                  "hall-4",
                  "library",
                  "computer center",
                  "core_lab",
                  "LHTC",
                  "NR2",
                  "NR3",
                  "Admin building",
                  "Rewa_Residency",
                  "Maa Saraswati Hostel",
                  "Nagarjun Hostel",
                  "Panini Hostel",
                ]}
                required
                mb="md"
                labelProps={{ fz: "md" }}
                styles={(theme) => ({
                  input: {
                    fontSize: theme.fontSizes.md,
                  },
                })}
              />
            </Grid.Col>
          </Grid>
          <TextInput
            label="Specific Location"
            placeholder="Room number, Floor, Block, etc."
            value={specificLocation}
            onChange={(e) => setSpecificLocation(e.target.value)}
            required
            mb="md"
            labelProps={{ fz: "md" }}
            styles={(theme) => ({
              input: {
                fontSize: theme.fontSizes.md,
              },
            })}
          />
          <Textarea
            label="Complaint Details"
            placeholder="What is your complaint?"
            value={complaintDetails}
            onChange={(e) => setComplaintDetails(e.target.value)}
            required
            mb="md"
            labelProps={{ fz: "md" }}
            styles={(theme) => ({
              input: {
                fontSize: theme.fontSizes.md,
              },
            })}
          />
          <FileInput
            label="Attach Files (PDF, JPEG, PNG, JPG)"
            placeholder="Choose File"
            accept=".pdf,.jpeg,.png,.jpg"
            onChange={setFile}
            mb="md"
            labelProps={{ fz: "md" }}
            styles={(theme) => ({
              input: {
                fontSize: theme.fontSizes.md,
              },
            })}
          />
          <Flex direction="row" justify="space-between" align="center">
            <Text size="sm" color="dimmed" fz="md">
              Complaint will be registered with your User ID.
            </Text>

            {/* 
              Submit button on large screens remains 150px wide, 
              but on small screens it goes full-width for better responsiveness. 
            */}
            <Button
              type="submit"
              variant="filled"
              color="blue"
              loading={loading}
              sx={(theme) => ({
                width: 150,
                fontSize: theme.fontSizes.md,
                backgroundColor: isSuccess ? "#2BB673" : theme.colors.blue[6],
                color: isSuccess ? "black" : "white",
                [theme.fn.smallerThan("sm")]: {
                  width: "100%", // full width on small devices
                  marginTop: theme.spacing.sm,
                },
              })}
            >
              {loading ? "Loading..." : isSuccess ? "Submitted" : "Submit"}
            </Button>
          </Flex>
        </form>
      </Paper>
    </Grid>
  );
}

export default ComplaintForm;
