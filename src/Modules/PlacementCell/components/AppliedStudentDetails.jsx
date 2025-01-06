// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   Pagination,
//   Select,
//   Card,
//   Title,
//   Container,
//   Button,
//   Loader,
//   Alert,
//   TextInput,
// } from "@mantine/core";
// import axios from "axios";

// function JobApplicationsTable() {
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [activePage, setActivePage] = useState(1);
//   const recordsPerPage = 10;

//   const jobId = new URLSearchParams(window.location.search).get("jobId");

//   useEffect(() => {
//     const fetchApplications = async () => {
//       const token = localStorage.getItem("authToken");
//       try {
//         const response = await axios.get(
//           `http://127.0.0.1:8000/placement/api/student-applications/${jobId}/`,
//           {
//             headers: { Authorization: `Token ${token}` },
//           },
//         );
//         setApplications(response.data.students);
//       } catch (error) {
//         console.error("Error fetching applications:", error);
//       }
//     };
//     fetchApplications();
//   }, [jobId]);

//   const handleStatusChange = (applicationId, status) => {
//     const data = {
//       status: status,
//     };

//     const updatedata = async () => {
//       const token = localStorage.getItem("authToken");
//       try {
//         const response = await axios.put(
//           `http://127.0.0.1:8000/placement/api/student-applications/${applicationId}/`,
//           data,
//           {
//             headers: {
//               Authorization: `Token ${token}`,
//               "Content-Type": "application/json",
//             },
//           },
//         );
//         console.log("response:", response);
//         if (response.status === 200) {
//           setApplications((prevApplications) =>
//             prevApplications.map((application) =>
//               application.id === applicationId
//                 ? { ...application, status }
//                 : application,
//             ),
//           );
//           console.log("updated");
//         } else {
//           console.error("Failed to update");
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     };
//     updatedata();
//   };

//   const downloadExcel = async () => {
//     const token = localStorage.getItem("authToken");
//     try {
//       const response = await axios.get(
//         `http://127.0.0.1:8000/placement/api/download-applications/${jobId}/`,
//         {
//           headers: { Authorization: `Token ${token}` },
//           responseType: "blob",
//         },
//       );

//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;
//       link.setAttribute("download", `applications_${jobId}.xlsx`);
//       document.body.appendChild(link);
//       link.click();
//     } catch (error) {
//       console.error("Error downloading Excel:", error);
//     }
//   };

//   const paginatedApplications = applications.slice(
//     (activePage - 1) * recordsPerPage,
//     activePage * recordsPerPage,
//   );

//   return (
//     <Container>
//       <Card shadow="sm" padding="md" radius="md" withBorder>
//         <Title order={3}>Student Job Applications</Title>
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             marginBottom: "12px",
//           }}
//         >
//           <TextInput placeholder="Search" style={{ width: "200px" }} />
//           <Button onClick={downloadExcel}>Download Excel</Button>
//         </div>
//         <Table highlightOnHover>
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Roll No</th>
//               <th>Email</th>
//               <th>CPI</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {paginatedApplications.map((application) => (
//               <tr key={application.id}>
//                 <td>{application.name}</td>
//                 <td>{application.roll_no}</td>
//                 <td>{application.email}</td>
//                 <td>{application.cpi}</td>
//                 <td>
//                   <Select
//                     data={[
//                       { value: "accept", label: "Accept" },
//                       { value: "reject", label: "Reject" },
//                     ]}
//                     value={application.status}
//                     onChange={(value) =>
//                       handleStatusChange(application.id, value)
//                     }
//                   />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//         <Pagination
//           total={Math.ceil(applications.length / recordsPerPage)}
//           page={activePage}
//           onChange={setActivePage}
//         />
//       </Card>
//     </Container>
//   );
// }

// export default JobApplicationsTable;

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
import { notifications } from "@mantine/notifications";
import {
  downloadExcelRoute,
  fetchApplicationsRoute,
  handleStatusChangeRoute,
} from "../../../routes/placementCellRoutes";

function JobApplicationsTable() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const recordsPerPage = 10;

  const jobId = new URLSearchParams(window.location.search).get("jobId");

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem("authToken");
      try {
        setLoading(true);
        const response = await axios.get(`${fetchApplicationsRoute}${jobId}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setApplications(response.data.students);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [jobId]);

  const handleStatusChange = (applicationId, status) => {
    const data = { status: status };
    const updateData = async () => {
      const token = localStorage.getItem("authToken");
      try {
        const response = await axios.put(
          `${handleStatusChangeRoute}${applicationId}/`,
          data,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (response.status === 200) {
          setApplications((prevApplications) =>
            prevApplications.map((application) =>
              application.id === applicationId
                ? { ...application, status }
                : application,
            ),
          );

          notifications.show({
            title: "Success",
            message: "Application status updated successfully",
            color: "green",
            position: "top-center",
          });
        } else {
          notifications.show({
            title: "Error",
            message: "Failed to update application status",
            color: "red",
            position: "top-center",
          });
        }
      } catch (error) {
        notifications.show({
          title: "Error",
          message: "Failed to update application status",
          color: "red",
          position: "top-center",
        });

        console.error(error);
      }
    };
    updateData();
  };

  const downloadExcel = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(`${downloadExcelRoute}${jobId}/`, {
        headers: { Authorization: `Token ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `applications_${jobId}.xlsx`);
      document.body.appendChild(link);
      link.click();

      notifications.show({
        title: "Success",
        message: "Excel file downloaded successfully",
        color: "green",
        position: "top-center",
      });
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to download Excel file",
        color: "red",
        position: "top-center",
      });

      console.error("Error downloading Excel:", error);
    }
  };

  // Columns definition for MantineReactTable
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 200,
      },
      {
        accessorKey: "roll_no",
        header: "Roll No",
        size: 150,
      },
      {
        accessorKey: "email",
        header: "Email",
        size: 250,
      },
      {
        accessorKey: "cpi",
        header: "CPI",
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
        Cell: ({ row }) => (
          <Select
            data={[
              { value: "accept", label: "Accept" },
              { value: "reject", label: "Reject" },
            ]}
            value={row.original.status}
            onChange={(value) => handleStatusChange(row.original.id, value)}
          />
        ),
      },
    ],
    [],
  );

  // Paginate records for the table display
  const paginatedApplications = applications.slice(
    (activePage - 1) * recordsPerPage,
    activePage * recordsPerPage,
  );

  if (loading) return <Loader />;

  return (
    <Container fluid>
      <Container padding="md" fluid>
        <Container
          fluid
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
          my={36}
        >
          <Title order={3}>Student Job Applications</Title>

          <Button onClick={downloadExcel}>Download Excel</Button>
        </Container>

        {applications.length > 0 ? (
          <MantineReactTable
            columns={columns}
            data={paginatedApplications}
            // enableColumnOrdering
            // enableGlobalFilter
          />
        ) : (
          <Alert color="yellow">No applications available</Alert>
        )}
      </Container>
    </Container>
  );
}

export default JobApplicationsTable;
