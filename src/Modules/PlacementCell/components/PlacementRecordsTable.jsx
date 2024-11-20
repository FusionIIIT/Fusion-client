// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Table,
//   Pagination,
//   Select,
//   Card,
//   Title,
//   Container,
//   Button,
//   TextInput,
//   Loader,
//   Alert,
// } from "@mantine/core";
// import axios from "axios";
// import { MantineReactTable } from "mantine-react-table";
// import { useSelector } from "react-redux";
// import AddPlacementRecordForm from "./AddPlacementRecordForm";

// function PlacementRecordsTable() {
//   const role = useSelector((state) => state.user.role);

//   const [placementStats, setPlacementStats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activePage, setActivePage] = useState(1);
//  const [modalOpened, setModalOpened] = useState(false);
// const recordsPerPage = 10;

//   useEffect(() => {
//     const fetchPlacementStats = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem("authToken");
//         const response = await axios.get(
//           "http://127.0.0.1:8000/placement/api/statistics/",
//           {
//             headers: {
//               Authorization: `Token ${token}`,
//             },
//           },
//         );

//         if (response.status === 200) {
//           setPlacementStats(response.data);
//         } else {
//           setError(`Error fetching data: ${response.status}`);
//         }
//       } catch (error) {
//         setError("Failed to fetch placement statistics");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPlacementStats();
//   }, []);

//   const downloadExcel = async () => {
//     const token = localStorage.getItem("authToken");
//     try {
//       const response = await axios.get(
//         "http://127.0.0.1:8000/placement/api/download-statistics/",
//         {
//           headers: {
//             Authorization: `Token ${token}`,
//           },
//           responseType: "blob",
//         },
//       );
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", "placement_statistics.xlsx");
//       document.body.appendChild(link);
//       link.click();
//     } catch (error) {
//       console.error("Error downloading Excel file:", error);
//     }
//   };

//   const columns = useMemo(
//     () => [
//       {
//         accessorKey: "first_name",
//         header: "Student Name",
//         size: 200,
//       },
//       {
//         accessorKey: "placement_name",
//         header: "Company",
//         size: 200,
//       },
//       {
//         accessorKey: "batch",
//         header: "Batch",
//         size: 150,
//       },
//       {
//         accessorKey: "branch",
//         header: "Branch",
//         size: 150,
//       },
//       {
//         accessorKey: "ctc",
//         header: "CTC",
//         size: 120,
//       },
//     ],
//     [],
//   );

//   const paginatedRecords = placementStats.slice(
//     (activePage - 1) * recordsPerPage,
//     activePage * recordsPerPage,
//   );

//   if (loading) return <Loader />;
//   if (error) return <Alert color="red">{error}</Alert>;

//   return (
//     <Container>
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
//         <Title order={2}>Placement Statistics</Title>
//         {role === "placement officer" && (
//           <>
//             <Button onClick={downloadExcel}>Download Excel</Button>

//             <Button onClick={() => setModalOpened(true)}>
//               Add Placement Record
//             </Button>

//           </>
//         )}

// <AddPlacementRecordForm
//         opened={modalOpened}
//         onClose={() => setModalOpened(false)}
//       />
//       </Container>

//       <Card shadow="sm" padding="md" radius="md" withBorder>
//         <Title order={3} style={{ marginBottom: "12px" }}>
//           All Students
//         </Title>

//         {placementStats.length > 0 ? (
//           <MantineReactTable
//             columns={columns}
//             data={paginatedRecords}
//             enableColumnOrdering
//             enableGlobalFilter
//           />
//         ) : (
//           <Alert color="yellow">No records available</Alert>
//         )}
//       </Card>
//     </Container>
//   );
// }

// export default PlacementRecordsTable;

// import React, { useEffect, useState, useMemo } from "react";
// import { Card, Title, Container, Button, Loader, Alert } from "@mantine/core";
// import axios from "axios";
// import { MantineReactTable } from "mantine-react-table";
// import { useSelector } from "react-redux";
// import AddPlacementRecordForm from "./AddPlacementRecordForm";
// import { notifications } from "@mantine/notifications";

