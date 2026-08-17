import React, { useState, useEffect } from "react";
import { Anchor, Container, Loader, Stack, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import FusionTable from "../../components/FusionTable";
import SearchInput from "../../components/SearchInput";
import Toolbar from "../../components/Toolbar";
import { matchesQuery } from "../../lib/search";
import { fetchWorkingCurriculumsData, fetchStudentMyInfo } from "./api/api";

const COLUMNS = ["Name", "Version", "Batch", "No. of Semesters"];

function ViewAllWorkingCurriculums() {
  const role = useSelector((state) => state.user.role);
  const isStudent = role === "student";
  const [search, setSearch] = useState("");
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentCurriculumIds, setStudentCurriculumIds] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const curriculaPromise = (async () => {
          const cachedData = localStorage.getItem("curriculumsCache");
          const timestamp = localStorage.getItem("curriculumsTimestamp");
          const isCacheValid =
            timestamp && Date.now() - parseInt(timestamp, 10) < 10 * 60 * 1000;

          if (cachedData && isCacheValid) {
            return JSON.parse(cachedData) || [];
          }
          const token = localStorage.getItem("authToken");
          if (!token) throw new Error("Authorization token is missing");
          const data = await fetchWorkingCurriculumsData(token);
          const list = data.curriculums || [];
          localStorage.setItem("curriculumsCache", JSON.stringify(list));
          localStorage.setItem("curriculumsTimestamp", Date.now().toString());
          return list;
        })();

        const studentInfoPromise = isStudent
          ? fetchStudentMyInfo()
          : Promise.resolve(null);

        const [list, info] = await Promise.all([
          curriculaPromise,
          studentInfoPromise,
        ]);

        setCurriculums(list);

        if (info && Array.isArray(info.curriculum_ids)) {
          setStudentCurriculumIds(info.curriculum_ids);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          "Failed to load curriculum data. Contact the academic office.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isStudent]);

  if (loading) {
    return <Loader size="lg" />;
  }

  if (error) {
    return <Text c="red">{error}</Text>;
  }

  const baseData =
    isStudent &&
    Array.isArray(studentCurriculumIds) &&
    studentCurriculumIds.length > 0
      ? curriculums.filter((c) => studentCurriculumIds.includes(c.id))
      : curriculums;

  const rows = baseData
    .filter((item) =>
      matchesQuery(search, [
        item.name,
        item.version,
        ...(item.batch || []),
        item.semesters,
      ]),
    )
    .map((item) => ({
      id: item.id,
      Name: (
        <Anchor
          component={Link}
          to={`/programme_curriculum/stud_curriculum_view/${item.id}`}
          underline="hover"
        >
          {item.name}
        </Anchor>
      ),
      Version: item.version,
      Batch: item.batch?.length ? (
        <Stack gap={2}>
          {item.batch.map((b) => (
            <Text key={b} size="sm">
              {b}
            </Text>
          ))}
        </Stack>
      ) : (
        "No batches available"
      ),
      "No. of Semesters": item.semesters,
    }));

  return (
    <Container p={0} fluid>
      <Toolbar
        search={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by name, version or batch"
          />
        }
      />

      <FusionTable
        columnNames={COLUMNS}
        elements={rows}
        ariaLabel="Working curriculums"
        emptyMessage="No curriculums match your search."
      />
    </Container>
  );
}

export default ViewAllWorkingCurriculums;
