"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Spinner from "@components/Spinner";
import { useToast } from "@hooks/use-toast";
import { deleteCarAction } from "@lib/actions/carsAction";
import SuccessToastDescription, {
  ErorrToastDescription,
} from "@components/toast-items";
import { useRouter } from "next/navigation";
const DeleteCar = ({ carId }: { carId: string | undefined }) => {
  return (
    <div
      className={
        "flex  flex-col  gap-y-2 xs:flex-row xs:items-center justify-between rounded-lg border p-3 shadow-sm gap-x-7"
      }
    >
      <div className="space-y-0.5   ">
        <label className=" font-semibold">Products</label>
        <p className=" text-muted-foreground text-sm">Delete car.</p>
      </div>
      <div className=" sm:pr-2">
        <DeleteDialog carId={carId} />
      </div>
    </div>
  );
};

function DeleteDialog({ carId }: { carId: string | undefined }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  async function handleDelete() {
    try {
      if (!carId) return;
      setIsLoading(true);
      await deleteCarAction(carId);
      router.back();
      //   checkIfLastItem();
      //   queryClient.invalidateQueries({ queryKey: ["carCount"] });
      setOpen(false);

      toast({
        variant: "default",
        title: "Success.",
        description: (
          <SuccessToastDescription message="Car hass been deleted" />
        ),
      });
    } catch (error: any) {
      console.log(error);
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: <ErorrToastDescription error={error.message} />,
      });
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          {isLoading ? <Spinner className=" h-full" size={12} /> : "Delete"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete this
            car&apos;s data from the server.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className=" flex items-center justify-end  gap-2">
            <Button
              onClick={() => setOpen(false)}
              type="reset"
              variant="secondary"
              size="sm"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              type="submit"
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : "Delete"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteCar;