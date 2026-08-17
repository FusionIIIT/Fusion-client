import { useState } from "react";
import { PageTabs } from "../../../../ui/components/PageTabs";
import PgThesis from "./PgThesis";
import PhdThesis from "./PhdThesis";

// eslint-disable-next-line react/prop-types, no-unused-vars
function ThesisSupervisionMaster() {
  const [activeTab, setActiveTab] = useState("0");

  // Tab items data
  const tabItems = [
    { title: "PG Thesis", component: <PgThesis /> },
    { title: "PhD Thesis", component: <PhdThesis /> },
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

export default ThesisSupervisionMaster;
