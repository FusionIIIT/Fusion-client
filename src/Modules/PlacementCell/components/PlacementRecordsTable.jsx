// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   Pagination,
//   TextInput,
//   Select,
//   Card,
//   Title,
//   Container,
//   Button,
//   Loader,
//   Alert,
// } from "@mantine/core";
// import { statisticsRoute } from "../../../routes/placementCellRoutes";
// import AddPlacementRecordForm from "./AddPlacementRecordForm";
// import { useSelector } from "react-redux";
// import axios from "axios";

// function PlacementRecordsTable() {
//   const role = useSelector((state) => state.user.role);

//   const [placementStats, setPlacementStats] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [modalOpened, setModalOpened] = useState(false);
//   const [activePage, setActivePage] = useState(1);
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
//           console.log("Fetched data:", response.data);
//           setPlacementStats(response.data);
//         } else {
//           console.error("Unexpected response:", response);
//           setError(`Error fetching data: ${response.status}`);
//         }
//       } catch (error) {
//         console.error("Fetch error:", error);
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

//   const paginatedRecords = placementStats.slice(
//     (activePage - 1) * recordsPerPage,
//     activePage * recordsPerPage,
//   );

//   const rows = paginatedRecords.map((record, index) => (
//     <tr key={index}>
//       <td>{record.first_name}</td>
//       <td>{record.placement_name}</td>
//       <td>{record.batch}</td>
//       <td>{record.branch}</td>
//       <td>{record.ctc}</td>
//     </tr>
//   ));

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
//       </Container>

//       <Card
//         shadow="sm"
//         padding="md"
//         radius="md"
//         withBorder
//         style={{ width: "900px" }}
//       >
//         {/* Title */}
//         <Title order={3} style={{ marginBottom: "12px", fontSize: "18px" }}>
//           All Students
//         </Title>

//         {/* Table Search and Sorting Options */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "flex-end",
//             marginBottom: "12px",
//             gap: "8px",
//           }}
//         >
//           <TextInput
//             placeholder="Search"
//             icon="🔍"
//             style={{ width: "180px", fontSize: "14px" }}
//           />
//           <Select
//             placeholder="Sort by"
//             data={[
//               { value: "newest", label: "Newest" },
//               { value: "highest_ctc", label: "Highest CTC" },
//               { value: "lowest_ctc", label: "Lowest CTC" },
//             ]}
//             style={{ width: "180px", fontSize: "14px" }}
//           />
//         </div>

//         <Table
//           highlightOnHover
//           style={{
//             tableLayout: "fixed",
//             width: "100%",
//             borderSpacing: "0px 0px",
//           }}
//         >
//           <thead>
//             <tr>
//               <th>Student Name</th>
//               <th>Company</th>
//               <th>Batch</th>
//               <th>Branch</th>
//               <th>CTC</th>
//             </tr>
//           </thead>
//           <tbody>{rows}</tbody>
//         </Table>

//         <div
//           style={{
//             display: "flex",
//             justifyContent: "flex-end",
//             marginTop: "12px",
//           }}
//         >
//           <Pagination
//             total={Math.ceil(placementStats.length / recordsPerPage)}
//             page={activePage}
//             onChange={setActivePage}
//           />
//         </div>
//       </Card>

//       <AddPlacementRecordForm
//         opened={modalOpened}
//         onClose={() => setModalOpened(false)}
//       />
//     </Container>
//   );
// }

// export default PlacementRecordsTable;

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  Pagination,
  Select,
  Card,
  Title,
  Container,
  Button,
  TextInput,
  Loader,
  Alert,
} from "@mantine/core";
import axios from "axios";
import { MantineReactTable } from "mantine-react-table";
import { useSelector } from "react-redux";

function PlacementRecordsTable() {
  const role = useSelector((state) => state.user.role);

  const [placementStats, setPlacementStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    const fetchPlacementStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await axios.get(
          "http://127.0.0.1:8000/placement/api/statistics/",
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
        }
      } catch (error) {
        setError("Failed to fetch placement statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementStats();
  }, []);

  const downloadExcel = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/placement/api/download-statistics/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "placement_statistics.xlsx");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading Excel file:", error);
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
    ],
    [],
  );

  const paginatedRecords = placementStats.slice(
    (activePage - 1) * recordsPerPage,
    activePage * recordsPerPage,
  );

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <Container>
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
            <Button onClick={downloadExcel}>Download Excel</Button>
            {/* Add placement record button can be added here */}
          </>
        )}
      </Container>

      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Title order={3} style={{ marginBottom: "12px" }}>
          All Students
        </Title>

        {placementStats.length > 0 ? (
          <MantineReactTable
            columns={columns}
            data={paginatedRecords}
            enableColumnOrdering
            enableGlobalFilter
          />
        ) : (
          <Alert color="yellow">No records available</Alert>
        )}
      </Card>
    </Container>
  );
}

export default PlacementRecordsTable;
