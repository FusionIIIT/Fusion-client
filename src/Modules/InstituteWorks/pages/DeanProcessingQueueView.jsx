import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import DeanProcessingQueueTable from "../components/tables/DeanProcessingQueueTable";
import DeanProcessingActionModal from "../components/forms/DeanProcessingActionModal";
import {
  getApiErrorMessage,
  getCreatedRequests,
  getDesignations,
  handleDeanProcessRequest,
} from "../services/api";

function DeanProcessingQueueView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [designation, setDesignation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [inboxRows, designationsData] = await Promise.all([
        getCreatedRequests(role),
        getDesignations(),
      ]);
      setRows(inboxRows);
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
          "Unable to fetch dean processing queue.",
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
    () => Boolean(selectedFileId && designation),
    [selectedFileId, designation],
  );

  const openActionModal = (fileId) => {
    setSelectedFileId(fileId);
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
      await handleDeanProcessRequest({
        fileid: selectedFileId,
        designation,
        remarks,
        file,
      });
      notifications.show({
        color: "green",
        message: "Request processed and forwarded by dean.",
      });
      setOpened(false);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to process request."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DeanProcessingQueueTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onAction={openActionModal}
      />
      <DeanProcessingActionModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={submit}
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

export default DeanProcessingQueueView;
