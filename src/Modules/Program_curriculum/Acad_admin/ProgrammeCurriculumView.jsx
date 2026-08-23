import React, { useState, useEffect } from "react";
import { Copy } from "@phosphor-icons/react";
import { Link, useLocation } from "react-router-dom";
import {
  MantineProvider,
  Table,
  Tabs,
  ScrollArea,
  Container,
  Button,
  Grid,
} from "@mantine/core";
import axios from "axios";
import { useMediaQuery } from "@mantine/hooks";
import { host } from "../../../routes/globalRoutes";
import SearchInput from "../../../components/SearchInput";
import Toolbar from "../../../components/Toolbar";
import tabClasses from "../../../ui/styles/tabs.module.css";
import { matchesQuery } from "../../../lib/search";

const CURRICULUM_DATA = {
  info: {
    programName: "B.Des",
    programCategory: "UG",
    programBeginYear: "2021",
  },
  workingCurriculums: [
    {
      name: "Design UG Curriculum",
      version: "1.0",
      batch: ["B.Des 2021", "B.Des 2022"],
      semesters: 8,
    },
    {
      name: "Design UG Curriculum",
      version: "2.0",
      batch: ["B.Des 2023"],
      semesters: 8,
    },
  ],
  obsoleteCurriculums: [
    {
      name: "Old Design Curriculum",
      version: "0.5",
      batch: ["B.Des 2019"],
      semesters: 8,
    },
    {
      name: "Outdated Design Curriculum",
      version: "1.1",
      batch: ["B.Des 2020"],
      semesters: 8,
    },
  ],
};

