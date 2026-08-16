import { useEffect, useState } from "react";
import { Text } from "@mantine/core";
// import CustomBreadcrumbs from "../../../../components/Breadcrumbs";
// import { useSelector } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { PageTabs } from "../../../../ui/components/PageTabs";
import Conference from "./Conference";
import Books from "./Books";
import Journal from "./Journal";
import { setPfNo } from "../../../../redux/pfNoSlice";
import { getPFRoute } from "../../../../routes/facultyProfessionalProfileRoutes";

// eslint-disable-next-line react/prop-types
function PublicationMaster({ setBreadCrumbItems }) {
  const [activeTab, setActiveTab] = useState("0");
  const dispatch = useDispatch();

  // const pfNo = useSelector((state) => state.pfNo.value);

  // console.log("publications", pfNo);

  // Tab items data
  const tabItems = [
    { title: "Journal", component: <Journal /> },
    { title: "Books", component: <Books /> },
    { title: "Conference", component: <Conference /> },
    // { title: "Thesis Supervision", component: <ThesisSupervisionMaster /> },
  ];

  const username = useSelector((state) => state.user.roll_no);

  const fetchPfNo = async () => {
    const formData = new FormData();
    formData.append("username", username);
    const res = await axios.post(getPFRoute, formData);
    dispatch(setPfNo(res.data.pf));
  };

  useEffect(() => {
    fetchPfNo();
  }, []);

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

export default PublicationMaster;
