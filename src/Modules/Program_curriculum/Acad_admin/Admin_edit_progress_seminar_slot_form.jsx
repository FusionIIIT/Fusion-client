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
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  fetchAllProgressSeminars,
  fetchSemesterDetails,
  fetchProgressSeminarSlotEditData,
} from "../api/api";
import { host } from "../../../routes/globalRoutes";

function Admin_edit_progress_seminar_slot_form() {
  const { psslotid } = useParams();
  const [progressSeminars, setProgressSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semesterid, setSemesterid] = useState("");
  const [curriculumid, setCurriculumid] = useState("");
  const [semesterOptions, setSemesterOptions] = useState([]);
  const navigate = useNavigate();

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

  useEffect(() => {
    const loadProgressSeminars = async () => {
      try {
        const data = await fetchAllProgressSeminars();
        setProgressSeminars(data);
      } catch (err) {
        setError("Failed to load progress seminars.");
      }
    };

    const loadSlotDetails = async () => {
      try {
        const data = await fetchProgressSeminarSlotEditData(psslotid);
        setSemesterid(data.semester);
        setCurriculumid(data.curriculum_id);
        form.setValues({
          semester: data.semester,
          slotName: data.name,
          information: data.progress_seminar_slot_info,
          progressSeminars: data.progress_seminars.map((ps) => ps.toString()),
          duration: data.duration,
          minLimit: data.min_registration_limit,
          maxLimit: data.max_registration_limit,
        });
      } catch (err) {
        setError("Failed to load progress seminar slot details.");
      } finally {
        setLoading(false);
      }
    };

    loadProgressSeminars();
    loadSlotDetails();
  }, [psslotid]);

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

  const handlePSSelect = (selectedId) => {
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
      const response = await axios.put(
        `${host}/programme_curriculum/api/admin_edit_progress_seminar_slot/${psslotid}/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (response.status === 200) {
        navigate(
          `/programme_curriculum/view_curriculum/?curriculum=${curriculumid}`,
        );
      }
    } catch (err) {
      console.error("Error updating progress seminar slot:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
                  Edit Progress Seminar Slot Form
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
                    form.setFieldValue("slotName", event.currentTarget.value)
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
                  value={form.values.progressSeminars}
                  onChange={handlePSSelect}
                  searchable
                  nothingFound="No progress seminars available"
                  required
                />

                <NumberInput
                  label="Duration (semesters)"
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
                  Update
                </Button>
              </Group>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default Admin_edit_progress_seminar_slot_form;
