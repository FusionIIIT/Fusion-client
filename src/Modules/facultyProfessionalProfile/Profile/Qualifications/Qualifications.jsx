import { useState, useEffect } from "react";
import axios from "axios";

import {
  MantineProvider,
  Container,
  Title,
  Paper,
  Grid,
  TextInput,
  Button,
  Pagination,
  Textarea,
} from "@mantine/core";
import { FloppyDisk } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import FusionTable from "../../../../components/FusionTable";
import RowActions from "../../../../components/RowActions";
import {
  deleteQualifications,
  getQualifications,
  insertQualifications,
} from "../../../../routes/facultyProfessionalProfileRoutes";

const COLUMNS = ["Degree", "College", "Description", "Actions"];

export default function Qualifications() {
  const [inputs, setInputs] = useState({
    degree: "",
    college: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [Id, setId] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const pfNo = useSelector((state) => state.pfNo.value);

  // Function to fetch qualifications from the backend
  const fetchQualifications = async () => {
    try {
      const response = await axios.get(getQualifications, {
        params: { pfNo },
      });
      const qualifications = response.data;
      // Sort qualifications by created_at date in descending order
      const sortedQualifications = qualifications.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
      setTableData(sortedQualifications);
    } catch (error) {
      console.error("Error fetching qualifications:", error);
    }
  };

  useEffect(() => {
    fetchQualifications();
  }, []); // Fixed: Added empty dependency array to useEffect

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("user_id", pfNo);
      formData.append("degree", inputs.degree);
      formData.append("college", inputs.college);
      formData.append("description", inputs.description);

      if (!isEdit) {
        await axios.post(insertQualifications, formData);
      } else {
        formData.append("qualification_id", Id);
        await axios.post(insertQualifications, formData);
        setEdit(false);
        setId(0);
      }

      fetchQualifications();
      setInputs({
        degree: "",
        college: "",
        description: "",
      });
    } catch (error) {
      console.error("Error saving qualification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (qualification) => {
    setInputs({
      degree: qualification.degree,
      college: qualification.college,
      description: qualification.description,
    });
    setId(qualification.id);
    setEdit(true);
  };

  const handleDelete = async (qualificationId) => {
    if (window.confirm("Are you sure you want to delete this qualification?")) {
      try {
        await axios.post(
          deleteQualifications,
          new URLSearchParams({ pk: qualificationId }),
        ); // Adjust the delete URL as needed
        fetchQualifications();
      } catch (error) {
        console.error("Error deleting qualification:", error);
      }
    }
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirstRow, indexOfLastRow);

  const rows = currentRows.map((qualification) => ({
    id: qualification.id,
    Degree: qualification.degree,
    College: qualification.college,
    Description: qualification.description,
    Actions: (
      <RowActions
        label={qualification.degree || "qualification"}
        onEdit={() => handleEdit(qualification)}
        onDelete={() => handleDelete(qualification.id)}
      />
    ),
  }));

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Container size="2xl" mt="xl">
        <Paper
          shadow="xs"
          p="md"
          withBorder
          style={{
            borderLeft: "8px solid #2185d0",
            backgroundColor: "#f9fafb",
          }}
        >
          <Title order={2} mb="sm" style={{ color: "#2185d0" }}>
            Add Qualification
          </Title>
          <form onSubmit={handleSubmit}>
            <Grid
              type="container"
              breakpoints={{
                xs: "100px",
                sm: "200px",
                md: "700px",
                lg: "900px",
                xl: "1000px",
              }}
            >
              <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                <TextInput
                  required
                  label="Degree"
                  placeholder="Enter your degree"
                  value={inputs.degree}
                  onChange={(e) =>
                    setInputs({ ...inputs, degree: e.target.value })
                  }
                  style={{ padding: "10px" }}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6, lg: 6 }}>
                <TextInput
                  required
                  label="College"
                  placeholder="Enter your college"
                  value={inputs.college}
                  onChange={(e) =>
                    setInputs({ ...inputs, college: e.target.value })
                  }
                  style={{ padding: "10px" }}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Textarea
                  label="Description"
                  placeholder="Enter description (optional)"
                  value={inputs.description}
                  onChange={(e) =>
                    setInputs({ ...inputs, description: e.target.value })
                  }
                  style={{ padding: "10px" }}
                />
              </Grid.Col>

              <Grid.Col
                span={12}
                p="md"
                style={{ display: "flex", justifyContent: "flex-start" }}
              >
                <Button
                  type="submit"
                  mt="md"
                  loading={isLoading}
                  leftSection={<FloppyDisk size={16} />}
                  style={{ backgroundColor: "#2185d0", color: "#fff" }}
                >
                  Save
                </Button>
              </Grid.Col>
            </Grid>
          </form>
        </Paper>

        <Paper
          mt="xl"
          p="lg"
          withBorder
          shadow="sm"
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Title order={3} mb="lg" style={{ color: "#2185d0" }}>
            Qualifications:
          </Title>
          <FusionTable
            columnNames={COLUMNS}
            elements={rows}
            ariaLabel="Qualifications"
            emptyMessage="No qualifications found."
          />

          <Pagination
            total={Math.ceil(tableData.length / rowsPerPage)}
            page={currentPage}
            onChange={setCurrentPage}
            mt="lg"
            position="center"
          />
        </Paper>
      </Container>
    </MantineProvider>
  );
}
