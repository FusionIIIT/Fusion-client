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
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { notifications } from "@mantine/notifications";
import {
  fetchAllTeachingCredits,
  fetchSemesterDetails,
  fetchTeachingCreditSlotEditData,
} from "../api/api";
import { host } from "../../../routes/globalRoutes";

const SLOT_NAME_PREFIX = "TC";

function Admin_edit_teaching_credit_slot_form() {
  const { tcslotid } = useParams();
  const [teachingCredits, setTeachingCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [semesterid, setSemesterid] = useState("");
  const [curriculumid, setCurriculumid] = useState("");
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [semesterNumberById, setSemesterNumberById] = useState({});
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      semester: "",
      slotName: "",
      information: "",
      teachingCredits: [],
      duration: 1,
      minLimit: 0,
      maxLimit: 1000,
    },
    validate: {
      slotName: (value) =>
        !value ? "Teaching credit slot name is required" : null,
    },
  });

  useEffect(() => {
    const loadTeachingCredits = async () => {
      try {
        const data = await fetchAllTeachingCredits();
        setTeachingCredits(data);
      } catch (err) {
        setError("Failed to load teaching credits.");
      }
    };

    const loadSlotDetails = async () => {
      try {
        const data = await fetchTeachingCreditSlotEditData(tcslotid);
        setSemesterid(data.semester);
        setCurriculumid(data.curriculum_id);
        form.setValues({
          semester: data.semester,
          slotName: data.name,
          information: data.teaching_credit_slot_info,
          teachingCredits: data.teaching_credits.map((tc) => tc.toString()),
          duration: data.duration,
          minLimit: data.min_registration_limit,
          maxLimit: data.max_registration_limit,
        });
      } catch (err) {
        setError("Failed to load teaching credit slot details.");
      } finally {
        setLoading(false);
      }
    };

    loadTeachingCredits();
    loadSlotDetails();
  }, [tcslotid]);

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

  const handleTeachingCreditSelect = (selectedId) => {
    form.setFieldValue("teachingCredits", selectedId);
  };

  const handleSubmit = async (values) => {
    const cacheChangeKey = `CurriculumCacheChange_${curriculumid}`;
    localStorage.setItem(cacheChangeKey, "true");
    setLoading(true);
    try {
      const formData = {
        semester: values.semester,
        name: values.slotName,
        teaching_credit_slot_info: values.information,
        teaching_credits: values.teachingCredits,
        duration: values.duration,
        min_registration_limit: values.minLimit,
        max_registration_limit: values.maxLimit,
      };
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        `${host}/programme_curriculum/api/admin_edit_teaching_credit_slot/${tcslotid}/`,
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
      const responseData = err.response?.data;
      notifications.show({
        title: "Failed to Update Teaching Credit Slot",
        message:
          responseData?.message ||
          responseData?.error ||
          (responseData?.errors &&
            Object.values(responseData.errors).flat().join(", ")) ||
          "Unable to update teaching credit slot. Please try again.",
        color: "red",
        autoClose: 5000,
      });
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
                  Edit Teaching Credit Slot Form
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
                  label="Teaching Credit Slot Name"
                  value={form.values.slotName}
                  description="Automatically set based on the selected semester"
                  disabled
                />

                <Textarea
                  label="Information"
                  placeholder="Enter information about this teaching credit slot"
                  value={form.values.information}
                  onChange={(event) =>
                    form.setFieldValue("information", event.currentTarget.value)
                  }
                  rows={4}
                  required
                />

                <MultiSelect
                  label="Teaching Credits"
                  placeholder="Search and select teaching credits"
                  data={teachingCredits.map((tc) => ({
                    value: `${tc.id}`,
                    label: `${tc.code} - ${tc.name}`,
                  }))}
                  value={form.values.teachingCredits}
                  onChange={handleTeachingCreditSelect}
                  searchable
                  nothingFound="No teaching credits available"
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

export default Admin_edit_teaching_credit_slot_form;