// function PlacementRecordsTable() {
//   const role = useSelector((state) => state.user.role);

//   const [placementStats, setPlacementStats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activePage, setActivePage] = useState(1);
//   const [modalOpened, setModalOpened] = useState(false);
//   const recordsPerPage = 10;

//   useEffect(() => {
//     const fetchPlacementStats = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem("authToken");
//         const response = await axios.get(
//           "http://127.0.0.1:8000/placement/api/statistics/",
//           {
//             headers: {
//               Authorization: `Token ${token}`,
//             },
//           },
//         );

//         if (response.status === 200) {
//           setPlacementStats(response.data);
//         } else {
//           setError(`Error fetching data: ${response.status}`);
//           notifications.showNotification({
//             title: "Error fetching data",
//             message: `Error fetching data: ${response.status}`,
//             color: "red",
//           });
//         }
//       } catch (error) {
//         setError("Failed to fetch placement statistics");
//         notifications.showNotification({
//           title: "Failed to fetch data",
//           message: "Failed to fetch placement statistics",
//           color: "red",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPlacementStats();
//   }, []);

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm(
//       "Are you sure you want to delete this record?",
//     );

//     if (!confirmDelete) return;

//     try {
//       const token = localStorage.getItem("authToken");
//       const response = await axios.delete(
//         `http://127.0.0.1:8000/placement/api/statistics/${id}/`,
//         {
//           headers: {
//             Authorization: `Token ${token}`,
//           },
//         },
//       );

//       if (response.status === 204) {
//         notifications.showNotification({
//           title: "Record deleted",
//           message: "Record successfully deleted!",
//           color: "green",
//         });
//         setPlacementStats((prevStats) =>
//           prevStats.filter((record) => record.id !== id),
//         );
//       } else {
//         notifications.showNotification({
//           title: "Failed to delete record",
//           message: "Unable to delete the record.",
//           color: "red",
//         });
//       }
//     } catch (error) {
//       console.error("Error deleting record:", error);
//       notifications.showNotification({
//         title: "Failed to delete record",
//         message: "An error occured while deleting the record.",
//         color: "red",
//       });
//     }
//   };

//   const columns = useMemo(
//     () => [
//       {
//         accessorKey: "first_name",
//         header: "Student Name",
//         size: 200,
//       },
//       {
//         accessorKey: "placement_name",
//         header: "Company",
//         size: 200,
//       },
//       {
//         accessorKey: "batch",
//         header: "Batch",
//         size: 150,
//       },
//       {
//         accessorKey: "branch",
//         header: "Branch",
//         size: 150,
//       },
//       {
//         accessorKey: "ctc",
//         header: "CTC",
//         size: 120,
//       },
//       ...(role === "placement officer"
//         ? [
//             {
//               accessorKey: "actions",
//               header: "Actions",
//               Cell: ({ row }) => (
//                 <Button
//                   color="red"
//                   size="xs"
//                   onClick={() => handleDelete(row.original.id)}
//                 >
//                   Delete
//                 </Button>
//               ),
//               size: 100,
//             },
//           ]
//         : []),
//     ],
//     [role],
//   );

//   const paginatedRecords = placementStats.slice(
//     (activePage - 1) * recordsPerPage,
//     activePage * recordsPerPage,
//   );

//   if (loading) return <Loader />;
//   if (error) return <Alert color="red">{error}</Alert>;

//   return (
//     <Container fluid>
//       <Container
//         fluid
//         style={{
//           display: "flex",
//           flexDirection: "row",
//           justifyContent: "space-between",
//           alignItems: "center",
//         }}
//         my={32}
//       >
//         <Title order={2}>Placement Statistics</Title>
//         {role === "placement officer" && (
//           <>
//             <Button onClick={() => setModalOpened(true)}>
//               Add Placement Record
//             </Button>
//           </>
//         )}

//         <AddPlacementRecordForm
//           opened={modalOpened}
//           onClose={() => setModalOpened(false)}
//         />
//       </Container>

//       <Container fluid>
//         <Title order={3} style={{ marginBottom: "12px" }}>
//           All Students
//         </Title>

//         {placementStats.length > 0 ? (
//           <MantineReactTable
//             columns={columns}
//             data={paginatedRecords}
//             enableColumnOrdering
//             enableGlobalFilter
//           />
//         ) : (
//           <Alert color="yellow">No records available</Alert>
//         )}
//       </Container>
//     </Container>
//   );
// }

// export default PlacementRecordsTable;

// css for mantine-tables

import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  Title,
  Container,
  Button,
  Loader,
  Alert,
  useStyles,
} from "@mantine/core";
import axios from "axios";
import { MantineReactTable } from "mantine-react-table";
import { useSelector } from "react-redux";
import AddPlacementRecordForm from "./AddPlacementRecordForm";
import { notifications } from "@mantine/notifications";
import { deletePlacementStatsRoute, fetchPlacementStatsRoute } from "../../../routes/placementCellRoutes";

