import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Flex, Tabs, Text, Divider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useFormState } from "../utils/formHelpers";
import { updateProfileSection } from "../services/profileService";
import EducationForm from "../components/forms/EducationForm";
import CourseForm from "../components/forms/CourseForm";
import EducationTable from "../components/tables/EducationTable";
import CoursesTable from "../components/tables/CoursesTable";

function EducationTab({ educationData, onAddEducation }) {
  const { formData, handleInputChange, resetForm } = useFormState({
    degree: "",
    stream: "",
    institute: "",
    grade: "",
    start_date: "",
    end_date: "",
  });

  const handleSubmit = async () => {
    try {
      const payload = {
        degree: formData.degree,
        stream: formData.stream,
        institute: formData.institute,
        grade: formData.grade,
      };

      if (formData.start_date) {
        payload.sdate = formData.start_date;
      }
      if (formData.end_date) {
        payload.edate = formData.end_date;
      }

      const response = await updateProfileSection({ education: payload });
      const createdEducation = response?.data?.id
        ? response.data
        : {
            ...formData,
            sdate: formData.start_date,
            edate: formData.end_date,
          };

      onAddEducation(createdEducation);
      notifications.show({
        message: "Education Added Successfully!",
        color: "green",
      });
      resetForm();
    } catch (error) {
      notifications.show({
        message: "Failed! Please try later.",
        color: "red",
      });
    }
  };

  return (
    <Flex
      w="100%"
      p="md"
      direction="column"
      style={{ border: "1px solid lightgray", borderRadius: "5px" }}
    >
      <Text fw={500} mb="md">
        Add a New Educational Qualification
      </Text>
      <EducationForm
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
      />
      <Divider my="md" />
      <Text fw={500} mb="md">
        Your Educations
      </Text>
      <EducationTable educationData={educationData} />
    </Flex>
  );
}

function CoursesTab({ coursesData, onAddCourse }) {
  const { formData, handleInputChange, resetForm } = useFormState({
    course_name: "",
    license: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  const handleSubmit = async () => {
    try {
      const payload = {
        course_name: formData.course_name,
        description: formData.description,
        license_no: formData.license,
      };

      if (formData.start_date) {
        payload.sdate = formData.start_date;
      }
      if (formData.end_date) {
        payload.edate = formData.end_date;
      }

      const response = await updateProfileSection({ coursesubmit: payload });
      const createdCourse = response?.data?.id
        ? response.data
        : {
            ...formData,
            license_no: formData.license,
            sdate: formData.start_date,
            edate: formData.end_date,
          };

      onAddCourse(createdCourse);
      notifications.show({
        message: "Certificates added Successfully!",
        color: "green",
      });
      resetForm();
    } catch (error) {
      notifications.show({
        message: "Failed! Please try later.",
        color: "red",
      });
    }
  };

  return (
    <Flex
      w="100%"
      p="md"
      direction="column"
      style={{ border: "1px solid lightgray", borderRadius: "5px" }}
    >
      <Text fw={500} mb="md">
        Add a New Certification Course
      </Text>
      <CourseForm
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
      />
      <Divider my="md" />
      <Text fw={500} mb="md">
        Your Certificates
      </Text>
      <CoursesTable coursesData={coursesData} />
    </Flex>
  );
}

export default function EducationCoursesComponent({ education, courses }) {
  const [educationList, setEducationList] = useState(education || []);
  const [coursesList, setCoursesList] = useState(courses || []);

  useEffect(() => {
    setEducationList(education || []);
  }, [education]);

  useEffect(() => {
    setCoursesList(courses || []);
  }, [courses]);

  const handleAddEducation = (newEducation) => {
    setEducationList((prev) => [...prev, newEducation]);
  };

  const handleAddCourse = (newCourse) => {
    setCoursesList((prev) => [...prev, newCourse]);
  };

  return (
    <Flex
      w={{ base: "100%", sm: "60%" }}
      p="md"
      h="auto"
      style={{ border: "1px solid lightgray", borderRadius: "5px" }}
      direction="column"
      justify="space-evenly"
    >
      <Tabs defaultValue="education">
        <Tabs.List mb="sm">
          <Tabs.Tab value="education">
            <Text fw={500} size="1.2rem">
              Education
            </Text>
          </Tabs.Tab>
          <Tabs.Tab value="courses">
            <Text fw={500} size="1.2rem">
              Certificate Courses
            </Text>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="education">
          <EducationTab
            educationData={educationList}
            onAddEducation={handleAddEducation}
          />
        </Tabs.Panel>
        <Tabs.Panel value="courses">
          <CoursesTab coursesData={coursesList} onAddCourse={handleAddCourse} />
        </Tabs.Panel>
      </Tabs>
    </Flex>
  );
}

EducationCoursesComponent.propTypes = {
  education: PropTypes.arrayOf(
    PropTypes.shape({
      degree: PropTypes.string,
      stream: PropTypes.string,
      institute: PropTypes.string,
      grade: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
    }),
  ).isRequired,
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      course_name: PropTypes.string,
      license: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
      description: PropTypes.string,
    }),
  ).isRequired,
};

EducationTab.propTypes = {
  educationData: PropTypes.arrayOf(
    PropTypes.shape({
      degree: PropTypes.string,
      stream: PropTypes.string,
      institute: PropTypes.string,
      grade: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
    }),
  ).isRequired,
  onAddEducation: PropTypes.func.isRequired,
};

CoursesTab.propTypes = {
  coursesData: PropTypes.arrayOf(
    PropTypes.shape({
      course_name: PropTypes.string,
      license: PropTypes.string,
      license_no: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
      sdate: PropTypes.string,
      edate: PropTypes.string,
      description: PropTypes.string,
    }),
  ).isRequired,
  onAddCourse: PropTypes.func.isRequired,
};
