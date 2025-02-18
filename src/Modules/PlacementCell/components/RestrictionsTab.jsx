// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Table,
//   Pagination,
//   Select,
//   Card,
//   Title,
//   Container,
//   Button,
//   TextInput,
//   Textarea,
//   Group,
//   ActionIcon,
//   Modal,
//   Alert,
//   Grid,
//   Loader
// } from "@mantine/core";
// import { notifications } from "@mantine/notifications";
// import { Pencil, Trash } from "@phosphor-icons/react";
// import axios from "axios";
// import { MantineReactTable } from "mantine-react-table";

// function RestrictionsTab() {
//   const [restrictions, setRestrictions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [activePage, setActivePage] = useState(1);
//   const recordsPerPage = 10;
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [company, setCompany] = useState("");
//   const [condition, setCondition] = useState("");
//   const [value, setValue] = useState("");
//   const [description, setDescription] = useState("");
//   const [editingRestriction, setEditingRestriction] = useState(null);

//   useEffect(() => {
//     const fetchRestrictions = async () => {
//       setLoading(true);
//       try {
//         const response = await axios.get("/api/restrictions");
//         setRestrictions(response.data);
//       } catch (error) {
//         notifications.show({
//           title: "Error",
//           message: "Failed to fetch restrictions.",
//           color: "red",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRestrictions();
//   }, []);

//   const handleSubmit = async () => {
//     const restrictionData = { company, condition, value, description };

//     try {
//       if (editingRestriction) {
//         await axios.put(`/api/restrictions/${editingRestriction.id}`, restrictionData);
//         notifications.show({
//           title: "Success",
//           message: "Restriction updated successfully!",
//           color: "green",
//         });
//       } else {
//         await axios.post("/api/restrictions", restrictionData);
//         notifications.show({
//           title: "Success",
//           message: "Restriction added successfully!",
//           color: "green",
//         });
//       }
//       fetchRestrictions();
//       setIsModalOpen(false);
//       resetForm();
//     } catch (error) {
//       notifications.show({
//         title: "Error",
//         message: "Failed to submit restriction.",
//         color: "red",
//       });
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`/api/restrictions/${id}`);
//       notifications.show({
//         title: "Success",
//         message: "Restriction deleted successfully!",
//         color: "green",
//       });
//       fetchRestrictions();
//     } catch (error) {
//       notifications.show({
//         title: "Error",
//         message: "Failed to delete restriction.",
//         color: "red",
//       });
//     }
//   };

//   const handleEdit = (restriction) => {
//     setEditingRestriction(restriction);
//     setCompany(restriction.company);
//     setCondition(restriction.condition);
//     setValue(restriction.value);
//     setDescription(restriction.description);
//     setIsModalOpen(true);
//   };

//   const resetForm = () => {
//     setCompany("");
//     setCondition("");
//     setValue("");
//     setDescription("");
//     setEditingRestriction(null);
//   };

//   const columns = useMemo(
//     () => [
//       { accessorKey: "company", header: "Company", size: 200 },
//       { accessorKey: "condition", header: "Condition", size: 150 },
//       { accessorKey: "value", header: "Value", size: 150 },
//       { accessorKey: "description", header: "Description", size: 250 },
//       {
//         accessorKey: "actions",
//         header: "Actions",
//         size: 120,
//         Cell: ({ row }) => (
//           <Group spacing="xs">
//             <ActionIcon onClick={() => handleEdit(row.original)}>
//               <Pencil size={16} />
//             </ActionIcon>
//             <ActionIcon onClick={() => handleDelete(row.original.id)} color="red">
//               <Trash size={16} />
//             </ActionIcon>
//           </Group>
//         ),
//       },
//     ],
//     []
//   );

//   // Paginate records for table display
//   const paginatedRestrictions = restrictions.slice(
//     (activePage - 1) * recordsPerPage,
//     activePage * recordsPerPage
//   );

//   if (loading) return <Loader />;

//   return (
//     <Container>
//       <Card shadow="sm" padding="lg" radius="lg" withBorder>
//         <Title order={3} align="center" style={{ marginBottom: "20px" }}>
//           Auto-Apply Restrictions
//         </Title>
//         <Button onClick={() => setIsModalOpen(true)} style={{ marginBottom: "20px" }}>
//           Add Restriction
//         </Button>