function PlacementRecordsTable() {
  const role = useSelector((state) => state.user.role);

  const [placementStats, setPlacementStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [modalOpened, setModalOpened] = useState(false);
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchPlacementStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          fetchPlacementStatsRoute,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );

        if (response.status === 200) {
          setPlacementStats(response.data);
        } else {
          setError(`Error fetching data: ${response.status}`);
          notifications.show({
            title: "Error fetching data",
            message: `Error fetching data: ${response.status}`,
            color: "red",
          });
        }
      } catch (error) {
        setError("Failed to fetch placement statistics");
        notifications.show({
          title: "Failed to fetch data",
          message: "Failed to fetch placement statistics",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementStats();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this record id:${id}?`,
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.delete(
        `${deletePlacementStatsRoute}${id}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );

      if (response.status === 200) {
        notifications.show({
          title: "Record deleted",
          message: "Record successfully deleted!",
          color: "green",
        });
        setPlacementStats((prevStats) =>
          prevStats.filter((record) => record.id !== id),
        );
      } else {
        notifications.show({
          title: "Failed to delete record",
          message: "Unable to delete the record.",
          color: "red",
        });
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      notifications.show({
        title: "Failed to delete record",
        message: "An error occured while deleting the record.",
        color: "red",
      });
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "first_name",
        header: "Student Name",
        size: 200,
      },
      {
        accessorKey: "placement_name",
        header: "Company",
        size: 200,
      },
      {
        accessorKey: "batch",
        header: "Batch",
        size: 150,
      },
      {
        accessorKey: "branch",
        header: "Branch",
        size: 150,
      },
      {
        accessorKey: "ctc",
        header: "CTC",
        size: 120,
      },
      ...(role === "placement officer"
        ? [
            {
              accessorKey: "actions",
              header: "Actions",
              Cell: ({ row }) => (
                <Button
                  color="red"
                  size="xs"
                  onClick={() => handleDelete(row.original.id)}
                >
                  Delete
                </Button>
              ),
              size: 100,
            },
          ]
        : []),
    ],
    [role],
  );

  const paginatedRecords = placementStats.slice(
    (activePage - 1) * recordsPerPage,
    activePage * recordsPerPage,
  );

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <Container fluid>
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
        <Title order={2}>Placement Statistics</Title>
        {role === "placement officer" && (
          <>
            <Button
              onClick={() => setModalOpened(true)}
              variant="outline"
              style={{ marginLeft: "auto", marginRight: 0 }}
            >
              Add Placement Record
            </Button>
          </>
        )}
      </Container>

      <AddPlacementRecordForm
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
      />

      <Container fluid>
        <Title order={3} style={{ marginBottom: "12px" }}>
          All Students
        </Title>

        {placementStats.length > 0 ? (
          <MantineReactTable
            columns={columns}
            data={paginatedRecords}
            // enableColumnOrdering
            // enableGlobalFilter
            // enableRowOrdering
            // mantineColumnActionsButtonProps={{
            //   variant: "light",
            // }}
            // positionActionsColumn="last"
          />
        ) : (
          <Alert color="yellow">No records available</Alert>
        )}
      </Container>
    </Container>
  );
}

export default PlacementRecordsTable;
