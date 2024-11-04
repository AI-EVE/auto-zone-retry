"use client";
import { ComboBox } from "@components/combo-box";

import {
  CarInfoProps,
  Category,
  ClientWithPhoneNumbers,
  ProductBrand,
  ProductType,
} from "@lib/types";
import { Filter } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";

import { Switch } from "@components/ui/switch";
import { Button } from "@/components/ui/button";

import { useMediaQuery } from "@mui/material";

import { cn } from "@lib/utils";
import { useIntersectionProvidor } from "@components/products/intersection-providor";
import { ClientsComboBox } from "@components/clients-combobox";
import { CarInfoComboBox } from "@components/dashboard/car-info-combobox";
import { Input } from "@components/ui/input";
import {
  DrawerProvidor,
  DrawerTrigger,
  DrawerContent,
  DrawerOverlay,
  DrawerClose,
} from "@components/DrawerComponent";
interface CarsListProps {
  color: string;
  plateNumber: string;
  chassisNumber: string;
  motorNumber: string;
  clientId: string;
  carInfoId: string;
  pageNumber: string;
  carInfos: CarInfoProps[];
  clietns: ClientWithPhoneNumbers[];
}

const GrageFilter: React.FC<CarsListProps> = ({
  color,
  plateNumber,
  chassisNumber,
  motorNumber,
  clientId,
  carInfoId,
  clietns,
  carInfos,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [plateNumberValue, setPlateNumberValue] = useState(plateNumber);
  const [motorValue, setMotorValue] = useState(motorNumber);
  const [chassieValue, setChassieValue] = useState(chassisNumber);
  const [chosenClient, setChosenClient] = useState(Number(clientId) || 0);
  const [chosenCarInfo, setChosenCarInfo] = useState(Number(carInfoId) || 0);
  const { inView } = useIntersectionProvidor();
  const searchParams = useSearchParams();
  const router = useRouter();

  const pathname = usePathname();
  const isBigScreen = useMediaQuery("(min-width:640px)");

  async function handleSubmit() {
    const params = new URLSearchParams(searchParams);

    if (plateNumberValue.trim() === "") {
      params.delete("plateNumber");
    } else {
      params.set("plateNumber", plateNumberValue);
    }

    if (motorValue.trim() === "") {
      params.delete("motorNumber");
    } else {
      params.set("motorNumber", motorValue);
    }

    if (chassieValue.trim() === "") {
      params.delete("chassisNumber");
    } else {
      params.set("chassisNumber", chassieValue);
    }

    if (!chosenCarInfo) {
      params.delete("carInfoId");
    } else {
      params.set("carInfoId", String(chosenCarInfo));
    }

    if (!chosenClient) {
      params.delete("clientId");
    } else {
      params.set("clientId", String(chosenClient));
    }
    params.set("page", "1");

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    window.scrollTo(0, 0);
    if (!isBigScreen) setDrawerOpen(false);
  }

  return (
    <>
      {isBigScreen && (
        <form
          action={handleSubmit}
          //   onSubmit={handleSubmit}
          className=" space-y-5  sticky top-[50px]  sm:block "
        >
          <h1 className=" font-semibold text-2xl flex items-center ">
            Filters{" "}
            <span>
              {" "}
              <Filter size={20} />
            </span>
          </h1>
          <div className=" space-y-2">
            <label>Clients</label>
            <ClientsComboBox
              value={chosenClient}
              options={clietns}
              setValue={setChosenClient}
            />
          </div>

          <div className=" space-y-2">
            <label>Car information</label>
            <CarInfoComboBox
              value={chosenCarInfo}
              options={carInfos}
              setValue={setChosenCarInfo}
            />
          </div>

          <div className=" space-y-2">
            <label>Plate number</label>
            <Input
              value={plateNumberValue}
              onChange={(e) => setPlateNumberValue(e.target.value)}
              placeholder="Plate number..."
            />
          </div>

          <div className=" space-y-2">
            <label>Chassie number</label>
            <Input
              value={chassieValue}
              onChange={(e) => setChassieValue(e.target.value)}
              placeholder="Chassie number"
            />
          </div>

          <div className=" space-y-2">
            <label>Motor number</label>
            <Input
              value={motorValue}
              onChange={(e) => setMotorValue(e.target.value)}
              placeholder="Motor number"
            />
          </div>

          {/* <ProdcutFilterInput name={name || ""} /> */}
          <Button size="sm" className=" w-full">
            Search...
          </Button>
        </form>
      )}

      {!isBigScreen && (
        <DrawerProvidor open={drawerOpen} setOpen={setDrawerOpen}>
          <div>
            <DrawerOverlay />

            <Button
              onClick={() => setDrawerOpen((is) => !is)}
              className={cn("fixed right-4 bottom-5 z-50 ", {
                "opacity-0 invisible": inView,
              })}
              size="icon"
              variant="outline"
            >
              {" "}
              <Filter size={18} />
            </Button>

            <DrawerContent className=" rounded-t-xl border-none max-h-[60vh] overflow-y-auto ">
              <h1 className=" text-center sm:text-left grid gap-1 p-4">
                <h2 className="  font-semibold text-xl">
                  {" "}
                  Filters <Filter size={20} className=" inline" />
                </h2>
                <p className=" text-sm text-muted-foreground">
                  Apply some filters to make the searching process easier.
                </p>
              </h1>
              <section className=" space-y-5   p-4">
                <form
                  action={handleSubmit}
                  //   onSubmit={handleSubmit}
                  className=" space-y-5  sticky top-[50px]  sm:block "
                >
                  <div className=" space-y-2">
                    <label>Clients</label>
                    <ClientsComboBox
                      value={chosenClient}
                      options={clietns}
                      setValue={setChosenClient}
                    />
                  </div>

                  <div className=" space-y-2">
                    <label>Car information</label>
                    <CarInfoComboBox
                      value={chosenCarInfo}
                      options={carInfos}
                      setValue={setChosenCarInfo}
                    />
                  </div>

                  <div className=" space-y-2">
                    <label>Plate number</label>
                    <Input
                      value={plateNumberValue}
                      onChange={(e) => setPlateNumberValue(e.target.value)}
                      placeholder="Plate number..."
                    />
                  </div>

                  <div className=" space-y-2">
                    <label>Chassie number</label>
                    <Input
                      value={chassieValue}
                      onChange={(e) => setChassieValue(e.target.value)}
                      placeholder="Chassie number"
                    />
                  </div>

                  <div className=" space-y-2">
                    <label>Motor number</label>
                    <Input
                      value={motorValue}
                      onChange={(e) => setMotorValue(e.target.value)}
                      placeholder="Motor number"
                    />
                  </div>

                  {/* <ProdcutFilterInput name={name || ""} /> */}
                  <div className="  space-y-3">
                    <Button size="sm" className=" w-full">
                      Search...
                    </Button>
                    <Button
                      onClick={() => setDrawerOpen(false)}
                      variant="outline"
                      className=" w-full block"
                      type="button"
                    >
                      Close
                    </Button>
                  </div>
                </form>
              </section>
            </DrawerContent>
          </div>
        </DrawerProvidor>
      )}
    </>
  );
};

export default GrageFilter;