//         {restrictions.length > 0 ? (
//           <MantineReactTable
//             columns={columns}
//             data={paginatedRestrictions}
//           />
//         ) : (
//           <Alert color="yellow">No restrictions available</Alert>
//         )}

//         <Pagination
//           page={activePage}
//           onChange={setActivePage}
//           total={Math.ceil(restrictions.length / recordsPerPage)}
//           style={{ marginTop: "20px" }}
//         />
//       </Card>

//       <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add/Edit Restriction">
//         <Card style={{ maxWidth: "800px", margin: "0 auto" }}>
//           <Title order={3} align="center" style={{ marginBottom: "20px" }}>
//             {editingRestriction ? "Edit Restriction" : "Add Restriction"}
//           </Title>
//           <Grid gutter="lg">
//             <Grid.Col span={12}>
//               <TextInput
//                 label="Company"
//                 placeholder="Enter company name"
//                 value={company}
//                 onChange={(e) => setCompany(e.target.value)}
//               />
//             </Grid.Col>
//             <Grid.Col span={12}>
//               <Select
//                 label="Condition"
//                 placeholder="Select condition"
//                 data={[
//                   { value: "cgpa", label: "CGPA" },
//                   { value: "placed", label: "Already Placed" },
//                   { value: "year", label: "Year of Study" },
//                   { value: "courses", label: "Completed Courses" },
//                 ]}
//                 value={condition}
//                 onChange={setCondition}
//               />
//             </Grid.Col>
//             <Grid.Col span={12}>
//               <TextInput
//                 label="Value"
//                 placeholder="Enter value"
//                 value={value}
//                 onChange={(e) => setValue(e.target.value)}
//               />
//             </Grid.Col>
//             <Grid.Col span={12}>
//               <Textarea
//                 label="Description"
//                 placeholder="Enter description"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//                 minRows={3}
//               />
//             </Grid.Col>
//             <Grid.Col span={12}>
//               <Button onClick={handleSubmit} fullWidth>
//                 Submit
//               </Button>
//             </Grid.Col>
//           </Grid>
//         </Card>
//       </Modal>
//     </Container>
//   );
// }

// export default RestrictionsTab;

import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  Container,
  Title,
  Button,
  Select,
  TextInput,
  Grid,
  Loader,
  Pagination,
  Alert,
  Chip,
  Text,
  ActionIcon,
  Group,
  Modal,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { Pencil, Trash } from "@phosphor-icons/react";
import axios from "axios";
import { MantineReactTable } from "mantine-react-table";
// import { notifications } from "@mantine/notifications";
import { fetchRestrictionsRoute } from "../../../routes/placementCellRoutes";

