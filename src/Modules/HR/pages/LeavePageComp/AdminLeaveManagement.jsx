// import React from "react";
// import { Container, SimpleGrid, Title } from "@mantine/core";
// import { ShieldCheck } from "@phosphor-icons/react"; // Using ShieldCheck for consistency
// import PerformanceCard from "../components/FormComponent/PerformanceCard";

// const AdminLeaveManagement = () => {
//   const adminCard = {
//     title: "Manage Leave Balance",
//     description: "Update and review employee leave balances.",
//     icon: ShieldCheck, // You can choose any icon that fits best
//     link: "/hr/admin_leave/manage_leave_balance"
//   };

//   return (
//     <Container size="lg" py="xl">
//       <Title order={2} mb="xl">
//         Admin Leave Management
//       </Title>
//       <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl">
//         <PerformanceCard
//           IconComponent={adminCard.icon}
//           title={adminCard.title}
//           description={adminCard.description}
//           link={adminCard.link}
//         />
//       </SimpleGrid>
//     </Container>
//   );
// };

// export default AdminLeaveManagement;

import React from "react";
import { Container, SimpleGrid, Title } from "@mantine/core";
import { ShieldCheck, PencilSimple } from "@phosphor-icons/react";

import PerformanceCard from "../../components/FormComponent/PerformanceCard";
import HrBreadcrumbs from "../../components/HrBreadcrumbs";

const AdminLeaveManagement = () => {
  // Card for reviewing leave balances.
  const reviewLeaveCard = {
    title: "Employees Leave Balance",
    description: "Review employee leave balances.",
    icon: ShieldCheck,
    link: "/hr/admin_leave/view_employees_leave_balance",
  };

  // Card for managing offline leave form.
  const manageOfflineLeaveCard = {
    title: "Manage Offline Leave Form",
    description: "Handle offline leave submissions.",
    icon: PencilSimple,
    link: "/hr/admin_leave/manage_offline_leave_form",
  };
  // Card for review employee Leave Requests.
  const reviewLeaveRequests = {
    title: "Review Leave Requests",
    description: "Review and manage employee leave requests.",
    icon: PencilSimple,
    link: "/hr/admin_leave/review_leave_requests",
  };

  const exampleItems = [
    { title: "Home", path: "/dashboard" },
    { title: "Human Resources", path: "/hr" },
    { title: "Admin Leave Management", path: "/hr/admin_leave" },
  ];

  return (
    <>
      <HrBreadcrumbs items={exampleItems} />
      <Container size="xxl" py="xl">
        <Title order={2} mb="xl">
          Admin Leave Management
        </Title>
        <SimpleGrid
          cols={4}
          spacing="lg"
          breakpoints={[{ maxWidth: 1500, cols: 3 }]}
        >
          <PerformanceCard
            IconComponent={reviewLeaveCard.icon}
            title={reviewLeaveCard.title}
            description={reviewLeaveCard.description}
            link={reviewLeaveCard.link}
          />
          <PerformanceCard
            IconComponent={reviewLeaveRequests.icon}
            title={reviewLeaveRequests.title}
            description={reviewLeaveRequests.description}
            link={reviewLeaveRequests.link}
          />
          <PerformanceCard
            IconComponent={manageOfflineLeaveCard.icon}
            title={manageOfflineLeaveCard.title}
            description={manageOfflineLeaveCard.description}
            link={manageOfflineLeaveCard.link}
          />
        </SimpleGrid>
      </Container>
    </>
  );
};

export default AdminLeaveManagement;
