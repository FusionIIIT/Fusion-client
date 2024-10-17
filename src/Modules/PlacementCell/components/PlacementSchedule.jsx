import React, { useState, useEffect } from 'react';
import PlacementScheduleCard from './PlacementScheduleCard';
import { Container, Pagination, Grid} from '@mantine/core';
import axios from 'axios';

// const placementData = [
//   {
//     id: 1,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   },
//   {
//     id: 2,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
//     companyName: 'Microsoft',
//     location: 'Redmond, WA, USA',
//     position: 'Data Scientist',
//     jobType: 'Full Time',
//     postedTime: '2 hours ago',
//     deadline: 'October 25, 2024, 11:59pm',
//     description: 'Analyze large datasets and build predictive models to support business decisions...',
//     salary: '$110,000/year',
//   },
//   {
//     id: 3,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Google_logo.svg',
//     companyName: 'Google',
//     location: 'Mountain View, CA, USA',
//     position: 'Product Manager',
//     jobType: 'Contract',
//     postedTime: '1 day ago',
//     deadline: 'November 1, 2024, 11:59pm',
//     description: 'Manage product life cycles and coordinate with cross-functional teams to deliver projects...',
//     salary: '$80,000/year',
//   },
//   {
//     id: 4,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Apple_logo_black.svg',
//     companyName: 'Apple',
//     location: 'Cupertino, CA, USA',
//     position: 'Hardware Engineer',
//     jobType: 'Full Time',
//     postedTime: '3 days ago',
//     deadline: 'November 10, 2024, 11:59pm',
//     description: 'Design and develop innovative hardware solutions for our cutting-edge products...',
//     salary: '$130,000/year',
//   },
//   {
//     id: 5,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   }, {
//     id: 6,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   }, {
//     id: 7,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   }, {
//     id: 8,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   }, {
//     id: 9,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   }, {
//     id: 10,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   }, {
//     id: 11,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   },
//   {
//     id: 12,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   },
//   {
//     id: 13,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
//     companyName: 'Microsoft',
//     location: 'Redmond, WA, USA',
//     position: 'Data Scientist',
//     jobType: 'Full Time',
//     postedTime: '2 hours ago',
//     deadline: 'October 25, 2024, 11:59pm',
//     description: 'Analyze large datasets and build predictive models to support business decisions...',
//     salary: '$110,000/year',
//   },
//   {
//     id: 14,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Google_logo.svg',
//     companyName: 'Google',
//     location: 'Mountain View, CA, USA',
//     position: 'Product Manager',
//     jobType: 'Contract',
//     postedTime: '1 day ago',
//     deadline: 'November 1, 2024, 11:59pm',
//     description: 'Manage product life cycles and coordinate with cross-functional teams to deliver projects...',
//     salary: '$80,000/year',
//   },
//   {
//     id: 15,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Apple_logo_black.svg',
//     companyName: 'Apple',
//     location: 'Cupertino, CA, USA',
//     position: 'Hardware Engineer',
//     jobType: 'Full Time',
//     postedTime: '3 days ago',
//     deadline: 'November 10, 2024, 11:59pm',
//     description: 'Design and develop innovative hardware solutions for our cutting-edge products...',
//     salary: '$130,000/year',
//   },
//   {
//     id: 16,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   }, {
//     id: 17,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   }, {
//     id: 18,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   }, {
//     id: 19,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   }, {
//     id: 20,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   }, {
//     id: 21,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   }, {
//     id: 22,
//     companyLogo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
//     companyName: 'Amazon',
//     location: 'Seattle, WA, USA',
//     position: 'Software Engineer',
//     jobType: 'Full Time',
//     postedTime: '5 min ago',
//     deadline: 'October 20, 2024, 11:59pm',
//     description: 'Participate in a coding challenge where you solve real-world problems using algorithms...',
//     salary: '$120,000/year',
//   },];
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

// Usage
const csrfToken = getCookie('csrftoken');

const PlacementScheduleGrid = ({ data, itemsPerPage, cardsPerRow }) => {
  const [activePage, setActivePage] = useState(1);

  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  // Calculate number of rows
  const totalRows = Math.ceil(currentItems.length / cardsPerRow);
  const paddedItems = [...currentItems];

  // Add placeholder cards if the last row is incomplete
  const remainingCards = totalRows * cardsPerRow - currentItems.length;
  for (let i = 0; i < remainingCards; i++) {
    paddedItems.push(null);
  }

  return (
    <Container fluid py={32}>
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <PlacementScheduleGrid data={placementData} itemsPerPage={6} />
  );
}

export default PlacementSchedule;