function RestrictionsTab() {
  const [restrictions, setRestrictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activePage, setActivePage] = useState(1);
  const recordsPerPage = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [criteria, setCriteria] = useState("");
  const [condition, setCondition] = useState("");
  const [values, setValues] = useState([]);
  const [editingRestriction, setEditingRestriction] = useState(null);

  // Available conditions based on criteria
  const conditionOptions = {
    cgpa: [
      { value: "less_than", label: "CGPA <" },
      { value: "greater_than", label: "CGPA >" },
    ],
    company: [
      { value: "equal", label: "Company = " },
      { value: "not_equal", label: "Company ≠" },
    ],
    year: [
      { value: "equal", label: "Year = " },
      { value: "greater_than", label: "Year >" },
      { value: "less_than", label: "Year <" },
    ],
    ctc: [
      { value: "greater_than", label: "CTC >" },
      { value: "less_than", label: "CTC <" },
    ],
  };

  // Fetch restrictions data (mockup as no backend is specified)
  useEffect(() => {
    // setLoading(true);
    // Simulate API call
    // setTimeout(() => {
    //   setRestrictions([
    //     {
    //       id: 1,
    //       criteria: "cgpa",
    //       condition: "greater_than",
    //       value: "5",
    //       description: "Students with CGPA greater than 5",
    //     },
    //     {
    //       id: 2,
    //       criteria: "company",
    //       condition: "equal",
    //       value: "ABC Corp",
    //       description: "Students already placed in ABC Corp",
    //     },
    //   ]);
    //   setLoading(false);
    // }, 1000);

    const fetchRestrictionsList = async () => {
      try {
        
        const token = localStorage.getItem("authToken");
        const response = await axios.get(fetchRestrictionsRoute, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (response.status == 200) {
          setRestrictions([]);
          response.data.forEach(element => {
            const newField = { 'criteria':element.criteria, 'condition':element.condition, 'value':element.value,'description':element.description };
            setRestrictions((prevFields) => [...prevFields, newField]);
          });
          
        } else if (response.status == 406) {
          console.log(`error fetching data: ${response.status}`);
          notifications.show({
            title: "Error fetching data",
            message: `Error fetching data: ${response.status}`,
            color: "red",
          });
        } else {
          console.log(`error fetching data: ${response.status}`);
          notifications.show({
            title: "Error fetching data",
            message: `Error fetching data: ${response.status}`,
            color: "red",
          });
        }
      } catch (error) {
        // setError("Failed to fetch debared students list");
        notifications.show({
          title: "Failed to fetch data",
          message: "Failed to fetch feilds list",
          color: "red",
        });
      }
    };
    fetchRestrictionsList();
  }, []);

  // Handle submit to add or edit restriction
  const handleSubmit = async () => {
    const restrictionData = {
      criteria,
      condition,
      value: values.join(", "),
      description: getRuleDescription(), // Set the generated rule as the description
    };

    if (editingRestriction) {
      // Update the restriction (mock API call)
      setRestrictions(
        restrictions.map((r) =>
          r.id === editingRestriction.id ? { ...restrictionData, id: r.id } : r,
        ),
      );
      notifications.show({
        title: "Success",
        message: "Restriction updated successfully!",
        color: "green",
      });
    } else {
      // Add the restriction (mock API call)
      const newRestriction = { ...restrictionData, id: Math.random() };
      try {
        const token = localStorage.getItem("authToken");
        console.log(newRestriction);
        const response = await axios.post(
          fetchRestrictionsRoute,
          newRestriction,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          },
        );
  
        if (response.status == 200) {
          notifications.show({
            title: "Success",
            message: "successfully added!",
            color: "green",
            position: "top-center",
          });
          setRestrictions([...restrictions, newRestriction]);
        } else {
          notifications.show({
            title: "Failed",
            message: `Failed to add`,
            color: "red",
            position: "top-center",
          });
        }
      }
      catch (error) {
        console.error("Error adding restriction:", error);
        notifications.show({
          title: "Error",
          message: "Failed to add restriction.",
          color: "red",
          position: "top-center",
        });
      }
  
      // Clear the form inputs
       // Clear any error
      
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    setRestrictions(restrictions.filter((r) => r.id !== id));
    notifications.show({
      title: "Success",
      message: "Restriction deleted successfully!",
      color: "green",
    });
  };

  const handleEdit = (restriction) => {
    setEditingRestriction(restriction);
    setCriteria(restriction.criteria);
    setCondition(restriction.condition);
    setValues(restriction.value.split(", "));
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCriteria("");
    setCondition("");
    setValues([]);
    setEditingRestriction(null);
  };

  // Function to generate the rule description
  const getRuleDescription = () => {
    if (!criteria || !condition || values.length === 0) return "";

    let conditionText = "";

    if (criteria === "cgpa") {
      conditionText =
        condition === "greater_than"
          ? `Students with CGPA > ${values[0]} are not allowed to participate in further drives.`
          : `Students with CGPA < ${values[0]} are not allowed to participate in further drives.`;
    } else if (criteria === "company") {
      conditionText =
        condition === "equal"
          ? `Students placed in ${values.join(", ")} are not allowed to participate in further drives.`
          : `Students not placed in ${values.join(", ")} are not allowed to participate in further drives.`;
    } else if (criteria === "year") {
      conditionText =
        condition === "greater_than"
          ? `Students in year > ${values[0]} are not allowed to participate in further drives.`
          : `Students in year < ${values[0]} are not allowed to participate in further drives.`;
    } else if (criteria === "ctc") {
      conditionText =
        condition === "greater_than"
          ? `Students with CTC > ${values[0]} are not allowed to participate in further drives.`
          : `Students with CTC < ${values[0]} are not allowed to participate in further drives.`;
    }

    return conditionText;
  };

  const columns = useMemo(
    () => [
      { accessorKey: "criteria", header: "Criteria", size: 200 },
      { accessorKey: "condition", header: "Condition", size: 150 },
      { accessorKey: "value", header: "Value", size: 150 },
      { accessorKey: "description", header: "Description", size: 250 },
      {
        accessorKey: "actions",
        header: "Actions",
        size: 120,
        Cell: ({ row }) => (
          <Group spacing="xs">
            <ActionIcon onClick={() => handleEdit(row.original)}>
              <Pencil size={16} />
            </ActionIcon>
            <ActionIcon
              onClick={() => handleDelete(row.original.id)}
              color="red"
            >
              <Trash size={16} />
            </ActionIcon>
          </Group>
        ),
      },
    ],
    [],
  );

  const paginatedRestrictions = restrictions.slice(
    (activePage - 1) * recordsPerPage,
    activePage * recordsPerPage,
  );

  if (loading) return <Loader />;

  return (
    <Container>
      <Card shadow="sm" padding="lg" radius="lg" withBorder style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
        <Title order={3} align="center" style={{ marginBottom: "20px" }}>
          Restrictions
        </Title>
        <Button
          onClick={() => setIsModalOpen(true)}
          style={{ marginBottom: "20px", width:'10rem' }}
        >
          Add Restriction
        </Button>

        {restrictions.length > 0 ? (
          <MantineReactTable columns={columns} data={paginatedRestrictions} />
        ) : (
          <Alert color="yellow">No restrictions available</Alert>
        )}

        <Pagination
          page={activePage}
          onChange={setActivePage}
          total={Math.ceil(restrictions.length / recordsPerPage)}
          style={{ marginTop: "20px" }}
        />
      </Card>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add/Edit Restriction"
        size={'lg'}
        centered
      >
        <Card style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Title order={3} align="center" style={{ marginBottom: "20px" }}>
            {editingRestriction ? "Edit Restriction" : "Add Restriction"}
          </Title>
          <Grid gutter="lg">
            <Grid.Col span={12}>
              <Select
                label="Criteria"
                placeholder="Select criteria"
                data={[
                  { value: "company", label: "Company" },
                  { value: "cgpa", label: "CGPA" },
                  { value: "year", label: "Year of Study" },
                  { value: "ctc", label: "CTC" },
                ]}
                value={criteria}
                onChange={setCriteria}
              />
            </Grid.Col>

            {criteria && (
              <Grid.Col span={12}>
                <Select
                  label="Condition"
                  placeholder="Select condition"
                  data={conditionOptions[criteria] || []}
                  value={condition}
                  onChange={setCondition}
                />
              </Grid.Col>
            )}

            <Grid.Col span={12}>
              <TextInput
                label="Value(s)"
                placeholder="Enter value(s)"
                value={values.join(", ")}
                onChange={(e) =>
                  setValues(e.target.value.split(", ").map((v) => v.trim()))
                }
              />
              <div style={{ marginTop: 10 }}>
                {values.map((value, index) => (
                  <Chip key={index} color="blue" style={{ margin: 3 }}>
                    {value}
                  </Chip>
                ))}
              </div>
            </Grid.Col>

            {/* Rule Preview Chip */}
            <Grid.Col span={12}>
              <div style={{ marginTop: 20 }}>
                <Text size="sm" style={{ marginBottom: 5 }}>
                  {" "}
                  Rule Preview:{" "}
                </Text>
                {criteria && condition && values.length > 0 && (
                  <Chip color="teal">{getRuleDescription()}</Chip>
                )}
              </div>
            </Grid.Col>

            <Grid.Col span={12}>
              <Button onClick={handleSubmit} fullWidth>
                Submit
              </Button>
            </Grid.Col>
          </Grid>
        </Card>
      </Modal>
    </Container>
  );
}

export default RestrictionsTab;
