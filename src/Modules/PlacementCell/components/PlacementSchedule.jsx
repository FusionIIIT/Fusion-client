import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Container, Pagination, Grid, Modal, Button, Title } from "@mantine/core";
import axios from "axios";
import { useSelector } from "react-redux";
import AddPlacementEventForm from "./AddPlacementEventForm";
import PlacementScheduleCard from "./PlacementScheduleCard";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const csrfToken = getCookie("csrftoken");

// PlacementScheduleGrid component
function PlacementScheduleGrid({
  data,
  itemsPerPage,
  cardsPerRow,
  onAddEvent,
}) {
  const role = useSelector((state) => state.user.role);
  const [activePage, setActivePage] = useState(1);

  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  const totalRows = Math.ceil(currentItems.length / cardsPerRow);
  const paddedItems = [...currentItems];

  const remainingCards = totalRows * cardsPerRow - currentItems.length;

  Array.from({ length: remainingCards }).forEach(() => paddedItems.push(null));

  return (
    <Container fluid py={16}>
      <Container
        fluid
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        my={16}
      >
        <Title order={2}>Placement Events</Title>
        {role === "placement officer" && (
          <Button onClick={onAddEvent} variant="outline">
            Add Placement Event
          </Button>
        )}
      </Container>
      <Grid gutter="xl">
        {paddedItems.map((item, index) => (
          <Grid.Col key={index} span={12 / cardsPerRow}>
            {item ? (
            <PlacementScheduleCard
                jobId={item.id}
                companyLogo="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                companyName={item.company_name}
                location={item.location}
                position={String(item.role)}
                jobType={item.placement_type}
                postedTime={item.schedule_at}
                deadline={item.placement_date}
                description={item.description}
                salary={item.ctc}
              />
            ) : (
              <div style={{ height: "100%", border: "1px dashed gray" }}>
                Placeholder
              </div>
            )}
          </Grid.Col>
        ))}
      </Grid>
      <Pagination
        page={activePage}
        onChange={setActivePage}
        total={Math.ceil(data.length / itemsPerPage)}
        mt="xl"
        position="right"
      />
    </Container>
  );
}

// Prop Types for PlacementScheduleGrid
PlacementScheduleGrid.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      company_name: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      placement_type: PropTypes.string.isRequired,
      schedule_at: PropTypes.string.isRequired,
      placement_date: PropTypes.string.isRequired,
      description: PropTypes.string,
      ctc: PropTypes.number,
    }),
  ).isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  cardsPerRow: PropTypes.number.isRequired,
  onAddEvent: PropTypes.func.isRequired,
};

// PlacementSchedule component
function PlacementSchedule() {
  const [placementData, setPlacementData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/placement/api/placement/",
          {
            headers: {
              "X-CSRFToken": csrfToken,
              "Content-Type": "application/json",
            },
          },
        );
        setPlacementData(response.data);
      } catch (err) {
        console.error(
          "Error details:",
          err.response ? err.response.data : err.message,
        );
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddEvent = () => {
    setIsModalOpen(true);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <PlacementScheduleGrid
        data={placementData}
        itemsPerPage={6}
        onAddEvent={handleAddEvent}
      />
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
        centered
      >
        <AddPlacementEventForm
          opened={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
};

export default PlacementSchedule;
