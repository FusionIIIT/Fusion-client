import { useState, Suspense, lazy, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Paper,
  Select,
  Group,
  Text,
  Badge,
  SimpleGrid,
  Card,
  Modal,
  Button,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import dayjs from "dayjs";

// Import from new structure
import ModuleTabs from "../../components/moduleTabs";
import { setActiveTab_ } from "../../redux/moduleslice";
import ClubFilter from "../components/common/ClubFilter";
import DateSelector from "../components/common/DateSelector";
import EventCalendar from "../components/common/EventCalendar";
import EventCard from "../components/common/EventCard";

// Import hooks from new structure
import { useUpcomingEvents, usePastEvents } from "../hooks/useEvents";
import { useFests } from "../hooks/useClubs";

// Lazy imports
const ClubViewComponent = lazy(
  () => import("../components/layouts/ClubViewComponent"),
);
const DataTable = lazy(() => import("../components/tables/DataTable"));

// Fallback loading component
function LoadingFallback() {
  return <div>Loading...</div>;
}

function GymkhanaDashboard() {
  const isMobile = useMediaQuery(`(max-width: 750px)`);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("0");
  const [selectedClub, setSelectedClub] = useState("Select a Club");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarSelectedClub, setCalendarSelectedClub] = useState("All Clubs");
  const [opened, setOpened] = useState(false);
  const [selectedFest, setSelectedFest] = useState(null);

  const tabs = [
    { title: "Clubs" },
    { title: "Calendar" },
    { title: "Fests" },
    { title: "Events" },
  ];

  // Fetch data using new hooks
  const { data: upcomingEvents = [], isLoading: upcomingLoading } =
    useUpcomingEvents();
  const { data: pastEvents = [], isLoading: pastLoading } = usePastEvents();
  const { data: fests = [], isLoading: festsLoading } = useFests();

  const isLoading = upcomingLoading || pastLoading || festsLoading;

  const openModal = (fest) => {
    setSelectedFest(fest);
    setOpened(true);
  };

  const allEvents = [...upcomingEvents, ...pastEvents];

  const clubOptions = [
    "BitByte",
    "AFC",
    "Jazbaat",
    "Aavartan",
    "Badminton Club",
    "Volleyball Club",
  ];

  const renderClubContent = () => {
    if (selectedClub === "Select a Club") {
      return (
        <Paper
          shadow="md"
          p="xl"
          style={{
            height: "80vh",
            overflow: "auto",
            width: "100%",
            maxWidth: "1200px",
            margin: "10px auto",
          }}
        >
          {/* Science & Tech Clubs */}
          <Box mb="xl" px="sm">
            <h2
              style={{
                borderBottom: "2px solid #e67700",
                paddingBottom: "8px",
              }}
            >
              Science & Technology Clubs
            </h2>
          </Box>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {/* Programming Club */}
            <Paper
              withBorder
              p="lg"
              shadow="sm"
              style={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <Group position="apart" align="flex-start">
                <Box style={{ width: 30, height: 30 }}>
                  <img
                    src="https://img.icons8.com/color/96/programming.png"
                    alt="Programming Club Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <Text size="xl" fw={700}>
                  The Programming Club
                </Text>
              </Group>
              <Box
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: 16,
                  paddingRight: 8,
                }}
              >
                <Text size="sm">
                  The byte-sized problem solvers! We host weekly coding
                  contests, hackathons, and open-source contribution drives. Our
                  teams have won ACM-ICPC regionals and developed apps used by
                  10,000+ students.
                </Text>
              </Box>
            </Paper>

            {/* Business & Management Club */}
            <Paper
              withBorder
              p="lg"
              shadow="sm"
              style={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <Group position="apart" align="flex-start">
                <Box style={{ width: 30, height: 30 }}>
                  <img
                    src="https://img.icons8.com/color/96/business.png"
                    alt="Business Club Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <Text size="xl" fw={700}>
                  Business & Management Club
                </Text>
              </Group>
              <Box
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: 16,
                  paddingRight: 8,
                }}
              >
                <Text size="sm">
                  Future CEOs in the making! We organize case study
                  competitions, startup mentorship programs, and investor pitch
                  simulations.
                </Text>
              </Box>
            </Paper>

            {/* Astronomy & Physics Society */}
            <Paper
              withBorder
              p="lg"
              shadow="sm"
              style={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <Group position="apart" align="flex-start">
                <Box style={{ width: 30, height: 30 }}>
                  <img
                    src="https://img.icons8.com/color/96/telescope.png"
                    alt="Astronomy Club Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <Text size="xl" fw={700}>
                  Astronomy & Physics Society
                </Text>
              </Group>
              <Box
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: 16,
                  paddingRight: 8,
                }}
              >
                <Text size="sm">
                  Exploring the universe one star at a time. We host telescope
                  nights, astrophysics lectures, and participate in
                  international astronomy olympiads.
                </Text>
              </Box>
            </Paper>

            {/* Aero Fabrication Club */}
            <Paper
              withBorder
              p="lg"
              shadow="sm"
              style={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <Group position="apart" align="flex-start">
                <Box style={{ width: 30, height: 30 }}>
                  <img
                    src="https://img.icons8.com/color/96/airplane.png"
                    alt="Aero Club Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <Text size="xl" fw={700}>
                  Aero Fabrication Club
                </Text>
              </Group>
              <Box
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: 16,
                  paddingRight: 8,
                }}
              >
                <Text size="sm">
                  Building the future of flight. Members design drones, RC
                  planes, and compete in international competitions like SAE
                  Aero Design.
                </Text>
              </Box>
            </Paper>

            {/* Robotics Club */}
            <Paper
              withBorder
              p="lg"
              shadow="sm"
              style={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <Group position="apart" align="flex-start">
                <Box style={{ width: 30, height: 30 }}>
                  <img
                    src="https://img.icons8.com/color/96/robot-2.png"
                    alt="Robotics Club Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <Text size="xl" fw={700}>
                  Robotics Club
                </Text>
              </Group>
              <Box
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: 16,
                  paddingRight: 8,
                }}
              >
                <Text size="sm">
                  Where machines come to life! We build combat robots,
                  autonomous rovers, and compete in ABU Robocon.
                </Text>
              </Box>
            </Paper>

            {/* Racing Club */}
            <Paper
              withBorder
              p="lg"
              shadow="sm"
              style={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <Group position="apart" align="flex-start">
                <Box style={{ width: 30, height: 30 }}>
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/2583/2583344.png"
                    alt="Racing Club Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
                <Text size="xl" fw={700}>
                  Racing Club
                </Text>
              </Group>
              <Box
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: 16,
                  paddingRight: 8,
                }}
              >
                <Text size="sm">
                  Engineering speed demons! We design formula-style race cars
                  for Formula Student.
                </Text>
              </Box>
            </Paper>
          </SimpleGrid>

          {/* Cultural Clubs */}
          <Box mb="xl">
            <h2
              style={{
                borderBottom: "2px solid #228be6",
                paddingBottom: "8px",
              }}
            >
              Cultural Clubs
            </h2>
          </Box>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {/* Saaz */}
            <Paper
              withBorder
              p="lg"
              shadow="sm"
              style={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <Group position="apart" noWrap>
                <Group spacing="xs" align="center">
                  <Text size="xl" fw={700}>
                    Saaz
                  </Text>
                  <Badge color="blue" variant="light">
                    Music
                  </Badge>
                </Group>
                <Box style={{ width: 30, height: 30 }}>
                  <img
                    src="https://img.icons8.com/color/96/music.png"
                    alt="Music Club Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              </Group>
              <Box
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: 16,
                  paddingRight: 8,
                }}
              >
                <Text size="sm">
                  The melody makers of campus! From classical to rock.
                </Text>
              </Box>
            </Paper>

            {/* Jazbaat */}
            <Paper
              withBorder
              p="lg"
              shadow="sm"
              style={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <Group position="apart" noWrap>
                <Group spacing="xs" align="center">
                  <Text size="xl" fw={700}>
                    Jazbaat
                  </Text>
                  <Badge color="red" variant="light">
                    Dramatics
                  </Badge>
                </Group>
                <Box style={{ width: 30, height: 30 }}>
                  <img
                    src="https://img.icons8.com/color/96/drama.png"
                    alt="Drama Club Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              </Group>
              <Box
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: 16,
                  paddingRight: 8,
                }}
              >
                <Text size="sm">
                  Where stories come alive! Specializes in street plays.
                </Text>
              </Box>
            </Paper>

            {/* Aavartan */}
            <Paper
              withBorder
              p="lg"
              shadow="sm"
              style={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <Group position="apart" noWrap>
                <Group spacing="xs" align="center">
                  <Text size="xl" fw={700}>
                    Aavartan
                  </Text>
                  <Badge color="violet" variant="light">
                    Dance
                  </Badge>
                </Group>
                <Box style={{ width: 30, height: 30 }}>
                  <img
                    src="https://img.icons8.com/color/96/dancing-party.png"
                    alt="Dance Club Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              </Group>
              <Box
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: 16,
                  paddingRight: 8,
                }}
              >
                <Text size="sm">
                  From Kathak to hip-hop, our award-winning troupe.
                </Text>
              </Box>
            </Paper>

            {/* Samvaad */}
            <Paper
              withBorder
              p="lg"
              shadow="sm"
              style={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <Group position="apart" noWrap>
                <Group spacing="xs" align="center">
                  <Text size="xl" fw={700}>
                    Samvaad
                  </Text>
                  <Badge color="orange" variant="light">
                    Literary
                  </Badge>
                </Group>
                <Box style={{ width: 30, height: 30 }}>
                  <img
                    src="https://img.icons8.com/color/96/literature.png"
                    alt="Literary Club Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              </Group>
              <Box
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: 16,
                  paddingRight: 8,
                }}
              >
                <Text size="sm">
                  Hosts poetry slams and debate competitions.
                </Text>
              </Box>
            </Paper>

            {/* ShutterBox */}
            <Paper
              withBorder
              p="lg"
              shadow="sm"
              style={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <Group position="apart" noWrap>
                <Group spacing="xs" align="center">
                  <Text size="xl" fw={700}>
                    ShutterBox
                  </Text>
                  <Badge color="grape" variant="light">
                    Photography
                  </Badge>
                </Group>
                <Box style={{ width: 30, height: 30 }}>
                  <img
                    src="https://img.icons8.com/color/96/compact-camera.png"
                    alt="Photography Club Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              </Group>
              <Box
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: 16,
                  paddingRight: 8,
                }}
              >
                <Text size="sm">
                  From DSLR workshops to short film competitions.
                </Text>
              </Box>
            </Paper>

            {/* Abhivyakti */}
            <Paper
              withBorder
              p="lg"
              shadow="sm"
              style={{ height: 200, display: "flex", flexDirection: "column" }}
            >
              <Group position="apart" noWrap>
                <Group spacing="xs" align="center">
                  <Text size="xl" fw={700}>
                    Abhivyakti
                  </Text>
                  <Badge color="green" variant="light">
                    Art & Craft
                  </Badge>
                </Group>
                <Box style={{ width: 30, height: 30 }}>
                  <img
                    src="https://img.icons8.com/color/96/paint-palette.png"
                    alt="Art Club Logo"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                </Box>
              </Group>
              <Box
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginTop: 16,
                  paddingRight: 8,
                }}
              >
                <Text size="sm">Weekly pottery and sketching sessions.</Text>
              </Box>
            </Paper>
          </SimpleGrid>

          {/* Sports Clubs */}
          <Box mb="xl">
            <h2
              style={{
                borderBottom: "2px solid #40c057",
                paddingBottom: "8px",
              }}
            >
              Sports Clubs
            </h2>
          </Box>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
            {[
              "Cricket",
              "Athletics",
              "Badminton",
              "Basketball",
              "Lawn Tennis",
              "Table Tennis",
              "Football",
              "Volleyball",
              "Kabaddi",
            ].map((sport) => (
              <Paper
                key={sport}
                withBorder
                p="lg"
                shadow="sm"
                style={{
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Group position="apart" align="flex-start">
                  <Box style={{ width: 30, height: 30 }}>
                    <img
                      src={`https://img.icons8.com/color/96/${sport.toLowerCase().replace(" ", "-")}.png`}
                      alt={`${sport} Logo`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        e.target.src =
                          "https://img.icons8.com/color/96/sports-mode.png";
                      }}
                    />
                  </Box>
                  <Text size="xl" fw={700}>
                    {sport}
                  </Text>
                </Group>
                <Box
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    marginTop: 16,
                    paddingRight: 8,
                  }}
                >
                  <Text size="sm">
                    Professional {sport.toLowerCase()} facilities with regular
                    tournaments and coaching.
                  </Text>
                </Box>
              </Paper>
            ))}
          </SimpleGrid>
        </Paper>
      );
    }

    return (
      <Suspense fallback={<LoadingFallback />}>
        <ClubViewComponent
          clubName={selectedClub}
          eventsData={allEvents.filter(
            (e) => e.club === selectedClub && e.status === "ACCEPT",
          )}
        />
      </Suspense>
    );
  };

  const renderCalendarContent = () => (
    <Box
      className="gymkhana-section gymkhana-section-body"
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        height: "100%",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "50px",
          paddingTop: "35px",
          boxSizing: "border-box",
        }}
      >
        <DateSelector
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
        />
        <EventCard
          events={allEvents
            .filter((event) =>
              dayjs(event.start_date).isSame(selectedDate, "day"),
            )
            .filter((event) => event.status === "ACCEPT")}
        />
      </Box>

      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
            overflow: "auto",
          }}
        >
          <h2>{dayjs(selectedDate).format("MMMM YYYY")}</h2>
          <ClubFilter
            selectedClub={calendarSelectedClub}
            setSelectedClub={setCalendarSelectedClub}
          />
        </div>
        <EventCalendar
          selectedDate={selectedDate}
          selectedClub={calendarSelectedClub}
          events={allEvents.filter((event) => event.status === "ACCEPT")}
        />
      </Box>
    </Box>
  );

  const renderFestsContent = () => (
    <Box className="gymkhana-section gymkhana-section-body" mt="10px" mx="0" my="xs">
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {fests.map((fest) => (
          <Card
            key={fest.id}
            className="gymkhana-grid-card"
            shadow="sm"
            padding="lg"
            radius="md"
            withBorder
          >
            <Text weight={700} size="lg">
              {fest.name}
            </Text>
            <Badge color="blue" mt="sm" size="sm" variant="light">
              {fest.category}
            </Badge>
            <Text size="sm" mt="sm">
              Date: {fest.date}
            </Text>
            <Text size="sm" mt="sm" color="blue">
              <a href={fest.link} target="_blank" rel="noopener noreferrer">
                Visit Link
              </a>
            </Text>
            <Button
              color="blue"
              fullWidth
              mt="md"
              radius="md"
              onClick={() => openModal(fest)}
            >
              View Description
            </Button>
          </Card>
        ))}
      </SimpleGrid>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={selectedFest?.name}
        centered
        size="70%"
      >
        <Text align="justify" size="md" mt="md">
          {selectedFest?.description?.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </Text>
      </Modal>
    </Box>
  );

  const renderEventsContent = () => (
    <Box className="gymkhana-page" mt="10px">
      <Box className="gymkhana-section gymkhana-section-body">
        <Suspense fallback={<div>Loading Events Table for you ...</div>}>
          <Text className="gymkhana-section-title" size="xl" mb="md">
            Upcoming Events
          </Text>
          <DataTable
            data={upcomingEvents}
            columns={[
              { accessorKey: "club", header: "Club" },
              { accessorKey: "event_name", header: "Event Name" },
              { accessorKey: "incharge", header: "Incharge" },
              { accessorKey: "venue", header: "Venue" },
              { accessorKey: "start_date", header: "Start Date" },
              { accessorKey: "end_date", header: "End Date" },
              { accessorKey: "start_time", header: "Start Time" },
              { accessorKey: "details", header: "Details" },
            ]}
          />
        </Suspense>
      </Box>
      <Box className="gymkhana-section gymkhana-section-body">
        <Suspense fallback={<div>Loading Events Table for you ...</div>}>
          <Text className="gymkhana-section-title" size="xl" mb="md">
            Past Events
          </Text>
          <DataTable
            data={pastEvents}
            columns={[
              { accessorKey: "club", header: "Club" },
              { accessorKey: "event_name", header: "Event Name" },
              { accessorKey: "incharge", header: "Incharge" },
              { accessorKey: "venue", header: "Venue" },
              { accessorKey: "start_date", header: "Start Date" },
              { accessorKey: "end_date", header: "End Date" },
              { accessorKey: "start_time", header: "Start Time" },
              { accessorKey: "details", header: "Details" },
            ]}
          />
        </Suspense>
      </Box>
    </Box>
  );

  const renderActiveContent = () => {
    switch (activeTab) {
      case "0":
        return renderClubContent();
      case "1":
        return renderCalendarContent();
      case "2":
        return renderFestsContent();
      case "3":
        return renderEventsContent();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="gymkhana-empty-state">
        <div>
          <Text className="gymkhana-empty-state__title">Loading Gymkhana</Text>
          <Text className="gymkhana-empty-state__text">
            Pulling club, event, and fest data into the Fusion workspace.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="gymkhana-shell">
      <ModuleTabs
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(String(tab));
          dispatch(setActiveTab_(tabs[tab].title));
        }}
      />
      <Box className="gymkhana-section">
        <Box className="gymkhana-section-body">
          <Group className="gymkhana-toolbar" justify="space-between" mb="md">
            <Text className="gymkhana-section-title">Gymkhana Dashboard</Text>
            <Text size="sm" className="gymkhana-subtle-text">
              Browse clubs, calendars, fests, and event history.
            </Text>
          </Group>
          <Group justify="end" mb="md">
            <Select
              data={clubOptions}
              value={selectedClub}
              placeholder="Select a Club"
              onChange={setSelectedClub}
              w="220px"
            />
          </Group>
          {renderActiveContent()}
        </Box>
      </Box>
    </div>
  );
}

export default GymkhanaDashboard;
