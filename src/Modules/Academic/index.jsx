import { useNavigate } from "react-router-dom";
import { Table, Button, Card, Text } from "@mantine/core";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import "./index_acd.css";

function AcademicPage() {
  const navigate = useNavigate();

  // Sample data for the table
  const courses = [
    {
      id: 1,
      code: "CS3009",
      name: "Network Security & Cryptography",
      credits: 3,
      hours: 5,
    },
    {
      id: 2,
      code: "CS3010",
      name: "Software Engineering",
      credits: 4,
      hours: 5,
    },
    {
      id: 3,
      code: "CS3011",
      name: "Artificial Intelligence",
      credits: 3,
      hours: 5,
    },
    { id: 4, code: "IT3001", name: "IT Workshop III", credits: 2, hours: 5 },
    { id: 5, code: "CS8028", name: "Hardware Security", credits: 3, hours: 5 },
    {
      id: 6,
      code: "HS3004",
      name: "Ecology and Environment Science",
      credits: 2,
      hours: 5,
    },
  ];

  return (
    <>
      <CustomBreadcrumbs />
      {/* <Text size="xl" weight={700} mb="lg">
        Academic Page
      </Text> */}

      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{
          marginTop: "20px",
          overflow: "hidden",
        }}
      >
        <Text size="lg" weight={600} mb="md" className="headingContainer">
          Course Management
        </Text>

        <div style={{ maxHeight: "400px", overflow: "auto" }}>
          <Table highlightOnHover className="custom-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Hours</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr key={course.id}>
                  <td>{index + 1}</td>
                  <td>{course.code}</td>
                  <td>{course.name}</td>
                  <td>{course.credits}</td>
                  <td>{course.hours}</td>
                  <td>
                    <Button
                      variant="light"
                      color="blue"
                      onClick={() => navigate(`/academics/course-management`)}
                      className="manage_btn"
                    >
                      Manage
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>
    </>
  );
}

export default AcademicPage;
