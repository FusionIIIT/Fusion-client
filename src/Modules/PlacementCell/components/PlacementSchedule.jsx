// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import {
//   Container,
//   Pagination,
//   Grid,
//   Modal,
//   Button,
//   Title,
// } from "@mantine/core";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import AddPlacementEventForm from "./AddPlacementEventForm";
// import PlacementScheduleCard from "./PlacementScheduleCard";

// const getCookie = (name) => {
//   const value = `; ${document.cookie}`;
//   const parts = value.split(`; ${name}=`);
//   if (parts.length === 2) return parts.pop().split(";").shift();
// };

// const csrfToken = getCookie("csrftoken");

// // PlacementScheduleGrid component
// function PlacementScheduleGrid({
//   data,
//   itemsPerPage,
//   cardsPerRow,
//   onAddEvent,
// }) {
//   const role = useSelector((state) => state.user.role);
//   const [activePage, setActivePage] = useState(1);

//   const startIndex = (activePage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentItems = data.slice(startIndex, endIndex);

//   const totalRows = Math.ceil(currentItems.length / cardsPerRow);
//   const paddedItems = [...currentItems];

//   const remainingCards = totalRows * cardsPerRow - currentItems.length;

//   Array.from({ length: remainingCards }).forEach(() => paddedItems.push(null));

//   return (
//     <Container fluid py={16}>
//       <Container
//         fluid
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//         my={16}
//       >
//         {/* <Title order={2}>Placement Events</Title> */}
//         {/* {role === "placement officer" && (
//           <Button onClick={onAddEvent} variant="outline">
//             Add Placement Event
//           </Button>
//         )} */}
//       </Container>
//       <Grid gutter="xl">
//         {paddedItems.map((item, index) => (
//           <Grid.Col key={index} span={12 / cardsPerRow}>
//             {item ? (
//               <PlacementScheduleCard
//                 jobId={item.id}
//                 // companyLogo="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
//                 companyName={item.company_name}
//                 location={item.location}
//                 position={item.role_st}
//                 jobType={item.placement_type}
//                 postedTime={item.schedule_at}
//                 deadline={item.placement_date}
//                 description={item.description}
//                 salary={item.ctc}
//                 check={item.check}
//               />
//             ) : (
//               <div></div>
//             )}
//           </Grid.Col>
//         ))}
//       </Grid>
//       <Pagination
//         page={activePage}
//         onChange={setActivePage}
//         total={Math.ceil(data.length / itemsPerPage)}
//         mt="xl"
//         position="right"
//       />
//     </Container>
//   );
// }

// // Prop Types for PlacementScheduleGrid
// PlacementScheduleGrid.propTypes = {
//   data: PropTypes.arrayOf(
//     PropTypes.shape({
//       company_name: PropTypes.string.isRequired,
//       location: PropTypes.string.isRequired,
//       role: PropTypes.string.isRequired,
//       placement_type: PropTypes.string.isRequired,
//       schedule_at: PropTypes.string.isRequired,
//       placement_date: PropTypes.string.isRequired,
//       description: PropTypes.string,
//       ctc: PropTypes.number,
//     }),
//   ).isRequired,
//   itemsPerPage: PropTypes.number.isRequired,
//   cardsPerRow: PropTypes.number.isRequired,
//   onAddEvent: PropTypes.func.isRequired,
// };

// function PlacementSchedule() {
//   const [placementData, setPlacementData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
//   const role = useSelector((state) => state.user.role);

//   useEffect(() => {
//     const fetchData = async () => {
//       const token = localStorage.getItem("authToken");
//       try {
//         const response = await axios.get(
//           "http://127.0.0.1:8000/placement/api/placement/",
//           {
//             headers: {
//               Authorization: `Token ${token}`,
//               "X-CSRFToken": csrfToken,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         setPlacementData(response.data);
//       } catch (err) {
//         console.error("Error details:", err.response ? err.response.data : err.message);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const handleAddEvent = () => {
//     setIsModalOpen(true);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   const today = new Date();

//   const activeEvents = placementData.filter(
//     (item) => new Date(item.placement_date) >= today
//   );
//   const closedEvents = placementData.filter(
//     (item) => new Date(item.placement_date) < today
//   );

//   return (
//     <>
//       <Container fluid py={16}>
//         <Container
//           fluid
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//           }}
//           my={16}
//         >
//           <Title order={2}>Placement Events</Title>
//           {role === "placement officer" && (
//             <Button onClick={handleAddEvent} variant="outline">
//               Add Placement Event
//             </Button>
//           )}
//         </Container>
//         {(role === "placement officer" || role==="placement chairman") && (
//           <>
//             <Title order={3} mt="xl">
//               Active
//             </Title>
//             <PlacementScheduleGrid
//               data={activeEvents}
//               itemsPerPage={6}
//               cardsPerRow={3}
//               onAddEvent={handleAddEvent}
//             />
//             <Title order={3} mt="xl">
//               Closed
//             </Title>
//             <PlacementScheduleGrid
//               data={closedEvents}
//               itemsPerPage={6}
//               cardsPerRow={3}
//               onAddEvent={handleAddEvent}
//             />
//           </>
//         )}
//         {role === "student" && (
//           <>
//             <PlacementScheduleGrid
//               data={activeEvents}
//               itemsPerPage={6}
//               cardsPerRow={3}
//               onAddEvent={handleAddEvent}
//             />
//           </>
//         )}
//       </Container>
//       <Modal
//         opened={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         size="lg"
//         centered
//       >
//         <AddPlacementEventForm
//           opened={isModalOpen}
//           onClose={() => setIsModalOpen(false)}
//         />
//       </Modal>
//     </>
//   );
// }

