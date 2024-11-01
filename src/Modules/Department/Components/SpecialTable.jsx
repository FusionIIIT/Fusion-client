/* eslint-disable react/jsx-pascal-case, radix */

import { Divider, Flex, Stack, Table, Title } from "@mantine/core";
import PropTypes from "prop-types";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import {
  MRT_GlobalFilterTextInput,
  MRT_TableBodyCellValue,
  MRT_TablePagination,
  MRT_ToolbarAlertBanner,
  flexRender,
  useMantineReactTable,
} from "mantine-react-table";
import "mantine-react-table/styles.css";

function SpecialTable({ title, columns, data, rowOptions }) {
  const table = useMantineReactTable({
    columns,
    data,
    enableRowSelection: false, // Disable row selection checkboxes
    initialState: {
      pagination: {
        pageSize: rowOptions ? parseInt(rowOptions[0]) : 5,
        pageIndex: 0,
      },
      showGlobalFilter: true,
    },
    // customize the MRT components
    mantinePaginationProps: {
      rowsPerPageOptions: rowOptions ?? ["5", "10", "20"],
    },
    paginationDisplayMode: "pages",
  });

  return (
    <div>
      <Stack>
        <Divider />
        <Title order={4}>{title ?? "My Special Table"}</Title>
        <Flex justify="space-between" align="center">
          {/**
           * Use MRT components along side your own markup.
           * They just need the table instance passed as a prop to work!
           */}
          <MRT_GlobalFilterTextInput table={table} />
          <MRT_TablePagination table={table} />
        </Flex>
        {/* Using Vanilla Mantine Table component here */}
        <Table
          captionSide="top"
          fz="md"
          highlightOnHover
          horizontalSpacing="xl"
          striped
          verticalSpacing="xs"
          withTableBorder
          withColumnBorders
          m="0"
        >
          {/* Use your own markup or stock Mantine components, customize however you want using the power of TanStack Table */}
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.Header ??
                            header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id}>
                    <MRT_TableBodyCellValue cell={cell} table={table} />
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <MRT_ToolbarAlertBanner stackAlertBanner table={table} />
      </Stack>
    </div>
  );
}

SpecialTable.propTypes = {
  title: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  rowOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SpecialTable;
