import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import BillProcessingTable from "../components/tables/BillProcessingTable";
import BillProcessingModal from "../components/forms/BillProcessingModal";
import {
  getBillPdfUrl,
  getApiErrorMessage,
  getDesignations,
  getGeneratedBills,
  processBill,
} from "../services/api";

function BillProcessingView() {
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [designation, setDesignation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [vendorId, setVendorId] = useState("");

  const load = async () => {
    setIsLoading(true);
    try {
      const [billRows, designationsData] = await Promise.all([
        getGeneratedBills(),
        getDesignations(),
      ]);
      setRows(billRows);

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
        message: getApiErrorMessage(error, "Unable to fetch generated bills."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ready = useMemo(
    () => Boolean(selectedFileId && designation && attachment),
    [selectedFileId, designation, attachment],
  );

  const openProcess = (fileId) => {
    setSelectedFileId(fileId);
    setDesignation("");
    setRemarks("");
    setAttachment(null);
    setVendorId("");
    setOpened(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;

    setIsSaving(true);
    try {
      await processBill({
        fileid: selectedFileId,
        designation,
        remarks,
        attachment,
        vendor_id: vendorId.trim(),
      });
      notifications.show({
        color: "green",
        message: "Bill processed successfully.",
      });
      setOpened(false);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to process bill."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <BillProcessingTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onProcess={openProcess}
        getBillPdfUrl={getBillPdfUrl}
      />
      <BillProcessingModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={submit}
        designationOptions={designationOptions}
        designation={designation}
        setDesignation={setDesignation}
        vendorId={vendorId}
        setVendorId={setVendorId}
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

export default BillProcessingView;
