import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Tabs } from "@mantine/core";
import { useSelector } from "react-redux";
import EmployeeDashboard from "./EmployeeDashboard";
import LeaveApplication from "./LeaveApplication";
import AppraisalForm from "./AppraisalForm";
import CPDAAdvance from "./CPDAAdvance";
import LTCForm from "./LTCForm";
import NomineeDashboard from "./NomineeDashboard";

function HR2Module() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const role = useSelector((state) => state.user.role);
  const isPrivilegedRole = /hod|director|registrar|accountant|hr/i.test(
    role || "",
  );
  const hideFinanceTabs = false;
  const showNominee = !isPrivilegedRole;

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    const allowedTabs = ["dashboard", "leave", "appraisal"];
    if (!hideFinanceTabs) {
      allowedTabs.push("cpda-advance", "ltc");
    }
    if (showNominee) {
      allowedTabs.push("nominee");
    }
    if (tab && allowedTabs.includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search, showNominee]);

  return (
    <div className="p-6 space-y-6">
      <Tabs
        value={activeTab}
        onTabChange={setActiveTab}
        defaultValue="dashboard"
        variant="default"
      >
        <Tabs.List>
          <Tabs.Tab value="dashboard" label="Employee Dashboard" />
          {showNominee && (
            <Tabs.Tab value="nominee" label="Nominee Dashboard" />
          )}
          <Tabs.Tab value="leave" label="Leave Application" />
          <Tabs.Tab value="appraisal" label="Appraisal" />
          {!hideFinanceTabs && (
            <Tabs.Tab value="cpda-advance" label="CPDA Advance" />
          )}
          {!hideFinanceTabs && <Tabs.Tab value="ltc" label="LTC" />}
        </Tabs.List>

        <Tabs.Panel value="dashboard" pt="xl">
          <EmployeeDashboard onOpenTab={setActiveTab} />
        </Tabs.Panel>

        {showNominee && (
          <Tabs.Panel value="nominee" pt="xl">
            <NomineeDashboard onBack={() => setActiveTab("dashboard")} />
          </Tabs.Panel>
        )}

        <Tabs.Panel value="leave" pt="xl">
          <LeaveApplication onBack={() => setActiveTab("dashboard")} />
        </Tabs.Panel>

        {!hideFinanceTabs && (
          <Tabs.Panel value="ltc" pt="xl">
            <LTCForm onBack={() => setActiveTab("dashboard")} />
          </Tabs.Panel>
        )}

        <Tabs.Panel value="appraisal" pt="xl">
          <AppraisalForm onBack={() => setActiveTab("dashboard")} />
        </Tabs.Panel>

        {!hideFinanceTabs && (
          <Tabs.Panel value="cpda-advance" pt="xl">
            <CPDAAdvance onBack={() => setActiveTab("dashboard")} />
          </Tabs.Panel>
        )}
      </Tabs>
    </div>
  );
}

export default HR2Module;
