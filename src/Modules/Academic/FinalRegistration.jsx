import React, { useState, useEffect } from "react";
import { Card, Text } from "@mantine/core";
import FusionTable from "../../components/FusionTable";

const mockFinalRegistrationAPIResponse = [
  {
    id: 1,
    code: "OE3C41",
    name: "Agile Software Development Process",
    type: "Elective",
    semester: "6",
    credits: 3,
  },
  {
    id: 2,
    code: "OE3M36",
    name: "Generative AI for Product Innovation",
    type: "Elective",
    semester: "6",
    credits: 3,
  },
  {
    id: 3,
    code: "OE3D12",
    name: "Communication Skills Management",
    type: "Elective",
    semester: "6",
    credits: 3,
  },
  {
    id: 4,
    code: "PC3003",
    name: "Professional Development Course 3",
    type: "Core",
    semester: "6",
    credits: 1,
  },
  {
    id: 5,
    code: "IT3C03",
    name: "Web And Mobile App Development",
    type: "Core",
    semester: "6",
    credits: 2,
  },
  {
    id: 6,
    code: "DS3014",
    name: "Fabrication Project",
    type: "Core",
    semester: "6",
    credits: 4,
  },
  {
    id: 7,
    code: "PR2001",
    name: "PR Project",
    type: "Backlog/Improvement",
    semester: "6",
    credits: 2,
  },
];

function FinalRegistration() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockFinalRegistrationAPIResponse);
        }, 500);
      });
      setCourses(data);
    };

    fetchCourses();
  }, []);

  const columnNames = [
    "ID",
    "Course Code",
    "Course Name",
    "Type",
    "Semester",
    "Credits",
  ];

  const mappedCourses = courses.map((course) => ({
    ID: course.id,
    "Course Code": course.code,
    "Course Name": course.name,
    Type: course.type,
    Semester: course.semester,
    Credits: course.credits,
  }));

  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Text
        size="lg"
        weight={700}
        mb="md"
        style={{
          textAlign: "center",
          width: "100%",
          color: "#3B82F6",
        }}
      >
        Final Registration For This Semester
      </Text>
      <div style={{ overflowX: "auto" }}>
        <FusionTable
          columnNames={columnNames}
          elements={mappedCourses}
          width="100%"
        />
      </div>
      <Text
        size="md"
        weight={700}
        mt="md"
        style={{ textAlign: "left", width: "100%" }}
      >
        Total Credits: {totalCredits}
      </Text>
    </Card>
  );
}

export default FinalRegistration;
