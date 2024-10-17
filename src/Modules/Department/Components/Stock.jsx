import React from "react";
import SpecialTable from "./SpecialTable";
import stockdata from "./Data/StockData";

const columns = [
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
  },
];

function Stock() {
  return (
    <SpecialTable
      title="Stock"
      columns={columns}
      data={stockdata}
      rowOptions={["3", "4", "6"]}
    />
  );
}

export default Stock;
