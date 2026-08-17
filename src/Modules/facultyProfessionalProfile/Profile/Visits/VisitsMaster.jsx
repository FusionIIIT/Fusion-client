import { useState } from "react";
import { PageTabs } from "../../../../ui/components/PageTabs";
import ForeignVisits from "./ForeignVisits";
import IndianVisits from "./IndianVisits";

function VisitsMaster() {
  const [activeTab, setActiveTab] = useState("0");

  // Tab items data
  const tabItems = [
    { title: "Foreign Visits", component: <ForeignVisits /> },
    { title: "Indian Visits", component: <IndianVisits /> },
  ];

  return (
    <>
      <PageTabs
        value={activeTab}
        onChange={setActiveTab}
        tabs={tabItems.map((item, index) => ({
          value: String(index),
          label: item.title,
        }))}
      />

      {/* Display the active tab content */}
      {tabItems[parseInt(activeTab, 10)]?.component}
    </>
  );
}

export default VisitsMaster;
