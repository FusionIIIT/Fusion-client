import React, { useEffect, useState } from "react";
import { Loader, Alert, Tabs, Card } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import axios from "axios";

import FusionTable from "../../components/FusionTable";
import { courseLabel } from "../../lib/course";
import { formatDate } from "../../lib/datetime";
import { StatusBadge } from "../../ui/components/StatusBadge";
import tabClasses from "../../ui/styles/tabs.module.css";
import {
  studentListRequestsRoute,
  studentDropRequestsRoute,
  studentAddRequestsRoute,
} from "../../routes/academicRoutes";

const REPLACEMENT_COLUMNS = [
  "Old course",
  "New course",
  "Status",
  "Term",
  "Requested",
];
const SLOT_COLUMNS = ["Slot", "Course", "Status", "Term", "Requested"];

const term = (r) =>
  [r.academic_year, r.semester_type].filter(Boolean).join(" · ") || "—";

const shared = (r) => ({
  id: r.id,
  Status: <StatusBadge status={r.status} />,
  Term: term(r),
  Requested: formatDate(r.created_at),
});

const replacementRows = (rows) =>
  rows.map((r) => ({
    ...shared(r),
    "Old course": courseLabel({ code: r.old_course, name: r.old_course_name }),
    "New course": courseLabel({ code: r.new_course, name: r.new_course_name }),
  }));

const slotRows = (rows) =>
  rows.map((r) => ({
    ...shared(r),
    Slot: r.slot,
    Course: courseLabel({ code: r.course, name: r.course_name }),
  }));

export default function ReplacementRequestStudent() {
  const compact = useMediaQuery("(max-width: 575px)");
  const [replacementRequests, setReplacementRequests] = useState([]);
  const [dropRequests, setDropRequests] = useState([]);
  const [addRequests, setAddRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No auth token");
      setLoading(false);
      return;
    }

    Promise.all([
      axios.get(studentListRequestsRoute, {
        headers: { Authorization: `Token ${token}` },
      }),
      axios.get(studentDropRequestsRoute, {
        headers: { Authorization: `Token ${token}` },
      }),
      axios.get(studentAddRequestsRoute, {
        headers: { Authorization: `Token ${token}` },
      }),
    ])
      .then(([replacementRes, dropRes, addRes]) => {
        setReplacementRequests(replacementRes.data);
        setDropRequests(dropRes.data);
        setAddRequests(addRes.data);
      })
      .catch((err) => setError(err.response?.data?.detail || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error)
    return (
      <Alert title="Error" color="red">
        {error}
      </Alert>
    );

  return (
    <Card p={0}>
      <Tabs defaultValue="replacement">
        <Tabs.List className={tabClasses.list}>
          <Tabs.Tab value="replacement" className={tabClasses.tab}>
            {compact ? "Replace" : "Replacement Requests"}
          </Tabs.Tab>
          <Tabs.Tab value="add" className={tabClasses.tab}>
            {compact ? "Add" : "Add Requests"}
          </Tabs.Tab>
          <Tabs.Tab value="drop" className={tabClasses.tab}>
            {compact ? "Drop" : "Drop Requests"}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="replacement" pt="md">
          <FusionTable
            columnNames={REPLACEMENT_COLUMNS}
            elements={replacementRows(replacementRequests)}
            ariaLabel="Replacement requests"
            emptyMessage="You have not submitted any replacement requests."
          />
        </Tabs.Panel>

        <Tabs.Panel value="add" pt="md">
          <FusionTable
            columnNames={SLOT_COLUMNS}
            elements={slotRows(addRequests)}
            ariaLabel="Add course requests"
            emptyMessage="You have not submitted any add course requests."
          />
        </Tabs.Panel>

        <Tabs.Panel value="drop" pt="md">
          <FusionTable
            columnNames={SLOT_COLUMNS}
            elements={slotRows(dropRequests)}
            ariaLabel="Drop course requests"
            emptyMessage="You have not submitted any drop requests."
          />
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}
