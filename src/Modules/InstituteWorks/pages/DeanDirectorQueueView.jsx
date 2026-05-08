import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import DeanDirectorQueueTable from "../components/tables/DeanDirectorQueueTable";
import DeanDirectorActionModal from "../components/forms/DeanDirectorActionModal";
import {
  getApiErrorMessage,
  getDeanProcessedRequests,
  getDesignations,
  submitDirectorApproval,
} from "../services/api";

function DeanDirectorQueueView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [action, setAction] = useState("approve");
  const [designation, setDesignation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [deanRows, designationsData] = await Promise.all([
        getDeanProcessedRequests(role),
        getDesignations(),
      ]);
      setRows(deanRows);

      const options = (designationsData?.holdsDesignations || []).map(
        (item) => ({
          value: `${item.designation?.name || ""}|${item.username || ""}`,
          label: `${item.designation?.name || "Unknown"} (${item.username || "-"})`,
        }),
      );
      setDesignationOptions(options);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(
          error,
          "Unable to fetch dean/director queue.",
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const ready = useMemo(
    () => Boolean(selectedFileId && action && designation),
    [selectedFileId, action, designation],
  );

  const openActionModal = (fileId) => {
    setSelectedFileId(fileId);
    setAction("approve");
    setDesignation("");
    setRemarks("");
    setFile(null);
    setOpened(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;

    setIsSaving(true);
    try {
      await submitDirectorApproval({
        fileid: selectedFileId,
        action,
        designation,
        remarks,
        file,
      });
      notifications.show({
        color: "green",
        message: "Director action submitted.",
      });
      setOpened(false);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to submit director action."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DeanDirectorQueueTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onAction={openActionModal}
      />
      <DeanDirectorActionModal
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

export default DeanDirectorQueueView;
