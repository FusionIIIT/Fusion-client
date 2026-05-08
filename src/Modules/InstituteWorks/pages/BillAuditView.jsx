import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import BillAuditTable from "../components/tables/BillAuditTable";
import BillAuditModal from "../components/forms/BillAuditModal";
import {
  getApiErrorMessage,
  getAuditDocuments,
  getDesignations,
  submitAuditDocument,
} from "../services/api";

function BillAuditView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [designation, setDesignation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [attachment, setAttachment] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [auditRows, designationsData] = await Promise.all([
        getAuditDocuments(role),
        getDesignations(),
      ]);
      setRows(auditRows);

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
        message: getApiErrorMessage(error, "Unable to fetch audit documents."),
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

  const openAudit = (fileId) => {
    setSelectedFileId(fileId);
    setDesignation("");
    setRemarks("");
    setAttachment(null);
    setOpened(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;

    setIsSaving(true);
    try {
      await submitAuditDocument({
        fileid: selectedFileId,
        designation,
        remarks,
        attachment,
      });
      notifications.show({
        color: "green",
        message: "Bill audited and forwarded.",
      });
      setOpened(false);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(
          error,
          "Unable to audit and forward this bill.",
        ),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <BillAuditTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onAudit={openAudit}
      />
      <BillAuditModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={submit}
        designationOptions={designationOptions}
        designation={designation}
        setDesignation={setDesignation}
        remarks={remarks}
        setRemarks={setRemarks}
        attachment={attachment}
        setAttachment={setAttachment}
        isSaving={isSaving}
        isReady={ready}
      />
    </>
  );
}

export default BillAuditView;
