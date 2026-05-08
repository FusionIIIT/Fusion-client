import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import CreatedRequestsTable from "../components/tables/CreatedRequestsTable";
import ForwardRequestModal from "../components/forms/ForwardRequestModal";
import TrackingHistoryModal from "../components/forms/TrackingHistoryModal";
import {
  forwardRequest,
  getCreatedRequests,
  getDesignations,
  getViewFile,
} from "../services/api";

function CreatedRequestsView() {
  const role = useSelector((state) => state.user.role);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [designationOptions, setDesignationOptions] = useState([]);

  // Forward modal state
  const [forwardOpened, setForwardOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [designation, setDesignation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // View tracking modal state
  const [trackingOpened, setTrackingOpened] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const [data, designationsData] = await Promise.all([
        getCreatedRequests(role),
        getDesignations(),
      ]);
      setRequests(data);
      const options = (designationsData?.holdsDesignations || []).map(
        (item) => ({
          value: `${item.designation?.name || ""}|${item.username || ""}`,
          label: `${item.designation?.name || "Unknown"} (${item.username || "-"})`,
        }),
      );
      setDesignationOptions(options);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch created IWD requests.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!role) return;
    loadRequests();
  }, [role]);

  const forwardReady = useMemo(
    () => Boolean(selectedFileId && designation),
    [selectedFileId, designation],
  );

  const openForwardModal = (fileId) => {
    setSelectedFileId(fileId);
    setDesignation("");
    setRemarks("");
    setAttachment(null);
    setForwardOpened(true);
  };

  const submitForward = async (event) => {
    event.preventDefault();
    if (!forwardReady) return;
    setIsSaving(true);
    try {
      await forwardRequest({
        fileid: selectedFileId,
        designation,
        remarks,
        file: attachment,
      });
      notifications.show({
        color: "green",
        message: "Request forwarded successfully.",
      });
      setForwardOpened(false);
      await loadRequests();
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to forward request.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openTrackingModal = async (fileId) => {
    setFileData(null);
    setTracks([]);
    setTrackingOpened(true);
    setIsTrackingLoading(true);
    try {
      const data = await getViewFile(fileId);
      setFileData(data.file || null);
      setTracks(data.tracks || []);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch file tracking data.",
      });
    } finally {
      setIsTrackingLoading(false);
    }
  };

  return (
    <>
      <CreatedRequestsTable
        requests={requests}
        isLoading={isLoading}
        onRefresh={loadRequests}
        onForward={openForwardModal}
        onTracking={openTrackingModal}
      />
      <ForwardRequestModal
        opened={forwardOpened}
        onClose={() => setForwardOpened(false)}
        onSubmit={submitForward}
        designationOptions={designationOptions}
        designation={designation}
        setDesignation={setDesignation}
        remarks={remarks}
        setRemarks={setRemarks}
        attachment={attachment}
        setAttachment={setAttachment}
        isSaving={isSaving}
        isReady={forwardReady}
      />
      <TrackingHistoryModal
        opened={trackingOpened}
        onClose={() => setTrackingOpened(false)}
        isLoading={isTrackingLoading}
        fileData={fileData}
        tracks={tracks}
      />
    </>
  );
}

export default CreatedRequestsView;
