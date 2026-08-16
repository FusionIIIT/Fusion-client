import { useEffect, useState } from "react";
import { Text } from "@mantine/core";
import { PageTabs } from "../../../../ui/components/PageTabs";
// import CustomBreadcrumbs from "../../../../components/Breadcrumbs";
import Achievements from "./Achievements";
import ExpertLectures from "./ExpertLectures";

// eslint-disable-next-line react/prop-types
function OtherMaster({ setBreadCrumbItems }) {
  const [activeTab, setActiveTab] = useState("0");

  // Tab items data
  const tabItems = [
    { title: "Achievements", component: <Achievements /> },
    { title: "Experts Lectures/Invited Talks", component: <ExpertLectures /> },
  ];

  useEffect(() => {
    const currentTab = tabItems[parseInt(activeTab, 10)];

    const breadcrumbs = [{ title: currentTab.title, href: "#" }].map(
      (item, index) => (
        <Text key={index} component="a" href={item.href} size="16px" fw={600}>
          {item.title}
        </Text>
      ),
    );

    setBreadCrumbItems((prevBreadCrumbs) => {
      const firstThreeEntries = prevBreadCrumbs.slice(0, 3);
      return [...firstThreeEntries, breadcrumbs];
    });
  }, [activeTab]);

  return (
    <>
      {/* <CustomBreadcrumbs /> */}

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

export default OtherMaster;
