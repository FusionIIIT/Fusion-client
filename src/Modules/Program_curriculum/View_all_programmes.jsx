import React, { useState, useEffect } from "react";
import { Anchor, Button, Container, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import FusionTable from "../../components/FusionTable";
import SearchInput from "../../components/SearchInput";
import Toolbar from "../../components/Toolbar";
import { matchesQuery } from "../../lib/search";
import { fetchAllProgrammes, fetchStudentMyInfo } from "./api/api";

const COLUMNS = ["Programme", "Discipline"];

const SECTIONS = [
  { value: "ug", label: "UG: Undergraduate" },
  { value: "pg", label: "PG: Post Graduate" },
  { value: "phd", label: "PhD: Doctor of Philosophy" },
];

function ViewAllProgrammes() {
  const role = useSelector((state) => state.user.role);
  const isStudent = role === "student";
  const [activeSection, setActiveSection] = useState("ug");
  const [ugData, setUgData] = useState([]);
  const [pgData, setPgData] = useState([]);
  const [phdData, setPhdData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = localStorage.getItem("programmesCache");
        const timestamp = localStorage.getItem("programmesTimestamp");
        const isCacheValid =
          timestamp && Date.now() - parseInt(timestamp, 10) < 10 * 60 * 1000;

        if (cachedData && isCacheValid) {
          const data = JSON.parse(cachedData);
          setUgData(data.ug_programmes || []);
          setPgData(data.pg_programmes || []);
          setPhdData(data.phd_programmes || []);
        } else {
          const data = await fetchAllProgrammes();
          setUgData(data.ug_programmes || []);
          setPgData(data.pg_programmes || []);
          setPhdData(data.phd_programmes || []);

          localStorage.setItem("programmesCache", JSON.stringify(data));
          localStorage.setItem("programmesTimestamp", Date.now().toString());
        }
      } catch (fetchError) {
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!isStudent) return;
    const loadStudentInfo = async () => {
      try {
        const info = await fetchStudentMyInfo();
        if (info && info.programme_type) {
          setActiveSection(info.programme_type);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          "Failed to load your programme info. Contact the academic office.";
        setError(msg);
      }
    };
    loadStudentInfo();
  }, [isStudent]);

  if (loading) {
    return (
      <Container>
        <Text>Loading programmes...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Text c="red">{error}</Text>
      </Container>
    );
  }

  const dataFor = { ug: ugData, pg: pgData, phd: phdData };

  const rows = (dataFor[activeSection] || [])
    .filter((item) => matchesQuery(search, [item.name, item.discipline__name]))
    .map((item, index) => ({
      id: `${item.id}-${item.programme}-${index}`,
      Programme: (
        <Anchor
          component={Link}
          to={`/programme_curriculum/curriculums/${item.id}`}
          underline="hover"
        >
          {item.name}
        </Anchor>
      ),
      Discipline: item.discipline__name,
    }));

  const visibleSections = isStudent ? [] : SECTIONS;

  return (
    <Container p={0} fluid>
      <Toolbar
        search={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search programmes or disciplines"
          />
        }
      >
        {visibleSections.map(({ value, label }) => (
          <Button
            key={value}
            variant={activeSection === value ? "filled" : "outline"}
            onClick={() => !isStudent && setActiveSection(value)}
            style={{ cursor: isStudent ? "default" : "pointer" }}
          >
            {label}
          </Button>
        ))}
      </Toolbar>

      <FusionTable
        columnNames={COLUMNS}
        elements={rows}
        ariaLabel="Programmes"
        emptyMessage="No programmes match your search."
      />
    </Container>
  );
}

export default ViewAllProgrammes;
