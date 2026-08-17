import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { PageTabs } from "../../../../ui/components/PageTabs";
import Conference from "./Conference";
import Books from "./Books";
import Journal from "./Journal";
import { setPfNo } from "../../../../redux/pfNoSlice";
import { getPFRoute } from "../../../../routes/facultyProfessionalProfileRoutes";

function PublicationMaster() {
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

export default PublicationMaster;
