import { useState } from "react";
import { PageTabs } from "../../../../ui/components/PageTabs";
import ResearchProjects from "./ResearchProjects";
import Patents from "./Patents";
import ConsultancyProjects from "./ConsultancyProjects";

function ProjectMaster() {
  const [activeTab, setActiveTab] = useState("0");

  // Tab items data
  const tabItems = [
    { title: "Research Projects", component: <ResearchProjects /> },
    { title: "Patents", component: <Patents /> },
    { title: "Consultancy Projects", component: <ConsultancyProjects /> },
    // { title: "Thesis Supervision", component: <ThesisSupervisionMaster /> },
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

export default ProjectMaster;
