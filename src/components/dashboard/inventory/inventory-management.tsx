import React from "react";
import InventoryForm from "./inventory-form";
import { getProductsAction } from "@lib/actions/productsActions";
import { getRestockingBillsAction } from "@lib/actions/restockingBillActions";

const InventoryManagement = async () => {
  const [productsData, restockingData] = await Promise.all([
    getProductsAction({}),
    getRestockingBillsAction({}),
  ]);

  const { data: products, error } = productsData;
  const { data: restockings, error: restockingsError } = restockingData;

  if (error || restockingsError) return <p>{error || restockingsError}</p>;
  if (!products) return <p>Soemthng went wrong</p>;

  return (
    <div className="flex  flex-col  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7">
      <div className="space-y-0.5   ">
        <label className=" font-semibold">Inventory</label>
        <p className=" text-muted-foreground text-sm">Add new Inventory.</p>
      </div>
      <div className=" sm:pr-2">
        <InventoryForm products={products} restockings={restockings} />
      </div>
    </div>
  );
};

export default InventoryManagement;