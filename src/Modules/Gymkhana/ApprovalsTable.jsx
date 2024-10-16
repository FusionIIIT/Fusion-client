import "@mantine/core/styles.css";
import "@mantine/dates/styles.css"; // if using mantine date picker features
import "mantine-react-table/styles.css"; // make sure MRT styles were imported in your app root (once)
import { useMemo, useState } from "react";
import { MantineReactTable, useMantineReactTable } from "mantine-react-table";
import { ActionIcon, Flex, Stack, Text, Tooltip, Modal } from "@mantine/core";
import { ModalsProvider, modals } from "@mantine/modals";
import { IconEye, IconTrash } from "@tabler/icons-react";
import PropTypes from "prop-types";
import { useGetClubMembers } from "./BackendLogic/ApiRoutes";

function EventApprovals({ clubName }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const columns = useMemo(
    () => [
      {
        accessorKey: "Status",
        header: "Status",
      },
      {
        accessorKey: "Event Title",
        header: "Event Title",
      },
      {
        accessorKey: "Date",
        header: "Date",
      },
    ],
    [validationErrors],
  );

  const {
    data: fetchedEvents = [],
    isError: isLoadingEventsError,
    isFetching: isFetchingEvents,
    isLoading: isLoadingEvents,
  } = useGetClubMembers(clubName);

  const openViewModal = (event) => {
    setSelectedEvent(event);
  };

  const closeViewModal = () => {
    setSelectedEvent(null);
  };

  const table = useMantineReactTable({
    columns,
    data: fetchedEvents,
    enableEditing: true,
    getRowId: (row) => row.id,
    mantineToolbarAlertBannerProps: isLoadingEventsError
      ? {
          color: "red",
          children: "Error loading data",
        }
      : undefined,
    renderRowActions: ({ row }) => (
      <Flex gap="md">
        <Tooltip label="View">
          <ActionIcon onClick={() => openViewModal(row.original)}>
            <IconEye />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon
            color="red"
            onClick={() => {
              /* Implement delete logic */
            }}
          >
            <IconTrash />
          </ActionIcon>
        </Tooltip>
      </Flex>
    ),
    state: {
      isLoading: isLoadingEvents,
      showAlertBanner: isLoadingEventsError,
      showProgressBars: isFetchingEvents,
    },
  });

  return (
    <>
      <MantineReactTable table={table} />
      <Modal
        opened={!!selectedEvent}
        onClose={closeViewModal}
        title="Event Details"
      >
        {/* View Content  */}
        {selectedEvent && (
          <Stack>
            <Text>Need put view content</Text>
          </Stack>
        )}
      </Modal>
    </>
  );
}

function EventApprovalsWithProviders({ clubName }) {
  return <EventApprovals clubName={clubName} />;
}
EventApprovalsWithProviders.propTypes = {
  clubName: PropTypes.string,
};
EventApprovals.propTypes = {
  clubName: PropTypes.string,
};

export default EventApprovalsWithProviders;
