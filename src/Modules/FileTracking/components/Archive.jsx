import React, { useState, useEffect } from "react";
import { Box, Card, Title, Table, ActionIcon, Tooltip } from "@mantine/core";
import { ArrowArcLeft, Eye } from "@phosphor-icons/react";
import axios from "axios";
import { useSelector } from "react-redux";
import View from "./ViewFile";
import {
  getArchiveRoute,
  unArchiveRoute,
} from "../../../routes/filetrackingRoutes";

export default function ArchiveFiles() {
  const [files, setFiles] = useState([]);
  const token = localStorage.getItem("authToken");
  const role = useSelector((state) => state.user.role);
  const username = useSelector((state) => state.user.roll_no);
  let current_module = useSelector((state) => state.module.current_module);
  current_module = current_module.split(" ").join("").toLowerCase();
  const convertDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString();
  };
  useEffect(() => {
    const getFiles = async () => {
      try {
        const response = await axios.get(
          `${getArchiveRoute}`,

          {
            params: {
              username,
              designation: role,
              src_module: current_module,
            },
            withCredentials: true,
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "multipart/form-data",
            },
          },
        );
        setFiles(response.data);
        console.log("Archived Files: ", files);
        // Set the response data to the files state
      } catch (err) {
        console.error("Error fetching files:", err);
      }
    };

    // Call the getFiles function to fetch data on component mount
    getFiles();
  }, [role, username, token]);

  const [selectedFile, setSelectedFile] = useState(null);

  const handleToggleArchive = async (fileID) => {
    // eslint-disable-next-line no-unused-vars
    const response = await axios.post(
      `${unArchiveRoute}`,
      {
        file_id: fileID,
      },
      {
        params: {
          username,
          designation: role,
          src_module: current_module,
        },
        withCredentials: true,
        headers: {
          Authorization: `Token ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      },
    );
    const updatedFiles = files.filter((file) => file.id !== fileID);
    setFiles(updatedFiles); // Update state with the new file list
  };

  const handleViewFile = (file) => {
    setSelectedFile(file);
  };

  const handleBack = () => {
    setSelectedFile(null);
  };

  const tableStyles = {
    padding: "12px",
    textAlign: "center",
    border: "1px solid #ddd",
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        backgroundColor: "#F5F7F8",
        position: "absolute",
        height: "70vh",
        width: "90vw",
        overflowY: "auto",
      }}
    >
      {!selectedFile && (
        <Title
          order={2}
          mb="md"
          style={{
            fontSize: "24px",
          }}
        >
          Archived Files
        </Title>
      )}

      {selectedFile ? (
        <div>
          <Title
            order={3}
            mb="md"
            style={{
              fontSize: "26px",
            }}
          >
            File Subject
          </Title>
          <View
            onBack={handleBack}
            fileID={selectedFile.id}
            updateFiles={() =>
              setFiles(files.filter((f) => f.id !== selectedFile.id))
            }
          />
        </div>
      ) : (
        <Box
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflowY: "auto",
            height: "56vh",
            backgroundColor: "#fff",
          }}
        >
          <Table
            highlightOnHover
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
              fontSize: "14px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#0000" }}>
                <th style={{ ...tableStyles, width: "8%" }}>Unarchive</th>
                <th style={{ ...tableStyles, width: "15%" }}>File ID</th>
                <th style={{ ...tableStyles, width: "15%" }}>Uploader</th>
                <th style={{ ...tableStyles, width: "25%" }}>Subject</th>
                <th style={{ ...tableStyles, width: "15%" }}>Date</th>
                <th style={{ ...tableStyles, width: "7%" }}>View File</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td style={tableStyles}>
                    <Tooltip
                      label={file.archived ? "Unarchive file" : "Archive file"}
                      position="top"
                      withArrow
                    >
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={() => handleToggleArchive(file.id)}
                        style={{ width: "2rem", height: "2rem" }}
                      >
                        <ArrowArcLeft size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                  </td>

                  <td style={tableStyles}>
                    {" "}
                    {file.branch}-{new Date(file.upload_date).getFullYear()}-
                    {(new Date(file.upload_date).getMonth() + 1)
                      .toString()
                      .padStart(2, "0")}
                    -#{file.id}
                  </td>
                  <td style={tableStyles}>{file.uploader}</td>
                  <td style={tableStyles}>{file.subject}</td>
                  <td style={tableStyles}>{convertDate(file.upload_date)}</td>
                  <td style={tableStyles}>
                    <ActionIcon
                      variant="outline"
                      color="black"
                      onClick={() => handleViewFile(file)}
                      style={{ width: "2rem", height: "2rem" }}
                    >
                      <Eye size="1rem" />
                    </ActionIcon>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>
      )}
    </Card>
  );
}
