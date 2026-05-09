import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Flex, Tabs, Text, Divider } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useFormState } from "../utils/formHelpers";
import { updateProfileSection } from "../services/profileService";
import InternshipForm from "../components/forms/InternshipForm";
import ProjectForm from "../components/forms/ProjectForm";
import InternshipsTable from "../components/tables/InternshipsTable";
import ProjectsTable from "../components/tables/ProjectsTable";

function InternshipsTab({ internshipsData, onAddInternship }) {
  const { formData, handleInputChange, handleFieldChange, resetForm } =
    useFormState({
    organization: "",
    location: "",
    job_title: "",
    status: "ONGOING",
    start_date: "",
    end_date: "",
    description: "",
  });

  const handleSubmit = async () => {
    try {
      const payload = {
        company: formData.organization,
        location: formData.location,
        title: formData.job_title,
        status: formData.status,
        description: formData.description,
      };

      if (formData.start_date) {
        payload.sdate = formData.start_date;
      }
      if (formData.end_date) {
        payload.edate = formData.end_date;
      }

      const response = await updateProfileSection({ experiencesubmit: payload });
      const createdInternship = response?.data?.id
        ? response.data
        : {
            ...formData,
            company: formData.organization,
            title: formData.job_title,
            sdate: formData.start_date,
            edate: formData.end_date,
          };

      onAddInternship(createdInternship);
      notifications.show({
        message: "Internship Added Successfully!",
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
        Add a New Internship
      </Text>
      <InternshipForm
        formData={formData}
        onChange={handleInputChange}
        onStatusChange={(value) => handleFieldChange("status", value || "ONGOING")}
        onSubmit={handleSubmit}
      />
      <Divider my="md" />
      <Text fw={500} mb="md">
        Your Experience
      </Text>
      <InternshipsTable internshipsData={internshipsData} />
    </Flex>
  );
}

function ProjectsTab({ projectsData, onAddProject }) {
  const { formData, handleInputChange, handleFieldChange, resetForm } =
    useFormState({
    project_name: "",
    status: "ONGOING",
    project_link: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  const handleSubmit = async () => {
    try {
      const payload = {
        project_name: formData.project_name,
        project_status: formData.status,
        project_link: formData.project_link,
        summary: formData.description,
      };

      if (formData.start_date) {
        payload.sdate = formData.start_date;
      }
      if (formData.end_date) {
        payload.edate = formData.end_date;
      }

      const response = await updateProfileSection({ projectsubmit: payload });
      const createdProject = response?.data?.id
        ? response.data
        : {
            ...formData,
            project_status: formData.status,
            summary: formData.description,
            sdate: formData.start_date,
            edate: formData.end_date,
          };

      onAddProject(createdProject);
      notifications.show({
        message: "Project Added Successfully!",
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
        Add a New Project
      </Text>
      <ProjectForm
        formData={formData}
        onChange={handleInputChange}
        onStatusChange={(value) => handleFieldChange("status", value || "ONGOING")}
        onSubmit={handleSubmit}
      />
      <Divider my="md" />
      <Text fw={500} mb="md">
        Your Projects
      </Text>
      <ProjectsTable projectsData={projectsData} />
    </Flex>
  );
}

export default function WorkExperienceComponent({ experience, project }) {
  const [internships, setInternships] = useState(experience || []);
  const [projects, setProjects] = useState(project || []);

  useEffect(() => {
    setInternships(experience || []);
  }, [experience]);

  useEffect(() => {
    setProjects(project || []);
  }, [project]);

  const handleAddInternship = (newInternship) => {
    setInternships((prev) => [...prev, newInternship]);
  };

  const handleAddProject = (newProject) => {
    setProjects((prev) => [...prev, newProject]);
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
      <Tabs defaultValue="internships">
        <Tabs.List mb="sm">
          <Tabs.Tab value="internships">
            <Text fw={500} size="1.2rem">
              Internships
            </Text>
          </Tabs.Tab>
          <Tabs.Tab value="projects">
            <Text fw={500} size="1.2rem">
              Projects
            </Text>
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="internships">
          <InternshipsTab
            internshipsData={internships}
            onAddInternship={handleAddInternship}
          />
        </Tabs.Panel>
        <Tabs.Panel value="projects">
          <ProjectsTab
            projectsData={projects}
            onAddProject={handleAddProject}
          />
        </Tabs.Panel>
      </Tabs>
    </Flex>
  );
}

WorkExperienceComponent.propTypes = {
  experience: PropTypes.arrayOf(
    PropTypes.shape({
      organization: PropTypes.string,
      location: PropTypes.string,
      job_title: PropTypes.string,
      status: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
      description: PropTypes.string,
    }),
  ).isRequired,
  project: PropTypes.arrayOf(
    PropTypes.shape({
      project_name: PropTypes.string,
      status: PropTypes.string,
      project_link: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
      description: PropTypes.string,
    }),
  ).isRequired,
};

InternshipsTab.propTypes = {
  internshipsData: PropTypes.arrayOf(
    PropTypes.shape({
      organization: PropTypes.string,
      location: PropTypes.string,
      job_title: PropTypes.string,
      status: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
      description: PropTypes.string,
    }),
  ).isRequired,
  onAddInternship: PropTypes.func.isRequired,
};

ProjectsTab.propTypes = {
  projectsData: PropTypes.arrayOf(
    PropTypes.shape({
      project_name: PropTypes.string,
      status: PropTypes.string,
      project_link: PropTypes.string,
      start_date: PropTypes.string,
      end_date: PropTypes.string,
      description: PropTypes.string,
    }),
  ).isRequired,
  onAddProject: PropTypes.func.isRequired,
};
