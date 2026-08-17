import React, { useState, useEffect } from "react";
import { Anchor, Container, Group, Loader, Text } from "@mantine/core";
import { Link } from "react-router-dom";
import FusionTable from "../../../components/FusionTable";
import SearchInput from "../../../components/SearchInput";
import Toolbar from "../../../components/Toolbar";
import { matchesQuery } from "../../../lib/search";
import { fetchDisciplinesData } from "../api/api";

const COLUMNS = ["Discipline", "Programmes"];

function DisciplineStud() {
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadDisciplines = async () => {
      try {
        const cachedData = localStorage.getItem("disciplinesCache");
        const timestamp = localStorage.getItem("disciplinesTimestamp");
        const isCacheValid =
          timestamp && Date.now() - parseInt(timestamp, 10) < 10 * 60 * 1000;

        if (cachedData && isCacheValid) {
          setDisciplines(JSON.parse(cachedData) || []);
        } else {
          const data = await fetchDisciplinesData();
          setDisciplines(data || []);

          localStorage.setItem("disciplinesCache", JSON.stringify(data));
          localStorage.setItem("disciplinesTimestamp", Date.now().toString());
        }
      } catch (err) {
        setDisciplines([]);
      } finally {
        setLoading(false);
      }
    };

    loadDisciplines();
  }, []);

  if (loading) {
    return <Loader size="lg" />;
  }

  const rows = disciplines
    .filter((item) =>
      matchesQuery(search, [
        item.name,
        item.acronym,
        ...item.programmes.map((programme) => programme.name),
      ]),
    )
    .map((item) => ({
      id: item.name,
      Discipline: `${item.name} (${item.acronym})`,
      Programmes: (
        <Group gap={6} justify="center">
          {item.programmes.map((programme, index) => (
            <React.Fragment key={programme.id}>
              <Anchor
                component={Link}
                to={`/programme_curriculum/curriculums/${programme.id}`}
                underline="hover"
                size="sm"
              >
                {programme.name}
              </Anchor>
              {index < item.programmes.length - 1 && (
                <Text c="dimmed" size="sm">
                  |
                </Text>
              )}
            </React.Fragment>
          ))}
        </Group>
      ),
    }));

  return (
    <Container p={0} fluid>
      <Toolbar
        search={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by discipline or programme"
          />
        }
      />

      <FusionTable
        columnNames={COLUMNS}
        elements={rows}
        ariaLabel="Disciplines"
        emptyMessage="No disciplines match your search."
      />
    </Container>
  );
}

export default DisciplineStud;
