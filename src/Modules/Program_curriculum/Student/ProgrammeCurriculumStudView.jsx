import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { MantineProvider, Table, Container, Tabs } from "@mantine/core";
import SearchInput from "../../../components/SearchInput";
import Toolbar from "../../../components/Toolbar";
import tabClasses from "../../../ui/styles/tabs.module.css";
import { matchesQuery } from "../../../lib/search";
import { fetchCurriculumData } from "../api/api";

function BDesStudView() {
  const { id } = useParams();
  const [curriculumData, setCurriculumData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  
  // States for filtering
  const [search, setSearch] = useState("");
  const [batchName, setBatchName] = useState("");

  useEffect(() => {
    const loadCurriculumData = async () => {
      try {
        const cacheKey = `curriculumCache_${id}`;
        const cachedData = localStorage.getItem(cacheKey);
        const timestamp = localStorage.getItem(`${cacheKey}_timestamp`);
        const isCacheValid =
          timestamp && Date.now() - parseInt(timestamp, 10) < 10 * 60 * 1000; // 10 min cache

        if (cachedData && isCacheValid) {
          const data = JSON.parse(cachedData);
          setCurriculumData(data || {});
          if (data && data.name) {
            setBatchName(data.name);
          }
        } else {
          const data = await fetchCurriculumData(id);
          setCurriculumData(data || {});
          if (data && data.name) {
            setBatchName(data.name);
          }

          localStorage.setItem(cacheKey, JSON.stringify(data));
          localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        }
      } catch (error) {
        console.error("Error loading curriculum data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCurriculumData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!curriculumData) {
    return <div>No data available</div>;
  }

  // Filter Logic for Working Curriculums
  const filteredWorkingCurriculums = curriculumData.working_curriculums
    ? curriculumData.working_curriculums.filter((curr) =>
        matchesQuery(search, [curr.name, curr.version]),
      )
    : [];

  // Filter Logic for Obsolete Curriculums
  const filteredObsoleteCurriculums = curriculumData.past_curriculums
    ? curriculumData.past_curriculums.filter((curr) =>
        matchesQuery(search, [curr.name, curr.version]),
      )
    : [];

  const renderInfo = () => (
    <div
      style={{
        maxHeight: "61vh",
        overflowY: "auto",
        border: "1px solid #d3d3d3",
        borderRadius: "10px",
        scrollbarWidth: "none",
      }}
    >
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <Table style={{ backgroundColor: "white", padding: "20px" }}>
        <tbody>
          <tr>
            <td
              colSpan="2"
              style={{
                padding: "15px 20px",
                backgroundColor: "#C5E2F6",
                color: "#3498db",
                fontSize: "16px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              {curriculumData.program ? curriculumData.program.name : ""}
            </td>
          </tr>

          <tr>
            <td
              style={{
                fontWeight: "bold",
                backgroundColor: "#FFFFFF",
                color: "#3498db",
                padding: "15px 20px",
                textAlign: "left",
                borderRight: "1px solid #d3d3d3",
              }}
            >
              Programme Name
            </td>
            <td style={{ padding: "20px 20px", backgroundColor: "#FFFFFF" }}>
              {curriculumData.program ? curriculumData.program.name : ""}
            </td>
          </tr>

          <tr>
            <td
              style={{
                fontWeight: "bold",
                backgroundColor: "#E6F7FF",
                color: "#3498db",
                padding: "15px 20px",
                textAlign: "left",
                borderRight: "1px solid #d3d3d3",
              }}
            >
              Programme Category
            </td>
            <td style={{ padding: "20px 20px", backgroundColor: "#E6F7FF" }}>
              {curriculumData.program ? curriculumData.program.category : ""}
            </td>
          </tr>

          <tr>
            <td
              style={{
                fontWeight: "bold",
                backgroundColor: "#FFFFFF",
                color: "#3498db",
                padding: "15px 20px",
                textAlign: "left",
                borderRight: "1px solid #d3d3d3",
              }}
            >
              Programme Begin Year
            </td>
            <td style={{ padding: "20px 20px", backgroundColor: "#FFFFFF" }}>
              {curriculumData.program ? curriculumData.program.programme_begin_year : ""}
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderWorkingCurriculums = () => (
    <div
      style={{
        maxHeight: "61vh",
        overflowY: "auto",
        border: "1px solid #d3d3d3",
        borderRadius: "10px",
        scrollbarWidth: "none",
      }}
    >
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <Table style={{ backgroundColor: "white", padding: "20px" }}>
        <thead>
          <tr
            style={{
              backgroundColor: "#15ABFF54",
              borderBottom: "1px solid #d3d3d3",
            }}
          >
            <th
              style={{
                padding: "15px 20px",
                backgroundColor: "#C5E2F6",
                color: "#3498db",
                fontSize: "16px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Name
            </th>
            <th
              style={{
                padding: "15px 20px",
                backgroundColor: "#C5E2F6",
                color: "#3498db",
                fontSize: "16px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Version
            </th>
            <th
              style={{
                padding: "15px 20px",
                backgroundColor: "#C5E2F6",
                color: "#3498db",
                fontSize: "16px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Batch
            </th>
            <th
              style={{
                padding: "15px 20px",
                backgroundColor: "#C5E2F6",
                color: "#3498db",
                fontSize: "16px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              No. of Semesters
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredWorkingCurriculums.length > 0 ? (
            filteredWorkingCurriculums.map((curr, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#E6F7FF",
                }}
              >
                <td
                  style={{
                    padding: "15px 20px",
                    borderRight: "1px solid #d3d3d3",
                    textAlign: "center",
                  }}
                >
                  <Link
                    to={`/programme_curriculum/stud_curriculum_view/${curr.id}`}
                    style={{ color: "#3498db", textDecoration: "none" }}
                  >
                    {curr.name}
                  </Link>
                </td>
                <td
                  style={{
                    padding: "15px 20px",
                    borderRight: "1px solid #d3d3d3",
                    textAlign: "center",
                  }}
                >
                  {curr.version}
                </td>
                <td
                  style={{
                    padding: "15px 20px",
                    textAlign: "center",
                    borderRight: "1px solid #d3d3d3",
                  }}
                >
                  {curr.batches ? (
                    curr.batches.map((b, i) => (
                      <React.Fragment key={i}>
                        <span style={{ marginRight: "10px" }}>
                          {`${b.name} ${b.year}`}
                        </span>
                        {i < curr.batches.length - 1 && (
                          <span style={{ margin: "0 10px" }}>|</span>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    `${batchName} ${curr.year}`
                  )}
                </td>
                <td
                  style={{
                    padding: "15px 20px",
                    borderRight: "1px solid #d3d3d3",
                    textAlign: "center",
                  }}
                >
                  {curr.no_of_semester}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                style={{ textAlign: "center", padding: "15px 20px" }}
              >
                No results found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );

  const renderObsoleteCurriculums = () => (
    <div
      style={{
        maxHeight: "61vh",
        overflowY: "auto",
        border: "1px solid #d3d3d3",
        borderRadius: "10px",
        scrollbarWidth: "none",
      }}
    >
      <style>
        {`
          div::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>
      <Table style={{ backgroundColor: "white", padding: "20px" }}>
        <thead>
          <tr
            style={{
              backgroundColor: "#15ABFF54",
              borderBottom: "1px solid #d3d3d3",
            }}
          >
            <th
              style={{
                padding: "15px 20px",
                backgroundColor: "#C5E2F6",
                color: "#3498db",
                fontSize: "16px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Name
            </th>
            <th
              style={{
                padding: "15px 20px",
                backgroundColor: "#C5E2F6",
                color: "#3498db",
                fontSize: "16px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Version
            </th>
            <th
              style={{
                padding: "15px 20px",
                backgroundColor: "#C5E2F6",
                color: "#3498db",
                fontSize: "16px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Batch
            </th>
            <th
              style={{
                padding: "15px 20px",
                backgroundColor: "#C5E2F6",
                color: "#3498db",
                fontSize: "16px",
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              No. of Semesters
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredObsoleteCurriculums.length > 0 ? (
            filteredObsoleteCurriculums.map((curr, idx) => (
              <tr
                key={idx}
                style={{
                  backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#E6F7FF",
                }}
              >
                <td
                  style={{
                    padding: "15px 20px",
                    borderRight: "1px solid #d3d3d3",
                    textAlign: "center",
                  }}
                >
                  {curr.name}
                </td>
                <td
                  style={{
                    padding: "15px 20px",
                    borderRight: "1px solid #d3d3d3",
                    textAlign: "center",
                  }}
                >
                  {curr.version}
                </td>
                <td
                  style={{
                    padding: "15px 20px",
                    textAlign: "center",
                    borderRight: "1px solid #d3d3d3",
                  }}
                >
                  {curr.batch ? curr.batch : `${batchName} ${curr.year}`}
                </td>
                <td
                  style={{
                    padding: "15px 20px",
                    borderRight: "1px solid #d3d3d3",
                    textAlign: "center",
                  }}
                >
                  {curr.no_of_semester || curr.semesters}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                style={{ textAlign: "center", padding: "15px 20px" }}
              >
                No results found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );

  // Filter Section
  const searchable = activeTab === "working" || activeTab === "obsolete";

  return (
    <MantineProvider
      theme={{ colorScheme: "light" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Container style={{ padding: "20px", maxWidth: "100%" }}>
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          variant="pills"
          color="blue"
          mb="md"
        >
          <Tabs.List className={tabClasses.list}>
            <Tabs.Tab value="info" className={tabClasses.tab}>
              Programme Info
            </Tabs.Tab>
            <Tabs.Tab value="working" className={tabClasses.tab}>
              Working Curriculums
            </Tabs.Tab>
            <Tabs.Tab value="obsolete" className={tabClasses.tab}>
              Obsolete Curriculums
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
        {searchable && (
          <Toolbar
            search={
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by name or version"
              />
            }
          />
        )}
        {activeTab === "info" && renderInfo()}
        {activeTab === "working" && renderWorkingCurriculums()}
        {activeTab === "obsolete" && renderObsoleteCurriculums()}
      </Container>
    </MantineProvider>
  );
}

export default BDesStudView;