function BDesAcadView() {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 768px)");
  // Create an instance of URLSearchParams to parse query parameters
  const queryParams = new URLSearchParams(location.search);

  // Get the value of the 'programme' query parameter
  const programmeId = queryParams.get("programme"); // This will be '1'

  const [activeTab, setActiveTab] = useState("info");

  // New States for Filtering
  const [search, setSearch] = useState("");
  const [batchName, setBatchName] = useState("");
  const [program, setProgram] = useState(null);
  const [workingCurriculums, setWorkingCurriculums] = useState([]);
  const [pastCurriculums, setPastCurriculums] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurriculmns = async () => {
      try {
        // Assuming you have stored the token in localStorage or state
        const token = localStorage.getItem("authToken"); // Replace with actual method to get token

        const response = await axios.get(
          `${host}/programme_curriculum/api/curriculums/${programmeId}`, // Use backticks for template literal
          {
            headers: {
              Authorization: `Token ${token}`, // Add the Authorization header
            },
          },
        );

        setProgram(response.data.program);
        setBatchName(response.data.name);
        setWorkingCurriculums(response.data.working_curriculums);
        setPastCurriculums(response.data.past_curriculums);
        // setLoading(false);
      } catch (FetchError) {
        console.error("Error fetching data: ", error);
        setError("Failed to load data");
        // setLoading(false);
      }
    };

    fetchCurriculmns();
  }, []);

  const [isHovered, setIsHovered] = useState(false);
  const [isAddCourseSlotHovered, setIsAddCourseSlotHovered] = useState(false);

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
              {program ? program.name : ""}
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
              {program ? program.name : ""}
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
              {program ? program.category : ""}
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
              {CURRICULUM_DATA.info.programBeginYear}
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const visible = (list) =>
    list.filter((curr) => matchesQuery(search, [curr.name, curr.version]));

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
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {visible(workingCurriculums).length > 0 ? (
            visible(workingCurriculums).map((curr, idx) => (
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
                    to={`/programme_curriculum/view_curriculum?curriculum=${curr.id}`}
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
                  {curr.batches && curr.batches.length > 0 ? (
                    curr.batches.map((batch, i) => (
                      <React.Fragment key={i}>
                        <span
                          style={{
                            marginRight: "10px",
                          }}
                        >
                          {batch.name} {batch.discipline} {batch.year}
                        </span>
                        {i < curr.batches.length - 1 && (
                          <span style={{ margin: "0 10px" }}>|</span>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    "No batches available"
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
                <td
                  style={{
                    padding: "15px 20px",
                    borderRight: "1px solid #d3d3d3",
                    textAlign: "center",
                  }}
                >
                  <Link
                    to={`/programme_curriculum/admin_edit_curriculum_form?curriculum=${curr.id}`}
                  >
                    <Button variant="filled" color="green" radius="sm">
                      Edit
                    </Button>
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
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
          {visible(pastCurriculums).length > 0 ? (
            visible(pastCurriculums).map((curr, idx) => (
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
                  }}
                >
                  {curr.name}
                </td>
                <td
                  style={{
                    padding: "15px 20px",
                    borderRight: "1px solid #d3d3d3",
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
                  {curr.batches && curr.batches.length > 0 ? (
                    curr.batches.map((batch, i) => (
                      <React.Fragment key={i}>
                        <span
                          style={{
                            marginRight: "10px",
                            color: "black",
                            textDecoration: "none",
                          }}
                        >
                          {batch.name} {batch.discipline} {batch.year}
                        </span>
                        {i < curr.batches.length - 1 && (
                          <span style={{ margin: "0 10px" }}>|</span>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    "No batches available"
                  )}
                </td>
                <td
                  style={{
                    padding: "15px 20px",
                    borderRight: "1px solid #d3d3d3",
                  }}
                >
                  {curr.semesters}
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

  // Single Filter Section
  const renderFilterSection = () => (
    <ScrollArea>
      {/* <Button
        variant="filled"
        style={{ width: "100%", padding: "0.25vw", margin: "0 0 1vw 0" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        OPTIONS
      </Button> */}

      {/* Options visible on hover */}

      <div
        className={`options-dropdowns ${isHovered ? "open" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        overflow
      >
        <div>
          <p
            style={{
              marginBottom: "-7px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Curriculum Options:
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "5px",
              marginTop: "10px",
            }}
          >
            <Link
              to="/programme_curriculum/acad_admin_add_curriculum_form"
              style={{
                textDecoration: "none",
                flex: "1 1 auto",
                maxWidth: "141px",
              }}
            >
              <Button
                className="dropdown-btns green-btns"
                variant="filled"
                style={{ width: "100%" }}
              >
                Add Curriculum
              </Button>
            </Link>

            <div
              style={{
                position: "relative",
                flex: "1 1 auto",
                minWidth: "150px",
              }}
              onMouseEnter={() => setIsAddCourseSlotHovered(true)}
              onMouseLeave={() => setIsAddCourseSlotHovered(false)}
            >
              <Button
                variant="filled"
                style={{ width: "100%", maxWidth: "170px" }}
              >
                Replicate Curriculum
              </Button>

              {isAddCourseSlotHovered && (
                <div
                  className="semester-dropdowns"
                  style={{
                    fontSize: "14px",
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    background: "#fff",
                    boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                    borderRadius: "5px",
                    zIndex: 10,
                    padding: "8px",
                    width: "100%",
                    maxWidth: "170px",
                  }}
                >
                  {workingCurriculums.length > 0 ? (
                    workingCurriculums.map((curr, index) => (
                    <Link
                      key={index}
                      to={`/programme_curriculum/acad_admin_replicate_curriculum_form?curriculum=${curr.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        className="semester-options"
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "5px 10px",
                          borderBottom: "1px solid #ddd",
                          cursor: "pointer",
                        }}
                      >
                        <div>
                          <span>{curr.name}</span> v<span>{curr.version}</span>
                        </div>
                        <Copy size={20} color="#000" weight="bold" />
                      </div>
                    </Link>
                  ))) : (
                    <div
                      style={{
                        padding: "5px 10px",
                        textAlign: "center",
                        color: "#999",
                      }}
                    >
                      No curriculums available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <p
            style={{
              marginTop: "4px",
              marginBottom: "-7px",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            Programe Options:
          </p>
          <Link
            to={`/programme_curriculum/admin_edit_programme_form/${programmeId}`}
            style={{ textDecoration: "none" }}
          >
            <Button
              className="dropdown-btns blue-btns"
              variant="filled"
              style={{
                marginTop: "10px",
                width: "100%",
                maxWidth: "141px",
                marginBottom: "10px",
              }}
            >
              Edit Programme
            </Button>
          </Link>
          {/* <button className="dropdown-btn black-btn">LINK BATCH</button> */}
        </div>
      </div>
    </ScrollArea>
  );

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
        {activeTab !== "info" && (
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
        <hr />
        <Grid>
          {isMobile && (
            <Grid.Col span={12}>
              {(activeTab === "working" || activeTab === "obsolete") &&
                renderFilterSection()}
            </Grid.Col>
          )}
          <Grid.Col span={isMobile ? 12 : 9}>
            {/* Render Filter Section Conditionally */}
            {/* <div style={{ display: "flex" }}> */}
            <div>
              {activeTab === "info" && renderInfo()}
              {activeTab === "working" && renderWorkingCurriculums()}
              {activeTab === "obsolete" && renderObsoleteCurriculums()}
            </div>
            {/* </div> */}
          </Grid.Col>
          {!isMobile && (
            <Grid.Col span={3}>
              {(activeTab === "working" || activeTab === "obsolete") &&
                renderFilterSection()}
            </Grid.Col>
          )}
        </Grid>
      </Container>
    </MantineProvider>
  );
}

export default BDesAcadView;
