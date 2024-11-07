
import React, { useState, useEffect } from 'react';
import PlacementScheduleCard from './PlacementScheduleCard';
import { Container, Pagination, Grid} from '@mantine/core';
import axios from 'axios';
import { Modal } from '@mantine/core';
import AddPlacementEventForm from './AddPlacementEventForm'; 
import { useSelector } from 'react-redux';
import { Button } from '@mantine/core';

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};


const csrfToken = getCookie('csrftoken');

const PlacementScheduleGrid = ({ data, itemsPerPage, cardsPerRow, onAddEvent }) => {
  const role = useSelector((state) => state.user.role);
  const [activePage, setActivePage] = useState(1);

  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  const totalRows = Math.ceil(currentItems.length / cardsPerRow);
  const paddedItems = [...currentItems];

  const remainingCards = totalRows * cardsPerRow - currentItems.length;
  
  for (let i = 0; i < remainingCards; i++) {
    paddedItems.push(null);
  }

  return (
    <Container fluid py={32}>
      {/* Add button for placement officers */}
      {role === 'placement officer' && (
        <Button onClick={onAddEvent} variant="outline" mb="md">
          Add Placement Event
        </Button>
      )}
      <Grid gutter="md">
        {paddedItems.map((item, index) => (
          <Grid.Col key={index} span={12 / cardsPerRow}>
            {item ? (
            <PlacementScheduleCard
                companyLogo="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                companyName={item.company_name}
                location={item.location}
                position={item.role}
                jobType={item.placement_type}
                postedTime={item.schedule_at}
                deadline={item.placement_date}
                description={item.description}
                salary={item.ctc}
              />
              ) : (
              <div style={{ height: '100%', border: '1px dashed gray' }}>
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
};

const PlacementSchedule = () => {

  const [placementData, setPlacementData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/placement/api/placement/', {
          headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/json',
          },
        });
        setPlacementData(response.data);
      } catch (err) {
        console.error('Error details:', err.response ? err.response.data : err.message);
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
      <PlacementScheduleGrid data={placementData} itemsPerPage={6} onAddEvent={handleAddEvent} />
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Placement Event"
        size="lg"
        centered
      >
        <AddPlacementEventForm opened={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
}

export default PlacementSchedule;
