import apiClient from "./apiClient";

// Create a file in file tracking system
export const createFile = async ({
  designation,
  receiverUsername,
  receiverDesignation,
  subject,
  description,
  files = [],
  srcModule = "Gymkhana",
}) => {
  const formData = new FormData();
  formData.append("designation", designation);
  formData.append("receiver_username", receiverUsername);
  formData.append("receiver_designation", receiverDesignation);
  formData.append("subject", subject);
  formData.append("description", description);
  formData.append("src_module", srcModule);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await apiClient.post("/filetracking/api/file/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// Forward a file to next approver
export const forwardFile = async ({
  fileId,
  receiver,
  receiverDesignation,
  remarks,
  fileExtraJSON = {},
  files = [],
}) => {
  const formData = new FormData();
  formData.append("receiver", receiver);
  formData.append("receiver_designation", receiverDesignation);
  formData.append("remarks", remarks);
  formData.append("file_extra_JSON", JSON.stringify(fileExtraJSON));

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await apiClient.post(
    `/filetracking/api/forwardfile/${fileId}/`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return response.data;
};

// Create and forward file in one step
export const createAndForwardFile = async ({ fileData, forwardData }) => {
  const { file_id } = await createFile(fileData);
  await forwardFile({ fileId: file_id, ...forwardData });
  return file_id;
};
