import { useState } from "react";
import {
  Card,
  Text,
  Button,
  TextInput,
  Alert,
  Group,
  Modal,
  Loader,
} from "@mantine/core";
import axios from "axios";
import FusionTable from "../../components/FusionTable";
import { errorMessage } from "../../lib/errors";
import {
  deletePreRegistrationRoute,
  searchPreRegistrationRoute,
} from "../../routes/academicRoutes";

function RegistrationSearch() {
  const [rollNo, setRollNo] = useState("");
  const [semester, setSemester] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  const handleSearch = async () => {
    setError("");
    setSearchResults(null);
    setLoading(true); // Start loading
    if (!rollNo || !semester) {
      setError("Please fill both Roll No and Semester fields");
      setLoading(false); // Stop loading
      return;
    }

    const token = localStorage.getItem("authToken"); // Get token from local storage
    if (!token) {
      setLoading(false); // Stop loading
      throw new Error("No token found"); // Handle the case where the token is not available
    }

    const roll = rollNo.trim().toUpperCase();
    try {
      const response = await axios.post(
        searchPreRegistrationRoute,
        {
          roll_no: roll,
          sem_no: semester,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      const {
        student_registration_check: registrationCheck,
        initial_registration: choices,
      } = response.data;
      // A submission that stopped part way saved course choices without the
      // pre-registration record; it still has to be found here to be deleted.
      if (registrationCheck || choices?.length) {
        setSearchResults({ ...response.data, roll, semester });
      } else {
        setError("No Registration Found!");
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem("authToken"); // Get token from local storage
    if (!token) {
      throw new Error("No token found"); // Handle the case where the token is not available
    }

    setLoading(true); // Start loading
    try {
      const response = await axios.post(
        deletePreRegistrationRoute,
        {
          roll_no: searchResults.roll,
          sem_no: searchResults.semester,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      setDeleteModalOpen(false);
      alert(response.data.message);
      setSearchResults(null);
    } catch (er) {
      setError(er);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const columnNames = ["Course", "Semester", "Course Slot", "Type", "Priority"];
  const check = searchResults?.student_registration_check;

  const mappedResults = searchResults
    ? searchResults.initial_registration.map((result) => ({
        Course: result.course_id?.name || "N/A",
        Semester: result.semester_id?.semester_no || "N/A",
        "Course Slot": result.course_slot_id?.name || "N/A",
        Type: result.registration_type || "N/A",
        Priority: result.priority || "N/A",
      }))
    : [];

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <div style={{ maxWidth: "100%", gap: 16, display: "grid" }}>
        <TextInput
          label="Roll No:"
          placeholder="Enter Roll No"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
        />

        <TextInput
          label="Semester:"
          placeholder="Enter Semester"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
        />

        <Button
          size="md"
          radius="sm"
          onClick={handleSearch}
          style={{ backgroundColor: "#3B82F6", color: "white" }}
          disabled={loading} // Disable button while loading
        >
          {loading ? "Loading..." : "Search"} {/* Show loading text */}
        </Button>
      </div>

      {error && (
        <Alert title="Error" color="red" mt="md">
          {errorMessage(error)}
        </Alert>
      )}

      {searchResults && (
        <div style={{ marginTop: 20 }}>
          <Text fw={600} mb="sm" size="xl">
            Search Results
          </Text>

          <Text fw={600} size="lg" mb="md" style={{ color: "#3B82F6" }}>
            Initial Registrations:
          </Text>

          <div style={{ overflowX: "auto" }}>
            <FusionTable
              columnNames={columnNames}
              elements={mappedResults}
              groupBy="Course Slot"
              width="100%"
            />
          </div>

          <Text fw={600} size="lg" mt="lg" mb="md" style={{ color: "#3B82F6" }}>
            Student Registration Check:
          </Text>

          {!check && (
            <Alert color="yellow" mb="md">
              These course choices were saved without the pre-registration
              record, so the student&apos;s submission did not finish. Delete
              them so the student can submit again.
            </Alert>
          )}

          <Card
            shadow="sm"
            p="md"
            withBorder
            style={{ backgroundColor: "#f8f9fa" }}
          >
            <Group gap="xs" mb={4}>
              <Text fw={500}>Student Roll No:</Text>
              <Text style={{ fontWeight: 600 }}>{searchResults.roll}</Text>
            </Group>
            <Group gap="xs" mb={4}>
              <Text fw={500}>Pre-Registration Flag:</Text>
              <Text c={check?.pre_registration_flag ? "green" : "red"} fw={600}>
                {check?.pre_registration_flag ? "True" : "False"}
              </Text>
            </Group>
            <Group gap="xs">
              <Text fw={500}>Final Registration Flag:</Text>
              <Text
                c={check?.final_registration_flag ? "green" : "red"}
                fw={600}
              >
                {check?.final_registration_flag ? "True" : "False"}
              </Text>
            </Group>
            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                color="red"
                size="sm"
                onClick={() => setDeleteModalOpen(true)}
              >
                Delete Pre-Registration
              </Button>
            </Group>
          </Card>
        </div>
      )}

      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: "1rem",
          }}
        >
          <Loader variant="dots" />
        </div>
      )}

      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <Text mb="sm">
          Are you sure you want to delete pre-registration details?
        </Text>
        <Text fw={600} mb="lg">
          This action cannot be undone!
        </Text>
        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={() => {
              handleDelete();
            }}
            disabled={loading} // Disable button while loading
          >
            {loading ? "Deleting..." : "Confirm Delete"}{" "}
            {/* Show loading text */}
          </Button>
        </Group>
      </Modal>
    </Card>
  );
}

export default RegistrationSearch;
