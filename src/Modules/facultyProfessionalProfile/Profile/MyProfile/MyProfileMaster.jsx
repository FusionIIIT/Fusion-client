import { useState } from "react";
import { PageTabs } from "../../../../ui/components/PageTabs";
import ViewResearchProject from "./ViewResearchProject";
import ViewConsultancyProject from "./ViewConsultancyProject";
import ViewPatent from "./ViewPatent";
import ViewPGThesis from "./ViewPGThesis";
import ViewPhDThesis from "./ViewPhDThesis";
// import ViewEvent from "./ViewEvents";
import ViewForeignVisits from "./ViewForeignVisits";
import ViewIndianVisits from "./ViewIndianVisits";
import ViewConSym from "./ViewConSym";
import ViewEvents from "./ViewEvents";
// import Journal from "../Publications/Journal";
// import ViewJournal from "./ViewJournal";
import ViewBooks from "./ViewBooks";
import ViewJournal from "./ViewJournal";

function VisitsMaster() {
  const [activeTab, setActiveTab] = useState("0");

  // Tab items data
  const tabItems = [
    { title: "Research Project", component: <ViewResearchProject /> },
    { title: "Consultancy Project", component: <ViewConsultancyProject /> },
    { title: "Patent", component: <ViewPatent /> },
    { title: "PG Thesis", component: <ViewPGThesis /> },
    { title: "PhD Thesis", component: <ViewPhDThesis /> },
    { title: "Events", component: <ViewEvents /> },
    { title: "Foreign Visits", component: <ViewForeignVisits /> },
    { title: "Indian Visits", component: <ViewIndianVisits /> },
    { title: "Con/Sym", component: <ViewConSym /> },
    { title: "Journal", component: <ViewJournal /> },
    { title: "Books", component: <ViewBooks /> },
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
