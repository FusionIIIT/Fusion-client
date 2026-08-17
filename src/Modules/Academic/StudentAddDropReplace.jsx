import React, { useState } from "react";
import { Tabs, Card } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import tabClasses from "../../ui/styles/tabs.module.css";
import ReplacementRequestStudent from "./ReplacementRequestStudent";
import StudentCourseReplacement from "./StudentCourseReplacement";
import StudentDropCourse from "./StudentDropCourse";
import StudentAddCourse from "./StudentAddCourse";

export default function StudentAddDropReplace() {
  const compact = useMediaQuery("(max-width: 575px)");
  const [activeTab, setActiveTab] = useState("form");

  return (
    <Card withBorder p={{ base: "sm", sm: "md" }}>
      <Tabs
        value={activeTab}
        onChange={setActiveTab}
        variant="pills"
        color="blue"
      >
        <Tabs.List className={tabClasses.list}>
          <Tabs.Tab value="form" className={tabClasses.tab}>
            {compact ? "Replace" : "Replacement Form"}
          </Tabs.Tab>
          <Tabs.Tab value="add" className={tabClasses.tab}>
            {compact ? "Add" : "Add Course"}
          </Tabs.Tab>
          <Tabs.Tab value="drop" className={tabClasses.tab}>
            {compact ? "Drop" : "Drop Course"}
          </Tabs.Tab>
          <Tabs.Tab value="requests" className={tabClasses.tab}>
            {compact ? "Requests" : "Your Requests"}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="form" pt="md" key={`panel-form-${activeTab}`}>
          {activeTab === "form" && <StudentCourseReplacement />}
        </Tabs.Panel>

        <Tabs.Panel
          value="requests"
          pt="md"
          key={`panel-requests-${activeTab}`}
        >
          {activeTab === "requests" && <ReplacementRequestStudent />}
        </Tabs.Panel>

        <Tabs.Panel value="add" pt="md" key={`panel-add-${activeTab}`}>
          {activeTab === "add" && <StudentAddCourse />}
        </Tabs.Panel>

        <Tabs.Panel value="drop" pt="md" key={`panel-drop-${activeTab}`}>
          {activeTab === "drop" && <StudentDropCourse />}
        </Tabs.Panel>
      </Tabs>
    </Card>
  );
}
