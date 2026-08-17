import React, { useState, useEffect } from "react";
import { Anchor, Container, Loader, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import FusionTable from "../../components/FusionTable";
import SearchInput from "../../components/SearchInput";
import Toolbar from "../../components/Toolbar";
import { matchesQuery } from "../../lib/search";
import { fetchAllCourses } from "./api/api";

const COLUMNS = ["Course Code", "Course Name", "Version", "Credits"];

function ViewAllCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const cachedData = localStorage.getItem("coursesCache");
        const timestamp = localStorage.getItem("coursesTimestamp");
        const isCacheValid =
          timestamp && Date.now() - parseInt(timestamp, 10) < 10 * 60 * 1000;

        if (cachedData && isCacheValid) {
          setCourses(JSON.parse(cachedData) || []);
        } else {
          const data = await fetchAllCourses();
          setCourses(data || []);

          localStorage.setItem("coursesCache", JSON.stringify(data));
          localStorage.setItem("coursesTimestamp", Date.now().toString());
        }
      } catch (err) {
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  if (loading) {
    return <Loader size="lg" />;
  }

  if (error) {
    return <Text c="red">{error}</Text>;
  }

  const rows = courses
    .filter((course) =>
      matchesQuery(search, [
        course.code,
        course.name,
        course.version,
        course.credits,
      ]),
    )
    .map((course) => ({
      id: course.id,
      "Course Code": (
        <Anchor
          component={Link}
          to={`/programme_curriculum/student_course/${course.id}`}
          underline="hover"
        >
          {course.code}
        </Anchor>
      ),
      "Course Name": course.name,
      Version: course.version,
      Credits: course.credits,
    }));

  return (
    <Container p={0} fluid>
      <Toolbar
        search={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by code, name or version"
          />
        }
      />

      <FusionTable
        columnNames={COLUMNS}
        elements={rows}
        ariaLabel="Courses"
        emptyMessage="No courses match your search."
      />
    </Container>
  );
}

export default ViewAllCourses;
