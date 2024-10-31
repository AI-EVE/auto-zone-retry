"use client";
import SubmitButton from "@components/submit-button";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";

import { Input } from "@components/ui/input";
import { useToast } from "@hooks/use-toast";
import { createCategoryAction } from "@lib/actions/categoriesAction";
import { createRestockingBillAction } from "@lib/actions/restockingBillActions";

import { SendHorizontal } from "lucide-react";
import React, { useState } from "react";

const RestockingForm = () => {
  const [value, setValue] = useState("");
  const { toast } = useToast();

  const disabled = value.trim() === "";
  async function handleSubmit() {
    try {
      await createRestockingBillAction(value);
      setValue("");
      toast({
        title: "Welcome back.",
        description: (
          <SuccessToastDescription message="A new category has been created." />
        ),
      });
    } catch (error: any) {
      console.log(error.message, "ERROR");
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <form action={handleSubmit}>
      {" "}
      <div className="flex  flex-col  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7">
        <div className="space-y-0.5   ">
          <label htmlFor="z" className=" font-semibold">
            Restocking bill
          </label>
          <p className=" text-muted-foreground text-sm">
            Add a new restocking bill.
          </p>
        </div>
        <div className=" flex items-center  gap-3 sm:pr-2">
          <Input
            placeholder="Shop name..."
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            id="z"
          />

          <SubmitButton disabled={disabled} className=" p-2 w-8 h-8">
            <SendHorizontal size={20} />
          </SubmitButton>
        </div>
      </div>
    </form>
  );
};

export default RestockingForm;