import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Text,
  Textarea,
  Checkbox,
  Button,
  Center,
  Loader,
  Table,
  NumberInput,
  Stack,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import RPCCommitteeTable from "./RPCCommitteeTable";
import {
  supervisorReviewRoute,
  facultyListRoute,
} from "../../routes/academicRoutes";

export default function SupervisorReviewModal({ thesis, onClose }) {
  const [form, setForm] = useState(null);
  const [facOpts, setFacOpts] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken");
  const headers = token ? { Authorization: `Token ${token}` } : {};

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, fRes] = await Promise.all([
        axios.get(supervisorReviewRoute(thesis.id), { headers }),
        axios.get(facultyListRoute, { headers }),
      ]);
      const data = tRes.data;
      const supId = data.supervisor.id;
      const coId = data.co_supervisor?.id;
      const allIds = data.committee.map((m) => m.id);
      const extras = allIds.filter((id) => id !== supId && id !== coId);
      const fixedCount = 1 + (coId ? 1 : 0);
      const numSelectables = 5 - fixedCount;
      const padded = extras.slice(0, numSelectables);
      while (padded.length < numSelectables) padded.push(null);
      setForm({ ...data, committee: padded });
      setFacOpts(
        fRes.data.map((f) => ({
          value: f.id,
          label: f.name,
          discipline: f.discipline,
        }))
      );
    } catch {
      showNotification({
        title: "Error",
        message: "Failed to load review data.",
        color: "red",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  }, [thesis.id]);

  useEffect(() => {
    if (!token) {
      showNotification({
        title: "Auth Error",
        message: "Not authenticated.",
        color: "red",
      });
      onClose();
      return;
    }
    load();
  }, [token, load]);

  if (loading) return <Center style={{ height: 200 }}><Loader size="lg" /></Center>;
  if (!form) return null;

  const {
    student_roll,
    student_name,
    student_discipline,
    category,
    broad_area,
    research_theme,
    is_supervisor,
    is_co_supervisor,
    status,
    supervisor_consented,
    co_supervisor_consented,
    load: supLoad,
    hod_remarks,
  } = form;

  const readOnly = !["supervisor_pending", "hod_rejected"].includes(status);
  const coId = form.co_supervisor?.id;

  const fixedCount = 1 + (coId ? 1 : 0);
  const selectedCount = form.committee.filter((id) => id != null).length;
  const totalMembers = fixedCount + selectedCount;

  const supCanSubmit =
    is_supervisor &&
    supervisor_consented &&
    (!coId || co_supervisor_consented) &&
    totalMembers >= 3;
  const coCanSubmit = is_co_supervisor && co_supervisor_consented;

  const handleSubmit = async () => {
    setLoading(true);
    const payload = { research_theme };
    if (is_supervisor) {
      payload.supervisor_consented = supervisor_consented;
      payload.pg_single = supLoad.pg_single;
      payload.pg_shared = supLoad.pg_shared;
      payload.phd_single = supLoad.phd_single;
      payload.phd_shared = supLoad.phd_shared;
      payload.committee = form.committee.filter((id) => id != null);
    }
    if (is_co_supervisor) {
      payload.co_supervisor_consented = co_supervisor_consented;
    }
    try {
      const res = await axios.post(
        supervisorReviewRoute(thesis.id),
        payload,
        { headers }
      );
      showNotification({ title: "Success", message: res.data.message, color: "green" });
      await load();
      onClose();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Submission failed",
        color: "red",
      });
      setLoading(false);
    }
  };

  return (
    <Modal opened onClose={onClose} title="Supervisor / Co-Supervisor Review" size="90%">
      <Stack spacing="lg">
        {/* Student Info */}
        <Table striped highlightOnHover>
          <tbody>
            <tr><td><Text weight={500}>Roll No</Text></td><td>{student_roll}</td></tr>
            <tr><td><Text weight={500}>Name</Text></td><td>{student_name}</td></tr>
            <tr><td><Text weight={500}>Discipline</Text></td><td>{student_discipline}</td></tr>
            <tr><td><Text weight={500}>Category</Text></td><td>{category}</td></tr>
            <tr><td><Text weight={500}>Broad Area</Text></td><td>{broad_area}</td></tr>
          </tbody>
        </Table>

        <Textarea
          label="Theme of Proposed Research"
          value={research_theme}
          onChange={(e) => setForm(f => ({ ...f, research_theme: e.target.value }))}
          disabled={readOnly}
          minRows={3}
        />

        {hod_remarks && (
          <Textarea
            label="HOD Remarks"
            value={hod_remarks}
            readOnly
            minRows={2}
            styles={{ root: { backgroundColor: '#ffe6e6' } }}
          />
        )}

        {is_supervisor && (
          <>
            <Text weight={500}>Supervisor Load</Text>
            <Table striped highlightOnHover>
              <thead><tr><th/><th>Single</th><th>Shared</th></tr></thead>
              <tbody>
                {['PG','PhD'].map(cat => (
                  <tr key={cat}>
                    <td><Text weight={500}>{cat}</Text></td>
                    <td>
                      <NumberInput
                        required
                        value={supLoad[`${cat.toLowerCase()}_single`]}
                        disabled={readOnly}
                        onChange={v => setForm(f => ({
                          ...f,
                          load: { ...f.load, [`${cat.toLowerCase()}_single`]: v }
                        }))}
                      />
                    </td>
                    <td>
                      <NumberInput
                        required
                        value={supLoad[`${cat.toLowerCase()}_shared`]}
                        disabled={readOnly}
                        onChange={v => setForm(f => ({
                          ...f,
                          load: { ...f.load, [`${cat.toLowerCase()}_shared`]: v }
                        }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Checkbox
              label="I consent as Supervisor"
              checked={supervisor_consented}
              disabled={readOnly || supervisor_consented}
              onChange={e => setForm(f => ({ ...f, supervisor_consented: e.target.checked }))}
            />

            {coId && (
              <Checkbox
                label="Co-Supervisor Consent"
                checked={co_supervisor_consented}
                disabled
              />
            )}

            <Text weight={500}>Select RPC Members (≥ 3 total)</Text>
            <RPCCommitteeTable
              supervisor={form.supervisor}
              coSupervisor={form.co_supervisor}
              facultyOptions={facOpts}
              committee={form.committee}
              onChange={c => setForm(f => ({ ...f, committee: c }))}
              readOnly={readOnly}
            />
          </>
        )}

        {!is_supervisor && is_co_supervisor && (
          <Checkbox
            label="I consent as Co-Supervisor"
            checked={co_supervisor_consented}
            disabled={readOnly || co_supervisor_consented}
            onChange={e => setForm(f => ({ ...f, co_supervisor_consented: e.target.checked }))}
          />
        )}

        <Group>
          <Button
            fullWidth
            onClick={handleSubmit}
            loading={loading}
            disabled={readOnly || (!(supCanSubmit || coCanSubmit))}
          >
            {is_supervisor ? "Forward to HOD" : "Submit Consent"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
