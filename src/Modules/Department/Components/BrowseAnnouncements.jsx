// import {
//   Button,
//   Container,
//   Flex,
//   Grid,
//   Loader,
//   Tabs,
//   Text,
// } from "@mantine/core";
// import { CaretCircleLeft, CaretCircleRight } from "@phosphor-icons/react";
// import { useRef, useState, Suspense, lazy } from "react";
// import classes from "../styles/Departmentmodule.module.css";

// // Lazy load Announcements
// const Announcements = lazy(() => import("./Announcements"));

// function BrowseAnnouncements() {
//   const [activeTab, setActiveTab] = useState("0");
//   const tabsListRef = useRef(null);

//   const tabItems = [
//     { title: "ALL" },
//     { title: "CSE" },
//     { title: "ECE" },
//     { title: "ME" },
//     { title: "SM" },
//   ];

//   const handleTabChange = (direction) => {
//     const newIndex =
//       direction === "next"
//         ? Math.min(+activeTab + 1, tabItems.length - 1)
//         : Math.max(+activeTab - 1, 0);
//     setActiveTab(String(newIndex));
//     tabsListRef.current.scrollBy({
//       left: direction === "next" ? 50 : -50,
//       behavior: "smooth",
//     });
//   };

//   // Render content based on active tab with lazy-loaded Announcements
//   const renderTabContent = () => {
//     switch (activeTab) {
//       case "0":
//         return <Announcements branch="ALL" />;
//       case "1":
//         return <Announcements branch="CSE" />;
//       case "2":
//         return <Announcements branch="ECE" />;
//       case "3":
//         return <Announcements branch="ME" />;
//       case "4":
//         return <Announcements branch="SM" />;
//       default:
//         return null;
//     }
//   };

//   const content = renderTabContent();

//   return (
//     <div>
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "center",
//           height: "auto",
//         }}
//       >
//         <h1>View Department-wise Announcements</h1>
//       </div>

//       <Flex justify="space-between" align="center">
//         <Flex justify="flex-start" align="center" gap="1rem" mt="0.1rem">
//           <Button
//             onClick={() => handleTabChange("prev")}
//             variant="default"
//             p={0}
//             style={{ border: "none" }}
//           >
//             <CaretCircleLeft
//               className={classes.fusionCaretCircleIcon}
//               weight="light"
//             />
//           </Button>

//           <div className={classes.fusionTabsContainer} ref={tabsListRef}>
//             <Tabs value={activeTab} onChange={setActiveTab}>
//               <Tabs.List style={{ display: "flex", flexWrap: "nowrap" }}>
//                 {tabItems.map((item, index) => (
//                   <Tabs.Tab
//                     value={String(index)}
//                     key={index}
//                     className={
//                       activeTab === String(index)
//                         ? classes.fusionActiveRecentTab
//                         : ""
//                     }
//                   >
//                     <Flex gap="4px">
//                       <Text>{item.title}</Text>
//                     </Flex>
//                   </Tabs.Tab>
//                 ))}
//               </Tabs.List>
//             </Tabs>
//           </div>

//           <Button
//             onClick={() => handleTabChange("next")}
//             variant="default"
//             p={0}
//             style={{ border: "none" }}
//           >
//             <CaretCircleRight
//               className={classes.fusionCaretCircleIcon}
//               weight="light"
//             />
//           </Button>
//         </Flex>
//       </Flex>

//       {/* Main content with Suspense fallback for lazy-loaded component */}
//       <Grid mt="xl">
//         <Container py="xl" style={{ position: "relative", minHeight: "400px" }}>
//           <Suspense
//             fallback={
//               <Loader
//                 style={{
//                   position: "absolute",
//                   top: "90%",
//                   left: "50%",
//                   transform: "translate(-50%, -50%)",
//                 }}
//               />
//             }
//           >
//             {content || (
//               <Text align="center" color="gray">
//                 No Announcements Available
//               </Text>
//             )}
//           </Suspense>
//         </Container>
//       </Grid>
//     </div>
//   );
// }

// export default BrowseAnnouncements;

import React, { useRef, useState, Suspense, lazy } from "react";
import {
  Button,
  Container,
  Flex,
  Grid,
  Tabs,
  Text,
  Title,
  Box,
} from "@mantine/core";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import classes from "../styles/Departmentmodule.module.css";

// Lazy load the Announcements component
const Announcements = lazy(() => import("./Announcements"));

function BrowseAnnouncements({ branch }) {
  const [activeTab, setActiveTab] = useState("0");
  const tabsListRef = useRef(null);

  const tabItems = [
    { title: "ALL" },
    { title: "CSE" },
    { title: "ECE" },
    { title: "ME" },
    { title: "SM" },
  ];

  const handleTabChange = (direction) => {
    const newIndex =
      direction === "next"
        ? Math.min(+activeTab + 1, tabItems.length - 1)
        : Math.max(+activeTab - 1, 0);
    setActiveTab(String(newIndex));
    tabsListRef.current?.scrollBy({
      left: direction === "next" ? 50 : -50,
      behavior: "smooth",
    });
  };

  // Render content based on active tab with lazy-loaded Announcements
  const renderTabContent = () => {
    switch (activeTab) {
      case "0":
        return <Announcements branch="ALL" />;
      case "1":
        return <Announcements branch="CSE" />;
      case "2":
        return <Announcements branch="ECE" />;
      case "3":
        return <Announcements branch="ME" />;
      case "4":
        return <Announcements branch="SM" />;
      default:
        return null;
    }
  };

  return (
    <Container size="xl">
      <Box mb="xl">
        <Title order={2} align="center">
          View Department-wise Announcements
        </Title>
      </Box>

      <Flex justify="center" align="center" mb="xl">
        <Button
          onClick={() => handleTabChange("prev")}
          variant="subtle"
          p={0}
          mr="xs"
        >
          <ChevronLeft size={24} />
        </Button>

        <Box style={{ maxWidth: "80%", overflowX: "auto" }} ref={tabsListRef}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List>
              {tabItems.map((item, index) => (
                <Tabs.Tab value={String(index)} key={index}>
                  <Text>{item.title}</Text>
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
        </Box>

        <Button
          onClick={() => handleTabChange("next")}
          variant="subtle"
          p={0}
          ml="xs"
        >
          <ChevronRight size={24} />
        </Button>
      </Flex>

      <Grid>
        <Grid.Col>
          <Suspense fallback={<Text>Loading...</Text>}>
            {renderTabContent() || (
              <Text align="center" color="gray">
                No Announcements Available
              </Text>
            )}
          </Suspense>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export default BrowseAnnouncements;

BrowseAnnouncements.propTypes = {
  branch: PropTypes.string.isRequired,
};