// export default PlacementSchedule;

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Container,
  Pagination,
  Grid,
  Modal,
  Button,
  Title,
  Tabs,
} from "@mantine/core";
import axios from "axios";
import { useSelector } from "react-redux";
import AddPlacementEventForm from "./AddPlacementEventForm";
import PlacementScheduleCard from "./PlacementScheduleCard";
import { fetchPlacementScheduleRoute } from "../../../routes/placementCellRoutes";

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(";").shift();
};

const csrfToken = getCookie("csrftoken");

function PlacementScheduleGrid({ data, itemsPerPage, cardsPerRow }) {
  const [activePage, setActivePage] = useState(1);

  const startIndex = (activePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = data.slice(startIndex, endIndex);

  const totalRows = Math.ceil(currentItems.length / cardsPerRow);
  const paddedItems = [...currentItems];
  const remainingCards = totalRows * cardsPerRow - currentItems.length;

  Array.from({ length: remainingCards }).forEach(() => paddedItems.push(null));

  return (
    <Container fluid>
      <Grid gutter="md">
        {paddedItems.map((item, index) => (
          <Grid.Col key={index} span={'content'}>
            {item ? (
              <PlacementScheduleCard
                jobId={item.id}
                companyName={item.company_name}
                location={item.location}
                position={item.role_st}
                jobType={item.placement_type}
                postedTime={item.schedule_at}
                deadline={item.placement_date}
                description={item.description}
                salary={item.ctc}
                check={item.check}
              />
            ) : (
              <div></div>
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
        style={{ position: "fixed", bottom: 32 }}
      />
    </Container>
  );
}

PlacementScheduleGrid.propTypes = {
  data: PropTypes.array.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  cardsPerRow: PropTypes.number.isRequired,
};

function PlacementSchedule() {
  const [placementData, setPlacementData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const role = useSelector((state) => state.user.role);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.get(
          fetchPlacementScheduleRoute,
          {
            headers: {
              Authorization: `Token ${token}`,
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

  const today = new Date();

  const activeEvents = placementData.filter(
    (item) => new Date(item.placement_date) >= today,
  );
  const closedEvents = placementData.filter(
    (item) => new Date(item.placement_date) < today,
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const handleAddEvent = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Container fluid mt={32}>
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
            <Button onClick={handleAddEvent} variant="outline">
              Add Placement Event
            </Button>
          )}
        </Container>
        <Tabs defaultValue="active" variant="pills" style={{ marginLeft: 16 }}>
          <Tabs.List>
            <Tabs.Tab value="active">Active</Tabs.Tab>
            {role != "student" && <Tabs.Tab value="closed">Closed</Tabs.Tab>}
          </Tabs.List>

          <Tabs.Panel value="active" pt="md">
            <PlacementScheduleGrid
              data={activeEvents}
              itemsPerPage={10}
              cardsPerRow={2}
            />
          </Tabs.Panel>
          <Tabs.Panel value="closed" pt="md">
            <PlacementScheduleGrid
              data={closedEvents}
              itemsPerPage={10}
              cardsPerRow={5}
            />
          </Tabs.Panel>
        </Tabs>
      </Container>
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
}

export default PlacementSchedule;

// // import { useState } from 'react';
// // import { Grid, Pagination, Container } from '@mantine/core';

// // // Example data
// // const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);

// // const PlacementSchedule = () => {
// //   const [activePage, setActivePage] = useState(1);
// //   const itemsPerPage = 8; // Two rows of 4 items each

// //   // Calculate visible items for the current page
// //   const startIdx = (activePage - 1) * itemsPerPage;
// //   const visibleItems = items.slice(startIdx, startIdx + itemsPerPage);

// //   return (
// //     <Container fluid>
// //       <Grid gutter="md">
// //         {visibleItems.map((item, index) => (
// //           <Grid.Col
// //             key={index}
// //             span={{
// //               sm:6 ,// 2 items per row on small screens
// //               md:4, // 3 items per row on medium screens
// //               lg:3 // 4 items per row on large screens

// //             }}

// //           >
// //             <div
// //               style={{
// //                 padding: '16px',
// //                 border: '1px solid #ddd',
// //                 borderRadius: '8px',
// //                 textAlign: 'center',
// //                 backgroundColor: '#f9f9f9',
// //               }}
// //             >
// //               {item}
// //             </div>
// //           </Grid.Col>
// //         ))}
// //       </Grid>

// //       <Pagination
// //         total={Math.ceil(items.length / itemsPerPage)}
// //         value={activePage}
// //         onChange={setActivePage}
// //         mt="lg"
// //         position="center"
// //       />
// //     </Container>
// //   );
// // };

// // export default PlacementSchedule;
