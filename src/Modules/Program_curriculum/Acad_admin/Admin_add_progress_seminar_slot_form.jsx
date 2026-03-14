import { React, useEffect, useState } from "react";
import {
  Select,
  NumberInput,
  Textarea,
  TextInput,
  Button,
  Group,
  Text,
  Container,
  Stack,
  MultiSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  fetchAllProgressSeminars,
  fetchSemesterDetails,
} from "../api/api";
import { host } from "../../../routes/globalRoutes";

function Admin_add_progress_seminar_slot_form() {
  const [progressSeminars, setProgressSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProgressSeminars = async () => {
      try {
        const data = await fetchAllProgressSeminars();
        setProgressSeminars(data);
      } catch (err) {
        setError("Failed to load progress seminars.");
      } finally {
        setLoading(false);
      }
    };
    loadProgressSeminars();
  }, []);

  const form = useForm({
    initialValues: {
      semester: "",
      slotName: "",
      information: "",
      progressSeminars: [],
      duration: 1,
      minLimit: 0,
      maxLimit: 1000,
    },
    validate: {
      slotName: (value) =>
        !value ? "Progress seminar slot name is required" : null,
    },
  });

  const [searchParams] = useSearchParams();
  const semesterid = searchParams.get("semester");
  const curriculumid = searchParams.get("curriculum");

  useEffect(() => {
    const loadSemesterDetails = async () => {
      try {
        if (semesterid && curriculumid) {
          const data = await fetchSemesterDetails(curriculumid, semesterid);
          const formattedOptions = data.semesters.map((semester) => ({
            value: semester.semester_id.toString(),
            label: `${data.curriculum_name} v${data.curriculum_version} Sem-${semester.semester_number}`,
          }));
          setSemesterOptions(formattedOptions);
          if (semesterid) {
            form.setFieldValue("semester", semesterid.toString());
          }
        }
      } catch (err) {
        console.error("Error fetching semester details:", err);
      }
    };
    loadSemesterDetails();
  }, [semesterid, curriculumid]);

  const handleProgressSeminarSelect = (selectedId) => {
    form.setFieldValue("progressSeminars", selectedId);
  };

  const handleSubmit = async (values) => {
    const cacheChangeKey = `CurriculumCacheChange_${curriculumid}`;
    localStorage.setItem(cacheChangeKey, "true");
    setLoading(true);
    try {
      const formData = {
        semester: values.semester,
        name: values.slotName,
        progress_seminar_slot_info: values.information,
        progress_seminars: values.progressSeminars,
        duration: values.duration,
        min_registration_limit: values.minLimit,
        max_registration_limit: values.maxLimit,
      };
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${host}/programme_curriculum/api/admin_add_progress_seminar_slot/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (response.status === 200) {
        navigate(
          `/programme_curriculum/view_curriculum?curriculum=${curriculumid}`,
        );
      }
    } catch (err) {
      console.error("Error submitting progress seminar slot:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(
      `/programme_curriculum/view_curriculum?curriculum=${curriculumid}`,
    );
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Container
        fluid
        style={{
          display: "flex",
          justifyContent: "left",
          alignItems: "left",
          width: "100%",
          margin: "0 0 0 -3.2vw",
        }}
      >
        <div
          style={{
            maxWidth: "290vw",
            width: "100%",
            display: "flex",
            gap: "2rem",
            padding: "2rem",
            flex: 4,
          }}
        >
          <div style={{ flex: 4 }}>
            <form
              onSubmit={form.onSubmit(handleSubmit)}
              style={{
                backgroundColor: "#fff",
                padding: "2rem",
                borderRadius: "8px",
                boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              }}
            >
              <Stack spacing="lg">
                <Text size="xl" weight={700} align="center">
                  Progress Seminar Slot Form
                </Text>

                <Select
                  label="For Semester"
                  placeholder="Select Semester"
                  data={semesterOptions}
                  value={form.values.semester}
                  onChange={(value) => form.setFieldValue("semester", value)}
                  required
                />

                <TextInput
                  label="Progress Seminar Slot Name"
                  placeholder="Enter Name/Code"
                  value={form.values.slotName}
                  onChange={(event) =>
                    form.setFieldValue(
                      "slotName",
                      event.currentTarget.value,
                    )
                  }
                  required
                />

                <Textarea
                  label="Information"
                  placeholder="Enter information about this progress seminar slot"
                  value={form.values.information}
                  onChange={(event) =>
                    form.setFieldValue("information", event.currentTarget.value)
                  }
                  rows={4}
                  required
                />

                <MultiSelect
                  label="Progress Seminars"
                  placeholder="Search and select progress seminars"
                  data={progressSeminars.map((ps) => ({
                    value: `${ps.id}`,
                    label: `${ps.code} - ${ps.name}`,
                  }))}
                  onChange={handleProgressSeminarSelect}
                  searchable
                  nothingFound="No progress seminars available"
                  required
                />

                <NumberInput
                  label="Duration (hours)"
                  min={1}
                  value={form.values.duration}
                  onChange={(value) => form.setFieldValue("duration", value)}
                  required
                />

                <NumberInput
                  label="Min Registration Limit"
                  min={0}
                  value={form.values.minLimit}
                  onChange={(value) => form.setFieldValue("minLimit", value)}
                  required
                />

                <NumberInput
                  label="Max Registration Limit"
                  min={1}
                  value={form.values.maxLimit}
                  onChange={(value) => form.setFieldValue("maxLimit", value)}
                  required
                />
              </Stack>

              <Group position="right" mt="lg">
                <Button
                  variant="outline"
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="submit" className="submit-btn">
                  Submit
                </Button>
              </Group>
            </form>
          </div>

          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
            }}
          />
        </div>
      </Container>
    </div>
  );
}

export default Admin_add_progress_seminar_slot_form;
