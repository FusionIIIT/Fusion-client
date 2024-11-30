import React, { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  Modal,
  Button,
  TextInput,
  Select,
  Textarea,
  Card,
  Container,
} from "@mantine/core";

function CreateNextRoundForm() {
  const [modalOpened, setModalOpened] = useState(false);
  const [roundNumber, setRoundNumber] = useState();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [roundType, setRoundType] = useState("");

  const loc = useLocation();
  const searchParams = new URLSearchParams(loc.search);
  const jobId = searchParams.get("jobId");
  
  const handleSubmit = () => {
    const nextRoundDetails = {
      round_no:roundNumber,
      test_date:date,
      // time:time,
      // location:location,
      description:description,
      test_type:roundType,
    };

    console.log("Next Round Details:", nextRoundDetails);
    setModalOpened(false);
    // Reset form fields
    setRoundNumber();
    setDate("");
    setTime("");
    setLocation("");
    setDescription("");
    setRoundType("");

    const submitFunc = async () => {
      const token = localStorage.getItem("authToken");
      console.log(jobId);
      try{
          const response = await axios.post(`http://127.0.0.1:8000/placement/api/nextround/${jobId}/`,nextRoundDetails,{
            headers:{
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            }
          });
          if(response.status===201){
            window.alert('succesfully posted');
          }
          else{
            console.error('failed to post');
          }
      }
      catch(error){
        console.error(error)
      }
    };
    submitFunc();
  
  };

  return (
    <Container>
      <Button onClick={() => setModalOpened(true)}>Create Next Round</Button>
      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Add Next Round Details"
      >
        <Card shadow="sm" padding="md" radius="md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <TextInput
              label="Round Number"
              placeholder="Enter round number"
              type="number" 
              value={roundNumber}
              onChange={(e) => setRoundNumber(e.target.value)}
              required
            />
            <TextInput
              label="Date"
              placeholder="YYYY-MM-DD"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            {/* <TextInput
              label="Time"
              placeholder="HH:MM (24-hour format)"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <TextInput
              label="Location"
              placeholder="Enter location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            /> */}
            <Textarea
              label="Description"
              placeholder="Enter a brief description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Select
              label="Round Type"
              placeholder="Select round type"
              data={[
                { value: "technical", label: "Technical" },
                { value: "hr", label: "HR" },
                { value: "group_discussion", label: "Group Discussion" },
                { value: "coding", label: "Coding" },
              ]}
              value={roundType}
              onChange={setRoundType}
              required
            />
            <Button type="submit" style={{ marginTop: "12px" }} fullWidth>
              Save Round Details
            </Button>
          </form>
        </Card>
      </Modal>
    </Container>
  );
}

export default CreateNextRoundForm;
