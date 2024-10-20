"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CarModelProps } from "@lib/types";

// const frameworks = [
//   {
//     value: "next.js",
//     label: "Next.js",
//   },
//   {
//     value: "sveltekit",
//     label: "SvelteKit",
//   },
//   {
//     value: "nuxt.js",
//     label: "Nuxt.js",
//   },
//   {
//     value: "remix",
//     label: "Remix",
//   },
//   {
//     value: "astro",
//     label: "Astro",
//   },
// ];

interface CarModelComboBoxProps {
  setValue: (carModel: number) => void;
  value: number;
  options: CarModelProps[];
}

export const ModelCombobox: React.FC<CarModelComboBoxProps> = ({
  setValue,
  value,
  options,
}) => {
  const [open, setOpen] = React.useState(false);
  // const [value, setValue] = React.useState(0);

  const selectedItem = options.find((option) => option.id === value);
  // console.log(options, "OP");
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="CarModelComboBox"
          aria-expanded={open}
          className=" w-full justify-between  h-fit"
        >
          {selectedItem ? (
            <p className=" text-wrap text-left">
              Model name: {selectedItem.name} Car maker:{" "}
              {selectedItem.carMaker ? selectedItem.carMaker : "None"}{" "}
            </p>
          ) : (
            "Select option..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="    p-0">
        <Command className="">
          <CommandInput placeholder="Search option..." />
          <CommandList>
            <CommandEmpty>No option found.</CommandEmpty>
            <CommandGroup>
              {options?.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.name + String(option.id)} // to avoid selecting two or more items that has the same name proprty.
                  onSelect={() => {
                    // console.log(currentValue, "CCCC");
                    setValue(option.id === value ? 0 : option.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span>
                    Model name: {option.name} Car maker:{" "}
                    {option.carMaker ? option.carMaker : "None"}
                  </span>{" "}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
