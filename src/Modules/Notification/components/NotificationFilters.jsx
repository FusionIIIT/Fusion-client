import PropTypes from "prop-types";
import { Flex, Select } from "@mantine/core";
import { SortAscending } from "@phosphor-icons/react";
import classes from "../../Dashboard/Dashboard.module.css";

const SORT_CATEGORIES = ["Most Recent", "Tags", "Title"];

function NotificationFilters({ sortedBy, onSortChange }) {
  return (
    <Flex
      w={{ base: "40%", sm: "auto" }}
      align="center"
      mt="md"
      rowGap="1rem"
      columnGap="4rem"
      wrap="wrap"
    >
      <Select
        classNames={{
          option: classes.selectoptions,
          input: classes.selectinputs,
        }}
        variant="filled"
        leftSection={<SortAscending />}
        data={SORT_CATEGORIES}
        value={sortedBy}
        onChange={onSortChange}
        placeholder="Sort By"
        searchable={false}
        clearable={false}
      />
    </Flex>
  );
}

NotificationFilters.propTypes = {
  sortedBy: PropTypes.string.isRequired,
  onSortChange: PropTypes.func.isRequired,
};

export default NotificationFilters;
