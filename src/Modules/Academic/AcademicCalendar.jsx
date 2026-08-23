import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Alert,
  Modal,
  Group,
  TextInput,
  Loader,
  FileInput,
} from "@mantine/core";
import axios from "axios";
import { IconUpload } from "@tabler/icons-react";
import {
  calendarRoute,
  addCalendarRoute,
  editCalendarRoute,
  deleteCalendarRoute,
  clearCalendarRoute,
  exportCalendarRoute,
  importCalendarRoute,
} from "../../routes/academicRoutes";
import AudienceSelector, {
  defaultAudienceValue,
} from "../../components/AudienceSelector.jsx";
import FusionTable from "../../components/FusionTable";
import RowActions from "../../components/RowActions";
import { formatWhen } from "../../lib/datetime";

const COLUMNS = ["Event", "Starts", "Ends", "Actions"];

function AcademicCalendar() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({
    description: "",
    from_date: null,
    to_date: null,
    from_time: "",
    to_time: "",
  });
  const [audience, setAudience] = useState(defaultAudienceValue());
  const [editingEvent, setEditingEvent] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [file, setFile] = useState(null);

  // Fetch events
  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }
      try {
        const { data } = await axios.get(calendarRoute, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!mounted) return;
        setEvents(
          Array.isArray(data)
            ? data.map((e) => ({
                ...e,
                from_date: e.from_date ? new Date(e.from_date) : null,
                to_date: e.to_date ? new Date(e.to_date) : null,
                from_time: e.from_time || "",
                to_time: e.to_time || "",
              }))
            : [],
        );
      } catch (err) {
        if (mounted) setError("Failed to load events");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, [refreshTrigger]);

  // Open modals
  const handleAdd = () => {
    setError("");
    setNewEvent({
      description: "",
      from_date: null,
      to_date: null,
      from_time: "",
      to_time: "",
    });
    setAudience(defaultAudienceValue());
    setAddModalOpen(true);
  };
  const handleEdit = (ev) => {
    setError("");
    setEditingEvent(ev);
  };

  // Save edited event
  const handleSaveEdit = async () => {
    if (
      !editingEvent?.description ||
      !editingEvent?.from_date ||
      !editingEvent?.to_date
    ) {
      return setError("Please fill all fields");
    }
    setProcessing(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        editCalendarRoute,
        {
          ...editingEvent,
          from_date: editingEvent.from_date.toISOString().slice(0, 10),
          to_date: editingEvent.to_date.toISOString().slice(0, 10),
          from_time: editingEvent.from_time || null,
          to_time: editingEvent.to_time || null,
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      setEditingEvent(null);
      setRefreshTrigger((t) => t + 1);
    } catch {
      setError("Failed to update event");
    } finally {
      setProcessing(false);
    }
  };

  // Create new event
  const handleAddEvent = async () => {
    if (!newEvent.description || !newEvent.from_date || !newEvent.to_date) {
      return setError("Please fill all fields");
    }
    if (audience.audienceType === "role" && !audience.targetRole) {
      return setError("Please select a role for the audience");
    }
    if (audience.audienceType === "department" && !audience.targetDepartment) {
      return setError("Please select a department for the audience");
    }
    if (audience.audienceType === "batch" && !audience.targetBatch) {
      return setError("Please select a batch for the audience");
    }
    if (
      audience.audienceType === "individual" &&
      audience.targetUsers.length === 0
    ) {
      return setError("Please select at least one user for the audience");
    }
    setProcessing(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        addCalendarRoute,
        {
          ...newEvent,
          from_date: newEvent.from_date.toISOString().slice(0, 10),
          to_date: newEvent.to_date.toISOString().slice(0, 10),
          from_time: newEvent.from_time || null,
          to_time: newEvent.to_time || null,
          audience_type: audience.audienceType,
          target_role:
            audience.audienceType === "role" ? audience.targetRole : null,
          target_department:
            audience.audienceType === "department"
              ? audience.targetDepartment
              : null,
          target_batch:
            audience.audienceType === "batch" ? audience.targetBatch : null,
          target_users:
            audience.audienceType === "individual" ? audience.targetUsers : [],
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      setAddModalOpen(false);
      setRefreshTrigger((t) => t + 1);
    } catch {
      setError("Failed to create event");
    } finally {
      setProcessing(false);
    }
  };

  // Delete one event
  const handleDelete = async (ev) => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(deleteCalendarRoute, {
        headers: { Authorization: `Token ${token}` },
        data: { id: ev.id },
      });
      setRefreshTrigger((t) => t + 1);
    } catch {
      setError("Failed to delete event");
    } finally {
      setProcessing(false);
    }
  };

  // Clear all
  const handleClear = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(clearCalendarRoute, {
        headers: { Authorization: `Token ${token}` },
      });
      setRefreshTrigger((t) => t + 1);
    } catch {
      setError("Failed to clear calendar");
    } finally {
      setProcessing(false);
    }
  };

  // Export Excel
  const handleExport = async () => {
    setProcessing(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(exportCalendarRoute, {
        headers: { Authorization: `Token ${token}` },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = "calendar.xlsx";
      a.click();
    } catch {
      setError("Failed to export excel");
    } finally {
      setProcessing(false);
    }
  };

  // Import Excel
  const handleFileUpload = async (f) => {
    if (!f) return;
    setProcessing(true);
    try {
      const token = localStorage.getItem("authToken");
      const form = new FormData();
      form.append("file", f);
      await axios.post(importCalendarRoute, form, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setFile(null);
      setRefreshTrigger((t) => t + 1);
    } catch {
      setError("Failed to import excel");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      {/* Initial loader or error */}
      {loading ? (
        <Group justify="center" py="xl">
          <Loader />
        </Group>
      ) : (
        <>
          {error && (
            <Alert
              color="red"
              mb="md"
              withCloseButton
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          )}

          <FusionTable
            columnNames={COLUMNS}
            ariaLabel="Academic calendar events"
            emptyMessage="No events found"
            elements={events.map((ev) => ({
              id: ev.id,
              Event: ev.description,
              Starts: formatWhen(ev.from_date, ev.from_time),
              Ends: formatWhen(ev.to_date, ev.to_time),
              Actions: (
                <RowActions
                  label={ev.description || "event"}
                  disabled={processing}
                  onEdit={() => handleEdit(ev)}
                  onDelete={() => handleDelete(ev)}
                />
              ),
            }))}
          />

          {/* Action buttons */}
          <Group mt="md">
            <Button onClick={handleAdd} disabled={processing}>
              Add New Event
            </Button>
            <Button
              variant="outline"
              color="red"
              onClick={handleClear}
              disabled={processing}
            >
              Clear Calendar
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={processing}
            >
              Export Excel
            </Button>
            <FileInput
              placeholder="Import Excel"
              accept=".xlsx,.xls"
              value={file}
              onChange={(f) => {
                setFile(f);
                handleFileUpload(f);
              }}
              leftSection={<IconUpload size={16} />}
              disabled={processing}
            />
          </Group>
        </>
      )}

      {/* Edit Modal */}
      <Modal
        opened={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        title="Edit Event"
        size="lg"
      >
        <TextInput
          label="Description"
          value={editingEvent?.description || ""}
          onChange={(e) =>
            setEditingEvent({
              ...editingEvent,
              description: e.target.value,
            })
          }
          mb="md"
          required
          disabled={processing}
        />
        <TextInput
          label="Start Date"
          type="date"
          value={
            editingEvent?.from_date
              ? editingEvent.from_date.toISOString().slice(0, 10)
              : ""
          }
          onChange={(e) =>
            setEditingEvent({
              ...editingEvent,
              from_date: e.target.value ? new Date(e.target.value) : null,
            })
          }
          mb="md"
          required
          disabled={processing}
        />
        <TextInput
          label="End Date"
          type="date"
          value={
            editingEvent?.to_date
              ? editingEvent.to_date.toISOString().slice(0, 10)
              : ""
          }
          onChange={(e) =>
            setEditingEvent({
              ...editingEvent,
              to_date: e.target.value ? new Date(e.target.value) : null,
            })
          }
          mb="md"
          required
          disabled={processing}
        />
        <TextInput
          label="Start Time (optional)"
          type="time"
          value={(editingEvent?.from_time || "").slice(0, 5)}
          onChange={(e) =>
            setEditingEvent({ ...editingEvent, from_time: e.target.value })
          }
          mb="md"
          disabled={processing}
        />
        <TextInput
          label="End Time (optional)"
          type="time"
          value={(editingEvent?.to_time || "").slice(0, 5)}
          onChange={(e) =>
            setEditingEvent({ ...editingEvent, to_time: e.target.value })
          }
          mb="md"
          disabled={processing}
        />
        <Group justify="flex-end" mt="lg">
          <Button onClick={handleSaveEdit} disabled={processing}>
            {processing ? "Saving…" : "Save Changes"}
          </Button>
        </Group>
      </Modal>

      {/* Add Modal */}
      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Event"
        size="lg"
      >
        <TextInput
          label="Description"
          value={newEvent.description}
          onChange={(e) =>
            setNewEvent({ ...newEvent, description: e.target.value })
          }
          mb="md"
          required
          disabled={processing}
        />
        <TextInput
          label="Start Date"
          type="date"
          value={newEvent.from_date?.toISOString().slice(0, 10) || ""}
          onChange={(e) =>
            setNewEvent({
              ...newEvent,
              from_date: e.target.value ? new Date(e.target.value) : null,
            })
          }
          mb="md"
          required
          disabled={processing}
        />
        <TextInput
          label="End Date"
          type="date"
          value={newEvent.to_date?.toISOString().slice(0, 10) || ""}
          onChange={(e) =>
            setNewEvent({
              ...newEvent,
              to_date: e.target.value ? new Date(e.target.value) : null,
            })
          }
          mb="md"
          required
          disabled={processing}
        />
        <TextInput
          label="Start Time (optional)"
          type="time"
          value={(newEvent.from_time || "").slice(0, 5)}
          onChange={(e) =>
            setNewEvent({ ...newEvent, from_time: e.target.value })
          }
          mb="md"
          disabled={processing}
        />
        <TextInput
          label="End Time (optional)"
          type="time"
          value={(newEvent.to_time || "").slice(0, 5)}
          onChange={(e) =>
            setNewEvent({ ...newEvent, to_time: e.target.value })
          }
          mb="md"
          disabled={processing}
        />
        <AudienceSelector value={audience} onChange={setAudience} />
        <Group justify="flex-end" mt="lg">
          <Button onClick={handleAddEvent} disabled={processing}>
            {processing ? "Adding…" : "Add Event"}
          </Button>
        </Group>
      </Modal>
    </Card>
  );
}

export default AcademicCalendar;
