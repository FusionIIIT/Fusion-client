// import { useEffect, useMemo, useState } from "react";
// import { notifications } from "@mantine/notifications";
// import AdminApprovalQueueTable from "../components/tables/AdminApprovalQueueTable";
// import AdminApprovalActionModal from "../components/forms/AdminApprovalActionModal";
// import {
//   getApiErrorMessage,
//   getDesignations,
//   getEngineerProcessedRequests,
//   submitAdminApproval,
// } from "../services/api";

// function AdminApprovalQueueView() {
//   const [rows, setRows] = useState([]);
//   const [designationOptions, setDesignationOptions] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [opened, setOpened] = useState(false);
//   const [selectedProposalId, setSelectedProposalId] = useState(null);

//   const [action, setAction] = useState("approve");
//   const [designation, setDesignation] = useState("");
//   const [remarks, setRemarks] = useState("");
//   const [file, setFile] = useState(null);

//   // ================= LOAD DATA =================
//   const load = async () => {
//     setIsLoading(true);
//     try {
//       const [queueRows, designationsData] = await Promise.all([
//         getEngineerProcessedRequests(),
//         getDesignations(),
//       ]);

//       setRows(queueRows);

//       const ALLOWED_ROLES = ["dean (p&d)", "director"];

//       const options = (designationsData?.holdsDesignations || [])
//         .filter((item) =>
//           ALLOWED_ROLES.includes(
//             (item.designation?.name || "").toLowerCase()
//           )
//         )
//         .map((item) => ({
//           value: `${item.designation?.name}|${item.username}`,
//           label: `${item.designation?.name} (${item.username})`,
//         }));

//       setDesignationOptions(options);
//     } catch (error) {
//       notifications.show({
//         color: "red",
//         message: getApiErrorMessage(error, "Unable to fetch admin queue."),
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   // ================= READY LOGIC =================
//   const ready = useMemo(() => {
//     return (
//       selectedProposalId !== null &&
//       action &&
//       (action !== "forward" || designation)
//     );
//   }, [selectedProposalId, action, designation]);

//   // ================= OPEN MODAL =================
//   const openActionModal = (proposalId) => {
//     console.log("CLICKED proposalId:", proposalId);

//     setSelectedProposalId(proposalId);
//     setAction("approve");
//     setDesignation("");
//     setRemarks("");
//     setFile(null);
//     setOpened(true);
//   };

//   // ================= SUBMIT =================
//   const submit = async (event) => {
//     event.preventDefault();

//     if (!ready) {
//       console.log("NOT READY:", {
//         selectedProposalId,
//         action,
//         designation,
//       });
//       return;
//     }

//     setIsSaving(true);

//     try {
//       await submitAdminApproval({
//         proposal_id: selectedProposalId,
//         action,
//         designation: action === "forward" ? designation : "",
//         remarks,
//         file,
//       });

//       notifications.show({
//         color: "green",
//         message: "Admin action submitted.",
//       });

//       setOpened(false);
//       await load();
//     } catch (error) {
//       console.error("ERROR:", error);

//       notifications.show({
//         color: "red",
//         message: getApiErrorMessage(error, "Unable to submit admin action."),
//       });
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // ================= RENDER =================
//   return (
//     <>
//       <AdminApprovalQueueTable
//         rows={rows}
//         isLoading={isLoading}
//         onRefresh={load}
//         onAction={openActionModal}
//       />

//       <AdminApprovalActionModal
//         opened={opened}
//         onClose={() => setOpened(false)}
//         onSubmit={submit}
//         action={action}
//         setAction={setAction}
//         designationOptions={designationOptions}
//         designation={designation}
//         setDesignation={setDesignation}
//         remarks={remarks}
//         setRemarks={setRemarks}
//         file={file}
//         setFile={setFile}
//         isSaving={isSaving}
//         isReady={ready}
//       />
//     </>
//   );
// }

// export default AdminApprovalQueueView;

import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import AdminApprovalQueueTable from "../components/tables/AdminApprovalQueueTable";
import AdminApprovalActionModal from "../components/forms/AdminApprovalActionModal";
import {
  getApiErrorMessage,
  getDesignations,
  getEngineerProcessedRequests,
  submitAdminApproval,
} from "../services/api";

function AdminApprovalQueueView() {
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);

  const [selectedFileId, setSelectedFileId] = useState(null); // ✅ FIXED

  const [action, setAction] = useState("approve");
  const [designation, setDesignation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [queueRows, designationsData] = await Promise.all([
        getEngineerProcessedRequests(),
        getDesignations(),
      ]);

      setRows(queueRows);

      const options = (designationsData?.holdsDesignations || []).map(
        (item) => ({
          value: `${item.designation?.name}|${item.username}`,
          label: `${item.designation?.name} (${item.username})`,
        }),
      );

      setDesignationOptions(options);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ready = useMemo(() => {
    if (!selectedFileId || !action) return false;

    if (action === "forward") {
      return !!designation;
    }

    return true;
  }, [selectedFileId, action, designation]);

  const openActionModal = (fileId) => {
    console.log("FILE ID:", fileId);
    setSelectedFileId(fileId);
    setAction("approve");
    setDesignation("");
    setRemarks("");
    setFile(null);
    setOpened(true);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!ready) return;

    setIsSaving(true);

    try {
      await submitAdminApproval({
        fileid: selectedFileId,
        action,
        designation: action === "forward" ? designation : "",
        remarks,
        file,
      });

      notifications.show({
        color: "green",
        message: "Admin action submitted successfully.",
      });

      setOpened(false);
      load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <AdminApprovalQueueTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onAction={openActionModal}
      />

      <AdminApprovalActionModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={submit}
        action={action}
        setAction={setAction}
        designationOptions={designationOptions}
        designation={designation}
        setDesignation={setDesignation}
        remarks={remarks}
        setRemarks={setRemarks}
        file={file}
        setFile={setFile}
        isSaving={isSaving}
        isReady={ready}
      />
    </>
  );
}

export default AdminApprovalQueueView;
