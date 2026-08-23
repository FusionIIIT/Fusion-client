import { React, useEffect, useState } from "react";
import {
  Select,
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
import { notifications } from "@mantine/notifications";
import {
  fetchAllSeminars,
  fetchSemesterDetails,
} from "../api/api";
import { host } from "../../../routes/globalRoutes";

const SLOT_NAME_PREFIX = "SEM";

function Admin_add_seminar_slot_form() {
  const [seminars, setSeminars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [semesterNumberById, setSemesterNumberById] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const loadSeminars = async () => {
      try {
        const data = await fetchAllSeminars();
        setSeminars(data);
      } catch (err) {
        setError("Failed to load seminars.");
      } finally {
        setLoading(false);
      }
    };
    loadSeminars();
  }, []);

  const form = useForm({
    initialValues: {
      semester: "",
      slotName: "",
      information: "",
      seminars: [],
      duration: 1,
      minLimit: 0,
      maxLimit: 1000,
    },
    validate: {
      slotName: (value) =>
        !value ? "Seminar slot name is required" : null,
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
          const numberById = {};
          data.semesters.forEach((semester) => {
            numberById[semester.semester_id.toString()] = semester.semester_number;
          });
          setSemesterNumberById(numberById);
          if (semesterid) {
            form.setFieldValue("semester", semesterid.toString());
            const semNum = numberById[semesterid.toString()];
            if (semNum) {
              form.setFieldValue("slotName", `${SLOT_NAME_PREFIX}${semNum}`);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching semester details:", err);
      }
    };
    loadSemesterDetails();
  }, [semesterid, curriculumid]);

  const handleSemesterChange = (value) => {
    form.setFieldValue("semester", value);
    const semNum = semesterNumberById[value];
    form.setFieldValue("slotName", semNum ? `${SLOT_NAME_PREFIX}${semNum}` : "");
  };

  const handleSeminarSelect = (selectedId) => {
    form.setFieldValue("seminars", selectedId);
  };

  const handleSubmit = async (values) => {
    const cacheChangeKey = `CurriculumCacheChange_${curriculumid}`;
    localStorage.setItem(cacheChangeKey, "true");
    setLoading(true);
    try {
      const formData = {
        semester: values.semester,
        name: values.slotName,
        seminar_slot_info: values.information,
        seminars: values.seminars,
        duration: values.duration,
        min_registration_limit: values.minLimit,
        max_registration_limit: values.maxLimit,
      };
      const token = localStorage.getItem("authToken");
      const response = await axios.post(
        `${host}/programme_curriculum/api/admin_add_seminar_slot/`,
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
      notifications.show({
        title: "Failed to Create Seminar Slot",
        message:
          err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to create seminar slot. Please try again.",
        color: "red",
        autoClose: 5000,
      });
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
              <Stack gap="lg">
                <Text size="xl" fw={700} ta="center">
                  Seminar Slot Form
                </Text>

                <Select
                  label="For Semester"
                  placeholder="Select Semester"
                  data={semesterOptions}
                  value={form.values.semester}
                  onChange={handleSemesterChange}
                  required
                />

                <TextInput
                  label="Seminar Slot Name"
                  value={form.values.slotName}
                  description="Automatically set based on the selected semester"
                  disabled
                />

                <Textarea
                  label="Information"
                  placeholder="Enter information about this seminar slot"
                  value={form.values.information}
                  onChange={(event) =>
                    form.setFieldValue("information", event.currentTarget.value)
                  }
                  rows={4}
                  required
                />

                <MultiSelect
                  label="Seminars"
                  placeholder="Search and select seminars"
                  data={seminars.map((seminar) => ({
                    value: `${seminar.id}`,
                    label: `${seminar.code} - ${seminar.name}`,
                  }))}
                  onChange={handleSeminarSelect}
                  searchable
                  nothingFoundMessage="No seminars available"
                  required
                />
              </Stack>

              <Group justify="flex-end" mt="lg">
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

export default Admin_add_seminar_slot_form;
